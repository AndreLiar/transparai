#!/usr/bin/env node
// Backend/scripts/test-sentry.js

require('dotenv').config();
const { testSentry, captureMessage, captureError } = require('../config/sentry');

/**
 * Test Sentry configuration and error reporting
 */
async function testSentrySetup() {
  console.log('🧪 Testing Sentry configuration...\n');

  // Check if DSN is configured
  if (!process.env.SENTRY_DSN || process.env.SENTRY_DSN.startsWith('your_')) {
    console.error('❌ SENTRY_DSN not configured in .env file');
    console.log('Please add your Sentry DSN to the .env file:');
    console.log('SENTRY_DSN=https://your-dsn@xxx.ingest.sentry.io/xxxxxxx\n');
    process.exit(1);
  }

  try {
    // Initialize Sentry with our configuration
    const Sentry = require('@sentry/node');

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || '1.0.0',
      tracesSampleRate: 1.0,
    });

    // Sentry should be initialized at this point

    console.log('✅ Sentry initialized successfully');
    console.log(`   DSN: ${process.env.SENTRY_DSN.substring(0, 50)}...`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);

    // Test basic message capture
    console.log('📤 Sending test message...');
    Sentry.captureMessage('Test message from TransparAI setup', 'info');

    // Test error capture
    console.log('📤 Sending test error...');
    try {
      throw new Error('Test error from TransparAI setup - this is intentional');
    } catch (error) {
      Sentry.captureException(error);
    }

    // Test warning
    console.log('📤 Sending test warning...');
    Sentry.captureMessage('Test warning from TransparAI setup', 'warning');

    console.log('\n✅ Test messages sent to Sentry successfully!');
    console.log('\n🔍 Check your Sentry dashboard at https://sentry.io');
    console.log('You should see:');
    console.log('  - 1 test message (info level)');
    console.log('  - 1 test error');
    console.log('  - 1 test warning');
    console.log('\nIf you see these events, Sentry is working correctly! 🎉');

    // Give Sentry time to send events
    setTimeout(() => {
      console.log('\n✅ Sentry test completed');
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.error('❌ Sentry test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your SENTRY_DSN is correct');
    console.log('2. Verify your Sentry project is active');
    console.log('3. Check network connectivity');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nTest interrupted');
  process.exit(0);
});

// Run the test
testSentrySetup();
