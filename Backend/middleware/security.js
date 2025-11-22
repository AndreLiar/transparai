// Backend/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

/**
 * Generate nonce for CSP
 */
const generateNonce = () => crypto.randomBytes(16).toString('base64');

/**
 * Enhanced security headers with strict CSP
 */
const securityHeaders = (req, res, next) => {
  // Generate nonce for this request
  const nonce = generateNonce();
  req.nonce = nonce;

  // Apply Helmet with enhanced CSP
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          `'nonce-${nonce}'`, // Use nonce instead of unsafe-inline
        ],
        scriptSrc: [
          "'self'",
          `'nonce-${nonce}'`, // Use nonce for scripts
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https:',
          'blob:',
        ],
        connectSrc: [
          "'self'",
          'https://api.stripe.com',
          'https://*.vercel.app',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'data:',
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for API compatibility
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    hidePoweredBy: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })(req, res, next);
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === 'string') {
      return value.replace(/<script.*?>.*?<\/script>/gi, '').trim();
    }
    if (Array.isArray(value)) {
      return value.map(sanitize);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitizedObj = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          sanitizedObj[key] = sanitize(value[key]);
        }
      }
      return sanitizedObj;
    }
    return value;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

// SQL injection protection (for NoSQL)
const noSQLInjectionProtection = (req, res, next) => {
  const containsDangerousOperators = (obj) => {
    const dangerousOperators = ['$where', '$regex', '$ne', '$gt', '$lt', '$eval'];

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (dangerousOperators.includes(key)) {
          return true;
        }
        if (typeof obj[key] === 'object' && containsDangerousOperators(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (containsDangerousOperators(req.body)
      || containsDangerousOperators(req.query)
      || containsDangerousOperators(req.params)) {
    return res.status(400).json({
      error: 'Requête non autorisée',
      code: 'INVALID_REQUEST',
    });
  }

  next();
};

// File upload security
const fileUploadSecurity = (req, res, next) => {
  if (req.file || req.files) {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];

    const files = req.files || [req.file];

    for (const file of files) {
      if (file && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Type de fichier non autorisé',
          allowedTypes,
          code: 'INVALID_FILE_TYPE',
        });
      }

      // Check file size (10MB max)
      if (file && file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Fichier trop volumineux (maximum 10MB)',
          code: 'FILE_TOO_LARGE',
        });
      }
    }
  }

  next();
};

// Request size limiter
// Request size limiter with configurable limits
const createSizeLimiter = (maxSizeBytes, routeName = 'default') => (req, res, next) => {
  const contentLength = req.headers['content-length'];

  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    const sizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    const actualMB = (parseInt(contentLength) / (1024 * 1024)).toFixed(2);

    logger.warn('Request size limit exceeded', {
      route: routeName,
      limit: `${sizeMB}MB`,
      actual: `${actualMB}MB`,
      ip: req.ip,
      endpoint: req.originalUrl,
    });

    return res.status(413).json({
      error: `Requête trop volumineuse. Limite: ${sizeMB}MB`,
      code: 'REQUEST_TOO_LARGE',
      details: {
        maxSize: `${sizeMB}MB`,
        yourSize: `${actualMB}MB`,
      },
    });
  }

  next();
};

// Default request size limiter (10MB)
const requestSizeLimiter = createSizeLimiter(10 * 1024 * 1024, 'default');

// Small request limiter (1MB) for simple endpoints
const smallRequestLimiter = createSizeLimiter(1 * 1024 * 1024, 'small');

// Medium request limiter (5MB) for moderate data
const mediumRequestLimiter = createSizeLimiter(5 * 1024 * 1024, 'medium');

// Large request limiter (20MB) for file uploads
const largeRequestLimiter = createSizeLimiter(20 * 1024 * 1024, 'large');

// API key validation for external access
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (req.path.startsWith('/api/external/')) {
    if (!apiKey) {
      return res.status(401).json({
        error: 'Clé API requise',
        code: 'API_KEY_REQUIRED',
      });
    }

    // Validate API key format and existence
    if (!/^[a-zA-Z0-9]{32,}$/.test(apiKey)) {
      return res.status(401).json({
        error: 'Format de clé API invalide',
        code: 'INVALID_API_KEY_FORMAT',
      });
    }

    // TODO: Validate against database of valid API keys
    // For now, we'll just check format
  }

  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//g, // Path traversal
    /<script/gi, // Script injection
    /union.*select/gi, // SQL injection
    /exec\(/gi, // Code execution
    /eval\(/gi, // Code evaluation
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.warn('🚨 Suspicious request detected:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        pattern: pattern.toString(),
      });
      break;
    }
  }

  next();
};

// Environment-based security
const environmentSecurity = (req, res, next) => {
  // In production, require HTTPS
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }

  // Disable certain endpoints in production
  if (process.env.NODE_ENV === 'production' && req.path.startsWith('/debug/')) {
    return res.status(404).json({ error: 'Endpoint non disponible en production' });
  }

  next();
};

module.exports = {
  securityHeaders,
  sanitizeInput,
  noSQLInjectionProtection,
  fileUploadSecurity,
  requestSizeLimiter,
  smallRequestLimiter,
  mediumRequestLimiter,
  largeRequestLimiter,
  createSizeLimiter,
  validateApiKey,
  securityLogger,
  environmentSecurity,
};
