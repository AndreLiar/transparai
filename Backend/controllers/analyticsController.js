// Backend/controllers/analyticsController.js
const { getAdvancedAnalytics } = require('../services/analyticsService');

const getAnalytics = async (req, res) => {
  try {
    const { uid } = req.user;

    const result = await getAdvancedAnalytics({ uid });

    return res.json(result);
  } catch (err) {
    console.error('❌ Erreur analytics :', err.message);
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

module.exports = { getAnalytics };
