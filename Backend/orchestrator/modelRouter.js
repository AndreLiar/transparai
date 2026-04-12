// Backend/orchestrator/modelRouter.js
// Plan-aware model selection via the OpenAI API (ChatGPT models).

const { ChatOpenAI } = require('@langchain/openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || undefined;

if (!OPENAI_API_KEY) {
  throw new Error('[ModelRouter] OPENAI_API_KEY is required.');
}

console.log('[ModelRouter] OpenAI API enabled');

// ── Cost per 1K tokens (input + output blended estimate) ─────────────────────
const MODEL_COSTS = {
  'gpt-4o': 0.005,
  'gpt-4o-mini': 0.0003,
};

// ── Monthly AI budget by plan (USD) ──────────────────────────────────────────
const PLAN_AI_BUDGETS = {
  free: 0.5,
  starter: 0.5,
  standard: 3.0,
  premium: 15.0,
  enterprise: 75.0,
};

const LENGTH_TIER = {
  GPT4O_MAX_CHARS: 15_000,
};

const estimateTokens = (textLength) => Math.ceil(textLength / 3);
const estimateCost = (modelName, textLength) =>
  (estimateTokens(textLength) / 1000) * (MODEL_COSTS[modelName] || 0);

const applyLengthTier = (preferredModel, textLength) => {
  if (preferredModel === 'gpt-4o' && textLength > LENGTH_TIER.GPT4O_MAX_CHARS) {
    return {
      modelName: 'gpt-4o-mini',
      lengthDowngrade: { from: 'gpt-4o', reason: `doc_too_long_for_gpt4o (${estimateTokens(textLength).toLocaleString()} tokens > 5k)` },
    };
  }

  return { modelName: preferredModel, lengthDowngrade: null };
};

const selectAffordableModel = (user, textLength) => {
  const plan = user.plan || 'free';
  const budget = user.aiSettings?.monthlyAIBudget || { allocated: 0, used: 0 };
  const remainingBudget = budget.allocated - budget.used;
  const userPreference = user.aiSettings?.preferredModel || 'auto';
  const allowPremiumAI = user.aiSettings?.allowPremiumAI !== false;
  const downgrades = [];

  if (plan === 'free' || plan === 'starter') {
    return {
      modelName: 'gpt-4o-mini', estimatedCost: estimateCost('gpt-4o-mini', textLength), reason: 'free-plan-mini-only', downgrades,
    };
  }

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

  if (userPreference !== 'auto' && allowPremiumAI) {
    const result = tryModel(userPreference, 'user-preference');
    if (result) return { ...result, downgrades };
  }

  if ((plan === 'premium' || plan === 'enterprise') && allowPremiumAI) {
    const result = tryModel('gpt-4o', 'premium-auto-select');
    if (result) return { ...result, downgrades };
  }

  if (downgrades.length > 0) {
    downgrades.push({ to: 'gpt-4o-mini', reason: 'cost-or-length-guardrail-fallback' });
  }
  return {
    modelName: 'gpt-4o-mini', estimatedCost: estimateCost('gpt-4o-mini', textLength), reason: 'gpt4o-mini-fallback', downgrades,
  };
};

const buildFallbackChain = (user, textLength) => {
  const selected = selectAffordableModel(user, textLength);

  if (selected.downgrades?.length > 0) {
    console.warn('[ModelRouter] Cost guardrail triggered — model downgraded:', selected.downgrades);
  }

  const chain = [{ modelName: selected.modelName, estimatedCost: selected.estimatedCost, reason: selected.reason }];

  if (selected.modelName === 'gpt-4o') {
    chain.push({ modelName: 'gpt-4o-mini', estimatedCost: estimateCost('gpt-4o-mini', textLength), reason: 'error-recovery-fallback' });
  }

  return chain;
};

const buildLLM = (modelName, maxTokens = 2048) => {
  if (modelName !== 'gpt-4o' && modelName !== 'gpt-4o-mini') {
    throw new Error(`Unknown model: ${modelName}`);
  }

  return new ChatOpenAI({
    model: modelName,
    maxTokens,
    temperature: 0.2,
    apiKey: OPENAI_API_KEY,
    ...(OPENAI_BASE_URL ? { configuration: { baseURL: OPENAI_BASE_URL } } : {}),
  });
};

module.exports = {
  buildFallbackChain, buildLLM, selectAffordableModel, estimateCost, MODEL_COSTS, PLAN_AI_BUDGETS,
};
