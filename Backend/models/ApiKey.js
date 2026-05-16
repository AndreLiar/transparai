// Backend/models/ApiKey.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  // SHA-256 hash of the raw key — never store the plaintext
  keyHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // First 8 chars of the raw key, kept for display/identification
  prefix: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    default: null, // null = never expires
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Hash a raw API key for storage/lookup.
 * @param {string} rawKey
 * @returns {string} hex SHA-256 digest
 */
apiKeySchema.statics.hashKey = function hashKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
};

/**
 * Generate a new cryptographically random API key.
 * Returns { rawKey, keyHash, prefix } — caller must persist the model
 * and return rawKey to the user exactly once.
 * @returns {{ rawKey: string, keyHash: string, prefix: string }}
 */
apiKeySchema.statics.generate = function generate() {
  const rawKey = crypto.randomBytes(32).toString('hex'); // 64 hex chars
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const prefix = rawKey.slice(0, 8);
  return { rawKey, keyHash, prefix };
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
