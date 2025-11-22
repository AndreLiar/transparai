// Backend/routes/adminRoutes.js
const express = require('express');
const { getQuotaAnalytics, getSystemMetrics, getSecurityMetrics } = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative endpoints for system monitoring and analytics
 */

/**
 * @swagger
 * /api/admin/quota-analytics:
 *   get:
 *     summary: Get comprehensive quota and usage analytics
 *     description: |
 *       Retrieves detailed analytics about user quotas, usage patterns, and system performance.
 *       This endpoint provides insights for business intelligence and system optimization.
 *
 *       **Admin Only**: Requires administrative privileges to access.
 *
 *       **Analytics Include:**
 *       - User quota utilization by plan
 *       - Usage trends over time
 *       - Users approaching quota limits
 *       - Error analytics and patterns
 *       - Rate limiting statistics
 *       - System recommendations
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Quota analytics retrieved successfully
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                           example: 1250
 *                         totalAnalyses:
 *                           type: number
 *                           example: 15680
 *                         avgUtilizationRate:
 *                           type: number
 *                           example: 68.5
 *                         usersNearLimit:
 *                           type: number
 *                           example: 23
 *                         generatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-10-11T10:30:00Z"
 *                     planBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "premium"
 *                           totalUsers:
 *                             type: number
 *                             example: 450
 *                           totalAnalyses:
 *                             type: number
 *                             example: 8900
 *                           avgAnalysesPerUser:
 *                             type: number
 *                             example: 19.8
 *                           totalQuotaUsed:
 *                             type: number
 *                             example: 7650
 *                           totalQuotaLimit:
 *                             type: number
 *                             example: 90000
 *                           utilizationRate:
 *                             type: number
 *                             example: 8.5
 *                     usageTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "2024-10-11"
 *                           planBreakdown:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 plan:
 *                                   type: string
 *                                   example: "premium"
 *                                 analyses:
 *                                   type: number
 *                                   example: 145
 *                                 users:
 *                                   type: number
 *                                   example: 28
 *                           totalAnalyses:
 *                             type: number
 *                             example: 347
 *                     usersNearLimit:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                             example: "user@company.com"
 *                           plan:
 *                             type: string
 *                             example: "standard"
 *                           currentUsage:
 *                             type: object
 *                             properties:
 *                               analyses:
 *                                 type: number
 *                                 example: 45
 *                           quotaLimit:
 *                             type: number
 *                             example: 50
 *                           utilizationRate:
 *                             type: number
 *                             example: 90.0
 *                           lastAnalysisAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-10-11T09:15:00Z"
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [quota_management, user_engagement, system_health, conversion_opportunity]
 *                             example: "conversion_opportunity"
 *                           priority:
 *                             type: string
 *                             enum: [low, medium, high, critical]
 *                             example: "medium"
 *                           message:
 *                             type: string
 *                             example: "Free plan users have 75% utilization. High conversion potential."
 *                           action:
 *                             type: string
 *                             example: "Create targeted upgrade campaigns for active free users"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Administrative privileges required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Accès administrateur requis"
 *                 code: "ADMIN_ACCESS_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/quota-analytics', authenticateToken, requireAdmin, strictLimiter, getQuotaAnalytics);

/**
 * @swagger
 * /api/admin/system-metrics:
 *   get:
 *     summary: Get real-time system metrics
 *     description: |
 *       Retrieves current system performance metrics including server health,
 *       database status, error rates, and user activity statistics.
 *
 *       **Admin Only**: Requires administrative privileges to access.
 *
 *       **Metrics Include:**
 *       - Server uptime and resource usage
 *       - Memory and CPU utilization
 *       - Database connection status
 *       - Error counts and rates
 *       - Active user statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T10:30:00Z"
 *                     system:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                           example: 86400
 *                           description: "Server uptime in seconds"
 *                         memory:
 *                           type: object
 *                           properties:
 *                             rss:
 *                               type: number
 *                               example: 134217728
 *                             heapTotal:
 *                               type: number
 *                               example: 67108864
 *                             heapUsed:
 *                               type: number
 *                               example: 45088768
 *                             external:
 *                               type: number
 *                               example: 2097152
 *                         cpu:
 *                           type: object
 *                           properties:
 *                             user:
 *                               type: number
 *                               example: 125000
 *                             system:
 *                               type: number
 *                               example: 45000
 *                         nodeVersion:
 *                           type: string
 *                           example: "v18.17.0"
 *                         platform:
 *                           type: string
 *                           example: "linux"
 *                     database:
 *                       type: object
 *                       properties:
 *                         connections:
 *                           type: string
 *                           example: "Available via MongoDB monitoring"
 *                         operations:
 *                           type: string
 *                           example: "Available via MongoDB monitoring"
 *                         performance:
 *                           type: string
 *                           example: "Available via MongoDB monitoring"
 *                     errors:
 *                       type: object
 *                       properties:
 *                         last24h:
 *                           type: number
 *                           example: 12
 *                           description: "Error count in last 24 hours"
 *                         unresolved:
 *                           type: number
 *                           example: 3
 *                           description: "Number of unresolved errors"
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 1250
 *                           description: "Total registered users"
 *                         active24h:
 *                           type: number
 *                           example: 89
 *                           description: "Users active in last 24 hours"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Administrative privileges required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Accès administrateur requis"
 *                 code: "ADMIN_ACCESS_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/system-metrics', authenticateToken, requireAdmin, strictLimiter, getSystemMetrics);

/**
 * @swagger
 * /api/admin/security-metrics:
 *   get:
 *     summary: Get security monitoring metrics
 *     description: |
 *       Retrieves security-related metrics including failed authentication attempts,
 *       locked accounts, and potential security threats.
 *
 *       **Admin Only**: Requires administrative privileges to access.
 *
 *       **Metrics Include:**
 *       - Failed authentication attempts
 *       - Locked accounts
 *       - Top IPs with failed attempts
 *       - Attempt breakdown by type
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Security metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     recentAttempts:
 *                       type: object
 *                       properties:
 *                         last15Minutes:
 *                           type: number
 *                         last24Hours:
 *                           type: number
 *                     attemptsByType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *                     topFailedIPs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *                           lastAttempt:
 *                             type: string
 *                             format: date-time
 *                     lockedAccounts:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                         accounts:
 *                           type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Administrative privileges required
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/security-metrics', authenticateToken, requireAdmin, strictLimiter, getSecurityMetrics);

module.exports = router;
