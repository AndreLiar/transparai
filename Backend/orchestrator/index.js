// Backend/orchestrator/index.js
// Central AI Orchestrator — single entry point for all LLM calls
// Implements: EU AI Act Art. 12 (logging), Art. 13 (transparency),
//             NIST AI RMF (Govern/Map/Measure/Manage), GDPR data minimisation

const crypto = require('crypto');
const AIDecisionLog = require('../models/AIDecisionLog');
const { validateInput, validateOutput, detectInjection, sanitizeInjection } = require('./guardrails');
const { buildFallbackChain, buildLLM, MODEL_COSTS } = require('./modelRouter');
const { parseSingleAnalysis, parseComparativeAnalysis } = require('./outputParser');
const {
  PROMPT_VERSION,
  PLAN_DEPTH,
  singleAnalysisPrompt,
  chunkAnalysisPrompt,
  chunkMergePrompt,
  comparativeAnalysisPrompt,
} = require('./prompts');
const { applyPlanLimit, chunkText, needsChunking } = require('./chunker');
const { DISCLAIMER_VERSION, enforceDisclaimer } = require('./disclaimer');
const { redactPII } = require('./piiRedactor');
const { INDUSTRY_TEMPLATES } = require('../utils/analysisTemplates');
const { findSimilarOrCached, storeEmbedding } = require('./vectorSearch');
const { callWithResilience } = require('./resilience');
const { getCached, setCached } = require('./promptCache');

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

/**
 * Run a prompt through the fallback chain until one succeeds.
 * Returns { rawText, modelUsed, actualCost, fallbackChain, latencyMs }
 */
const runWithFallback = async (formattedPrompt, user, textLength, maxTokens = 2048) => {
  const chain = buildFallbackChain(user, textLength);
  const fallbackLog = [];
  const start = Date.now();

  for (const entry of chain) {
    let llm;
    try {
      llm = buildLLM(entry.modelName, maxTokens);
    } catch (err) {
      fallbackLog.push({ model: entry.modelName, success: false });
      continue;
    }

    try {
      const response = await callWithResilience(
        entry.modelName,
        () => llm.invoke(formattedPrompt),
      );

      const rawText = typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);

      const usage = response.usage_metadata || response.response_metadata?.usage;
      const totalTokens = usage
        ? (usage.input_tokens || 0) + (usage.output_tokens || 0)
        : Math.ceil(textLength / 3);
      const actualCost = (totalTokens / 1000) * (MODEL_COSTS[entry.modelName] || 0);

      fallbackLog.push({ model: entry.modelName, success: true });

      return {
        rawText,
        modelUsed: entry.modelName,
        selectedEntry: entry,
        actualCost,
        fallbackChain: fallbackLog,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      console.error(`[Orchestrator] ${entry.modelName} failed:`, err.message);
      fallbackLog.push({ model: entry.modelName, success: false, reason: err.message });
    }
  }

  throw new Error('All AI models in the fallback chain failed. Please try again later.');
};

/**
 * Write an immutable audit record for this AI decision.
 */
const writeAuditLog = async ({
  firebaseUid, analysisType, selectedEntry, modelUsed,
  fallbackChain, inputText, rawOutput, parsed,
  guardrailResult, actualCost, latencyMs, industry,
  inputGuardrail,
}) => {
  try {
    await AIDecisionLog.create({
      firebaseUid,
      analysisType,
      promptVersion: PROMPT_VERSION,
      modelSelected: selectedEntry.modelName,
      modelActuallyUsed: modelUsed,
      selectionReason: selectedEntry.reason,
      fallbackChain,
      inputLengthChars: inputText.length,
      inputHash: sha256(inputText),
      outputHash: sha256(rawOutput),
      outputScore: parsed.score || parsed.summary?.substring(0, 20),
      clauseCount: parsed.clauses?.length,
      guardrails: {
        inputPassed: inputGuardrail.passed,
        outputPassed: guardrailResult.passed,
        hallucinationSignals: guardrailResult.hallucinationSignals,
        confidenceLevel: guardrailResult.confidenceLevel,
        requiresHumanReview: guardrailResult.requiresHumanReview,
      },
      actualCostUsd: actualCost,
      estimatedCostUsd: selectedEntry.estimatedCost,
      latencyMs,
      jurisdiction: 'FR',
      industry: industry || 'default',
      disclaimerVersion: DISCLAIMER_VERSION,
    });
  } catch (err) {
    // Audit log failure must not block the user response — log and continue
    console.error('[Orchestrator] Audit log write failed:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

/**
 * Analyse a single document.
 * For large documents (> 50k chars, paid plans only) runs a chunk → merge pipeline.
 * Free/starter plans are hard-capped at 50k chars.
 */
const analyseDocument = async ({ user, text, plan }) => {
  const effectivePlan = plan || user.plan || 'free';
  const depth = PLAN_DEPTH[effectivePlan] || PLAN_DEPTH.standard;

  // 1. Input guardrail (on raw text before any truncation)
  const inputGuardrail = validateInput(text);
  if (!inputGuardrail.passed) {
    throw new Error(`Contenu invalide : ${inputGuardrail.reasons.join('. ')}`);
  }

  // 2. Apply plan-based character limit (hard cap for free/starter, higher for paid)
  const limitedText = applyPlanLimit(text, effectivePlan);

  // 2a. Prompt injection detection + sanitization
  //     Contracts may embed adversarial instructions — neutralise before any LLM call.
  const injectionCheck = detectInjection(limitedText);
  if (injectionCheck.hasInjection) {
    console.warn('[Orchestrator] Prompt injection detected — sanitizing:', injectionCheck.patterns);
  }
  const sanitizedText = injectionCheck.hasInjection ? sanitizeInjection(limitedText) : limitedText;

  // 2b. PII redaction — strip personal data before sending to third-party LLM API (GDPR Art. 5)
  const { redactedText: processedText, redactionCount, typesFound: piiTypesFound } = redactPII(sanitizedText);
  if (redactionCount > 0) {
    console.log(`[Orchestrator] PII redacted: ${redactionCount} item(s) — types: ${piiTypesFound.join(', ')}`);
  }

  const inputHash = sha256(processedText);

  // 3. Global prompt cache — same contract text + same prompt version = same result.
  //    Netflix CGV analysed by user #1 is reused for every subsequent user at $0.00.
  const cachedResult = await getCached(inputHash, PROMPT_VERSION);
  if (cachedResult) {
    console.log(`[Orchestrator] Prompt cache hit — inputHash: ${inputHash.substring(0, 12)}…`);
    return enforceDisclaimer({
      resume:  cachedResult.resume,
      score:   cachedResult.score,
      clauses: [...(cachedResult.clauses || [])], // copy so we don't mutate cached entry
      _meta: {
        modelUsed:           cachedResult.modelUsed,
        actualCost:          0,
        promptVersion:       cachedResult.promptVersion || PROMPT_VERSION,
        confidenceLevel:     cachedResult.confidenceLevel,
        requiresHumanReview: cachedResult.requiresHumanReview,
        disclaimerVersion:   cachedResult.disclaimerVersion || DISCLAIMER_VERSION,
        jurisdiction:        cachedResult.jurisdiction || 'FR',
        analysisDepth:       PLAN_DEPTH[effectivePlan]?.complexity || 'standard',
        chunked:             false,
        fromPromptCache:     true,
      },
    });
  }

  // 4. RAG context — skipped for free/starter; hash cache avoids redundant embeds
  const ragContext = await findSimilarOrCached({
    text: processedText,
    plan: effectivePlan,
    inputHash,
    limit: 3,
  });

  const isPremiumPlan = ['premium', 'enterprise'].includes(effectivePlan);
  let extraCriteria = isPremiumPlan
    ? '- Équilibre contractuel\n- Respect du droit de la consommation\n- Sécurité juridique\n- Conformité réglementaire (RGPD, Code consommation)'
    : '';

  if (ragContext.length > 0) {
    const ragBlock = [
      '',
      'CONTEXTE — analyses similaires pour calibrer le score :',
      ...ragContext.map((ctx, i) => `${i + 1}. ${ctx}`),
    ].join('\n');
    extraCriteria = extraCriteria ? `${extraCriteria}\n${ragBlock}` : ragBlock;
  }

  // ── Chunking pipeline for large documents ────────────────────────────────
  if (needsChunking(processedText, effectivePlan)) {
    return analyseDocumentChunked({
      user, processedText, inputHash, inputGuardrail,
      depth, extraCriteria, effectivePlan,
    });
  }

  // ── Direct analysis for documents that fit in one prompt ─────────────────

  // 4. Format prompt
  const formattedPrompt = await singleAnalysisPrompt.format({
    complexity: depth.complexity,
    clauseCount: depth.clauseCount,
    extra_criteria: extraCriteria,
    document_text: processedText,
  });

  // 5. Run through model fallback chain
  const { rawText, modelUsed, selectedEntry, actualCost, fallbackChain, latencyMs } =
    await runWithFallback(formattedPrompt, user, processedText.length);

  // 6. Parse and validate output schema
  const parsed = parseSingleAnalysis(rawText);

  // 7. Output guardrail
  const guardrailResult = validateOutput(parsed, rawText);

  // 8. Audit log (async — must not block user response)
  writeAuditLog({
    firebaseUid: user.firebaseUid,
    analysisType: 'single',
    selectedEntry,
    modelUsed,
    fallbackChain,
    inputText: processedText,
    rawOutput: rawText,
    parsed,
    guardrailResult,
    actualCost,
    latencyMs,
    inputGuardrail,
  }).catch((err) => console.error('[Orchestrator] Audit log async write failed:', err.message));

  // 9. Store in global prompt cache (non-blocking) — future users get this for free
  setCached(inputHash, PROMPT_VERSION, {
    resume:              parsed.resume,
    score:               parsed.score,
    clauses:             parsed.clauses,
    modelUsed,
    confidenceLevel:     guardrailResult.confidenceLevel,
    requiresHumanReview: guardrailResult.requiresHumanReview,
    disclaimerVersion:   DISCLAIMER_VERSION,
    jurisdiction:        'FR',
    promptVersion:       PROMPT_VERSION,
  }).catch((err) => console.error('[Orchestrator] PromptCache store failed:', err.message));

  // 10. Store embedding (non-blocking, fire-and-forget)
  storeEmbedding({
    firebaseUid: user.firebaseUid,
    text: processedText,
    industry: 'default',
    score: parsed.score,
    summary: parsed.resume,
    topClauses: (parsed.clauses || []).slice(0, 3),
  }).catch((err) => console.error('[Orchestrator] storeEmbedding error:', err.message));

  return enforceDisclaimer({
    resume: parsed.resume,
    score: parsed.score,
    clauses: parsed.clauses,
    _meta: {
      modelUsed,
      actualCost,
      promptVersion: PROMPT_VERSION,
      confidenceLevel: guardrailResult.confidenceLevel,
      requiresHumanReview: guardrailResult.requiresHumanReview,
      disclaimerVersion: DISCLAIMER_VERSION,
      jurisdiction: 'FR',
      analysisDepth: depth.complexity,
      chunked: false,
      fromPromptCache: false,
      injectionDetected: injectionCheck.hasInjection,
      piiRedacted: redactionCount > 0,
      piiTypes: piiTypesFound,
    },
  });
};

/**
 * Chunked analysis pipeline for large documents.
 * 1. Split into 50k-char overlapping chunks
 * 2. Analyse each chunk independently (partial clauses only, no score)
 * 3. Merge all partial results into one final analysis via a merge prompt
 */
const analyseDocumentChunked = async ({
  user, processedText, inputHash, inputGuardrail,
  depth, extraCriteria, effectivePlan,
}) => {
  const chunks = chunkText(processedText);
  console.log(`[Orchestrator] Chunking: ${chunks.length} chunks for ${processedText.length} chars`);

  const start = Date.now();

  // Step 1 — analyse each chunk in parallel (bounded by model rate limits)
  // Sequential to avoid overwhelming the LLM API on large documents
  const partialResults = [];
  let totalCost = 0;
  let lastModelUsed = null;
  let lastSelectedEntry = null;
  let lastFallbackChain = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkPrompt = await chunkAnalysisPrompt.format({
      chunk_index: i + 1,
      chunk_total: chunks.length,
      chunk_text: chunks[i],
    });

    const result = await runWithFallback(chunkPrompt, user, chunks[i].length, 1024);
    totalCost += result.actualCost;
    lastModelUsed = result.modelUsed;
    lastSelectedEntry = result.selectedEntry;
    lastFallbackChain = result.fallbackChain;

    // Parse chunk result loosely — partial schema (clauses + partial_summary)
    let chunkParsed;
    try {
      const cleaned = result.rawText.trim()
        .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      chunkParsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch {
      console.warn(`[Orchestrator] Chunk ${i + 1} parse failed, skipping`);
      continue;
    }

    partialResults.push({
      chunk: i + 1,
      partial_summary: chunkParsed.partial_summary || '',
      clauses: Array.isArray(chunkParsed.clauses) ? chunkParsed.clauses : [],
    });
  }

  if (partialResults.length === 0) {
    throw new Error('All chunks failed to parse. Document may be malformed.');
  }

  // Step 2 — merge prompt: summarise all partial results into final analysis
  const partialResultsText = partialResults
    .map((r) => `Partie ${r.chunk} :\nRésumé partiel : ${r.partial_summary}\nClauses :\n${r.clauses.map((c) => `- ${c}`).join('\n')}`)
    .join('\n\n---\n\n');

  const mergePrompt = await chunkMergePrompt.format({
    chunk_total: chunks.length,
    partial_results: partialResultsText,
    clause_count: depth.clauseCount,
    complexity: depth.complexity,
  });

  const mergeResult = await runWithFallback(mergePrompt, user, partialResultsText.length, 2048);
  totalCost += mergeResult.actualCost;

  const parsed = parseSingleAnalysis(mergeResult.rawText);
  const guardrailResult = validateOutput(parsed, mergeResult.rawText);
  const latencyMs = Date.now() - start;

  // Audit log for the full chunked operation
  writeAuditLog({
    firebaseUid: user.firebaseUid,
    analysisType: 'single',
    selectedEntry: lastSelectedEntry,
    modelUsed: lastModelUsed,
    fallbackChain: lastFallbackChain,
    inputText: processedText,
    rawOutput: mergeResult.rawText,
    parsed,
    guardrailResult,
    actualCost: totalCost,
    latencyMs,
    inputGuardrail,
  }).catch((err) => console.error('[Orchestrator] Audit log async write failed:', err.message));

  // Store in global prompt cache — chunked large docs also benefit future users
  setCached(inputHash, PROMPT_VERSION, {
    resume:              parsed.resume,
    score:               parsed.score,
    clauses:             parsed.clauses,
    modelUsed:           lastModelUsed,
    confidenceLevel:     guardrailResult.confidenceLevel,
    requiresHumanReview: guardrailResult.requiresHumanReview,
    disclaimerVersion:   DISCLAIMER_VERSION,
    jurisdiction:        'FR',
    promptVersion:       PROMPT_VERSION,
  }).catch((err) => console.error('[Orchestrator] PromptCache store failed:', err.message));

  storeEmbedding({
    firebaseUid: user.firebaseUid,
    text: processedText,
    industry: 'default',
    score: parsed.score,
    summary: parsed.resume,
    topClauses: (parsed.clauses || []).slice(0, 3),
  }).catch((err) => console.error('[Orchestrator] storeEmbedding error:', err.message));

  return enforceDisclaimer({
    resume: parsed.resume,
    score: parsed.score,
    clauses: parsed.clauses,
    _meta: {
      modelUsed: lastModelUsed,
      actualCost: totalCost,
      promptVersion: PROMPT_VERSION,
      confidenceLevel: guardrailResult.confidenceLevel,
      requiresHumanReview: guardrailResult.requiresHumanReview,
      disclaimerVersion: DISCLAIMER_VERSION,
      jurisdiction: 'FR',
      analysisDepth: depth.complexity,
      chunked: true,
      chunkCount: chunks.length,
      fromPromptCache: false,
    },
  });
};

/**
 * Comparative analysis of multiple documents.
 * Replaces the direct Gemini call in comparativeService.js
 */
const analyseComparative = async ({ user, documents, industry = 'default' }) => {
  const template = INDUSTRY_TEMPLATES[industry] || INDUSTRY_TEMPLATES.default;

  // Validate each document
  for (const doc of documents) {
    const check = validateInput(doc.text || '');
    if (!check.passed) {
      throw new Error(`Document "${doc.name}" invalide : ${check.reasons.join('. ')}`);
    }
  }

  const documentsText = documents
    .map((doc, i) => `=== DOCUMENT ${i + 1}: ${doc.name} ===\n${doc.text}`)
    .join('\n\n');

  // Truncate combined text
  const truncated = documentsText.length > 100000
    ? documentsText.substring(0, 100000) + '...'
    : documentsText;

  // Injection sanitization + PII redaction on combined text
  const compInjectionCheck = detectInjection(truncated);
  if (compInjectionCheck.hasInjection) {
    console.warn('[Orchestrator] Comparative: prompt injection detected — sanitizing');
  }
  const compSanitized = compInjectionCheck.hasInjection ? sanitizeInjection(truncated) : truncated;
  const { redactedText: processedText } = redactPII(compSanitized);

  const inputGuardrail = validateInput(processedText);

  const criteriaList = template.criteria.map(c => `- ${c}`).join('\n');
  const complianceList = template.compliance.map(c => `- ${c}`).join('\n');

  const formattedPrompt = await comparativeAnalysisPrompt.format({
    industry_name: template.name,
    criteria_list: criteriaList,
    compliance_list: complianceList,
    documents_text: processedText,
  });

  const maxTokens = user.plan === 'enterprise' ? 8192 : 4096;

  const { rawText, modelUsed, selectedEntry, actualCost, fallbackChain, latencyMs } =
    await runWithFallback(formattedPrompt, user, processedText.length, maxTokens);

  const parsed = parseComparativeAnalysis(rawText);
  const guardrailResult = validateOutput(parsed, rawText);

  writeAuditLog({
    firebaseUid: user.firebaseUid,
    analysisType: 'comparative',
    selectedEntry,
    modelUsed,
    fallbackChain,
    inputText: processedText,
    rawOutput: rawText,
    parsed,
    guardrailResult,
    actualCost,
    latencyMs,
    industry,
    inputGuardrail,
  }).catch((err) => console.error('[Orchestrator] Audit log async write failed:', err.message));

  return enforceDisclaimer({
    summary: parsed.summary,
    comparisonTable: parsed.comparison_table,
    bestPractices: parsed.best_practices,
    redFlags: parsed.red_flags,
    recommendations: parsed.recommendations,
    overallRanking: parsed.overall_ranking,
    complianceAnalysis: parsed.compliance_analysis,
    industryInsights: parsed.industry_insights,
    clauses: [], // enforceDisclaimer appends disclaimer here for comparative too
    _meta: {
      modelUsed,
      actualCost,
      promptVersion: PROMPT_VERSION,
      confidenceLevel: guardrailResult.confidenceLevel,
      requiresHumanReview: guardrailResult.requiresHumanReview,
      disclaimerVersion: DISCLAIMER_VERSION,
      jurisdiction: 'FR',
      industry,
    },
  });
};

module.exports = { analyseDocument, analyseComparative };
