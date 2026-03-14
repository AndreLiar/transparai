// Backend/models/AIDecisionLog.js
// Immutable audit log for every AI call — EU AI Act Art. 12, NIST AI RMF Manage
const mongoose = require('mongoose');

const aiDecisionLogSchema = new mongoose.Schema({
  // Who made the request
  firebaseUid: { type: String, required: true, index: true },

  // What kind of analysis
  analysisType: {
    type: String,
    required: true,
    enum: ['single', 'comparative'],
  },

  // AI provenance — full traceability
  promptVersion: { type: String, required: true },
  modelSelected: { type: String, required: true },
  modelActuallyUsed: { type: String, required: true },
  selectionReason: { type: String, required: true },
  fallbackChain: [{ model: String, success: Boolean }],

  // Input fingerprint — no raw text stored (data minimisation)
  inputLengthChars: { type: Number, required: true },
  inputHash: { type: String, required: true },
  documentComplexity: { type: Number, min: 0, max: 1 },
  industry: { type: String, default: 'default' },

  // Output fingerprint
  outputHash: { type: String, required: true },
  outputScore: { type: String },
  clauseCount: { type: Number },

  // Guardrail results
  guardrails: {
    inputPassed: { type: Boolean, required: true },
    outputPassed: { type: Boolean, required: true },
    hallucinationSignals: [String],
    confidenceLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },
    requiresHumanReview: { type: Boolean, default: false },
  },

  // Cost & performance
  estimatedCostUsd: { type: Number, default: 0 },
  actualCostUsd: { type: Number, default: 0 },
  latencyMs: { type: Number },

  // Compliance context
  jurisdiction: { type: String, default: 'FR' },
  disclaimerVersion: { type: String, required: true },

  createdAt: { type: Date, default: Date.now, immutable: true },
});

aiDecisionLogSchema.index({ firebaseUid: 1, createdAt: -1 });
aiDecisionLogSchema.index({ 'guardrails.requiresHumanReview': 1, createdAt: -1 });

// TTL: 2 years — GDPR / EU AI Act Art. 12
aiDecisionLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

// Immutability guard
aiDecisionLogSchema.pre('save', function (next) {
  if (!this.isNew) return next(new Error('AIDecisionLog records are immutable'));
  next();
});

module.exports = mongoose.model('AIDecisionLog', aiDecisionLogSchema);
