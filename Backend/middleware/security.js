// Backend/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters from all string inputs
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
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

  if (containsDangerousOperators(req.body) || 
      containsDangerousOperators(req.query) || 
      containsDangerousOperators(req.params)) {
    return res.status(400).json({
      error: 'Requête non autorisée',
      code: 'INVALID_REQUEST'
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
      'text/plain'
    ];

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Type de fichier non autorisé',
          allowedTypes,
          code: 'INVALID_FILE_TYPE'
        });
      }

      // Check file size (10MB max)
      if (file && file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Fichier trop volumineux (maximum 10MB)',
          code: 'FILE_TOO_LARGE'
        });
      }
    }
  }

  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      error: 'Requête trop volumineuse',
      maxSize: '10MB',
      code: 'REQUEST_TOO_LARGE'
    });
  }

  next();
};

// API key validation for external access
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (req.path.startsWith('/api/external/')) {
    if (!apiKey) {
      return res.status(401).json({
        error: 'Clé API requise',
        code: 'API_KEY_REQUIRED'
      });
    }

    // Validate API key format and existence
    if (!/^[a-zA-Z0-9]{32,}$/.test(apiKey)) {
      return res.status(401).json({
        error: 'Format de clé API invalide',
        code: 'INVALID_API_KEY_FORMAT'
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
    params: req.params
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.warn('🚨 Suspicious request detected:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        pattern: pattern.toString()
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
  validateApiKey,
  securityLogger,
  environmentSecurity
};