// Backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    default: '',
  },
  isAdmin: {
    type: Boolean,
    default: false,
    index: true,
  },
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    country: { type: String, default: '' },
    isComplete: { type: Boolean, default: false },
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'standard', 'premium', 'enterprise'],
    default: 'free',
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
  monthlyQuota: {
    used: { type: Number, default: 0 },
    limit: { type: Number, default: 20 },
  },
  lastQuotaReset: {
    type: Date,
    default: new Date(),
  },
  aiSettings: {
    preferredModel: {
      type: String,
      enum: ['auto', 'gpt-4o', 'gpt-4o-mini'],
      default: 'auto',
    },
    allowPremiumAI: { type: Boolean, default: true },
    monthlyAIBudget: {
      allocated: { type: Number, default: 5.0 }, // $5 monthly budget for AI calls
      used: { type: Number, default: 0 },
      lastReset: { type: Date, default: new Date() },
    },
  },
  aiUsageStats: {
    totalAnalyses: { type: Number, default: 0 },
    gpt4oAnalyses: { type: Number, default: 0 },
    gpt4oMiniAnalyses: { type: Number, default: 0 },
    totalAICost: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: new Date() },
  },
  // GDPR compliance fields
  consent: {
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    dataProcessing: { type: Boolean, default: true }, // Required for service
    // Explicit consent for AI processing of document content (Art. 22 GDPR)
    // Also covers third-party processors: Azure OpenAI (Microsoft)
    aiProcessing: { type: Boolean, default: false },
    aiProcessingDate: { type: Date, default: null },
    lastUpdated: { type: Date, default: Date.now },
  },
  dataRetention: {
    analysesDeleteAfter: { type: Number, default: 730 }, // Days (2 years)
    accountCreated: { type: Date, default: Date.now },
  },
});

module.exports = mongoose.model('User', userSchema);
