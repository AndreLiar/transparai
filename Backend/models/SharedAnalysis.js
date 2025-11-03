// Backend/models/SharedAnalysis.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const approvalSchema = new mongoose.Schema({
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approverName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
    default: 'pending',
  },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const sharedAnalysisSchema = new mongoose.Schema({
  // Analysis reference
  analysisId: { type: mongoose.Schema.Types.ObjectId, required: true },
  analysisType: {
    type: String,
    enum: ['single', 'comparative'],
    required: true,
  },

  // Organization context
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

  // Sharing details
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: {
    type: String,
    enum: ['organization', 'managers', 'specific_users'],
    default: 'organization',
  },
  specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Analysis metadata
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [String],

  // Collaboration features
  allowComments: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: false },
  approvalWorkflow: [approvalSchema],
  comments: [commentSchema],

  // Status
  status: {
    type: String,
    enum: ['draft', 'shared', 'under_review', 'approved', 'published', 'archived'],
    default: 'shared',
  },

  // Permissions
  permissions: {
    canView: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    canComment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    canApprove: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },

  // Metrics
  viewCount: { type: Number, default: 0 },
  lastViewed: { type: Date, default: null },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
sharedAnalysisSchema.index({ organizationId: 1, status: 1 });
sharedAnalysisSchema.index({ sharedBy: 1, createdAt: -1 });
sharedAnalysisSchema.index({ 'permissions.canView': 1 });

// Update timestamp on save
sharedAnalysisSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SharedAnalysis', sharedAnalysisSchema);
