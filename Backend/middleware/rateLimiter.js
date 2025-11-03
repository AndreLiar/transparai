// Backend/middleware/rateLimiter.js
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const logger = require('../utils/logger');

// Custom key generator that includes user ID when available
const createKeyGenerator = (prefix = '') => (req, res) => {
  const userId = req.user?.uid || req.user?.id;
  const ipKey = ipKeyGenerator(req, res);
  return `${prefix}:${userId || ipKey}`;
};

// Custom rate limit hit handler
const handler = (req, res, options) => {
  const userId = req.user?.uid || req.user?.id;

  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    userId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    limit: options.max,
    windowMs: options.windowMs,
  });

  res.status(options.statusCode).send(options.message);
};

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Trop de requêtes, veuillez réessayer plus tard.',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
      retryAfter: '15 minutes',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: createKeyGenerator('api'),
  handler,
  skip: (req) =>
    // Skip rate limiting for health checks
    req.path.startsWith('/health'),

});

// Analysis endpoint rate limiter (more restrictive)
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Different limits based on user plan
    const userPlan = req.user?.plan || 'free';
    const limits = {
      free: 5,
      standard: 50,
      premium: 200,
      enterprise: 1000,
    };
    return limits[userPlan] || limits.free;
  },
  message: {
    success: false,
    error: {
      message: 'Limite d\'analyses atteinte pour votre plan. Upgradez votre abonnement ou réessayez plus tard.',
      code: 'ANALYSIS_QUOTA_EXCEEDED',
      timestamp: new Date().toISOString(),
      retryAfter: '1 hour',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('analysis'),
  handler: (req, res, options) => {
    handler(req, res, options);

    // Log quota usage for analytics
    logger.logQuotaUsage(
      req.user?.uid || req.user?.id,
      req.user?.plan || 'free',
      req.rateLimit?.used || 0,
      req.rateLimit?.limit || 0,
      'analysis_limit_reached',
    );
  },
});

// Authentication endpoints rate limiter (very restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
      retryAfter: '15 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('auth'),
  handler,
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: {
      message: 'Trop de demandes de réinitialisation de mot de passe. Veuillez réessayer dans 1 heure.',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
      retryAfter: '1 hour',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('password-reset'),
  handler,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    const userPlan = req.user?.plan || 'free';
    const limits = {
      free: 10,
      standard: 100,
      premium: 500,
      enterprise: 2000,
    };
    return limits[userPlan] || limits.free;
  },
  message: {
    success: false,
    error: {
      message: 'Limite de téléchargements atteinte pour votre plan.',
      code: 'UPLOAD_QUOTA_EXCEEDED',
      timestamp: new Date().toISOString(),
      retryAfter: '1 hour',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('upload'),
  handler,
});

// Export rate limiter
const exportLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: (req) => {
    const userPlan = req.user?.plan || 'free';
    const limits = {
      free: 3,
      standard: 20,
      premium: 100,
      enterprise: 500,
    };
    return limits[userPlan] || limits.free;
  },
  message: {
    success: false,
    error: {
      message: 'Limite d\'exports atteinte pour votre plan.',
      code: 'EXPORT_QUOTA_EXCEEDED',
      timestamp: new Date().toISOString(),
      retryAfter: '24 hours',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('export'),
  handler,
});

// Strict rate limiter for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Very restrictive
  message: {
    success: false,
    error: {
      message: 'Limite d\'accès atteinte pour cette fonctionnalité sensible.',
      code: 'STRICT_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
      retryAfter: '1 hour',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator('strict'),
  handler,
});

// Create a rate limiter with custom options
const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createKeyGenerator(options.prefix || 'custom'),
    handler,
  };

  return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
  apiLimiter,
  analysisLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  exportLimiter,
  strictLimiter,
  createCustomLimiter,
};
