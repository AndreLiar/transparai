// Backend/middleware/envValidation.js
const logger = require('../utils/logger');

/**
 * Environment variable validation middleware
 * Validates all required environment variables on application startup
 */
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'FIREBASE_SERVICE_ACCOUNT_JSON',
    'FRONTEND_URL',
    'GEMINI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'LOG_LEVEL',
  ];

  const conditionalVars = {
    // Email alert configuration
    email: {
      condition: process.env.ALERT_EMAIL_ENABLED === 'true',
      vars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'ALERT_EMAIL_TO'],
    },
    // Slack alert configuration
    slack: {
      condition: process.env.ALERT_SLACK_ENABLED === 'true',
      vars: ['SLACK_BOT_TOKEN', 'SLACK_ALERT_CHANNEL', 'SLACK_WEBHOOK_URL'],
    },
    // OpenAI configuration (optional for premium features)
    openai: {
      condition: process.env.OPENAI_ENABLED !== 'false',
      vars: ['OPENAI_API_KEY'],
      optional: true,
    },
    // New Relic monitoring (optional)
    newrelic: {
      condition: process.env.NEW_RELIC_LICENSE_KEY && process.env.NEW_RELIC_LICENSE_KEY !== 'your_new_relic_license_key',
      vars: ['NEW_RELIC_LICENSE_KEY', 'NEW_RELIC_APP_NAME'],
      optional: true,
    },
  };

  const missingVars = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Check conditional variables
  Object.entries(conditionalVars).forEach(([service, config]) => {
    if (config.condition) {
      config.vars.forEach((varName) => {
        if (!process.env[varName] || process.env[varName].startsWith('your_')) {
          if (config.optional) {
            warnings.push(`${service.toUpperCase()}: ${varName} not configured (optional)`);
          } else {
            missingVars.push(`${varName} (required for ${service})`);
          }
        }
      });
    }
  });

  // Validate Firebase service account JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
      const missingFields = requiredFields.filter((field) => !serviceAccount[field]);

      if (missingFields.length > 0) {
        missingVars.push(`FIREBASE_SERVICE_ACCOUNT_JSON missing fields: ${missingFields.join(', ')}`);
      }
    } catch (error) {
      missingVars.push('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
    }
  }

  // Validate database URI format
  if (process.env.MONGO_URI) {
    if (!process.env.MONGO_URI.startsWith('mongodb://') && !process.env.MONGO_URI.startsWith('mongodb+srv://')) {
      missingVars.push('MONGO_URI must start with mongodb:// or mongodb+srv://');
    }
  }

  // Validate SMTP configuration if email alerts are enabled
  if (process.env.ALERT_EMAIL_ENABLED === 'true') {
    const smtpPort = process.env.SMTP_PORT;
    if (smtpPort && (isNaN(smtpPort) || parseInt(smtpPort) <= 0)) {
      missingVars.push('SMTP_PORT must be a valid positive number');
    }

    const smtpSecure = process.env.SMTP_SECURE;
    if (smtpSecure && !['true', 'false'].includes(smtpSecure.toLowerCase())) {
      missingVars.push('SMTP_SECURE must be "true" or "false"');
    }
  }

  // Check for default/placeholder values
  const defaultValues = [
    { key: 'JWT_SECRET', check: (val) => !val || val.length < 32 },
    { key: 'SESSION_SECRET', check: (val) => !val || val.length < 32 },
    { key: 'ENCRYPTION_KEY', check: (val) => !val || val.length < 32 },
  ];

  defaultValues.forEach(({ key, check }) => {
    if (check(process.env[key])) {
      warnings.push(`${key} appears to be weak or not set (should be 32+ characters)`);
    }
  });

  // Report results
  if (missingVars.length > 0) {
    logger.error('Environment validation failed - missing required variables:', {
      missingVariables: missingVars,
      nodeEnv: process.env.NODE_ENV,
    });

    console.error('\n🚨 ENVIRONMENT VALIDATION FAILED');
    console.error('Missing required environment variables:');
    missingVars.forEach((varName) => console.error(`  ❌ ${varName}`));
    console.error('\nApplication cannot start safely. Please check your .env file.\n');

    process.exit(1);
  }

  // Report warnings
  if (warnings.length > 0) {
    logger.warn('Environment validation warnings:', { warnings });

    console.warn('\n⚠️  ENVIRONMENT VALIDATION WARNINGS');
    warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`));
    console.warn('');
  }

  // Success
  const configuredFeatures = [];
  if (process.env.ALERT_EMAIL_ENABLED === 'true') configuredFeatures.push('Email Alerts');
  if (process.env.ALERT_SLACK_ENABLED === 'true') configuredFeatures.push('Slack Alerts');
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('your_')) configuredFeatures.push('OpenAI');
  if (process.env.NEW_RELIC_LICENSE_KEY && !process.env.NEW_RELIC_LICENSE_KEY.startsWith('your_')) configuredFeatures.push('New Relic');

  logger.info('Environment validation passed', {
    nodeEnv: process.env.NODE_ENV,
    configuredFeatures,
    totalVariables: Object.keys(process.env).length,
  });

  console.log('✅ Environment validation passed');
  if (configuredFeatures.length > 0) {
    console.log(`   Configured features: ${configuredFeatures.join(', ')}`);
  }
};

/**
 * Middleware to check environment on each request (development only)
 */
const runtimeEnvCheck = (req, res, next) => {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  // Check for critical missing variables during runtime
  const criticalVars = ['MONGO_URI', 'FIREBASE_SERVICE_ACCOUNT_JSON'];
  const missing = criticalVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    logger.error('Runtime environment check failed', { missingVariables: missing });
    return res.status(503).json({
      error: 'Server configuration error',
      code: 'ENV_CONFIG_ERROR',
      message: 'Critical environment variables are missing',
    });
  }

  next();
};

module.exports = {
  validateEnvironmentVariables,
  runtimeEnvCheck,
};
