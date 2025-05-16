//Backend/services/dashboardService.js
const User = require('../models/User');

const getDashboardData = async (firebaseUid, emailFromToken) => {
  let user = await User.findOne({ firebaseUid });

  if (!user) {
    console.log(`🆕 Creating new user in DB for UID: ${firebaseUid}`);
    user = await User.create({
      firebaseUid,
      email: emailFromToken || '', // ✅ Save email from token if available
      plan: 'starter',
      dailyQuota: { used: 0, limit: 10 },
      analyses: [],
    });
  } else if (!user.email && emailFromToken) {
    user.email = emailFromToken; // 🔄 Update if missing
    await user.save();
  }

  return {
    plan: user.plan,
    quota: user.dailyQuota,
    analyses: user.analyses,
  };
};

module.exports = { getDashboardData };

