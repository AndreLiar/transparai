// Backend/utils/planUtils.js
const { PLAN_AI_BUDGETS } = require('../services/aiModelService');

// Plan configuration with features and limits
const PLAN_CONFIG = {
  free: {
    name: 'Gratuit',
    monthlyAnalyses: 20,
    aiBudget: 0,
    features: {
      basicAnalysis: true,
      sampleContracts: true,
      textInput: true,
      fileUpload: true,
      ocrProcessing: true,
      pdfExport: false,
      history: false,
      prioritySupport: false,
      advancedAnalysis: false,
      teamFeatures: false,
      apiAccess: false,
      premiumAI: false,
    },
  },
  starter: {
    name: 'Starter',
    monthlyAnalyses: 20,
    aiBudget: 0,
    features: {
      basicAnalysis: true,
      sampleContracts: true,
      textInput: true,
      fileUpload: true,
      ocrProcessing: true,
      pdfExport: false,
      history: false,
      prioritySupport: false,
      advancedAnalysis: false,
      teamFeatures: false,
      apiAccess: false,
      premiumAI: false,
    },
  },
  standard: {
    name: 'Standard',
    monthlyAnalyses: 40,
    aiBudget: 2.0,
    features: {
      basicAnalysis: true,
      sampleContracts: true,
      textInput: true,
      fileUpload: true,
      ocrProcessing: true,
      pdfExport: true,
      history: true,
      prioritySupport: false,
      advancedAnalysis: false,
      teamFeatures: false,
      apiAccess: false,
      premiumAI: true,
    },
  },
  premium: {
    name: 'Premium',
    monthlyAnalyses: -1, // Unlimited
    aiBudget: 10.0,
    features: {
      basicAnalysis: true,
      sampleContracts: true,
      textInput: true,
      fileUpload: true,
      ocrProcessing: true,
      pdfExport: true,
      history: true,
      prioritySupport: true,
      advancedAnalysis: true,
      teamFeatures: false,
      apiAccess: true,
      premiumAI: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    monthlyAnalyses: -1, // Unlimited
    aiBudget: 50.0,
    features: {
      basicAnalysis: true,
      sampleContracts: true,
      textInput: true,
      fileUpload: true,
      ocrProcessing: true,
      pdfExport: true,
      history: true,
      prioritySupport: true,
      advancedAnalysis: true,
      teamFeatures: true,
      apiAccess: true,
      premiumAI: true,
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

  if (!config.features.premiumAI && aiUsage.totalAnalyses > 5) {
    return {
      suggested: 'standard',
      reason: 'premium_ai_needed',
      message: 'Débloquez l\'IA premium pour une analyse plus précise avec le plan Standard.',
    };
  }

  const budget = aiUsage.monthlyAIBudget || { allocated: 0, used: 0 };
  if (budget.allocated > 0 && budget.used >= budget.allocated * 0.8) {
    const nextPlan = plan === 'standard' ? 'premium' : 'enterprise';
    return {
      suggested: nextPlan,
      reason: 'ai_budget_exhausted',
      message: `Budget IA bientôt épuisé. Passez à ${getPlanConfig(nextPlan).name} pour plus d'analyses premium.`,
    };
  }

  return null;
};

// Get upgrade suggestions based on current plan and usage
const getUpgradeRecommendation = (plan, usedAnalyses) => {
  const config = getPlanConfig(plan);
  const limit = config.monthlyAnalyses;

  if (plan === 'free' || plan === 'starter') {
    if (limit !== -1 && usedAnalyses >= limit * 0.8) {
      return {
        suggested: 'standard',
        reason: 'quota_nearly_reached',
        message: 'Vous approchez de votre limite mensuelle. Passez à Standard pour 40 analyses + historique.',
      };
    }
    if (usedAnalyses >= 5) {
      return {
        suggested: 'standard',
        reason: 'active_user',
        message: 'Vous utilisez régulièrement TransparAI. Débloquez plus d\'analyses et l\'historique avec Standard.',
      };
    }
  }

  if (plan === 'standard' && limit !== -1 && usedAnalyses >= limit * 0.9) {
    return {
      suggested: 'premium',
      reason: 'heavy_usage',
      message: 'Analyses illimitées + support prioritaire avec Premium.',
    };
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
