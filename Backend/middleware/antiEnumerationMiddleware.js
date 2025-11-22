// Backend/middleware/antiEnumerationMiddleware.js
const FailedAttempt = require('../models/FailedAttempt');
const logger = require('../utils/logger');

// Configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 15;
const IP_RATE_LIMIT = 20;

// Standardized error messages (no information disclosure)
const STANDARD_AUTH_ERROR = 'Identifiants invalides';
const ACCOUNT_LOCKED_ERROR = 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
const RATE_LIMIT_ERROR = 'Trop de requêtes. Veuillez réessayer plus tard.';

/**
 * Add timing delay to prevent timing attacks
 * Ensures all auth responses take similar time
 */
const timingSafeResponse = async (delayMs = 200) => {
  const jitter = Math.random() * 100; // Add 0-100ms random jitter
  await new Promise((resolve) => setTimeout(resolve, delayMs + jitter));
};

/**
 * Check if identifier (email/uid) is locked out
 */
const checkLockout = async (req, res, next) => {
  const identifier = req.body.email || req.body.uid || req.user?.uid;
  const ip = req.ip;

  if (!identifier) {
    return next();
  }

  try {
    // Check if identifier is locked out
    const isLocked = await FailedAttempt.isLockedOut(identifier, MAX_ATTEMPTS, LOCKOUT_WINDOW_MINUTES);

    if (isLocked) {
      logger.warn('Account lockout triggered', {
        identifier,
        ip,
        endpoint: req.originalUrl,
      });

      // Add timing delay before responding
      await timingSafeResponse();

      return res.status(429).json({
        error: ACCOUNT_LOCKED_ERROR,
        code: 'ACCOUNT_LOCKED',
      });
    }

    // Check if IP is rate limited
    const isIPLimited = await FailedAttempt.isIPRateLimited(ip, IP_RATE_LIMIT, LOCKOUT_WINDOW_MINUTES);

    if (isIPLimited) {
      logger.warn('IP rate limit triggered', {
        ip,
        endpoint: req.originalUrl,
      });

      await timingSafeResponse();

      return res.status(429).json({
        error: RATE_LIMIT_ERROR,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  } catch (error) {
    logger.error('Lockout check error', {
      error: error.message,
      identifier,
      ip,
    });
    // Continue on error - don't block legitimate users
    next();
  }
};

/**
 * Record failed authentication attempt
 */
const recordFailedAttempt = async (identifier, ip, type = 'auth', metadata = {}) => {
  try {
    await FailedAttempt.recordAttempt(identifier, ip, type, metadata);

    // Check if this puts them over the limit
    const isLocked = await FailedAttempt.isLockedOut(identifier, MAX_ATTEMPTS, LOCKOUT_WINDOW_MINUTES);

    if (isLocked) {
      logger.warn('Account locked out after failed attempt', {
        identifier,
        ip,
        type,
      });
    }
  } catch (error) {
    logger.error('Failed to record attempt', {
      error: error.message,
      identifier,
    });
  }
};

/**
 * Clear failed attempts after successful authentication
 */
const clearFailedAttempts = async (identifier) => {
  try {
    await FailedAttempt.clearAttempts(identifier);
    logger.info('Failed attempts cleared', { identifier });
  } catch (error) {
    logger.error('Failed to clear attempts', {
      error: error.message,
      identifier,
    });
  }
};

/**
 * Middleware to standardize auth error responses
 * Prevents user enumeration through error message differences
 */
const standardizeAuthError = async (req, res, next) => {
  // Wrap res.status and res.json to intercept auth errors
  const originalStatus = res.status.bind(res);
  const originalJson = res.json.bind(res);

  res.status = function (code) {
    res.statusCode = code;
    return this;
  };

  res.json = async function (body) {
    // If this is an auth error (401 or 403), standardize the message
    if ((res.statusCode === 401 || res.statusCode === 403) && body.message) {
      const identifier = req.body.email || req.body.uid || req.user?.uid;
      const ip = req.ip;

      // Record failed attempt
      if (identifier) {
        await recordFailedAttempt(identifier, ip, 'auth', {
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent'),
          originalMessage: body.message,
        });
      }

      // Add timing delay to prevent timing attacks
      await timingSafeResponse();

      // Standardize error message
      body.message = STANDARD_AUTH_ERROR;
      delete body.error; // Remove any additional error details
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Enhanced auth middleware wrapper that includes enumeration protection
 */
const protectedAuth = (authMiddleware) => async (req, res, next) => {
  // Apply lockout check first
  await checkLockout(req, res, () => {
    // Then apply standard auth
    authMiddleware(req, res, async (err) => {
      if (!err && req.user) {
        // Successful auth - clear failed attempts
        await clearFailedAttempts(req.user.uid);
        await clearFailedAttempts(req.user.email);
      }
      next(err);
    });
  });
};

module.exports = {
  checkLockout,
  standardizeAuthError,
  recordFailedAttempt,
  clearFailedAttempts,
  timingSafeResponse,
  protectedAuth,
  STANDARD_AUTH_ERROR,
  MAX_ATTEMPTS,
  LOCKOUT_WINDOW_MINUTES,
};
