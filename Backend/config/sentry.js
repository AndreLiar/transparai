// Backend/config/sentry.js
const Sentry = require('@sentry/node');
const { CaptureConsole } = require('@sentry/integrations');
const logger = require('../utils/logger');

/**
 * Initialize Sentry for error monitoring and performance tracking
 */
const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn || dsn.startsWith('your_')) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Sentry DSN not configured for production environment');
    } else {
      logger.info('Sentry DSN not configured - error monitoring disabled');
    }
    return null;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || '1.0.0',

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Session tracking
      autoSessionTracking: true,

      // Integrations
      integrations: [
        // Capture console.log, console.error etc
        new CaptureConsole({
          levels: ['error', 'warn'],
        }),

        // HTTP integration for Express
        new Sentry.Integrations.Http({ tracing: true }),

        // Express integration
        new Sentry.Integrations.Express({ app }),

        // MongoDB integration if available
        ...(process.env.MONGO_URI ? [new Sentry.Integrations.Mongo()] : []),
      ],

      // Filter out sensitive data
      beforeSend: (event, hint) => {
        // Remove sensitive headers
        if (event.request && event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }

        // Remove sensitive data from extra context
        if (event.extra) {
          const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
          Object.keys(event.extra).forEach((key) => {
            if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
              event.extra[key] = '[Filtered]';
            }
          });
        }

        // Filter out health check requests from performance monitoring
        if (event.request && event.request.url) {
          const url = event.request.url.toLowerCase();
          if (url.includes('/health') || url.includes('/ping')) {
            return null; // Don't send health check errors
          }
        }

        return event;
      },

      // Capture unhandled promise rejections
      captureUnhandledRejections: true,

      // Custom fingerprinting for better error grouping
      beforeBreadcrumb: (breadcrumb) => {
        // Filter out noisy breadcrumbs
        if (breadcrumb.category === 'http' && breadcrumb.data) {
          const url = breadcrumb.data.url;
          if (url && (url.includes('/health') || url.includes('/ping'))) {
            return null;
          }
        }
        return breadcrumb;
      },
    });

    logger.info('Sentry initialized successfully', {
      environment: process.env.NODE_ENV,
      release: process.env.APP_VERSION,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });

    return Sentry;
  } catch (error) {
    logger.error('Failed to initialize Sentry', { error: error.message });
    return null;
  }
};

/**
 * Sentry request handler middleware (must be first)
 */
const requestHandler = () => Sentry.Handlers.requestHandler({
  ip: false, // Don't capture IP addresses
  request: ['method', 'url', 'headers.user-agent'],
  serverName: process.env.SERVER_NAME || 'transparai-api',
});

/**
 * Sentry tracing handler middleware
 */
const tracingHandler = () => Sentry.Handlers.tracingHandler();

/**
 * Sentry error handler middleware (must be after routes)
 */
const errorHandler = () => Sentry.Handlers.errorHandler({
  shouldHandleError: (error) => {
    // Only send 4xx and 5xx errors to Sentry
    if (error.status) {
      return error.status >= 400;
    }
    return true;
  },
});

/**
 * Custom error capture with additional context
 */
const captureError = (error, req = null, additionalContext = {}) => {
  Sentry.withScope((scope) => {
    // Add user context if available
    if (req && req.user) {
      scope.setUser({
        id: req.user.uid,
        email: req.user.email,
      });
    }

    // Add request context
    if (req) {
      scope.setContext('request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    }

    // Add additional context
    Object.keys(additionalContext).forEach((key) => {
      scope.setContext(key, additionalContext[key]);
    });

    // Set appropriate level based on error type
    if (error.status && error.status < 500) {
      scope.setLevel('warning');
    } else {
      scope.setLevel('error');
    }

    Sentry.captureException(error);
  });
};

/**
 * Capture custom message with context
 */
const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureMessage(message);
  });
};

/**
 * Add performance transaction
 */
const startTransaction = (name, op = 'http') => Sentry.startTransaction({
  name,
  op,
});

/**
 * Set user context for current scope
 */
const setUserContext = (user) => {
  Sentry.setUser({
    id: user.uid || user.id,
    email: user.email,
    plan: user.plan,
  });
};

/**
 * Test Sentry configuration
 */
const testSentry = () => {
  if (!Sentry.getCurrentHub().getClient()) {
    throw new Error('Sentry is not initialized');
  }

  Sentry.captureMessage('Sentry test message', 'info');
  logger.info('Sentry test message sent');
  return true;
};

module.exports = {
  initSentry,
  requestHandler,
  tracingHandler,
  errorHandler,
  captureError,
  captureMessage,
  startTransaction,
  setUserContext,
  testSentry,
  Sentry,
};
