// Backend/orchestrator/chunker.js
// Splits large contract text into overlapping chunks for LLM summarisation pipeline.
// Prevents token explosion, timeouts, and high inference costs on large documents.

// Hard limits by plan — characters (not tokens; ~3 chars per token estimate)
const PLAN_LIMITS = {
  free: 50_000, // hard cap — no chunking, text truncated
  starter: 50_000, // hard cap — no chunking, text truncated
  standard: 100_000, // up to 2 chunks of 50k
  premium: 150_000, // up to 3 chunks of 50k
  enterprise: 200_000, // up to 4 chunks of 50k
};

const CHUNK_SIZE = 50_000; // characters per chunk
const CHUNK_OVERLAP = 1_000; // overlap to preserve clause continuity at boundaries

/**
 * Apply the plan's character limit and return the capped text.
 * Free/starter plans get truncated here — no chunking for them.
 */
const applyPlanLimit = (text, plan) => {
  const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  if (text.length <= limit) return text;
  return text.substring(0, limit);
};

/**
 * Split text into overlapping chunks of CHUNK_SIZE characters.
 * Returns the original text unchanged if it fits in one chunk.
 *
 * Overlap ensures clauses that straddle a boundary are seen in full
 * by at least one chunk's LLM call.
 *
 * Splits on paragraph boundaries when possible to avoid cutting mid-clause.
 */
const chunkText = (text) => {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + CHUNK_SIZE;

    if (end < text.length) {
      // Try to split on a paragraph boundary within the last 2k chars of the chunk
      const searchWindow = text.substring(end - 2_000, end);
      const lastNewline = searchWindow.lastIndexOf('\n\n');
      const lastPeriod = searchWindow.lastIndexOf('. ');
      const boundary = lastNewline !== -1 ? lastNewline : lastPeriod;

      if (boundary !== -1) {
        end = end - 2_000 + boundary + 1;
      }
    }

    chunks.push(text.substring(start, Math.min(end, text.length)));

    // Next chunk starts with overlap to preserve cross-boundary clauses
    start = end - CHUNK_OVERLAP;
    if (start >= text.length) break;
  }

  return chunks;
};

/**
 * Returns true if the text requires chunking for this plan.
 * Free/starter plans never chunk — they are hard-truncated instead.
 */
const needsChunking = (text, plan) => {
  if (plan === 'free' || plan === 'starter') return false;
  return text.length > CHUNK_SIZE;
};

module.exports = {
  applyPlanLimit, chunkText, needsChunking, CHUNK_SIZE, PLAN_LIMITS,
};
