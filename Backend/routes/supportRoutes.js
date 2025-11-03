// Backend/routes/supportRoutes.js
const express = require('express');

const router = express.Router();
const { sendPrioritySupport, getSupportInfo } = require('../controllers/supportController');
const authenticate = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Support System
 *   description: Customer support and help system
 */

/**
 * @swagger
 * /api/support/info:
 *   get:
 *     summary: Get support information for user plan
 *     description: |
 *       Retrieves support options and contact information based on the user's
 *       subscription plan. Different plans have different support levels and
 *       response times.
 *
 *       **Support Levels by Plan:**
 *       - Free: Community forum access only
 *       - Standard: Email support (48h response)
 *       - Premium: Priority email + live chat (24h response)
 *       - Enterprise: Dedicated account manager + phone support (4h response)
 *     tags: [Support System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Support information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 supportInfo:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: string
 *                       example: "Premium"
 *                     supportLevel:
 *                       type: string
 *                       enum: [community, email, priority, enterprise]
 *                       example: "priority"
 *                     responseTime:
 *                       type: string
 *                       example: "24 heures"
 *                     availableChannels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [email, chat, phone, forum]
 *                             example: "email"
 *                           description:
 *                             type: string
 *                             example: "Support par email prioritaire"
 *                           available:
 *                             type: boolean
 *                             example: true
 *                           contact:
 *                             type: string
 *                             example: "ktaylconsult@gmail.com"
 *                     accountManager:
 *                       type: object
 *                       properties:
 *                         assigned:
 *                           type: boolean
 *                           example: false
 *                         name:
 *                           type: string
 *                           example: null
 *                         email:
 *                           type: string
 *                           example: null
 *                     helpResources:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Guide d'utilisation"
 *                           url:
 *                             type: string
 *                             example: "/docs/user-guide"
 *                           type:
 *                             type: string
 *                             enum: [documentation, tutorial, faq, video]
 *                             example: "documentation"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// GET /api/support/info - Get support information for user plan
router.get('/info', authenticate, getSupportInfo);

/**
 * @swagger
 * /api/support/priority:
 *   post:
 *     summary: Send priority support request
 *     description: |
 *       Submits a priority support request for Premium and Enterprise users.
 *       Creates a support ticket with high priority handling and faster response times.
 *
 *       **Priority Support Features:**
 *       - Escalated to senior support team
 *       - Faster response times (Premium: 24h, Enterprise: 4h)
 *       - Direct email notifications to support team
 *       - Integration with internal ticketing system
 *     tags: [Support System]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Problème de facturation Enterprise"
 *                 description: "Brief subject line for the support request"
 *               message:
 *                 type: string
 *                 example: "Nous avons des questions concernant notre facturation Enterprise pour le mois dernier..."
 *                 description: "Detailed description of the issue or question"
 *               category:
 *                 type: string
 *                 enum: [technical, billing, feature_request, bug_report, account_management, integration, performance]
 *                 example: "billing"
 *                 description: "Category of the support request"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: "high"
 *                 example: "high"
 *                 description: "Priority level (automatically set to high for priority support)"
 *               organizationContext:
 *                 type: object
 *                 properties:
 *                   organizationId:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                   affectedUsers:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["user1@company.com", "user2@company.com"]
 *                   environment:
 *                     type: string
 *                     enum: [production, staging, development]
 *                     example: "production"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "error-screenshot.png"
 *                     contentType:
 *                       type: string
 *                       example: "image/png"
 *                     size:
 *                       type: number
 *                       example: 245760
 *                     url:
 *                       type: string
 *                       example: "https://storage.example.com/attachments/abc123"
 *             required: [subject, message, category]
 *     responses:
 *       200:
 *         description: Priority support request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "TICKET-20241011-0001"
 *                     status:
 *                       type: string
 *                       enum: [open, in_progress, waiting_response, resolved, closed]
 *                       example: "open"
 *                     priority:
 *                       type: string
 *                       example: "high"
 *                     assignedTo:
 *                       type: string
 *                       example: "ktaylconsult@gmail.com"
 *                     estimatedResponse:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-12T10:30:00Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T10:30:00Z"
 *                 message:
 *                   type: string
 *                   example: "Votre demande de support prioritaire a été soumise avec succès. Vous recevrez une réponse dans les 24 heures."
 *                 nextSteps:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "Vous recevrez un email de confirmation"
 *                     - "Notre équipe examinera votre demande en priorité"
 *                     - "Réponse attendue dans les 24 heures"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Priority support not available for current plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Le support prioritaire nécessite un abonnement Premium ou Enterprise"
 *                 code: "PREMIUM_FEATURE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       429:
 *         description: Rate limit exceeded for support requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Limite de demandes de support atteinte. Veuillez patienter avant de soumettre une nouvelle demande."
 *                 code: "RATE_LIMIT_EXCEEDED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *                 retryAfter: 3600
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// POST /api/support/priority - Send priority support request
router.post('/priority', authenticate, sendPrioritySupport);

module.exports = router;
