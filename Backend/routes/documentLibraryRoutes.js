// Backend/routes/documentLibraryRoutes.js
const express = require('express');
const {
  getLibrary,
  getDocumentById,
  removeDocument,
  toggleOrgSharing,
} = require('../controllers/documentLibraryController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Document Library
 *   description: Document reuse and management system
 */

/**
 * @swagger
 * /api/documents/library:
 *   get:
 *     summary: Get user's document library
 *     description: |
 *       Retrieves the user's document library with smart caching and reuse features.
 *       Documents are cached by content hash for privacy-preserving duplicate detection.
 *       Available for Standard, Premium, and Enterprise users.
 *     tags: [Document Library]
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
 *         name: search
 *         schema:
 *           type: string
 *         example: "privacy policy"
 *         description: "Search in document names"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, lastUsed, createdAt, usageCount]
 *           default: "lastUsed"
 *         example: "lastUsed"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Document library retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       name:
 *                         type: string
 *                         example: "Company Privacy Policy"
 *                       originalName:
 *                         type: string
 *                         example: "privacy-policy-v2.pdf"
 *                       usageCount:
 *                         type: number
 *                         example: 5
 *                       lastUsed:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-11T10:30:00Z"
 *                       isSharedWithOrg:
 *                         type: boolean
 *                         example: false
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["privacy", "legal"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-09-15T14:20:00Z"
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
 *         description: Document library not available for current plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "La bibliothèque de documents nécessite un abonnement Standard ou supérieur"
 *                 code: "PLAN_UPGRADE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get user's document library
router.get('/library', authenticateToken, getLibrary);

/**
 * @swagger
 * /api/documents/library/{documentId}:
 *   get:
 *     summary: Get specific document content
 *     description: |
 *       Retrieves the extracted text content of a specific document from the library.
 *       Used for reanalysis without re-uploading the same document.
 *     tags: [Document Library]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Document content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 document:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Company Privacy Policy"
 *                     extractedText:
 *                       type: string
 *                       example: "Privacy Policy... [full text content]"
 *                     contentHash:
 *                       type: string
 *                       example: "sha256:a1b2c3..."
 *                       description: "Content fingerprint for duplicate detection"
 *                     lastUsed:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Document not found or not accessible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Document introuvable dans votre bibliothèque"
 *                 code: "DOCUMENT_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get specific document content
router.get('/library/:documentId', authenticateToken, getDocumentById);

/**
 * @swagger
 * /api/documents/library/{documentId}:
 *   delete:
 *     summary: Remove document from library
 *     description: |
 *       Removes a document from the user's library. This is a soft delete that
 *       maintains the analysis history but removes the document from the library view.
 *     tags: [Document Library]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Document removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document supprimé de la bibliothèque"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Document not found or not accessible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Document introuvable dans votre bibliothèque"
 *                 code: "DOCUMENT_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Delete document from library
router.delete('/library/:documentId', authenticateToken, removeDocument);

/**
 * @swagger
 * /api/documents/library/{documentId}/share:
 *   put:
 *     summary: Share/unshare document with organization
 *     description: |
 *       Toggles sharing of a document with the user's organization. Shared documents
 *       can be accessed by other organization members for comparative analysis.
 *       Available for Enterprise users only.
 *     tags: [Document Library]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
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
 *               shared:
 *                 type: boolean
 *                 example: true
 *                 description: "Whether to share (true) or unshare (false) the document"
 *               shareLevel:
 *                 type: string
 *                 enum: [organization, managers, specific_users]
 *                 default: "organization"
 *                 example: "organization"
 *                 description: "Level of sharing within organization"
 *             required: [shared]
 *     responses:
 *       200:
 *         description: Sharing settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document partagé avec l'organisation"
 *                 sharing:
 *                   type: object
 *                   properties:
 *                     isShared:
 *                       type: boolean
 *                       example: true
 *                     shareLevel:
 *                       type: string
 *                       example: "organization"
 *                     sharedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-11T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Document sharing not available for current plan or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Le partage de documents nécessite un abonnement Enterprise"
 *                 code: "ENTERPRISE_FEATURE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       404:
 *         description: Document not found or not accessible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Document introuvable dans votre bibliothèque"
 *                 code: "DOCUMENT_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Share/unshare document with organization
router.put('/library/:documentId/share', authenticateToken, toggleOrgSharing);

module.exports = router;
