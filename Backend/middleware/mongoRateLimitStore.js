const mongoose = require('mongoose');

const COLLECTION_NAME = 'rate_limits';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class MongoRateLimitStore {
  constructor({ windowMs, prefix }) {
    this.windowMs = windowMs;
    this.prefix = prefix;
    this.localKeys = false;
    this.indexInitPromise = null;
  }

  async getCollection() {
    if (!mongoose.connection?.db) {
      throw new Error('MongoDB connection is not ready for rate limiting');
    }

    const collection = mongoose.connection.db.collection(COLLECTION_NAME);

    if (!this.indexInitPromise) {
      this.indexInitPromise = Promise.all([
        collection.createIndex({ key: 1 }, { unique: true }),
        collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
    }

    await this.indexInitPromise;
    return collection;
  }

  withPrefix(key) {
    return `${this.prefix}${key}`;
  }

  async increment(key) {
    const collection = await this.getCollection();
    const now = new Date();
    const resetTime = new Date(now.getTime() + this.windowMs);
    const prefixedKey = this.withPrefix(key);

    const activeDocResult = await collection.findOneAndUpdate(
      { key: prefixedKey, expiresAt: { $gt: now } },
      {
        $inc: { hits: 1 },
        $set: { updatedAt: now },
      },
      { returnDocument: 'after' },
    );

    const activeDoc = activeDocResult.value || activeDocResult;
    if (activeDoc) {
      return { totalHits: activeDoc.hits, resetTime: activeDoc.expiresAt };
    }

    const resetDocResult = await collection.findOneAndUpdate(
      { key: prefixedKey },
      {
        $set: {
          key: prefixedKey,
          hits: 1,
          expiresAt: resetTime,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: 'after' },
    );

    const resetDoc = resetDocResult.value || resetDocResult;
    return {
      totalHits: resetDoc?.hits || 1,
      resetTime: resetDoc?.expiresAt || resetTime,
    };
  }

  async decrement(key) {
    const collection = await this.getCollection();
    const prefixedKey = this.withPrefix(key);
    const now = new Date();

    await collection.findOneAndUpdate(
      { key: prefixedKey, hits: { $gt: 1 } },
      {
        $inc: { hits: -1 },
        $set: { updatedAt: now },
      },
    );
    await collection.deleteOne({ key: prefixedKey, hits: { $lte: 1 } });
  }

  async resetKey(key) {
    const collection = await this.getCollection();
    await collection.deleteOne({ key: this.withPrefix(key) });
  }

  async resetAll() {
    const collection = await this.getCollection();
    const prefixRegex = new RegExp(`^${escapeRegex(this.prefix)}`);
    await collection.deleteMany({ key: prefixRegex });
  }
}

module.exports = MongoRateLimitStore;
