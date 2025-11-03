// Backend/routes/analyticsRoutes.js
const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Advanced analytics endpoints for Premium and Enterprise users
 */

/**
 * @swagger
 * /api/analytics/advanced:
 *   get:
 *     summary: Get advanced analytics
 *     description: |
 *       Retrieves comprehensive analytics data including usage patterns, trends,
 *       comparative analysis metrics, and detailed insights. Available for Premium
 *       and Enterprise users only.
 *
 *       **Includes:**
 *       - Analysis trends over time
 *       - Score distribution and patterns
 *       - Document type analytics
 *       - Risk category insights
 *       - Comparative analysis metrics
 *       - Usage forecasting
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *           default: "30d"
 *         example: "30d"
 *         description: "Time period for analytics data"
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: "weekly"
 *         example: "weekly"
 *         description: "Data aggregation granularity"
 *       - in: query
 *         name: includeComparative
 *         schema:
 *           type: boolean
 *           default: true
 *         example: true
 *         description: "Include comparative analysis metrics"
 *     responses:
 *       200:
 *         description: Advanced analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalAnalyses:
 *                           type: number
 *                           example: 247
 *                         averageScore:
 *                           type: number
 *                           example: 72.5
 *                         mostCommonRisks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               type:
 *                                 type: string
 *                                 example: "Data Collection"
 *                               count:
 *                                 type: number
 *                                 example: 89
 *                               percentage:
 *                                 type: number
 *                                 example: 36.0
 *                         improvementTrend:
 *                           type: number
 *                           example: 5.2
 *                           description: "Percentage improvement in average score over period"
 *                     trends:
 *                       type: object
 *                       properties:
 *                         analysisVolume:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: "2024-10-01"
 *                               count:
 *                                 type: number
 *                                 example: 12
 *                         scoreDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               scoreRange:
 *                                 type: string
 *                                 example: "80-90"
 *                               count:
 *                                 type: number
 *                                 example: 45
 *                               percentage:
 *                                 type: number
 *                                 example: 18.2
 *                         riskEvolution:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               week:
 *                                 type: string
 *                                 example: "2024-W41"
 *                               riskTypes:
 *                                 type: object
 *                                 properties:
 *                                   dataCollection:
 *                                     type: number
 *                                     example: 15
 *                                   liability:
 *                                     type: number
 *                                     example: 8
 *                                   termination:
 *                                     type: number
 *                                     example: 3
 *                     comparativeAnalytics:
 *                       type: object
 *                       properties:
 *                         totalComparisons:
 *                           type: number
 *                           example: 34
 *                         averageDocumentsPerComparison:
 *                           type: number
 *                           example: 3.2
 *                         mostComparedIndustries:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               industry:
 *                                 type: string
 *                                 example: "SaaS"
 *                               count:
 *                                 type: number
 *                                 example: 12
 *                         competitiveInsights:
 *                           type: object
 *                           properties:
 *                             betterThanAverage:
 *                               type: number
 *                               example: 68.5
 *                               description: "Percentage of analyses scoring above industry average"
 *                             topPerformingAreas:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Data Transparency", "Termination Clarity"]
 *                     predictions:
 *                       type: object
 *                       properties:
 *                         nextMonthVolume:
 *                           type: object
 *                           properties:
 *                             predicted:
 *                               type: number
 *                               example: 95
 *                             confidence:
 *                               type: number
 *                               example: 0.85
 *                         riskTrends:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               riskType:
 *                                 type: string
 *                                 example: "Data Collection"
 *                               trend:
 *                                 type: string
 *                                 enum: [increasing, decreasing, stable]
 *                                 example: "decreasing"
 *                               prediction:
 *                                 type: string
 *                                 example: "Risk likely to decrease by 15% next month"
 *             example:
 *               success: true
 *               analytics:
 *                 overview:
 *                   totalAnalyses: 247
 *                   averageScore: 72.5
 *                   mostCommonRisks:
 *                     - type: "Data Collection"
 *                       count: 89
 *                       percentage: 36.0
 *                     - type: "Liability Limitation"
 *                       count: 67
 *                       percentage: 27.1
 *                   improvementTrend: 5.2
 *                 trends:
 *                   analysisVolume:
 *                     - date: "2024-10-01"
 *                       count: 12
 *                     - date: "2024-10-08"
 *                       count: 18
 *                   scoreDistribution:
 *                     - scoreRange: "80-90"
 *                       count: 45
 *                       percentage: 18.2
 *                 comparativeAnalytics:
 *                   totalComparisons: 34
 *                   averageDocumentsPerComparison: 3.2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Advanced analytics not available for current plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Les analyses avancées nécessitent un abonnement Premium ou Enterprise"
 *                 code: "PREMIUM_FEATURE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/advanced', authenticateToken, getAnalytics);

module.exports = router;
