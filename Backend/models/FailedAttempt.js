// Backend/models/FailedAttempt.js
const mongoose = require('mongoose');

const failedAttemptSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['auth', 'login', 'password_reset', 'admin_access'],
    default: 'auth',
    required: true,
  },
  ip: {
    type: String,
    required: true,
    index: true,
  },
  userAgent: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    endpoint: String,
    email: String,
    reason: String,
  },
});

// Compound index for efficient queries
failedAttemptSchema.index({ identifier: 1, timestamp: -1 });
failedAttemptSchema.index({ ip: 1, timestamp: -1 });

// TTL index - automatically delete attempts older than 24 hours
failedAttemptSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

// Static method to check if identifier is locked out
failedAttemptSchema.statics.isLockedOut = async function (identifier, maxAttempts = 5, windowMinutes = 15) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const count = await this.countDocuments({
    identifier,
    timestamp: { $gte: windowStart },
  });

  return count >= maxAttempts;
};

// Static method to check if IP is rate limited
failedAttemptSchema.statics.isIPRateLimited = async function (ip, maxAttempts = 20, windowMinutes = 15) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const count = await this.countDocuments({
    ip,
    timestamp: { $gte: windowStart },
  });

  return count >= maxAttempts;
};

// Static method to record failed attempt
failedAttemptSchema.statics.recordAttempt = async function (identifier, ip, type = 'auth', metadata = {}) {
  return this.create({
    identifier,
    ip,
    type,
    userAgent: metadata.userAgent || '',
    metadata,
  });
};

// Static method to clear attempts after successful login
failedAttemptSchema.statics.clearAttempts = async function (identifier) {
  return this.deleteMany({ identifier });
};

module.exports = mongoose.model('FailedAttempt', failedAttemptSchema);
