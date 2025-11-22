#!/usr/bin/env node
// Backend/scripts/deploy.js

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = require('../utils/logger');

/**
 * Production Deployment Script
 * Runs pre-deployment checks and prepares for production
 */
class DeploymentScript {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Run a shell command and capture output
   */
  runCommand(command, description, options = {}) {
    try {
      console.log(`🔄 ${description}...`);
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd || process.cwd(),
      });
      console.log(`✅ ${description} - completed`);
      return output;
    } catch (error) {
      const message = `❌ ${description} - failed: ${error.message}`;
      console.error(message);
      if (options.required !== false) {
        this.errors.push(message);
      } else {
        this.warnings.push(message);
      }
      return null;
    }
  }

  /**
   * Check if required environment variables are set
   */
  checkEnvironmentVariables() {
    console.log('\n📋 Checking Environment Variables...');

    const requiredVars = [
      'NODE_ENV',
      'PORT',
      'MONGO_URI',
      'FIREBASE_SERVICE_ACCOUNT_JSON',
      'FRONTEND_URL',
      'GEMINI_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ];

    const productionVars = [
      'SENTRY_DSN',
      'ALERT_EMAIL_ENABLED',
      'SMTP_HOST',
    ];

    const missingVars = [];
    const warningVars = [];

    // Check required variables
    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      } else if (process.env[varName].startsWith('your_')
                 || process.env[varName].startsWith('test_')
                 || process.env[varName].includes('fake')) {
        warningVars.push(`${varName} appears to be a placeholder value`);
      }
    });

    // Check production-recommended variables
    if (this.isProduction) {
      productionVars.forEach((varName) => {
        if (!process.env[varName] || process.env[varName].startsWith('your_')) {
          warningVars.push(`${varName} not configured for production`);
        }
      });
    }

    if (missingVars.length > 0) {
      this.errors.push(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    if (warningVars.length > 0) {
      this.warnings.push(...warningVars);
    }

    console.log('   ✅ Environment variables checked');
  }

  /**
   * Run tests
   */
  runTests() {
    console.log('\n🧪 Running Tests...');

    // Backend tests
    this.runCommand('npm test', 'Backend tests');

    // Frontend tests (if available)
    const frontendPath = path.join(__dirname, '../../frontend');
    if (fs.access(frontendPath)) {
      this.runCommand('npm run test:run', 'Frontend tests', {
        cwd: frontendPath,
        required: false,
      });
    }
  }

  /**
   * Run linting
   */
  runLinting() {
    console.log('\n🔍 Running Code Quality Checks...');

    // Backend linting
    this.runCommand('npm run lint', 'Backend linting');

    // Frontend linting
    const frontendPath = path.join(__dirname, '../../frontend');
    this.runCommand('npm run lint', 'Frontend linting', {
      cwd: frontendPath,
      required: false,
    });
  }

  /**
   * Security audit
   */
  runSecurityAudit() {
    console.log('\n🔒 Running Security Audit...');

    // Backend audit
    this.runCommand('npm audit --audit-level=high', 'Backend security audit', {
      required: false,
    });

    // Frontend audit
    const frontendPath = path.join(__dirname, '../../frontend');
    this.runCommand('npm audit --audit-level=high', 'Frontend security audit', {
      cwd: frontendPath,
      required: false,
    });
  }

  /**
   * Test monitoring systems
   */
  testMonitoringSystems() {
    console.log('\n📊 Testing Monitoring Systems...');

    // Test Sentry
    if (process.env.SENTRY_DSN && !process.env.SENTRY_DSN.startsWith('your_')) {
      this.runCommand('npm run sentry:test', 'Sentry integration test', {
        required: false,
      });
    } else {
      this.warnings.push('Sentry DSN not configured');
    }

    // Test health monitoring
    this.runCommand('npm run monitor:test', 'Health monitoring test', {
      required: false,
    });
  }

  /**
   * Build frontend
   */
  buildFrontend() {
    console.log('\n🏗️  Building Frontend...');

    const frontendPath = path.join(__dirname, '../../frontend');
    this.runCommand('npm run build', 'Frontend build', {
      cwd: frontendPath,
      required: false,
    });
  }

  /**
   * Create backup before deployment
   */
  createBackup() {
    if (this.isProduction) {
      console.log('\n💾 Creating Pre-deployment Backup...');

      this.runCommand('npm run backup', 'Database backup', {
        required: false,
      });
    }
  }

  /**
   * Generate deployment report
   */
  generateReport() {
    console.log('\n📊 Deployment Readiness Report');
    console.log('=====================================');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 ALL CHECKS PASSED!');
      console.log('✅ Ready for production deployment\n');
    } else {
      if (this.errors.length > 0) {
        console.log('❌ CRITICAL ISSUES FOUND:');
        this.errors.forEach((error) => console.log(`   • ${error}`));
        console.log('');
      }

      if (this.warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        this.warnings.forEach((warning) => console.log(`   • ${warning}`));
        console.log('');
      }

      if (this.errors.length > 0) {
        console.log('❌ NOT READY FOR DEPLOYMENT');
        console.log('Please fix critical issues before deploying.\n');
      } else {
        console.log('⚠️  DEPLOYMENT POSSIBLE WITH WARNINGS');
        console.log('Consider addressing warnings for optimal production setup.\n');
      }
    }

    // Environment summary
    console.log('🔧 Environment Summary:');
    console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   • Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
    console.log(`   • Database: ${process.env.MONGO_URI ? 'configured' : 'not configured'}`);
    console.log(`   • Sentry: ${process.env.SENTRY_DSN && !process.env.SENTRY_DSN.startsWith('your_') ? 'enabled' : 'disabled'}`);
    console.log(`   • Email Alerts: ${process.env.ALERT_EMAIL_ENABLED === 'true' ? 'enabled' : 'disabled'}`);
    console.log('');

    // Next steps
    if (this.errors.length === 0) {
      console.log('🚀 Next Steps:');
      console.log('   1. Deploy backend to your hosting platform');
      console.log('   2. Set up production environment variables');
      console.log('   3. Configure monitoring and alerting');
      console.log('   4. Set up automated backups');
      console.log('   5. Test production deployment');
      console.log('');
    }

    return this.errors.length === 0;
  }

  /**
   * Main deployment check workflow
   */
  async run() {
    console.log('🚀 TransparAI Production Deployment Check');
    console.log('==========================================\n');

    try {
      // Environment checks
      this.checkEnvironmentVariables();

      // Code quality checks
      this.runLinting();

      // Test suite
      this.runTests();

      // Security checks
      this.runSecurityAudit();

      // Monitoring tests
      this.testMonitoringSystems();

      // Frontend build
      this.buildFrontend();

      // Pre-deployment backup
      this.createBackup();

      // Generate final report
      const ready = this.generateReport();

      if (ready) {
        logger.info('Deployment check completed successfully');
        process.exit(0);
      } else {
        logger.error('Deployment check failed', {
          errors: this.errors.length,
          warnings: this.warnings.length,
        });
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Deployment check failed with error:', error.message);
      logger.error('Deployment check error', { error: error.message, stack: error.stack });
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const deployment = new DeploymentScript();
  deployment.run();
}

module.exports = DeploymentScript;
