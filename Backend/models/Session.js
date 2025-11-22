// Backend/models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    deviceType: String,
    browser: String,
    os: String,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  revokedReason: {
    type: String,
    enum: ['logout', 'password_change', 'admin_revoke', 'expired', 'security'],
    default: null,
  },
});

// Compound index for efficient queries
sessionSchema.index({ firebaseUid: 1, isActive: 1 });
sessionSchema.index({ firebaseUid: 1, lastActivity: -1 });

// TTL index - automatically delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to revoke session
sessionSchema.methods.revoke = function (reason = 'logout') {
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

// Static method to revoke all sessions for a user
sessionSchema.statics.revokeAllForUser = async function (firebaseUid, reason = 'security') {
  return this.updateMany(
    { firebaseUid, isActive: true },
    {
      $set: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    },
  );
};

// Static method to get active sessions for a user
sessionSchema.statics.getActiveSessions = function (firebaseUid) {
  return this.find({
    firebaseUid,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ lastActivity: -1 });
};

// Static method to cleanup old sessions
sessionSchema.statics.cleanupOldSessions = function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    $or: [
      { isActive: false, revokedAt: { $lt: cutoffDate } },
      { expiresAt: { $lt: cutoffDate } },
    ],
  });
};

module.exports = mongoose.model('Session', sessionSchema);
