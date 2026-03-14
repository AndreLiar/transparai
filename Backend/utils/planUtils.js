// Backend/utils/planUtils.js
const { PLAN_AI_BUDGETS } = require('../orchestrator/modelRouter');

// ── Plan configuration ────────────────────────────────────────────────────────
//
// Pricing rationale (updated):
//   Free     €0      —  5 analyses/mo, gpt-4o-mini (capped budget), text-only input
//                        Goal: demonstrate value, funnel to Standard
//   Standard €14.99  — 100 analyses/mo, gpt-4o-mini, PDF export + history
//                        Goal: primary B2C revenue driver
//   Premium  €29.99  — Unlimited, gpt-4o, comparative analysis, API access
//                        Goal: power users + freelance lawyers
//   Enterprise €199  — Unlimited, gpt-4o priority, teams, SLA, custom branding
//                        Goal: B2B — law firms, compliance teams, LegalTech
//
// AI cost break-even (worst case, all gpt-4o at $0.015/analysis):
//   Standard:   100 × $0.015 = $1.50  → margin: €14.99 - $1.50 ≈ €13.85/user
//   Premium:    heavy user 300 × $0.015 = $4.50  → margin: €29.99 - $4.50 ≈ €25/user
//   Enterprise: team 500 × $0.015 = $7.50  → margin: €199 - $7.50 ≈ €191/org
//
// In practice, prompt cache and model downgrading cut real AI costs by 60–80%.
const PLAN_CONFIG = {
  free: {
    name: 'Gratuit',
    priceEur: 0,
    monthlyAnalyses: 5,       // was 20 — real scarcity to drive upgrades
    aiBudget: 0,
    features: {
      basicAnalysis:    true,
      sampleContracts:  true,
      textInput:        true,
      fileUpload:       false, // free plan: text paste only (reduces abuse + costs)
      ocrProcessing:    false, // OCR is a premium differentiator
      pdfExport:        false,
      history:          false,
      prioritySupport:  false,
      advancedAnalysis: false,
      comparativeAnalysis: false,
      teamFeatures:     false,
      apiAccess:        false,
      premiumAI:        false, // gpt-4o-mini only with capped budget
      historyRetentionDays: 0,
    },
  },

  // Kept for backwards compatibility with existing DB records — same limits as free
  // New users should not be assigned 'starter'; use 'free' instead
  starter: {
    name: 'Starter',
    priceEur: 0,
    monthlyAnalyses: 5,
    aiBudget: 0,
    features: {
      basicAnalysis:    true,
      sampleContracts:  true,
      textInput:        true,
      fileUpload:       false,
      ocrProcessing:    false,
      pdfExport:        false,
      history:          false,
      prioritySupport:  false,
      advancedAnalysis: false,
      comparativeAnalysis: false,
      teamFeatures:     false,
      apiAccess:        false,
      premiumAI:        false,
      historyRetentionDays: 0,
    },
  },

  standard: {
    name: 'Standard',
    priceEur: 14.99,          // was €9.99 — still below market, more sustainable
    monthlyAnalyses: 100,     // was 40 — removes churn pressure at this price point
    aiBudget: 3.0,            // was $2 — covers 100 gpt-4o-mini analyses comfortably
    features: {
      basicAnalysis:    true,
      sampleContracts:  true,
      textInput:        true,
      fileUpload:       true,
      ocrProcessing:    true,
      pdfExport:        true,
      history:          true,
      prioritySupport:  false,
      advancedAnalysis: false,
      comparativeAnalysis: false, // comparative is Premium+
      teamFeatures:     false,
      apiAccess:        false,
      premiumAI:        true,  // gpt-4o-mini
      historyRetentionDays: 90,
    },
  },

  premium: {
    name: 'Premium',
    priceEur: 29.99,          // was €19.99 — matches Grammarly/Notion tier
    monthlyAnalyses: -1,      // Unlimited
    aiBudget: 15.0,           // was $10 — covers ~1000 gpt-4o-mini or ~300 gpt-4o analyses
    features: {
      basicAnalysis:    true,
      sampleContracts:  true,
      textInput:        true,
      fileUpload:       true,
      ocrProcessing:    true,
      pdfExport:        true,
      history:          true,
      prioritySupport:  true,
      advancedAnalysis: true,
      comparativeAnalysis: true,
      teamFeatures:     false,
      apiAccess:        true,
      premiumAI:        true,  // gpt-4o
      historyRetentionDays: 730, // 2 years
    },
  },

  enterprise: {
    name: 'Enterprise',
    priceEur: 199,            // was €99 — still 10× below legal SaaS market rate
    monthlyAnalyses: -1,      // Unlimited
    aiBudget: 75.0,           // was $50 — covers a full team's heavy usage
    features: {
      basicAnalysis:    true,
      sampleContracts:  true,
      textInput:        true,
      fileUpload:       true,
      ocrProcessing:    true,
      pdfExport:        true,
      history:          true,
      prioritySupport:  true,
      advancedAnalysis: true,
      comparativeAnalysis: true,
      teamFeatures:     true,
      apiAccess:        true,
      premiumAI:        true,  // gpt-4o priority routing
      historyRetentionDays: 730,
      slaGuarantee:     true,
      customBranding:   true,
      dedicatedSupport: true,
    },
  },
};

// Check if user is premium (has paid plan)
const isPremiumUser = (plan) => ['standard', 'premium', 'enterprise'].includes(plan);

// Get plan configuration
const getPlanConfig = (plan) => PLAN_CONFIG[plan] || PLAN_CONFIG.free;

// Get monthly analysis limit for a plan
const getMonthlyLimit = (plan) => {
  const config = getPlanConfig(plan);
  return config.monthlyAnalyses;
};

// Check if feature is available for plan
const hasFeature = (plan, feature) => {
  const config = getPlanConfig(plan);
  return config.features[feature] || false;
};

// Check if user can perform analysis (quota check)
const canAnalyze = (plan, usedAnalyses) => {
  const limit = getMonthlyLimit(plan);
  if (limit === -1) return true; // Unlimited
  return usedAnalyses < limit;
};

// Get remaining analyses for the month
const getRemainingAnalyses = (plan, usedAnalyses) => {
  const limit = getMonthlyLimit(plan);
  if (limit === -1) return -1; // Unlimited
  return Math.max(0, limit - usedAnalyses);
};

// Check if plan has access to specific routes/features
const hasRouteAccess = (plan, route) => {
  const routePermissions = {
    '/history': hasFeature(plan, 'history'),
    '/compare': hasFeature(plan, 'advancedAnalysis'),
    '/organization': hasFeature(plan, 'teamFeatures'),
    '/user-management': hasFeature(plan, 'teamFeatures'),
    '/api': hasFeature(plan, 'apiAccess'),
  };

  return routePermissions[route] !== undefined ? routePermissions[route] : true;
};

// Get AI budget for a plan
const getAIBudget = (plan) => PLAN_AI_BUDGETS[plan] || 0;

// Sync user AI settings with their current plan
const syncAIBudgetWithPlan = async (user) => {
  const expectedBudget = getAIBudget(user.plan);

  // Initialize aiSettings if it doesn't exist
  if (!user.aiSettings) {
    user.aiSettings = {
      preferredModel: 'auto',
      allowPremiumAI: true,
      monthlyAIBudget: {
        allocated: expectedBudget,
        used: 0,
        lastReset: new Date(),
      },
    };
    return true; // Indicate changes were made
  }

  // Check if budget needs to be updated
  const currentBudget = user.aiSettings.monthlyAIBudget?.allocated || 0;
  if (currentBudget !== expectedBudget) {
    user.aiSettings.monthlyAIBudget = user.aiSettings.monthlyAIBudget || {};
    user.aiSettings.monthlyAIBudget.allocated = expectedBudget;

    // If downgrading and used budget exceeds new limit, reset usage
    if (expectedBudget < currentBudget
        && user.aiSettings.monthlyAIBudget.used > expectedBudget) {
      user.aiSettings.monthlyAIBudget.used = 0;
      user.aiSettings.monthlyAIBudget.lastReset = new Date();
    }

    return true; // Indicate changes were made
  }

  return false; // No changes needed
};

// Check if user has access to premium AI features
const hasAIAccess = (plan, aiSettings = {}) => {
  const config = getPlanConfig(plan);
  if (!config.features.premiumAI) return false;

  const budget = aiSettings.monthlyAIBudget || { allocated: 0, used: 0 };
  return budget.allocated > budget.used;
};

// Get AI-specific upgrade recommendation
const getAIUpgradeRecommendation = (plan, aiUsage = {}) => {
  const config = getPlanConfig(plan);

  if (!config.features.premiumAI && aiUsage.totalAnalyses > 2) {
    return {
      suggested: 'standard',
      reason: 'premium_ai_needed',
      message: 'Passez à Standard (€14,99/mois) pour des analyses illimitées avec GPT-4o mini et un budget IA mensuel dédié.',
    };
  }

  const budget = aiUsage.monthlyAIBudget || { allocated: 0, used: 0 };
  if (budget.allocated > 0 && budget.used >= budget.allocated * 0.8) {
    const nextPlan = plan === 'standard' ? 'premium' : 'enterprise';
    const nextConfig = getPlanConfig(nextPlan);
    return {
      suggested: nextPlan,
      reason: 'ai_budget_exhausted',
      message: `Budget IA bientôt épuisé. Passez à ${nextConfig.name} (€${nextConfig.priceEur}/mois) pour ${nextPlan === 'premium' ? '$15' : '$75'} de budget IA/mois.`,
    };
  }

  return null;
};

// Get upgrade suggestions based on current plan and usage
const getUpgradeRecommendation = (plan, usedAnalyses) => {
  const config = getPlanConfig(plan);
  const limit = config.monthlyAnalyses;

  if (plan === 'free' || plan === 'starter') {
    if (limit !== -1 && usedAnalyses >= limit * 0.6) {
      // Trigger upgrade prompt earlier (at 60%) — 5 analyses goes fast
      return {
        suggested: 'standard',
        reason: 'quota_nearly_reached',
        message: `Vous avez utilisé ${usedAnalyses}/${limit} analyses ce mois. Passez à Standard (€14,99/mois) pour 100 analyses + historique + export PDF.`,
      };
    }
    if (usedAnalyses >= 2) {
      return {
        suggested: 'standard',
        reason: 'active_user',
        message: 'Vous utilisez déjà TransparAI. Débloquez 100 analyses/mois, l\'historique et l\'IA avancée avec Standard à €14,99/mois.',
      };
    }
  }

  if (plan === 'standard') {
    if (limit !== -1 && usedAnalyses >= limit * 0.9) {
      return {
        suggested: 'premium',
        reason: 'heavy_usage',
        message: 'Analyses illimitées + analyse comparative multi-documents + accès API avec Premium à €29,99/mois.',
      };
    }
  }

  return null;
};

module.exports = {
  PLAN_CONFIG,
  isPremiumUser,
  getPlanConfig,
  getMonthlyLimit,
  hasFeature,
  canAnalyze,
  getRemainingAnalyses,
  hasRouteAccess,
  getUpgradeRecommendation,
  // AI-specific functions
  getAIBudget,
  syncAIBudgetWithPlan,
  hasAIAccess,
  getAIUpgradeRecommendation,
};
