// Backend/config/appInsights.js
//
// Azure Application Insights initialisation.
// MUST be required FIRST in index.js — before any other module —
// so the SDK can auto-instrument Express, Mongoose, and outbound HTTP calls.
//
// What this gives you (replaces Sentry + New Relic):
//   - Full request/response telemetry (latency, status codes, throughput)
//   - Exception tracking with stack traces and request context
//   - Dependency tracking: Cosmos DB queries, Voyage AI calls, Stripe HTTP calls
//   - Live Metrics stream (real-time in Azure Portal)
//   - Smart Detection — alerts on anomalous error rates automatically
//   - Distributed tracing across all Azure services
//   - User/session context via setAuthenticatedUserContext()
//
// Cost: 1 GB/day ingestion free, ~$2.30/GB after that.
// Connection string is injected by Terraform via App Service app_settings.

const logger = require('../utils/logger');

let client = null;

const initAppInsights = () => {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString || connectionString.startsWith('InstrumentationKey=your')) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Azure Application Insights not configured for production — set APPLICATIONINSIGHTS_CONNECTION_STRING');
    } else {
      logger.info('Application Insights disabled (no connection string) — add APPLICATIONINSIGHTS_CONNECTION_STRING to enable');
    }
    return null;
  }

  try {
    // Must be required here (not at top of file) so it instruments after env is loaded
    const appInsights = require('applicationinsights');

    appInsights
      .setup(connectionString)
      // Auto-collect all telemetry types
      .setAutoCollectRequests(true) // HTTP request tracking
      .setAutoCollectPerformance(true, true) // CPU, memory, gc
      .setAutoCollectExceptions(true) // Uncaught exceptions + rejections
      .setAutoCollectDependencies(true) // MongoDB, HTTP, Redis calls
      .setAutoCollectConsole(true, true) // console.log → traces
      .setAutoCollectHeartbeat(true) // Instance heartbeat
      .setSendLiveMetrics(true) // Live Metrics stream in portal
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    client = appInsights.defaultClient;

    // ── Cloud role name — shows in Application Map ────────────────────────────
    client.context.tags[client.context.keys.cloudRole] = 'transparai-api';
    client.context.tags[client.context.keys.cloudRoleInstance] = process.env.WEBSITE_INSTANCE_ID || 'local';

    // ── Filter out noisy telemetry ─────────────────────────────────────────────
    client.addTelemetryProcessor((envelope) => {
      const url = envelope.data?.baseData?.url || envelope.data?.baseData?.name || '';

      // Drop health check pings from telemetry (they add noise, not signal)
      if (url.includes('/health') || url.includes('/ping')) {
        return false;
      }

      // Scrub Authorization headers before sending
      const props = envelope.data?.baseData?.properties;
      if (props) {
        delete props.authorization;
        delete props['x-api-key'];
      }

      return true;
    });

    logger.info('Azure Application Insights initialised', {
      labels: { cloudRole: 'transparai-api' },
    });

    return client;
  } catch (error) {
    logger.error('Failed to initialise Application Insights', {
      error: { message: error.message, stack: error.stack },
    });
    return null;
  }
};

/**
 * Track a custom event (e.g. "AnalysisCompleted", "PlanUpgraded").
 * No-ops gracefully if App Insights is not initialised.
 */
const trackEvent = (name, properties = {}) => {
  if (!client) return;
  client.trackEvent({ name, properties });
};

/**
 * Track an exception with optional request context.
 * Use this in catch blocks for expected errors (App Insights auto-tracks uncaught ones).
 */
const trackException = (error, properties = {}) => {
  if (!client) return;
  client.trackException({ exception: error, properties });
};

/**
 * Set the authenticated user context on the current request.
 * Call this in authMiddleware after verifying the Firebase token.
 */
const setUserContext = (userId) => {
  if (!client) return;
  client.context.tags[client.context.keys.userId] = userId;
};

/**
 * Track a custom metric (e.g. AI token usage, analysis score).
 */
const trackMetric = (name, value, properties = {}) => {
  if (!client) return;
  client.trackMetric({ name, value, properties });
};

module.exports = {
  initAppInsights,
  trackEvent,
  trackException,
  trackMetric,
  setUserContext,
  getClient: () => client,
};
