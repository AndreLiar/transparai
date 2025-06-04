//Backend/models/User.js
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  source: String,
  summary: String,
  score: String,
  clauses: [String],
  pdfLink: String
});

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    default: ''
  },
  plan: {
    type: String,
    enum: ['starter', 'standard', 'premium'],
    default: 'starter'
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  dailyQuota: {
    used: { type: Number, default: 0 },
    limit: { type: Number, default: 2 }
  },
  lastQuotaReset: {
    type: Date,
    default: new Date()
  },
  analyses: [analysisSchema],
});

module.exports = mongoose.model('User', userSchema);
