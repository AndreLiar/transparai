// Backend/models/ErrorLog.js
const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  errorId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'debug'],
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
  },
  request: {
    method: String,
    url: String,
    userAgent: String,
    ip: String,
    userId: String,
    body: mongoose.Schema.Types.Mixed,
    params: mongoose.Schema.Types.Mixed,
    query: mongoose.Schema.Types.Mixed,
  },
  response: {
    statusCode: Number,
    duration: Number,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  environment: {
    type: String,
    default: process.env.NODE_ENV || 'development',
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true,
  },
  resolvedAt: Date,
  resolvedBy: String,
  tags: [{
    type: String,
    index: true,
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
errorLogSchema.index({ timestamp: -1 });
errorLogSchema.index({ level: 1, timestamp: -1 });
errorLogSchema.index({ 'request.userId': 1, timestamp: -1 });
errorLogSchema.index({ resolved: 1, level: 1 });

// TTL index - auto-delete logs older than 90 days
errorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('ErrorLog', errorLogSchema);
