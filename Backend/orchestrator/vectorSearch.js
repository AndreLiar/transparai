// Backend/orchestrator/vectorSearch.js
// Voyage AI embeddings + MongoDB Atlas Vector Search for RAG context.
//
// Setup required (one-time, Atlas UI > Search > Create Index > JSON editor):
// Collection: contractvectors
// Index name: contract_vector_index
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

const crypto = require('crypto');
const VoyageAI = require('voyageai').default || require('voyageai');
const ContractVector = require('../models/ContractVector');

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

let voyageClient = null;

const getVoyageClient = () => {
  if (!voyageClient) {
    if (!process.env.VOYAGE_API_KEY) {
      throw new Error('VOYAGE_API_KEY is not set — vector search unavailable');
    }
    voyageClient = new VoyageAI({ apiKey: process.env.VOYAGE_API_KEY });
  }
  return voyageClient;
};

/**
 * Embed a text string using voyage-law-2.
 * Returns a 1024-dimensional float array.
 */
const embedText = async (text) => {
  const client = getVoyageClient();

  // Voyage AI has a token limit per call — truncate safely
  const truncated = text.length > 120000 ? text.substring(0, 120000) : text;

  const response = await client.embed({
    input: [truncated],
    model: 'voyage-law-2',
  });

  return response.data[0].embedding; // float[]
};

/**
 * Store an embedding for a completed contract analysis.
 * Called AFTER a successful analysis so we never store partial results.
 *
 * @param {Object} opts
 * @param {string} opts.firebaseUid
 * @param {string} opts.text           Raw contract text (used to generate embedding)
 * @param {string} opts.industry       e.g. 'saas', 'ecommerce', 'default'
 * @param {string} opts.score          e.g. 'Bon', 'Médiocre'
 * @param {string} opts.summary        1–2 sentence AI summary
 * @param {string[]} opts.topClauses   Top 3 clause descriptions
 */
const storeEmbedding = async ({
  firebaseUid, text, industry, score, summary, topClauses,
}) => {
  const inputHash = sha256(text);

  // Skip if we already stored an embedding for identical input
  const existing = await ContractVector.findOne({ inputHash });
  if (existing) return;

  let embedding;
  try {
    embedding = await embedText(text);
  } catch (err) {
    // Non-fatal — don't block the analysis response
    console.error('[VectorSearch] Embedding failed, skipping store:', err.message);
    return;
  }

  try {
    await ContractVector.create({
      firebaseUid,
      embedding,
      industry: industry || 'default',
      score,
      summary,
      topClauses: topClauses || [],
      inputHash,
      inputLengthChars: text.length,
    });
  } catch (err) {
    console.error('[VectorSearch] Store failed:', err.message);
  }
};

/**
 * Find the top-k most similar past analyses and return them as RAG context strings.
 * Returns [] if vector search is unavailable (no API key, index not ready, etc.)
 *
 * @param {Object} opts
 * @param {string} opts.text       Current contract text to match against
 * @param {string} [opts.industry] Filter by industry (optional)
 * @param {number} [opts.limit]    Max results (default 3)
 * @returns {string[]}             Array of summary strings to inject into prompt
 */
const findSimilar = async ({ text, industry, limit = 3 }) => {
  if (!process.env.VOYAGE_API_KEY) return [];

  let queryEmbedding;
  try {
    queryEmbedding = await embedText(text);
  } catch (err) {
    console.error('[VectorSearch] Query embedding failed:', err.message);
    return [];
  }

  const pipeline = [
    {
      $vectorSearch: {
        index: 'contract_vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: limit * 10,
        limit,
        // Apply industry pre-filter only when a specific industry is requested
        ...(industry && industry !== 'default' ? {
          filter: { industry: { $eq: industry } },
        } : {}),
      },
    },
    {
      $project: {
        _id: 0,
        summary: 1,
        topClauses: 1,
        score: 1,
        industry: 1,
        vectorSearchScore: { $meta: 'vectorSearchScore' },
      },
    },
    {
      // Only include results with meaningful similarity (cosine > 0.75)
      $match: { vectorSearchScore: { $gte: 0.75 } },
    },
  ];

  try {
    const results = await ContractVector.aggregate(pipeline);

    if (!results.length) return [];

    // Format each result as a compact context string for the prompt
    return results.map((r) => {
      const clauses = r.topClauses?.length
        ? `Clauses principales : ${r.topClauses.join(' | ')}`
        : '';
      return `[Analyse similaire — score ${r.score || 'N/A'}] ${r.summary}${clauses ? `. ${clauses}` : ''}`;
    });
  } catch (err) {
    // Atlas Vector Search returns an error if the index doesn't exist yet
    if (err.message?.includes('$vectorSearch') || err.code === 31082) {
      console.warn('[VectorSearch] Index not ready yet — RAG context skipped.');
    } else {
      console.error('[VectorSearch] Aggregation failed:', err.message);
    }
    return [];
  }
};

/**
 * Plan-gated RAG lookup with hash-based cache.
 * - Skips entirely for free/starter plans
 * - Returns cached context string if this exact document was already embedded
 * - Falls back to full vector search on cache miss
 */
const findSimilarOrCached = async ({
  text, plan, inputHash, limit = 3,
}) => {
  if (plan === 'free' || plan === 'starter') return [];

  if (!process.env.VOYAGE_API_KEY) return [];

  // Cache hit — avoid redundant Voyage AI call
  const existing = await ContractVector.findOne(
    { inputHash },
    { summary: 1, topClauses: 1, score: 1 },
  ).lean();

  if (existing) {
    const clauses = existing.topClauses?.length
      ? `Clauses principales : ${existing.topClauses.join(' | ')}`
      : '';
    return [`[Analyse similaire — score ${existing.score || 'N/A'}] ${existing.summary}${clauses ? `. ${clauses}` : ''}`];
  }

  return findSimilar({ text, limit });
};

module.exports = {
  embedText, storeEmbedding, findSimilar, findSimilarOrCached,
};
