// Backend/middleware/errorTracker.js
const { v4: uuidv4 } = require('uuid');
const ErrorLog = require('../models/ErrorLog');

const sanitizeRequest = (req) => {
  const sanitized = {
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.uid || req.user?.id,
    params: req.params,
    query: req.query,
  };

  // Sanitize body - remove sensitive data
  if (req.body && typeof req.body === 'object') {
    const body = { ...req.body };
    // Remove sensitive fields
    ['password', 'token', 'secret', 'key', 'authorization'].forEach((field) => {
      if (body[field]) {
        body[field] = '[REDACTED]';
      }
    });
    sanitized.body = body;
  }

  return sanitized;
};

const errorTracker = async (err, req, res, next) => {
  const errorId = uuidv4();
  const timestamp = new Date();

  // Calculate response duration if available
  const duration = req.startTime ? Date.now() - req.startTime : null;

  // Determine if this is a client error (4xx) or server error (5xx)
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;

  try {
    // Create error log entry
    const errorLogData = {
      errorId,
      timestamp,
      level: isServerError ? 'error' : 'warn',
      message: err.message || 'Unknown error',
      stack: err.stack,
      request: sanitizeRequest(req),
      response: {
        statusCode,
        duration,
      },
      metadata: {
        name: err.name,
        code: err.code,
        isOperational: err.isOperational || false,
        severity: isServerError ? 'high' : 'medium',
      },
      tags: [
        statusCode >= 500 ? 'server-error' : 'client-error',
        req.route?.path ? `route:${req.route.path}` : 'unknown-route',
        req.method?.toLowerCase(),
      ],
    };

    // Save to database (don't await to avoid blocking response)
    ErrorLog.create(errorLogData).catch((dbErr) => {
      console.error('Failed to save error log to database:', dbErr);
    });

    // Add error ID to response headers for tracking
    res.set('X-Error-ID', errorId);

    // Log to console for immediate visibility
    console.error(`[ERROR ${errorId}] ${err.message}`, {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.uid,
      statusCode,
      duration: duration ? `${duration}ms` : 'unknown',
      stack: err.stack,
    });
  } catch (trackingError) {
    console.error('Error tracking failed:', trackingError);
  }

  // Continue with error handling
  next(err);
};

// Middleware to add start time for duration calculation
const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong!';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = {
  errorTracker,
  requestTimer,
  globalErrorHandler,
};
