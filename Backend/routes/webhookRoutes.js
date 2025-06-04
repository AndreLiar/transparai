//routes/// webhookRoutes.js
const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhookController');
const bodyParser = require('body-parser');

router.post('/', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
