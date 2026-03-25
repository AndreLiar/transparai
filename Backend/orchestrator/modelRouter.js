// Backend/orchestrator/modelRouter.js
// Plan-aware model selection via Azure AI Foundry.
//
// All AI traffic routes exclusively through Azure OpenAI — no direct OpenAI fallback.
// This ensures user data stays within the platform owner's Azure tenant.
//
// Azure AI Foundry gives you:
//   - Infrastructure-level health routing between deployments
//   - Azure Monitor metrics (latency, errors, tokens) for free
//   - Access to gpt-4o and gpt-4o-mini (better + cheaper than gpt-4-turbo / gpt-3.5)
//   - Content filtering built-in (useful for legal docs)
//
// Deployment name convention expected in Foundry:
//   gpt-4o       → deployment name: "gpt-4o"
//   gpt-4o-mini  → deployment name: "gpt-4o-mini"
// These can be overridden with AZURE_OPENAI_DEPLOYMENT_GPT4O and
// AZURE_OPENAI_DEPLOYMENT_GPT4O_MINI env vars.

const { AzureChatOpenAI } = require('@langchain/openai');

// ── Cost per 1K tokens (input + output blended estimate) ─────────────────────
// Azure pricing matches OpenAI pricing for the same models.
const MODEL_COSTS = {
  'gpt-4o':       0.005,  // $5/1M input + $15/1M output → ~$0.005/1k blended
  'gpt-4o-mini':  0.0003, // $0.15/1M input + $0.60/1M output → ~$0.0003/1k blended
};

// ── Monthly AI budget by plan (USD) ──────────────────────────────────────────
// Must stay in sync with PLAN_CONFIG.aiBudget in planUtils.js
// Free/starter use gpt-4o-mini (lowest cost Azure model) within a tight budget cap.
const PLAN_AI_BUDGETS = {
  free:       0.5,   // small Azure budget — gpt-4o-mini only, 5 analyses/mo
  starter:    0.5,
  standard:   3.0,   // covers ~100 gpt-4o-mini analyses
  premium:   15.0,   // covers ~300 gpt-4o or ~16k gpt-4o-mini analyses
  enterprise: 75.0,  // covers a full legal team
};

// ── Azure Foundry config (resolved once at startup) ───────────────────────────
const AZURE_ENDPOINT    = process.env.AZURE_OPENAI_ENDPOINT;    // e.g. https://my-resource.openai.azure.com/
const AZURE_API_KEY     = process.env.AZURE_OPENAI_API_KEY;
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

// Deployment names — default to model names, overridable per environment
const AZURE_DEPLOY_GPT4O      = process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O      || 'gpt-4o';
const AZURE_DEPLOY_GPT4O_MINI = process.env.AZURE_OPENAI_DEPLOYMENT_GPT4O_MINI || 'gpt-4o-mini';

if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
  throw new Error('[ModelRouter] AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY are required. All AI traffic must route through Azure.');
}

console.log(`[ModelRouter] Azure AI Foundry enabled — endpoint: ${AZURE_ENDPOINT}`);

// ── Token estimation ──────────────────────────────────────────────────────────
// GPT-4o family: ~4 chars/token. Gemini: similar. We use 3 for a safe upper bound.
const estimateTokens = (textLength) => Math.ceil(textLength / 3);
const estimateCost = (modelName, textLength) =>
  (estimateTokens(textLength) / 1000) * (MODEL_COSTS[modelName] || 0);

// ── Token-length model tiers ──────────────────────────────────────────────────
// Prevents sending 15k-token documents to gpt-4o when gpt-4o-mini handles them
// just as well at a fraction of the cost.
//
//   < 5,000 tokens  → gpt-4o         (complex reasoning, short/medium docs)
//   5k+ tokens      → gpt-4o-mini    (good comprehension, lower cost, 128k context)
//
// Token thresholds in characters (×3 chars/token estimate):
const LENGTH_TIER = {
  GPT4O_MAX_CHARS: 15_000,  // 5,000 tokens × 3 — above this, cap at gpt-4o-mini
};

/**
 * Given the plan-allowed model and document length, apply token-length downgrade.
 * Returns { modelName, lengthDowngrade } — may cap gpt-4o to gpt-4o-mini for long docs.
 * gpt-4o-mini has a 128k context window and handles any document size.
 */
const applyLengthTier = (preferredModel, textLength) => {
  // Cap gpt-4o at 5k tokens — use gpt-4o-mini for longer docs (same quality, lower cost)
  if (preferredModel === 'gpt-4o' && textLength > LENGTH_TIER.GPT4O_MAX_CHARS) {
    return {
      modelName: 'gpt-4o-mini',
      lengthDowngrade: { from: 'gpt-4o', reason: `doc_too_long_for_gpt4o (${estimateTokens(textLength).toLocaleString()} tokens > 5k)` },
    };
  }

  return { modelName: preferredModel, lengthDowngrade: null };
};

/**
 * Cost + length guardrail — pick the best model this user can actually afford
 * AND that is appropriate for the document size.
 *
 * Resolution order:
 *   1. User's preferred model   — if affordable AND document fits
 *   2. gpt-4o                   — premium/enterprise + auto, if affordable AND fits
 *   3. gpt-4o-mini              — all plans (lowest cost, 128k context — final fallback)
 *
 * Each downgrade is recorded in `downgrades[]` so callers can log it.
 * Returns { modelName, estimatedCost, reason, downgrades[] }
 */
const selectAffordableModel = (user, textLength) => {
  const plan            = user.plan || 'free';
  const budget          = user.aiSettings?.monthlyAIBudget || { allocated: 0, used: 0 };
  const remainingBudget = budget.allocated - budget.used;
  const userPreference  = user.aiSettings?.preferredModel || 'auto';
  const allowPremiumAI  = user.aiSettings?.allowPremiumAI !== false;
  const downgrades      = [];

  // Free/starter — gpt-4o-mini only (within their small budget cap)
  if (plan === 'free' || plan === 'starter') {
    return { modelName: 'gpt-4o-mini', estimatedCost: estimateCost('gpt-4o-mini', textLength), reason: 'free-plan-mini-only', downgrades };
  }

  // Helper: try a candidate model through both cost and length guardrails
  const tryModel = (candidate, reason) => {
    const cost = estimateCost(candidate, textLength);
    if (cost > remainingBudget) {
      downgrades.push({ from: candidate, reason: `budget_exceeded (need $${cost.toFixed(4)}, remaining $${remainingBudget.toFixed(4)})` });
      return null;
    }
    const { modelName: tiered, lengthDowngrade } = applyLengthTier(candidate, textLength);
    if (lengthDowngrade) downgrades.push(lengthDowngrade);
    return { modelName: tiered, estimatedCost: estimateCost(tiered, textLength), reason };
  };

  // ── Try user preference first ──────────────────────────────────────────────
  if (userPreference !== 'auto' && allowPremiumAI) {
    const result = tryModel(userPreference, 'user-preference');
    if (result) return { ...result, downgrades };
  }

  // ── gpt-4o (premium/enterprise auto) ──────────────────────────────────────
  if ((plan === 'premium' || plan === 'enterprise') && allowPremiumAI) {
    const result = tryModel('gpt-4o', 'premium-auto-select');
    if (result) return { ...result, downgrades };
  }

  // ── gpt-4o-mini — final fallback for all plans ────────────────────────────
  if (downgrades.length > 0) {
    downgrades.push({ to: 'gpt-4o-mini', reason: 'cost-or-length-guardrail-fallback' });
  }
  return { modelName: 'gpt-4o-mini', estimatedCost: estimateCost('gpt-4o-mini', textLength), reason: 'gpt4o-mini-fallback', downgrades };
};

/**
 * Build the ordered list of models to try for this user + document.
 * Uses selectAffordableModel as the primary entry, then adds gpt-4o-mini
 * as error-recovery fallback if the primary is gpt-4o.
 * Returns [{ modelName, estimatedCost, reason }]
 */
const buildFallbackChain = (user, textLength) => {
  const selected = selectAffordableModel(user, textLength);

  // Log downgrades at selection time so they appear in the request log
  if (selected.downgrades?.length > 0) {
    console.warn('[ModelRouter] Cost guardrail triggered — model downgraded:', selected.downgrades);
  }

  const chain = [{ modelName: selected.modelName, estimatedCost: selected.estimatedCost, reason: selected.reason }];

  // If primary is gpt-4o, add gpt-4o-mini as error-recovery fallback
  if (selected.modelName === 'gpt-4o') {
    chain.push({ modelName: 'gpt-4o-mini', estimatedCost: estimateCost('gpt-4o-mini', textLength), reason: 'error-recovery-fallback' });
  }

  return chain;
};

/**
 * Instantiate a LangChain LLM for a given model name via Azure AI Foundry.
 */
const buildLLM = (modelName, maxTokens = 2048) => {
  if (modelName !== 'gpt-4o' && modelName !== 'gpt-4o-mini') {
    throw new Error(`Unknown model: ${modelName}`);
  }

  const deploymentName = modelName === 'gpt-4o' ? AZURE_DEPLOY_GPT4O : AZURE_DEPLOY_GPT4O_MINI;
  return new AzureChatOpenAI({
    azureOpenAIApiKey:            AZURE_API_KEY,
    azureOpenAIApiInstanceName:   AZURE_ENDPOINT.replace('https://', '').replace('.openai.azure.com/', '').replace('.openai.azure.com', ''),
    azureOpenAIApiDeploymentName: deploymentName,
    azureOpenAIApiVersion:        AZURE_API_VERSION,
    maxTokens,
    temperature: 0.2,
  });
};

module.exports = { buildFallbackChain, buildLLM, selectAffordableModel, estimateCost, MODEL_COSTS, PLAN_AI_BUDGETS };
