// Backend/models/User.js
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  source: String,
  summary: String,
  score: String,
  clauses: [String],
  pdfLink: String,
});

const comparativeAnalysisSchema = new mongoose.Schema({
  documents: [{
    name: String,
    source: String,
  }],
  industry: { type: String, default: 'default' },
  template: { type: String, default: 'Analyse Standard' },
  summary: String,
  comparisonTable: [{
    criteria: String,
    documents: [{
      name: String,
      value: String,
      score: Number,
    }],
  }],
  bestPractices: [String],
  redFlags: [String],
  recommendations: [String],
  overallRanking: [{
    name: String,
    rank: Number,
    justification: String,
  }],
  complianceAnalysis: [{
    framework: String,
    status: String,
    details: String,
  }],
  industryInsights: [String],
  createdAt: { type: Date, default: Date.now },
});

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
  profile: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    country: { type: String, default: '' },
    isComplete: { type: Boolean, default: false },
  },
  plan: {
    type: String,
    enum: ['free', 'standard', 'premium', 'enterprise'],
    default: 'free',
  },
  organization: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    role: {
      type: String,
      enum: ['admin', 'manager', 'analyst', 'viewer'],
      default: null,
    },
    joinedAt: { type: Date, default: null },
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
      enum: ['auto', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gemini'],
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
    gptAnalyses: { type: Number, default: 0 },
    geminiAnalyses: { type: Number, default: 0 },
    totalAICost: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: new Date() },
  },
  analyses: [analysisSchema],
  comparativeAnalyses: [comparativeAnalysisSchema],
});

module.exports = mongoose.model('User', userSchema);
