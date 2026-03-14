// Backend/orchestrator/promptCache.js
// Global prompt-level cache — hash(text + promptVersion) → full analysis result.
//
// Netflix CGV submitted by user #1 → LLM runs → result stored.
// Netflix CGV submitted by user #2 → cache hit → result returned in ~5ms, $0.00.
//
// Cache is keyed on inputHash + promptVersion so it auto-invalidates when
// prompts change (new model, new instructions, new output schema).

const crypto = require('crypto');
const PromptCache = require('../models/PromptCache');

const makeCacheKey = (inputHash, promptVersion) =>
  crypto.createHash('sha256').update(`${inputHash}:${promptVersion}`).digest('hex');

/**
 * Look up the global prompt cache.
 * Returns the cached result object or null on miss.
 *
 * @param {string} inputHash    SHA-256 of preprocessed text
 * @param {string} promptVersion  e.g. 'v1.2'
 * @returns {object|null}
 */
const getCached = async (inputHash, promptVersion) => {
  const cacheKey = makeCacheKey(inputHash, promptVersion);
  const entry = await PromptCache.findOneAndUpdate(
    { cacheKey },
    { $inc: { hitCount: 1 }, $set: { lastHitAt: new Date() } },
    { new: false, lean: true },
  );
  return entry ? entry.result : null;
};

/**
 * Store a completed analysis result in the global prompt cache.
 * Only stores high-confidence results (requiresHumanReview: false) to avoid
 * propagating low-quality outputs to future users.
 *
 * @param {string} inputHash
 * @param {string} promptVersion
 * @param {object} result   { resume, score, clauses, modelUsed, confidenceLevel, ... }
 */
const setCached = async (inputHash, promptVersion, result) => {
  // Don't cache uncertain results — they need human review and shouldn't be reused
  if (result.requiresHumanReview) return;

  const cacheKey = makeCacheKey(inputHash, promptVersion);

  try {
    await PromptCache.updateOne(
      { cacheKey },
      {
        $setOnInsert: {
          cacheKey,
          inputHash,
          promptVersion,
          result: {
            resume:              result.resume,
            score:               result.score,
            clauses:             result.clauses || [],
            modelUsed:           result.modelUsed,
            confidenceLevel:     result.confidenceLevel,
            requiresHumanReview: result.requiresHumanReview,
            disclaimerVersion:   result.disclaimerVersion,
            jurisdiction:        result.jurisdiction || 'FR',
            promptVersion:       result.promptVersion,
          },
        },
      },
      { upsert: true },
    );
  } catch (err) {
    // Duplicate key on race condition is fine — another request stored it first
    if (err.code !== 11000) {
      console.error('[PromptCache] Store failed:', err.message);
    }
  }
};

module.exports = { getCached, setCached };
