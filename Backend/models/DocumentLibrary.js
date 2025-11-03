// Backend/models/DocumentLibrary.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const documentLibrarySchema = new mongoose.Schema({
  // User ownership
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Document identification (without storing original file)
  name: { type: String, required: true },
  originalName: { type: String, required: true }, // User's original filename

  // Document fingerprinting for duplicate detection
  contentHash: {
    type: String,
    required: true,
    index: true,
  }, // SHA-256 hash of extracted text
  sizeBytes: { type: Number }, // Original file size for reference

  // Extracted content (what we actually need for analysis)
  extractedText: { type: String, required: true },

  // Processing metadata
  source: {
    type: String,
    enum: ['upload', 'ocr'],
    required: true,
  },
  fileType: { type: String }, // pdf, jpg, png, etc.
  pageCount: { type: Number }, // For PDFs
  ocrConfidence: { type: Number }, // For OCR processed documents

  // Usage tracking
  usageCount: { type: Number, default: 1 },
  lastUsed: { type: Date, default: Date.now },

  // Analysis references (to track where this document was used)
  analysisReferences: [{
    analysisId: { type: mongoose.Schema.Types.ObjectId },
    analysisType: {
      type: String,
      enum: ['single', 'comparative'],
    },
    usedAt: { type: Date, default: Date.now },
  }],

  // Privacy and retention
  isActive: { type: Boolean, default: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year retention
  },

  // Organization context (for enterprise users)
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  sharedWithOrg: { type: Boolean, default: false },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for user + hash (prevent duplicates per user)
documentLibrarySchema.index({ userId: 1, contentHash: 1 }, { unique: true });

// Index for organization sharing
documentLibrarySchema.index({ organizationId: 1, sharedWithOrg: 1 });

// Auto-cleanup expired documents
documentLibrarySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate content hash
documentLibrarySchema.statics.generateContentHash = function (text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
};

// Instance method to update usage
documentLibrarySchema.methods.recordUsage = function (analysisId, analysisType) {
  this.usageCount += 1;
  this.lastUsed = new Date();
  this.analysisReferences.push({
    analysisId,
    analysisType,
    usedAt: new Date(),
  });
  this.updatedAt = new Date();
  return this.save();
};

// Pre-save middleware to update timestamps
documentLibrarySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DocumentLibrary', documentLibrarySchema);
