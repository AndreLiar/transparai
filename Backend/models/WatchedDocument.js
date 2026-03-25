// Backend/models/WatchedDocument.js
// Stores documents a user has chosen to monitor for changes.
// The cron job (services/watcherCron.js) checks these periodically.
const mongoose = require('mongoose');

const watchedDocumentSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, index: true },

  // Human-readable label (original file name or user-set name)
  name: { type: String, required: true },

  // Optional: URL to re-fetch automatically (premium+)
  url: { type: String, default: null },

  // SHA-256 of the last known version's preprocessed text
  lastHash: { type: String, required: true },

  // The analysisId of the last known analysis — for diff context
  lastAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', default: null },

  // Brief summary from the last known analysis — shown in the watch dashboard
  lastSummary: { type: String, default: '' },
  lastScore: { type: String, default: '' },

  alertsEnabled: { type: Boolean, default: true },

  // 'weekly' checks every 7 days, 'monthly' every 30 days
  checkFrequency: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'weekly',
  },

  lastCheckedAt: { type: Date, default: Date.now },
  lastChangedAt: { type: Date, default: null },

  // How many changes detected since user started watching
  changeCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now, immutable: true },
});

watchedDocumentSchema.index({ firebaseUid: 1, lastCheckedAt: 1 });

module.exports = mongoose.model('WatchedDocument', watchedDocumentSchema);
