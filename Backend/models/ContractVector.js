// Backend/models/ContractVector.js
// Stores Voyage AI embeddings for analyzed contracts.
// Enables MongoDB Atlas Vector Search for RAG context retrieval.
//
// Atlas Vector Search index to create (Atlas UI > Search > Create Index > JSON):
// {
//   "fields": [{
//     "type": "vector",
//     "path": "embedding",
//     "numDimensions": 1024,
//     "similarity": "cosine"
//   }, {
//     "type": "filter",
//     "path": "industry"
//   }, {
//     "type": "filter",
//     "path": "score"
//   }]
// }
// Index name: contract_vector_index

const mongoose = require('mongoose');

const contractVectorSchema = new mongoose.Schema({
  // Owning user — for privacy, only search within global pool, not per-user
  firebaseUid: { type: String, required: true, index: true },

  // Embedding — 1024 dimensions (voyage-law-2)
  embedding: { type: [Number], required: true },

  // Searchable metadata (used as pre-filters in $vectorSearch)
  industry: { type: String, default: 'default', index: true },
  score: { type: String }, // Excellent/Bon/Moyen/Médiocre/Problématique

  // Summary of what the AI found — used as RAG context snippet
  summary: { type: String, required: true },
  topClauses: { type: [String], default: [] }, // Top 3 clauses for context

  // Input fingerprint — no raw text stored (GDPR data minimisation)
  inputHash: { type: String, required: true },
  inputLengthChars: { type: Number },

  createdAt: { type: Date, default: Date.now },
});

// TTL: keep 2 years, consistent with AIDecisionLog
contractVectorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

module.exports = mongoose.model('ContractVector', contractVectorSchema);
