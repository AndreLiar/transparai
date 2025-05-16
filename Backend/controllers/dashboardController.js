//Backend/controllers/dashboardController.js

const { getDashboardData } = require('../services/dashboardService');

const fetchDashboard = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const data = await getDashboardData(uid, email);
    res.status(200).json(data);
  } catch (err) {
    console.error('Erreur dashboard:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { fetchDashboard };

