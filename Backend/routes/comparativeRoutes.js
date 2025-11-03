// Backend/routes/comparativeRoutes.js
const express = require('express');
const { compareDocuments, getIndustryTemplates } = require('../controllers/comparativeController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comparative Analysis
 *   description: Multi-document comparison and industry benchmarking
 */

/**
 * @swagger
 * /api/comparative/templates:
 *   get:
 *     summary: Get industry analysis templates
 *     description: |
 *       Retrieves available industry-specific analysis templates for
 *       enhanced comparative analysis. Templates include industry-specific
 *       criteria, compliance frameworks, and scoring weights.
 *     tags: [Comparative Analysis]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Industry templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 templates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "banking"
 *                       name:
 *                         type: string
 *                         example: "Services Bancaires"
 *                       description:
 *                         type: string
 *                         example: "Template spécialisé pour l'analyse des CGA bancaires"
 *                       criteria:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Frais de tenue de compte", "Conditions de découvert"]
 *                       compliance:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["PCI DSS", "GDPR", "PSD2"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get available industry templates
router.get('/templates', authenticateToken, getIndustryTemplates);

/**
 * @swagger
 * /api/comparative/compare:
 *   post:
 *     summary: Compare multiple documents
 *     description: |
 *       Performs comparative analysis between multiple documents, highlighting
 *       differences, similarities, and competitive advantages. Supports up to
 *       5 documents for Premium users and 20 for Enterprise users.
 *     tags: [Comparative Analysis]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                       description: "Analysis ID from previous analysis"
 *                     label:
 *                       type: string
 *                       example: "Our T&C"
 *                       description: "Custom label for this document"
 *                 minItems: 2
 *                 maxItems: 20
 *                 example:
 *                   - id: "507f1f77bcf86cd799439011"
 *                     label: "Our Terms"
 *                   - id: "507f1f77bcf86cd799439012"
 *                     label: "Competitor A"
 *               template:
 *                 type: string
 *                 example: "saas"
 *                 description: "Industry template to use (optional)"
 *               focusAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Data Collection", "Liability", "Termination"]
 *                 description: "Specific areas to focus comparison on"
 *             required: [documents]
 *     responses:
 *       200:
 *         description: Comparative analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comparison:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439013"
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           label:
 *                             type: string
 *                           score:
 *                             type: number
 *                           rank:
 *                             type: number
 *                     summary:
 *                       type: string
 *                       example: "Your terms are more transparent than 2/3 competitors..."
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Better data transparency", "Clearer termination process"]
 *                     improvements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Liability clauses could be more balanced"]
 *                     detailedComparison:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "Data Collection"
 *                           comparison:
 *                             type: string
 *                             example: "Document A is more transparent..."
 *                           winner:
 *                             type: string
 *                             example: "Your Terms"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T10:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Comparative analysis not available for current plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "L'analyse comparative nécessite un abonnement Premium ou Enterprise"
 *                 code: "PREMIUM_FEATURE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Compare documents
router.post('/compare', authenticateToken, compareDocuments);

module.exports = router;
