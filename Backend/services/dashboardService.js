//Backend/services/dashboardService.js
const User = require('../models/User');

const getDashboardData = async (firebaseUid, emailFromToken) => {
  let user = await User.findOne({ firebaseUid });

  if (!user) {
    console.log(`🆕 Creating new user in DB for UID: ${firebaseUid}`);
    user = await User.create({
      firebaseUid,
      email: emailFromToken || '',
      plan: 'starter',
      dailyQuota: { used: 0, limit: 2 },
      lastQuotaReset: new Date(),
      analyses: []
    });
  } else {
    // Reset quota if a new day has started
    const today = new Date().toISOString().slice(0, 10);
    const lastReset = user.lastQuotaReset?.toISOString().slice(0, 10);
    if (today !== lastReset) {
      user.dailyQuota.used = 0;
      user.lastQuotaReset = new Date();
    }

    // Sync limit with plan
    let expectedLimit = 2;
    if (user.plan === 'standard') expectedLimit = 10;
    if (user.plan === 'premium') expectedLimit = -1;

    if (user.dailyQuota.limit !== expectedLimit) {
      user.dailyQuota.limit = expectedLimit;
    }

    if (!user.email && emailFromToken) {
      user.email = emailFromToken;
    }

    await user.save();
  }

  return {
    plan: user.plan,
    quota: user.dailyQuota,
    analyses: user.analyses,
  };
};

module.exports = { getDashboardData };

