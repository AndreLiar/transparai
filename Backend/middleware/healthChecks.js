// Backend/middleware/healthChecks.js
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const axios = require('axios');

const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();

    await mongoose.connection.db.admin().ping();

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      details: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      error: error.message,
      details: {
        readyState: mongoose.connection.readyState,
      },
    };
  }
};

/**
 * OpenAI API reachability (models list — lightweight, no document sent).
 */
const checkOpenAIHealth = async () => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        status: 'unhealthy',
        responseTime: null,
        error: 'OpenAI not configured (OPENAI_API_KEY missing)',
      };
    }

    const baseURL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const startTime = Date.now();
    const response = await axios.get(`${baseURL}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: { limit: 1 },
      timeout: 5000,
    });

    const responseTime = Date.now() - startTime;
    return {
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime,
      details: { statusCode: response.status },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      error: error.message,
      details: { code: error.code, timeout: error.code === 'ECONNABORTED' },
    };
  }
};

const checkStripeHealth = async () => {
  try {
    const startTime = Date.now();
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        status: 'unhealthy',
        responseTime: null,
        error: 'Stripe secret key not configured',
      };
    }

    await stripe.products.list({ limit: 1 });

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      details: {
        environment: process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live',
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      error: error.message,
      details: {
        type: error.type || 'unknown',
        code: error.code || 'unknown',
      },
    };
  }
};

const checkFirebaseHealth = async () => {
  try {
    const startTime = Date.now();

    if (!admin.apps.length) {
      return {
        status: 'unhealthy',
        responseTime: null,
        error: 'Firebase Admin not initialized',
      };
    }

    const testUid = 'health-check-test-uid';
    await admin.auth().createCustomToken(testUid);

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      details: {
        projectId: admin.app().options.projectId,
        initialized: true,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      error: error.message,
      details: {
        code: error.code || 'unknown',
      },
    };
  }
};

const checkSystemHealth = () => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();

  const heapLimit = memoryUsage.heapTotal;
  const { heapUsed } = memoryUsage;
  const memoryUsagePercentage = (heapUsed / heapLimit) * 100;

  const isMemoryHealthy = memoryUsagePercentage < 80;
  const isUptimeHealthy = uptime > 0;

  return {
    status: isMemoryHealthy && isUptimeHealthy ? 'healthy' : 'degraded',
    details: {
      memory: {
        heapUsed: Math.round(heapUsed / 1024 / 1024),
        heapTotal: Math.round(heapLimit / 1024 / 1024),
        usagePercentage: Math.round(memoryUsagePercentage),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: Math.round(uptime),
      nodeVersion: process.version,
      platform: process.platform,
    },
  };
};

const { getCircuitStatus } = require('../orchestrator/resilience');

const runAllHealthChecks = async () => {
  const startTime = Date.now();

  console.log('🔍 Running health checks...');

  const [database, openai, stripe, firebase] = await Promise.allSettled([
    checkDatabaseHealth(),
    checkOpenAIHealth(),
    checkStripeHealth(),
    checkFirebaseHealth(),
  ]);

  const system = checkSystemHealth();

  const circuitBreakers = getCircuitStatus();
  const anyCircuitOpen = Object.values(circuitBreakers).some((cb) => cb.state === 'OPEN');

  const checks = {
    database: database.status === 'fulfilled' ? database.value : { status: 'unhealthy', error: database.reason?.message },
    openai: openai.status === 'fulfilled' ? openai.value : { status: 'unhealthy', error: openai.reason?.message },
    stripe: stripe.status === 'fulfilled' ? stripe.value : { status: 'unhealthy', error: stripe.reason?.message },
    firebase: firebase.status === 'fulfilled' ? firebase.value : { status: 'unhealthy', error: firebase.reason?.message },
    system,
    aiCircuitBreakers: {
      status: anyCircuitOpen ? 'degraded' : 'healthy',
      models: circuitBreakers,
    },
  };

  const healthyChecks = Object.values(checks).filter((check) => check.status === 'healthy').length;
  const totalChecks = Object.keys(checks).length;
  const degradedChecks = Object.values(checks).filter((check) => check.status === 'degraded').length;

  let overallStatus = 'healthy';
  if (healthyChecks < totalChecks && degradedChecks === 0) {
    overallStatus = 'unhealthy';
  } else if (degradedChecks > 0 || healthyChecks < totalChecks) {
    overallStatus = 'degraded';
  }

  const totalResponseTime = Date.now() - startTime;

  console.log(`✅ Health checks completed in ${totalResponseTime}ms - Status: ${overallStatus}`);

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    checks,
    summary: {
      total: totalChecks,
      healthy: healthyChecks,
      degraded: degradedChecks,
      unhealthy: totalChecks - healthyChecks - degradedChecks,
      responseTime: totalResponseTime,
    },
  };
};

module.exports = {
  checkDatabaseHealth,
  checkOpenAIHealth,
  checkStripeHealth,
  checkFirebaseHealth,
  checkSystemHealth,
  runAllHealthChecks,
};
