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
    index: true, // ✅ for performance
  },
  email: {
    type: String,
    required: true,
    default: '', // will be updated later if needed
  },
  plan: {
    type: String,
    default: 'starter',
  },
  dailyQuota: {
    used: { type: Number, default: 0 },
    limit: { type: Number, default: 10 } // ✔️ fallback for starter
  },
  analyses: [analysisSchema],
});

module.exports = mongoose.model('User', userSchema);
