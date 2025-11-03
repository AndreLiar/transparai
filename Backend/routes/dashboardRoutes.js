// Backend/routes/dashboardRoutes.js

const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { fetchDashboard } = require('../controllers/dashboardController');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: User dashboard and analytics endpoints
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     description: |
 *       Retrieves comprehensive dashboard data for the authenticated user including:
 *       - User profile and plan information
 *       - Monthly quota usage and remaining analyses
 *       - Recent analysis history
 *       - Usage statistics and trends
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     quota:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                           example: 15
 *                         limit:
 *                           type: number
 *                           example: 100
 *                           description: "-1 for unlimited"
 *                         remaining:
 *                           type: number
 *                           example: 85
 *                         resetDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-11-01"
 *                     recentAnalyses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Analysis'
 *                       description: "Last 5 analyses"
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalAnalyses:
 *                           type: number
 *                           example: 47
 *                         averageScore:
 *                           type: number
 *                           example: 72.5
 *                         thisMonthAnalyses:
 *                           type: number
 *                           example: 15
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   firebaseUid: "RywcCYBykQdHjYRydqMWv2pLeyw1"
 *                   email: "user@example.com"
 *                   plan: "premium"
 *                   profile:
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                 quota:
 *                   used: 15
 *                   limit: 100
 *                   remaining: 85
 *                   resetDate: "2024-11-01"
 *                 recentAnalyses:
 *                   - id: "507f1f77bcf86cd799439011"
 *                     fileName: "terms.pdf"
 *                     score: 75
 *                     grade: "B"
 *                     createdAt: "2024-10-11T10:30:00Z"
 *                 statistics:
 *                   totalAnalyses: 47
 *                   averageScore: 72.5
 *                   thisMonthAnalyses: 15
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', authenticate, fetchDashboard);

module.exports = router;
