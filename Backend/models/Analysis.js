// Backend/models/Analysis.js
// Stores per-analysis results in a dedicated collection.
// Replaces the embedded analyses array in User.js — prevents document bloat.
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, index: true },
  source: { type: String }, // 'text' | 'pdf' | 'ocr'
  documentName: { type: String },
  summary: { type: String },
  score: { type: String },
  clauses: { type: [String], default: [] },
  pdfLink: { type: String },
  // SHA-256 of preprocessed text — used for idempotency cache lookup
  inputHash: { type: String, index: true },
  // EU AI Act Art. 13 transparency metadata — surfaced to the user
  aiModelUsed: { type: String },
  confidenceLevel: { type: String },
  requiresHumanReview: { type: Boolean, default: false },
  promptVersion: { type: String },
  disclaimerVersion: { type: String },
  jurisdiction: { type: String, default: 'FR' },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

// Composite index: fast idempotency lookup (hash first, then user scope)
analysisSchema.index({ inputHash: 1, firebaseUid: 1 });
analysisSchema.index({ firebaseUid: 1, createdAt: -1 });

// TTL: 2 years — matches dataRetention.analysesDeleteAfter: 730 days in User model
analysisSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

module.exports = mongoose.model('Analysis', analysisSchema);
