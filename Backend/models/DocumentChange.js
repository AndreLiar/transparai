// Backend/models/DocumentChange.js
// Records each detected change event for a watched document.
// Powers the change history timeline in the Watch dashboard.
const mongoose = require('mongoose');

const documentChangeSchema = new mongoose.Schema({
  watchedDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatchedDocument',
    required: true,
    index: true,
  },
  firebaseUid: { type: String, required: true, index: true },

  // The new analysis generated for this version
  newAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', default: null },
  previousAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', default: null },

  // AI-generated diff summary
  diffSummary: { type: String, default: '' },

  // Clause-level changes
  addedClauses: { type: [String], default: [] },
  removedClauses: { type: [String], default: [] },
  modifiedClauses: { type: [String], default: [] },

  // Risk assessment of changes: 'low' | 'medium' | 'high' | 'critical'
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },

  previousScore: { type: String, default: '' },
  newScore: { type: String, default: '' },

  detectedAt: { type: Date, default: Date.now, immutable: true },
});

documentChangeSchema.index({ watchedDocumentId: 1, detectedAt: -1 });

// TTL: 2 years consistent with Analysis model
documentChangeSchema.index({ detectedAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

module.exports = mongoose.model('DocumentChange', documentChangeSchema);
