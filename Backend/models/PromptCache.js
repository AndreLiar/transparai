// Backend/models/PromptCache.js
// Global prompt-level cache: hash(preprocessedText + promptVersion) → full AI result.
//
// Purpose: If 10,000 users submit Netflix CGV, the LLM is called ONCE.
//   Every subsequent user gets the cached result in ~5ms at $0.00 cost.
//
// Key design decisions:
//   - Keyed on inputHash + promptVersion (cache invalidates automatically on prompt updates)
//   - NOT per-user — the analysis of a public contract is the same for everyone
//   - TTL: 90 days — contracts change; stale cache is worse than no cache
//   - Only stores result from high-confidence analyses (requiresHumanReview: false)

const mongoose = require('mongoose');

const promptCacheSchema = new mongoose.Schema({
  // Cache key — SHA-256 of preprocessed text + prompt version string
  cacheKey:   { type: String, required: true, unique: true, index: true },

  // Original input fingerprint (for debugging / audit)
  inputHash:     { type: String, required: true },
  promptVersion: { type: String, required: true },

  // Full analysis result — everything the service layer needs to build a response
  result: {
    resume:    { type: String, required: true },
    score:     { type: String, required: true },
    clauses:   { type: [String], default: [] },
    modelUsed: { type: String, required: true },

    // EU AI Act Art. 13 metadata
    confidenceLevel:     { type: String },
    requiresHumanReview: { type: Boolean, default: false },
    disclaimerVersion:   { type: String },
    jurisdiction:        { type: String, default: 'FR' },
    promptVersion:       { type: String },
  },

  // How many times this cache entry has been served (analytics)
  hitCount: { type: Number, default: 0 },

  createdAt:   { type: Date, default: Date.now, immutable: true },
  lastHitAt:   { type: Date, default: Date.now },
});

// TTL: 90 days — contracts change, we don't want stale legal analysis
promptCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('PromptCache', promptCacheSchema);
