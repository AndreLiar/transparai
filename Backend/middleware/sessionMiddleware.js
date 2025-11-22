// Backend/middleware/sessionMiddleware.js
const Session = require('../models/Session');
const logger = require('../utils/logger');

// Maximum concurrent sessions per user
const MAX_SESSIONS_PER_USER = 3;

/**
 * Validate session exists and is active
 * This middleware should run AFTER authenticateToken
 */
const validateSession = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        error: 'Authentication requise',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token manquant',
        code: 'TOKEN_MISSING',
      });
    }

    const token = authHeader.substring(7);
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

    // Check if session exists and is active
    const session = await Session.findOne({
      token: tokenHash,
      firebaseUid: req.user.uid,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      logger.warn('Invalid or expired session', {
        uid: req.user.uid,
        ip: req.ip,
      });

      return res.status(401).json({
        error: 'Session invalide ou expirée',
        code: 'SESSION_INVALID',
      });
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    req.session = session;
    next();
  } catch (error) {
    logger.error('Session validation error', {
      error: error.message,
      stack: error.stack,
      uid: req.user?.uid,
    });

    return res.status(500).json({
      error: 'Erreur de validation de session',
      code: 'SESSION_VALIDATION_ERROR',
    });
  }
};

/**
 * Create a new session for authenticated user
 */
const createSession = async (firebaseUid, token, deviceInfo = {}) => {
  try {
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

    // Check existing active sessions
    const activeSessions = await Session.getActiveSessions(firebaseUid);

    // If at limit, revoke oldest session
    if (activeSessions.length >= MAX_SESSIONS_PER_USER) {
      const oldestSession = activeSessions[activeSessions.length - 1];
      await oldestSession.revoke('max_sessions_exceeded');

      logger.info('Session limit reached - revoked oldest session', {
        firebaseUid,
        revokedSessionId: oldestSession._id,
      });
    }

    // Parse device info
    const userAgent = deviceInfo.userAgent || '';
    const deviceType = /mobile/i.test(userAgent) ? 'mobile' : 'desktop';
    const browser = userAgent.match(/(?:Firefox|Chrome|Safari|Edge)\/[\d.]+/)?.[0] || 'unknown';
    const os = userAgent.match(/\(([^)]+)\)/)?.[1] || 'unknown';

    // Create new session (expires in 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const session = await Session.create({
      firebaseUid,
      token: tokenHash,
      deviceInfo: {
        userAgent,
        ip: deviceInfo.ip,
        deviceType,
        browser,
        os,
      },
      expiresAt,
      isActive: true,
    });

    logger.info('Session created', {
      firebaseUid,
      sessionId: session._id,
      deviceType,
      expiresAt,
    });

    return session;
  } catch (error) {
    logger.error('Session creation error', {
      error: error.message,
      stack: error.stack,
      firebaseUid,
    });
    throw error;
  }
};

/**
 * Revoke session on logout
 */
const revokeSession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

    const session = await Session.findOne({ token: tokenHash });
    if (session) {
      await session.revoke('logout');
      logger.info('Session revoked', {
        firebaseUid: session.firebaseUid,
        sessionId: session._id,
      });
    }

    next();
  } catch (error) {
    logger.error('Session revocation error', {
      error: error.message,
      stack: error.stack,
    });
    next(); // Continue even if revocation fails
  }
};

module.exports = {
  validateSession,
  createSession,
  revokeSession,
  MAX_SESSIONS_PER_USER,
};
