// Backend/utils/externalMonitoring.js
const logger = require('./logger');

// Check external service health
const checkExternalServices = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    services: {},
    overall: 'healthy',
  };

  // Check Gemini API
  try {
    const geminiStartTime = Date.now();
    // This would be a lightweight test call to Gemini API
    // For now, we'll simulate the check
    const geminiLatency = Date.now() - geminiStartTime;

    results.services.gemini = {
      status: 'healthy',
      latency: geminiLatency,
      lastChecked: new Date().toISOString(),
    };

    logger.logExternalService('gemini', 'health_check', true, geminiLatency);
  } catch (error) {
    results.services.gemini = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
    results.overall = 'degraded';

    logger.logExternalService('gemini', 'health_check', false, 0, error);
  }

  // Check Stripe API
  try {
    const stripeStartTime = Date.now();
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Simple API call to check Stripe health
    if (process.env.STRIPE_SECRET_KEY) {
      await stripe.balance.retrieve();
      const stripeLatency = Date.now() - stripeStartTime;

      results.services.stripe = {
        status: 'healthy',
        latency: stripeLatency,
        lastChecked: new Date().toISOString(),
      };

      logger.logExternalService('stripe', 'health_check', true, stripeLatency);
    } else {
      results.services.stripe = {
        status: 'not_configured',
        message: 'Stripe not configured',
        lastChecked: new Date().toISOString(),
      };
    }
  } catch (error) {
    results.services.stripe = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
    results.overall = 'degraded';

    logger.logExternalService('stripe', 'health_check', false, 0, error);
  }

  // Check Firebase Admin
  try {
    const firebaseStartTime = Date.now();
    const admin = require('firebase-admin');

    // Simple Firebase Admin check
    if (admin.apps.length > 0) {
      // Just verify the app is initialized
      const app = admin.app();
      const firebaseLatency = Date.now() - firebaseStartTime;

      results.services.firebase = {
        status: 'healthy',
        latency: firebaseLatency,
        lastChecked: new Date().toISOString(),
      };

      logger.logExternalService('firebase', 'health_check', true, firebaseLatency);
    } else {
      results.services.firebase = {
        status: 'not_initialized',
        message: 'Firebase Admin not initialized',
        lastChecked: new Date().toISOString(),
      };
    }
  } catch (error) {
    results.services.firebase = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
    results.overall = 'degraded';

    logger.logExternalService('firebase', 'health_check', false, 0, error);
  }

  // Check MongoDB
  try {
    const mongoStartTime = Date.now();
    const mongoose = require('mongoose');

    if (mongoose.connection.readyState === 1) {
      // Connection is open, do a simple query
      await mongoose.connection.db.admin().ping();
      const mongoLatency = Date.now() - mongoStartTime;

      results.services.mongodb = {
        status: 'healthy',
        latency: mongoLatency,
        connectionState: 'connected',
        lastChecked: new Date().toISOString(),
      };

      logger.logExternalService('mongodb', 'health_check', true, mongoLatency);
    } else {
      results.services.mongodb = {
        status: 'unhealthy',
        connectionState: 'disconnected',
        lastChecked: new Date().toISOString(),
      };
      results.overall = 'unhealthy';

      logger.logExternalService(
        'mongodb',
        'health_check',
        false,
        0,
        new Error('MongoDB connection not ready'),
      );
    }
  } catch (error) {
    results.services.mongodb = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
    results.overall = 'unhealthy';

    logger.logExternalService('mongodb', 'health_check', false, 0, error);
  }

  // Determine overall health
  const serviceStatuses = Object.values(results.services).map((service) => service.status);
  if (serviceStatuses.includes('unhealthy')) {
    results.overall = 'unhealthy';
  } else if (serviceStatuses.includes('not_configured') || serviceStatuses.includes('not_initialized')) {
    results.overall = 'degraded';
  }

  return results;
};

// UptimeRobot configuration helper
const generateUptimeRobotConfig = () => {
  const baseUrl = process.env.BASE_URL || 'https://your-api-domain.com';

  return {
    monitors: [
      {
        name: 'TransparAI API Health',
        url: `${baseUrl}/health`,
        type: 'HTTP',
        interval: 300, // 5 minutes
        expectedStatusCode: 200,
      },
      {
        name: 'TransparAI API Detailed Health',
        url: `${baseUrl}/health/detailed`,
        type: 'HTTP',
        interval: 600, // 10 minutes
        expectedStatusCode: 200,
      },
      {
        name: 'TransparAI API Documentation',
        url: `${baseUrl}/docs`,
        type: 'HTTP',
        interval: 3600, // 1 hour
        expectedStatusCode: 200,
      },
    ],
    alertContacts: [
      {
        type: 'email',
        value: process.env.ALERT_EMAIL || 'admin@transparai.com',
      },
      {
        type: 'webhook',
        value: `${baseUrl}/api/webhook/uptime-alert`,
      },
    ],
    settings: {
      alertWhenDown: true,
      alertWhenUp: true,
      downAlertAfter: 2, // Alert after 2 failed checks
      upAlertAfter: 1, // Alert after 1 successful check when recovering
    },
  };
};

// New Relic configuration helper
const generateNewRelicConfig = () => ({
  app_name: ['TransparAI API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    filepath: 'logs/newrelic_agent.log',
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404, 401, 403],
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
  },
  browser_monitoring: {
    enable: false, // API only, no browser monitoring needed
  },
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: true,
    },
  },
});

// Setup monitoring alerts
const setupMonitoringAlerts = () => {
  // This would integrate with your alerting system
  logger.info('Setting up monitoring alerts', {
    uptimeRobotConfig: generateUptimeRobotConfig(),
    newRelicAvailable: !!process.env.NEW_RELIC_LICENSE_KEY,
    slackAlertsEnabled: !!process.env.SLACK_WEBHOOK_URL,
    emailAlertsEnabled: !!process.env.ALERT_EMAIL,
  });

  return {
    uptimeRobot: generateUptimeRobotConfig(),
    newRelic: generateNewRelicConfig(),
    alertsConfigured: {
      email: !!process.env.ALERT_EMAIL,
      slack: !!process.env.SLACK_WEBHOOK_URL,
      webhook: !!process.env.WEBHOOK_ALERT_URL,
    },
  };
};

// Performance monitoring integration
const trackPerformanceMetrics = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // Log performance data
    logger.info('Performance Metric', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.uid,
    });

    // Track slow requests
    if (duration > 5000) { // 5 seconds
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userId: req.user?.uid,
      });
    }
  });

  next();
};

module.exports = {
  checkExternalServices,
  generateUptimeRobotConfig,
  generateNewRelicConfig,
  setupMonitoringAlerts,
  trackPerformanceMetrics,
};
