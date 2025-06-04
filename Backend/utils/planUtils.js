// Backend/utils/planUtils.js
const isPremiumUser = (plan) => {
  return plan === 'standard' || plan === 'premium';
};

module.exports = { isPremiumUser };
