// Backend/services/dashboardService.js
const User = require('../models/User');
const { getMonthlyLimit, getPlanConfig, getUpgradeRecommendation, getRemainingAnalyses } = require('../utils/planUtils');

const getDashboardData = async (firebaseUid, emailFromToken) => {
  let user = await User.findOne({ firebaseUid });

  if (!user) {
    console.log(`🆕 Creating new user in DB for UID: ${firebaseUid}`);
    user = await User.create({
      firebaseUid,
      email: emailFromToken || '',
      plan: 'free',
      monthlyQuota: { used: 0, limit: 20 },
      lastQuotaReset: new Date(),
      analyses: [],
    });
  } else {
    // Reset quota if a new month has started
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastResetMonth = user.lastQuotaReset
      ? `${user.lastQuotaReset.getFullYear()}-${String(user.lastQuotaReset.getMonth() + 1).padStart(2, '0')}`
      : null;

    if (currentMonth !== lastResetMonth) {
      user.monthlyQuota.used = 0;
      user.lastQuotaReset = new Date();
    }

    // Sync limit with plan using plan utilities
    const expectedLimit = getMonthlyLimit(user.plan || 'free');
    if (user.monthlyQuota.limit !== expectedLimit) {
      user.monthlyQuota.limit = expectedLimit;
    }

    if (!user.email && emailFromToken) {
      user.email = emailFromToken;
    }

    await user.save();
  }

  // Get plan configuration and upgrade recommendations
  const planConfig = getPlanConfig(user.plan || 'free');
  const upgradeRecommendation = getUpgradeRecommendation(user.plan || 'free', user.monthlyQuota.used);
  const remainingAnalyses = getRemainingAnalyses(user.plan || 'free', user.monthlyQuota.used);

  return {
    plan: user.plan || 'free',
    planConfig,
    quota: {
      used: user.monthlyQuota.used,
      limit: user.monthlyQuota.limit,
      remaining: remainingAnalyses
    },
    analyses: user.analyses,
    upgradeRecommendation,
    features: planConfig.features
  };
};

module.exports = { getDashboardData };
