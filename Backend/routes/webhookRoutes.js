// routes/// webhookRoutes.js
const express = require('express');

const router = express.Router();
const bodyParser = require('body-parser');
const { handleStripeWebhook } = require('../controllers/webhookController');

router.post('/', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
