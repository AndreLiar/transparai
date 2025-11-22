#!/usr/bin/env node
// Backend/scripts/test-newrelic.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { initNewRelic } = require('../config/newrelic');
const logger = require('../utils/logger');

/**
 * Test New Relic configuration
 */
async function testNewRelic() {
  console.log('🔍 Testing New Relic Configuration...\n');

  try {
    // Check environment variables
    const licenseKey = process.env.NEW_RELIC_LICENSE_KEY;
    const appName = process.env.NEW_RELIC_APP_NAME;

    if (!licenseKey || licenseKey === 'your_new_relic_license_key') {
      console.error('❌ NEW_RELIC_LICENSE_KEY not configured');
      process.exit(1);
    }

    if (!appName) {
      console.warn('⚠️  NEW_RELIC_APP_NAME not set, using default');
    }

    console.log('✅ Environment variables configured:');
    console.log(`   License Key: ${licenseKey.substring(0, 8)}...${licenseKey.substring(licenseKey.length - 4)}`);
    console.log(`   App Name: ${appName}`);
    console.log('');

    // Initialize New Relic
    const newrelic = initNewRelic();

    if (!newrelic) {
      console.error('❌ Failed to initialize New Relic');
      process.exit(1);
    }

    console.log('✅ New Relic initialized successfully');

    // Test custom metrics
    newrelic.recordMetric('Custom/Test/Setup', 1);
    console.log('✅ Custom metric recorded');

    // Test custom event
    newrelic.recordCustomEvent('TestSetup', {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      source: 'setup-test',
    });
    console.log('✅ Custom event recorded');

    // Test error tracking
    const testError = new Error('Test error for New Relic setup verification');
    newrelic.noticeError(testError);
    console.log('✅ Test error recorded');

    console.log('\n🎉 New Relic configuration test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your application to see live data in New Relic');
    console.log('2. Monitor performance metrics in the New Relic dashboard');
    console.log('3. Set up alert policies for critical thresholds');
    console.log('');

    logger.info('New Relic configuration test completed successfully');
  } catch (error) {
    console.error('❌ New Relic test failed:', error.message);
    logger.error('New Relic test failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

if (require.main === module) {
  testNewRelic();
}

module.exports = { testNewRelic };
