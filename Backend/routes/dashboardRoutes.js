//Backend/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { fetchDashboard } = require('../controllers/dashboardController');

router.get('/', authenticate, fetchDashboard);

module.exports = router;
