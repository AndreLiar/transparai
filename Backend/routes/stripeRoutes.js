//src/routes/stripeRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { createCheckoutSession } = require('../controllers/stripeController');

router.post('/create-checkout-session', authenticate, createCheckoutSession);

module.exports = router;
