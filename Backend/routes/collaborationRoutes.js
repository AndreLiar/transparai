// Backend/routes/collaborationRoutes.js
const express = require('express');
const {
  shareAnalysis,
  getSharedAnalyses,
  getSharedAnalysisDetails,
  addComment,
} = require('../controllers/collaborationController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Collaboration
 *   description: Team collaboration and analysis sharing features
 */

/**
 * @swagger
 * /api/collaboration/share:
 *   post:
 *     summary: Share analysis with organization members
 *     description: |
 *       Shares an analysis result with specific users or groups within the organization.
 *       Enables collaborative review, discussion, and decision-making around analysis results.
 *       Available for Premium and Enterprise users only.
 *
 *       **Sharing Options:**
 *       - Individual users within organization
 *       - User groups/departments
 *       - Organization-wide visibility
 *       - External stakeholders (Enterprise only)
 *     tags: [Collaboration]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analysisId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: "ID of the analysis to share"
 *               shareWith:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [user, group, organization, external]
 *                       example: "user"
 *                     identifier:
 *                       type: string
 *                       example: "user@company.com"
 *                       description: "Email for users, group ID for groups"
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [view, comment, download, edit_sharing]
 *                       example: ["view", "comment"]
 *                 description: "List of users/groups to share with and their permissions"
 *               message:
 *                 type: string
 *                 example: "Analyse des CGA pour révision avant la signature du contrat"
 *                 description: "Optional message to include with the sharing notification"
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-11-11T10:30:00Z"
 *                 description: "Optional expiration date for the share"
 *               notifyByEmail:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *                 description: "Whether to send email notifications to shared users"
 *             required: [analysisId, shareWith]
 *     responses:
 *       200:
 *         description: Analysis shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 share:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439013"
 *                     analysisId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     sharedBy:
 *                       type: string
 *                       example: "manager@company.com"
 *                     sharedWith:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "user"
 *                           identifier:
 *                             type: string
 *                             example: "user@company.com"
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["view", "comment"]
 *                           status:
 *                             type: string
 *                             enum: [pending, accepted, declined]
 *                             example: "pending"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T10:30:00Z"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-11T10:30:00Z"
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     emailsSent:
 *                       type: number
 *                       example: 3
 *                     recipients:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["user1@company.com", "user2@company.com"]
 *                 message:
 *                   type: string
 *                   example: "Analyse partagée avec succès avec 3 membres de l'équipe"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Collaboration features not available for current plan or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Les fonctionnalités de collaboration nécessitent un abonnement Premium ou Enterprise"
 *                 code: "PREMIUM_FEATURE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       404:
 *         description: Analysis not found or not accessible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Analyse introuvable ou non accessible"
 *                 code: "ANALYSIS_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Share an analysis
router.post('/share', authenticateToken, shareAnalysis);

/**
 * @swagger
 * /api/collaboration/shared:
 *   get:
 *     summary: Get shared analyses for organization
 *     description: |
 *       Retrieves all analyses that have been shared with the current user or their organization.
 *       Includes both analyses shared with the user directly and organization-wide shares.
 *
 *       **Includes:**
 *       - Analyses shared directly with the user
 *       - Organization-wide shared analyses
 *       - Group-based shares where user is a member
 *       - Filtering and sorting options
 *     tags: [Collaboration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         example: 20
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, direct, organization, group]
 *           default: "all"
 *         example: "all"
 *         description: "Filter by sharing type"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [sharedAt, analysisDate, documentName, sharedBy]
 *           default: "sharedAt"
 *         example: "sharedAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         example: "desc"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: "privacy policy"
 *         description: "Search in document names and analysis titles"
 *     responses:
 *       200:
 *         description: Shared analyses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sharedAnalyses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shareId:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439013"
 *                       analysis:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           documentName:
 *                             type: string
 *                             example: "Terms and Conditions - Company A"
 *                           score:
 *                             type: number
 *                             example: 75
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-10-10T14:20:00Z"
 *                       sharedBy:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                             example: "manager@company.com"
 *                           name:
 *                             type: string
 *                             example: "John Manager"
 *                           role:
 *                             type: string
 *                             example: "manager"
 *                       shareType:
 *                         type: string
 *                         enum: [direct, organization, group]
 *                         example: "direct"
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["view", "comment"]
 *                       sharedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-11T10:30:00Z"
 *                       message:
 *                         type: string
 *                         example: "Analyse pour révision avant signature"
 *                       status:
 *                         type: string
 *                         enum: [active, expired, revoked]
 *                         example: "active"
 *                       commentCount:
 *                         type: number
 *                         example: 3
 *                       lastActivity:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-11T15:45:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Collaboration features not available for current plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Les fonctionnalités de collaboration nécessitent un abonnement Premium ou Enterprise"
 *                 code: "PREMIUM_FEATURE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get shared analyses for user's organization
router.get('/shared', authenticateToken, getSharedAnalyses);

/**
 * @swagger
 * /api/collaboration/shared/{analysisId}:
 *   get:
 *     summary: Get detailed view of shared analysis
 *     description: |
 *       Retrieves detailed information about a specific shared analysis, including
 *       the full analysis results, sharing details, comments, and collaboration history.
 *       User must have view permissions on the shared analysis.
 *     tags: [Collaboration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: includeComments
 *         schema:
 *           type: boolean
 *           default: true
 *         example: true
 *         description: "Whether to include comments in the response"
 *       - in: query
 *         name: includeHistory
 *         schema:
 *           type: boolean
 *           default: false
 *         example: false
 *         description: "Whether to include collaboration history"
 *     responses:
 *       200:
 *         description: Shared analysis details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sharedAnalysis:
 *                   type: object
 *                   properties:
 *                     shareInfo:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439013"
 *                         sharedBy:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: string
 *                               example: "manager@company.com"
 *                             name:
 *                               type: string
 *                               example: "John Manager"
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["view", "comment"]
 *                         sharedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-10-11T10:30:00Z"
 *                         message:
 *                           type: string
 *                           example: "Analyse pour révision avant signature"
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         documentName:
 *                           type: string
 *                           example: "Terms and Conditions - Company A"
 *                         extractedText:
 *                           type: string
 *                           example: "Article 1. Objet du contrat..."
 *                         analysis:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                               example: 75
 *                             risks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   type:
 *                                     type: string
 *                                     example: "Data Collection"
 *                                   severity:
 *                                     type: string
 *                                     example: "medium"
 *                                   description:
 *                                     type: string
 *                                     example: "Collecte étendue de données personnelles"
 *                             recommendations:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Clarifier les finalités de collecte", "Ajouter un droit de portabilité"]
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-10-10T14:20:00Z"
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439014"
 *                           author:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                                 example: "analyst@company.com"
 *                               name:
 *                                 type: string
 *                                 example: "Jane Analyst"
 *                           content:
 *                             type: string
 *                             example: "Je pense que le score pourrait être amélioré en clarifiant l'article 3"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-10-11T11:15:00Z"
 *                           replies:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 author:
 *                                   type: object
 *                                 content:
 *                                   type: string
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                     collaborationStats:
 *                       type: object
 *                       properties:
 *                         totalViews:
 *                           type: number
 *                           example: 12
 *                         totalComments:
 *                           type: number
 *                           example: 5
 *                         lastActivity:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-10-11T15:45:00Z"
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               email:
 *                                 type: string
 *                                 example: "user@company.com"
 *                               lastSeen:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2024-10-11T14:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied to shared analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Accès refusé à cette analyse partagée"
 *                 code: "ACCESS_DENIED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       404:
 *         description: Shared analysis not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Analyse partagée introuvable"
 *                 code: "SHARED_ANALYSIS_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get specific shared analysis details
router.get('/shared/:analysisId', authenticateToken, getSharedAnalysisDetails);

/**
 * @swagger
 * /api/collaboration/shared/{analysisId}/comments:
 *   post:
 *     summary: Add comment to shared analysis
 *     description: |
 *       Adds a comment or reply to a shared analysis. Enables team discussion
 *       and collaboration around analysis results. User must have comment permissions
 *       on the shared analysis.
 *
 *       **Comment Features:**
 *       - Threaded replies to comments
 *       - Mentions (@username) with notifications
 *       - Rich text formatting support
 *       - File attachments (Enterprise only)
 *     tags: [Collaboration]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Je pense que le score pourrait être amélioré en clarifiant l'article 3 sur la collecte de données"
 *                 description: "The comment content"
 *               parentCommentId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439014"
 *                 description: "ID of parent comment if this is a reply"
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["manager@company.com", "legal@company.com"]
 *                 description: "List of user emails to mention and notify"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "suggested-changes.pdf"
 *                     contentType:
 *                       type: string
 *                       example: "application/pdf"
 *                     size:
 *                       type: number
 *                       example: 245760
 *                     url:
 *                       type: string
 *                       example: "https://storage.example.com/comments/abc123"
 *                 description: "File attachments (Enterprise only)"
 *             required: [content]
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439015"
 *                     content:
 *                       type: string
 *                       example: "Je pense que le score pourrait être amélioré en clarifiant l'article 3"
 *                     author:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: "analyst@company.com"
 *                         name:
 *                           type: string
 *                           example: "Jane Analyst"
 *                     parentCommentId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439014"
 *                     mentions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["manager@company.com"]
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                           url:
 *                             type: string
 *                           contentType:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T16:20:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T16:20:00Z"
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     mentionsSent:
 *                       type: number
 *                       example: 1
 *                     notifiedUsers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["manager@company.com"]
 *                 message:
 *                   type: string
 *                   example: "Commentaire ajouté avec succès"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No permission to comment on this analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Vous n'avez pas la permission de commenter cette analyse"
 *                 code: "COMMENT_PERMISSION_DENIED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       404:
 *         description: Shared analysis not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Analyse partagée introuvable"
 *                 code: "SHARED_ANALYSIS_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Add comment to shared analysis
router.post('/shared/:analysisId/comments', authenticateToken, addComment);

module.exports = router;
