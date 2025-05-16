// Backend/routes/analyzeRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { analyzeText } = require('../controllers/analyzeController');

router.post('/', authenticate, analyzeText);

module.exports = router;
