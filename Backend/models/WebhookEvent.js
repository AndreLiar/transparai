// Backend/models/WebhookEvent.js
const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['stripe'],
    default: 'stripe',
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['processed', 'failed', 'duplicate'],
    default: 'processed',
  },
  error: {
    type: String,
    default: null,
  },
  metadata: {
    ip: String,
    userAgent: String,
    receivedAt: Date,
    processingTime: Number,
  },
});

// TTL index - automatically delete events older than 90 days
webhookEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
