// Backend/routes/gdprRoutes.js
const express = require('express');
const {
  exportUserData,
  deleteUserAccount,
  getConsentStatus,
  updateConsent,
  getRetentionPolicy,
} = require('../controllers/gdprController');
const authenticateToken = require('../middleware/authMiddleware');
const { strictLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/gdpr/export:
 *   get:
 *     summary: Export all user data (GDPR Article 20)
 *     tags: [GDPR]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/export', authenticateToken, strictLimiter, exportUserData);

/**
 * @swagger
 * /api/gdpr/delete-account:
 *   delete:
 *     summary: Delete user account and all data (GDPR Article 17)
 *     tags: [GDPR]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmation
 *             properties:
 *               confirmation:
 *                 type: string
 *                 description: Must be "DELETE_MY_ACCOUNT"
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete('/delete-account', authenticateToken, strictLimiter, deleteUserAccount);

/**
 * @swagger
 * /api/gdpr/consent:
 *   get:
 *     summary: Get user consent status
 *     tags: [GDPR]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Consent status retrieved
 */
router.get('/consent', authenticateToken, getConsentStatus);

/**
 * @swagger
 * /api/gdpr/consent:
 *   put:
 *     summary: Update user consent preferences
 *     tags: [GDPR]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analytics:
 *                 type: boolean
 *               marketing:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Consent updated successfully
 */
router.put('/consent', authenticateToken, updateConsent);

/**
 * @swagger
 * /api/gdpr/retention-policy:
 *   get:
 *     summary: Get data retention policy
 *     tags: [GDPR]
 *     responses:
 *       200:
 *         description: Retention policy retrieved
 */
router.get('/retention-policy', getRetentionPolicy);

module.exports = router;
