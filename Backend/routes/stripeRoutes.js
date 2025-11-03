// src/routes/stripeRoutes.js
const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { createCheckoutSession } = require('../controllers/stripeController');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Stripe payment and subscription endpoints
 */

/**
 * @swagger
 * /api/stripe/create-checkout-session:
 *   post:
 *     summary: Create Stripe checkout session
 *     description: |
 *       Creates a Stripe checkout session for plan upgrades. Supports upgrading from any plan
 *       to Standard, Premium, or Enterprise tiers.
 *
 *       **Available Plans:**
 *       - `standard` - €2/month, 40 analyses/month
 *       - `premium` - €5/month, unlimited analyses
 *       - `enterprise` - Custom pricing, unlimited analyses + organization features
 *
 *       After successful payment, user's plan is automatically updated via webhook.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [standard, premium, enterprise]
 *                 example: "premium"
 *                 description: "Target subscription plan"
 *               successUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://transparai.vercel.app/dashboard?success=true"
 *                 description: "URL to redirect after successful payment"
 *               cancelUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://transparai.vercel.app/upgrade?cancelled=true"
 *                 description: "URL to redirect if payment is cancelled"
 *             required: [plan]
 *           examples:
 *             upgradeToStandard:
 *               summary: "Upgrade to Standard plan"
 *               value:
 *                 plan: "standard"
 *                 successUrl: "https://transparai.vercel.app/dashboard?upgraded=true"
 *                 cancelUrl: "https://transparai.vercel.app/upgrade"
 *             upgradeToPremium:
 *               summary: "Upgrade to Premium plan"
 *               value:
 *                 plan: "premium"
 *                 successUrl: "https://transparai.vercel.app/dashboard?upgraded=true"
 *                 cancelUrl: "https://transparai.vercel.app/upgrade"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sessionId:
 *                   type: string
 *                   example: "cs_live_a1B2c3D4e5F6g7H8i9J0"
 *                   description: "Stripe checkout session ID"
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: "https://checkout.stripe.com/pay/cs_live_a1B2c3D4e5F6g7H8i9J0"
 *                   description: "Stripe checkout URL to redirect user to"
 *             example:
 *               success: true
 *               sessionId: "cs_live_a1B2c3D4e5F6g7H8i9J0"
 *               url: "https://checkout.stripe.com/pay/cs_live_a1B2c3D4e5F6g7H8i9J0"
 *       400:
 *         description: Invalid plan or request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Plan invalide. Plans disponibles: standard, premium, enterprise"
 *                 code: "INVALID_PLAN"
 *                 field: "plan"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Stripe API error or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Erreur lors de la création de la session de paiement"
 *                 code: "STRIPE_ERROR"
 *                 timestamp: "2024-10-11T10:30:00Z"
 */
router.post('/create-checkout-session', authenticate, createCheckoutSession);

module.exports = router;
