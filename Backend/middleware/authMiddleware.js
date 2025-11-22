// Backend/middleware/authMiddleware.js
const admin = require('../config/firebase');
const logger = require('../utils/logger');
const {
  recordFailedAttempt,
  clearFailedAttempts,
  timingSafeResponse,
  STANDARD_AUTH_ERROR,
} = require('./antiEnumerationMiddleware');

const authenticate = async (req, res, next) => {
  // Only log minimal info in production, exclude sensitive headers
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Auth middleware invoked', {
      method: req.method,
      url: req.url,
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or malformed authorization header', {
      ip: req.ip,
      endpoint: req.originalUrl,
    });

    // Add timing delay to prevent enumeration
    await timingSafeResponse();

    return res.status(401).json({ message: STANDARD_AUTH_ERROR });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Only log email in dev, never log tokens
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Token verified', { email: decodedToken.email });
    } else {
      logger.info('Token verified successfully', { uid: decodedToken.uid });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
    };

    // Clear any failed attempts for this user
    await clearFailedAttempts(decodedToken.uid);
    if (decodedToken.email) {
      await clearFailedAttempts(decodedToken.email);
    }

    next();
  } catch (err) {
    // Record failed attempt
    const identifier = req.body.email || req.body.uid || 'unknown';
    await recordFailedAttempt(identifier, req.ip, 'auth', {
      endpoint: req.originalUrl,
      userAgent: req.get('User-Agent'),
      reason: 'token_verification_failed',
    });

    // Sanitize error messages in production
    const sanitizedError = process.env.NODE_ENV === 'production'
      ? 'Token validation failed'
      : err.message;

    logger.warn('Token verification failed', {
      error: sanitizedError,
      ip: req.ip,
    });

    // Add timing delay to prevent enumeration
    await timingSafeResponse();

    return res.status(403).json({ message: STANDARD_AUTH_ERROR });
  }
};

module.exports = authenticate;
