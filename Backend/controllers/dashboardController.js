// Backend/controllers/dashboardController.js

const { getDashboardData } = require('../services/dashboardService');

const fetchDashboard = async (req, res) => {
  try {
    console.log('📊 Dashboard endpoint accessed');
    const { uid, email } = req.user;
    console.log('👤 User:', uid, email);
    const data = await getDashboardData(uid, email);
    console.log('✅ Dashboard data retrieved successfully');
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Erreur dashboard:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { fetchDashboard };
