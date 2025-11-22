// Backend/config/environment.js
require('dotenv').config();

// Environment validation
const requiredEnvVars = [
  'FIREBASE_SERVICE_ACCOUNT_JSON',
  'GEMINI_API_KEY',
  'MONGO_URI',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

// Check for required environment variables
const missingVars = requiredEnvVars.filter((varName) => {
  const value = process.env[varName];
  return !value || value.includes('[SECURE_') || value === '';
});

if (missingVars.length > 0) {
  console.error('🚨 SECURITY ERROR: Missing or placeholder environment variables:');
  missingVars.forEach((varName) => {
    console.error(`   ❌ ${varName}`);
  });
  console.error('\n📋 Required actions:');
  console.error('   1. Set real values for all [SECURE_*] placeholders');
  console.error('   2. Rotate all compromised credentials');
  console.error('   3. Use proper environment variable management');

  if (process.env.NODE_ENV === 'production') {
    console.error('\n🛑 STOPPING: Cannot start in production with placeholder values');
    process.exit(1);
  } else {
    console.warn('\n⚠️  WARNING: Development mode with placeholder values');
  }
}

// Secure environment configuration
const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5001,

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,

  // Database
  MONGO_URI: process.env.MONGO_URI,

  // External APIs
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_STANDARD: process.env.STRIPE_PRICE_STANDARD,
  STRIPE_PRICE_PREMIUM: process.env.STRIPE_PRICE_PREMIUM,
  STRIPE_PRICE_ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,

  // Security
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'dev-encryption-key-change-in-production',

  // Security settings
  WHITELIST_IPS: process.env.WHITELIST_IPS?.split(',') || [],
  MAX_REQUEST_SIZE: '10mb',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),

  // Feature flags
  FEATURES: {
    DEBUG_MODE: process.env.NODE_ENV !== 'production',
    RATE_LIMITING: process.env.DISABLE_RATE_LIMITING !== 'true',
    SECURITY_HEADERS: process.env.DISABLE_SECURITY_HEADERS !== 'true',
    REQUEST_LOGGING: process.env.DISABLE_REQUEST_LOGGING !== 'true',
  },
};

// Validate critical configurations
if (config.NODE_ENV === 'production') {
  // Production-specific validations
  if (config.SESSION_SECRET.includes('dev-')) {
    throw new Error('🚨 SECURITY: Production secrets must not contain dev- prefix');
  }

  if (!config.FRONTEND_URL.startsWith('https://')) {
    console.warn('⚠️  WARNING: Production frontend URL should use HTTPS');
  }
}

// Log configuration (safely, without secrets)
const safeConfig = {
  NODE_ENV: config.NODE_ENV,
  PORT: config.PORT,
  FRONTEND_URL: config.FRONTEND_URL,
  FEATURES: config.FEATURES,
  LOG_LEVEL: config.LOG_LEVEL,
};

console.log('🔧 Environment configuration loaded:', safeConfig);

module.exports = config;
