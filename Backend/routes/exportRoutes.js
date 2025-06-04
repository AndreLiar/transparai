//routes/exportRoutes.js
const express = require('express');
const router = express.Router();
const { exportAnalysisPDF } = require('../controllers/exportController');
const authenticate = require('../middleware/authMiddleware');

router.get('/:analysisId', authenticate, exportAnalysisPDF);

module.exports = router;
