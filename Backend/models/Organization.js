// Backend/models/Organization.js
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  domain: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  plan: {
    type: String,
    enum: ['enterprise'],
    default: 'enterprise',
  },
  settings: {
    branding: {
      logo: { type: String, default: '' },
      primaryColor: { type: String, default: '#4f46e5' },
      secondaryColor: { type: String, default: '#6b7280' },
      companyName: { type: String, default: '' },
    },
  },
  billing: {
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    maxUsers: { type: Number, default: 50 },
    pricePerUser: { type: Number, default: 30 }, // €30/user/month
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  },
  usage: {
    currentUsers: { type: Number, default: 0 },
    totalAnalyses: { type: Number, default: 0 },
    monthlyAnalyses: { type: Number, default: 0 },
    lastMonthReset: { type: Date, default: Date.now },
  },
  adminUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

organizationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
