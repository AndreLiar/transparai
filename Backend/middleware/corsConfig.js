// Backend/middleware/corsConfig.js
const logger = require('../utils/logger');

// Exact whitelist of allowed origins
const ALLOWED_ORIGINS = {
  production: [
    'https://transparai.vercel.app',
    'https://transparai-bpr4eqsyt-andreliars-projects.vercel.app',
    // Add more production URLs as needed
  ],
  development: [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:3000',
  ],
};

// Trusted Vercel preview deployment pattern
const VERCEL_PREVIEW_PATTERN = /^https:\/\/transparai-[a-z0-9]+-andreliars-projects\.vercel\.app$/;

/**
 * Validate if origin is from a trusted Vercel preview deployment
 */
const isValidVercelPreview = (origin) => VERCEL_PREVIEW_PATTERN.test(origin);

/**
 * Enhanced CORS origin validation with logging
 */
const corsOriginValidator = (origin, callback) => {
  // Allow requests with no origin (mobile apps, Postman, server-to-server)
  if (!origin) {
    logger.debug('CORS: No origin header - allowing request');
    return callback(null, true);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Get allowed origins for current environment
  const allowedOrigins = isProduction
    ? ALLOWED_ORIGINS.production
    : [...ALLOWED_ORIGINS.production, ...ALLOWED_ORIGINS.development];

  // Check exact match against whitelist
  if (allowedOrigins.includes(origin)) {
    logger.debug('CORS: Origin allowed (exact match)', { origin });
    return callback(null, true);
  }

  // In production, reject HTTP origins immediately
  if (isProduction && !origin.startsWith('https://')) {
    logger.warn('CORS: Rejected HTTP origin in production', {
      origin,
      reason: 'HTTP_NOT_ALLOWED_IN_PRODUCTION',
    });
    return callback(new Error('HTTP origins not allowed in production'));
  }

  // Allow Vercel preview deployments only in non-production
  if (!isProduction && isValidVercelPreview(origin)) {
    logger.info('CORS: Preview deployment allowed', {
      origin,
      reason: 'VERCEL_PREVIEW',
    });
    return callback(null, true);
  }

  // Reject all other origins
  logger.warn('CORS: Origin rejected', {
    origin,
    isProduction,
    reason: 'NOT_WHITELISTED',
  });

  callback(new Error('Origin not allowed by CORS'));
};

/**
 * CORS configuration object
 */
const corsOptions = {
  origin: corsOriginValidator,
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
};

/**
 * Get list of allowed origins for documentation/debugging
 */
const getAllowedOrigins = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    production: ALLOWED_ORIGINS.production,
    development: isProduction ? [] : ALLOWED_ORIGINS.development,
    previewPattern: isProduction ? 'Disabled' : VERCEL_PREVIEW_PATTERN.toString(),
  };
};

/**
 * Add a new allowed origin (use sparingly, prefer environment config)
 */
const addAllowedOrigin = (origin, environment = 'production') => {
  if (!ALLOWED_ORIGINS[environment]) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  if (!ALLOWED_ORIGINS[environment].includes(origin)) {
    ALLOWED_ORIGINS[environment].push(origin);
    logger.info('CORS: Added new allowed origin', { origin, environment });
  }
};

module.exports = {
  corsOptions,
  getAllowedOrigins,
  addAllowedOrigin,
  isValidVercelPreview,
  ALLOWED_ORIGINS,
};
