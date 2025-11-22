// Backend/config/newrelic.js
// New Relic configuration for TransparAI

/**
 * New Relic configuration object
 * This is loaded by the New Relic agent
 */
exports.config = {
  /**
   * Array of application names
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'TransparAI API'],

  /**
   * Your New Relic license key
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  /**
   * Logging configuration
   */
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when
     * diagnosing issues with the agent, 'info' and higher will impose the
     * least overhead on production applications.
     */
    level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',

    /**
     * Where to put the log file -- by default just logs to stdout
     */
    filepath: process.env.NEW_RELIC_LOG_FILE || 'stdout',
  },

  /**
   * Whether the agent captures attributes or not
   */
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.x-api-key',
      'response.headers.set-cookie*',
    ],
  },

  /**
   * Browser monitoring configuration
   */
  browser_monitoring: {
    enable: process.env.NEW_RELIC_BROWSER_MONITORING === 'true',
  },

  /**
   * Application performance monitoring
   */
  application_logging: {
    forwarding: {
      enabled: process.env.NODE_ENV === 'production',
      max_samples_stored: 10000,
    },
  },

  /**
   * Distributed tracing configuration
   */
  distributed_tracing: {
    enabled: true,
  },

  /**
   * Error collection configuration
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
    attributes: {
      exclude: [
        'request.headers.cookie',
        'request.headers.authorization',
      ],
    },
  },

  /**
   * Transaction tracer configuration
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    attributes: {
      exclude: [
        'request.headers.cookie',
        'request.headers.authorization',
      ],
    },
  },

  /**
   * Slow SQL configuration
   */
  slow_sql: {
    enabled: true,
    max_samples: 10,
  },

  /**
   * Rules for naming or ignoring transactions
   */
  rules: {
    name: [
      // Health checks
      { pattern: '/health*', name: '/health' },
      { pattern: '/api/health*', name: '/api/health' },

      // Group API endpoints
      { pattern: '/api/analyze*', name: '/api/analyze' },
      { pattern: '/api/dashboard*', name: '/api/dashboard' },
      { pattern: '/api/user*', name: '/api/user' },
      { pattern: '/api/stripe*', name: '/api/stripe' },
    ],
    ignore: [
      // Ignore health check endpoints for cleaner metrics
      '^/health$',
      '^/ping$',
    ],
  },

  /**
   * Custom instrumentation
   */
  custom_insights_events: {
    enabled: true,
    max_samples_stored: 30000,
  },

  /**
   * Security configuration
   */
  security: {
    agent: {
      enabled: false, // Disable security agent for now
    },
  },

  /**
   * High security mode (for sensitive environments)
   */
  high_security: process.env.NEW_RELIC_HIGH_SECURITY === 'true',
};

/**
 * Initialize New Relic if license key is provided
 */
const initNewRelic = () => {
  if (!process.env.NEW_RELIC_LICENSE_KEY
      || process.env.NEW_RELIC_LICENSE_KEY.startsWith('your_')) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  New Relic license key not configured for production');
    } else {
      console.log('ℹ️  New Relic monitoring disabled (no license key)');
    }
    return null;
  }

  try {
    // New Relic must be loaded before any other modules
    const newrelic = require('newrelic');

    console.log('✅ New Relic monitoring initialized');
    console.log(`   App name: ${exports.config.app_name[0]}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);

    return newrelic;
  } catch (error) {
    console.error('❌ Failed to initialize New Relic:', error.message);
    return null;
  }
};

module.exports = {
  initNewRelic,
  config: exports.config,
};
