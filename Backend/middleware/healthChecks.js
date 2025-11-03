// Backend/middleware/healthChecks.js
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const axios = require('axios');

/**
 * Database health check
 */
const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();

    // Simple ping to check MongoDB connection
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
 * Gemini AI API health check
 */
const checkGeminiAPIHealth = async () => {
  try {
    const startTime = Date.now();
    const { GEMINI_API_KEY } = process.env;

    if (!GEMINI_API_KEY) {
      return {
        status: 'unhealthy',
        responseTime: null,
        error: 'Gemini API key not configured',
      };
    }

    // Simple test request to Gemini API
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await axios.get(testUrl, {
      timeout: 5000, // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    return {
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime,
      details: {
        statusCode: response.status,
        modelsAvailable: response.data?.models?.length || 0,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: null,
      error: error.message,
      details: {
        code: error.code,
        timeout: error.code === 'ECONNABORTED',
      },
    };
  }
};

/**
 * Stripe API health check
 */
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

    // Simple test by listing products (limited to 1)
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

/**
 * Firebase Admin health check
 */
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

    // Test Firebase Auth by creating a custom token (without actually using it)
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

/**
 * System resource health check
 */
const checkSystemHealth = () => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();

  // Check if memory usage is concerning (over 80% of heap limit)
  const heapLimit = memoryUsage.heapTotal;
  const { heapUsed } = memoryUsage;
  const memoryUsagePercentage = (heapUsed / heapLimit) * 100;

  const isMemoryHealthy = memoryUsagePercentage < 80;
  const isUptimeHealthy = uptime > 0; // Basic uptime check

  return {
    status: isMemoryHealthy && isUptimeHealthy ? 'healthy' : 'degraded',
    details: {
      memory: {
        heapUsed: Math.round(heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(heapLimit / 1024 / 1024), // MB
        usagePercentage: Math.round(memoryUsagePercentage),
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
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

/**
 * Comprehensive health check that runs all checks
 */
const runAllHealthChecks = async () => {
  const startTime = Date.now();

  console.log('🔍 Running health checks...');

  const [database, geminiAPI, stripe, firebase] = await Promise.allSettled([
    checkDatabaseHealth(),
    checkGeminiAPIHealth(),
    checkStripeHealth(),
    checkFirebaseHealth(),
  ]);

  const system = checkSystemHealth();

  const checks = {
    database: database.status === 'fulfilled' ? database.value : { status: 'unhealthy', error: database.reason?.message },
    geminiAPI: geminiAPI.status === 'fulfilled' ? geminiAPI.value : { status: 'unhealthy', error: geminiAPI.reason?.message },
    stripe: stripe.status === 'fulfilled' ? stripe.value : { status: 'unhealthy', error: stripe.reason?.message },
    firebase: firebase.status === 'fulfilled' ? firebase.value : { status: 'unhealthy', error: firebase.reason?.message },
    system,
  };

  // Determine overall health status
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
  checkGeminiAPIHealth,
  checkStripeHealth,
  checkFirebaseHealth,
  checkSystemHealth,
  runAllHealthChecks,
};
