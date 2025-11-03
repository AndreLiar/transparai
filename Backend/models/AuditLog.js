// Backend/models/AuditLog.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Analysis actions
      'analysis_created',
      'analysis_viewed',
      'analysis_edited',
      'analysis_deleted',
      'analysis_exported',
      'comparative_analysis_created',

      // User management actions
      'user_invited',
      'user_role_changed',
      'user_removed',
      'user_joined',

      // Organization actions
      'organization_settings_updated',
      'organization_branding_updated',

      // Authentication actions
      'user_login',
      'user_logout',

      // Billing actions
      'billing_viewed',
      'subscription_updated',
    ],
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  metadata: {
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resourceId: { type: String, default: null },
    resourceType: { type: String, default: null },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// TTL index to automatically delete old logs after 2 years
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

auditLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('AuditLog', auditLogSchema);
