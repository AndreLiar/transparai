// Backend/routes/sessionRoutes.js
const express = require('express');
const Session = require('../models/Session');
const FailedAttempt = require('../models/FailedAttempt');
const authenticateToken = require('../middleware/authMiddleware');
const { validateSession, revokeSession } = require('../middleware/sessionMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/session/active:
 *   get:
 *     summary: Get all active sessions for current user
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 */
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.getActiveSessions(req.user.uid);

    // Don't expose full token hash
    const sessionList = sessions.map((s) => ({
      id: s._id,
      deviceInfo: s.deviceInfo,
      lastActivity: s.lastActivity,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));

    res.json({
      success: true,
      sessions: sessionList,
      total: sessionList.length,
    });
  } catch (error) {
    logger.error('Failed to fetch active sessions', {
      error: error.message,
      uid: req.user.uid,
    });

    res.status(500).json({
      error: 'Erreur lors de la récupération des sessions',
      code: 'FETCH_SESSIONS_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/session/revoke/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session revoked successfully
 */
router.delete('/revoke/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      firebaseUid: req.user.uid,
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session non trouvée',
        code: 'SESSION_NOT_FOUND',
      });
    }

    await session.revoke('user_revoke');

    logger.info('Session revoked by user', {
      uid: req.user.uid,
      sessionId: session._id,
    });

    res.json({
      success: true,
      message: 'Session révoquée avec succès',
    });
  } catch (error) {
    logger.error('Failed to revoke session', {
      error: error.message,
      uid: req.user.uid,
      sessionId: req.params.sessionId,
    });

    res.status(500).json({
      error: 'Erreur lors de la révocation de la session',
      code: 'REVOKE_SESSION_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/session/revoke-all:
 *   post:
 *     summary: Revoke all sessions except current
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked
 */
router.post('/revoke-all', authenticateToken, async (req, res) => {
  try {
    // Get current session token
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7);
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

    // Revoke all sessions except current
    const result = await Session.updateMany(
      {
        firebaseUid: req.user.uid,
        isActive: true,
        token: { $ne: tokenHash },
      },
      {
        $set: {
          isActive: false,
          revokedAt: new Date(),
          revokedReason: 'user_revoke_all',
        },
      },
    );

    logger.info('All other sessions revoked', {
      uid: req.user.uid,
      count: result.modifiedCount,
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} session(s) révoquée(s)`,
      revokedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('Failed to revoke all sessions', {
      error: error.message,
      uid: req.user.uid,
    });

    res.status(500).json({
      error: 'Erreur lors de la révocation des sessions',
      code: 'REVOKE_ALL_SESSIONS_ERROR',
    });
  }
});

/**
 * @swagger
 * /api/session/logout:
 *   post:
 *     summary: Logout and revoke current session
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authenticateToken, revokeSession, (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie',
  });
});

/**
 * @swagger
 * /api/session/failed-attempts:
 *   get:
 *     summary: Get failed authentication attempts (for monitoring)
 *     tags: [Session]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Failed attempts retrieved
 */
router.get('/failed-attempts', authenticateToken, async (req, res) => {
  try {
    const recentAttempts = await FailedAttempt.find({
      $or: [
        { identifier: req.user.uid },
        { identifier: req.user.email },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('-__v');

    res.json({
      success: true,
      attempts: recentAttempts,
      total: recentAttempts.length,
    });
  } catch (error) {
    logger.error('Failed to fetch failed attempts', {
      error: error.message,
      uid: req.user.uid,
    });

    res.status(500).json({
      error: 'Erreur lors de la récupération des tentatives échouées',
      code: 'FETCH_ATTEMPTS_ERROR',
    });
  }
});

module.exports = router;
