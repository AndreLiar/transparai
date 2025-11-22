#!/usr/bin/env node
// Backend/scripts/health-monitor.js

const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = require('../utils/logger');

/**
 * Health Monitoring and Alerting System
 * Monitors application health and sends alerts when issues are detected
 */
class HealthMonitor {
  constructor() {
    this.apiBaseUrl = process.env.HEALTH_CHECK_URL || 'http://localhost:5001';
    this.checkInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL_MS) || 60000; // 1 minute
    this.alertThreshold = parseInt(process.env.HEALTH_ALERT_THRESHOLD) || 3; // consecutive failures
    this.timeoutMs = parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS) || 10000; // 10 seconds

    this.consecutiveFailures = 0;
    this.isAlerting = false;
    this.lastSuccessTime = new Date();
    this.lastAlertTime = null;
    this.alertCooldownMs = parseInt(process.env.HEALTH_ALERT_COOLDOWN_MS) || 300000; // 5 minutes

    this.healthChecks = [
      {
        name: 'Basic Health',
        url: '/health',
        critical: true,
        timeout: 5000,
      },
      {
        name: 'Database Health',
        url: '/health/detailed',
        critical: true,
        timeout: 10000,
      },
      {
        name: 'API Version',
        url: '/api/version',
        critical: false,
        timeout: 5000,
      },
    ];
  }

  /**
   * Perform a single health check
   */
  async performHealthCheck(check) {
    const startTime = Date.now();

    try {
      const response = await axios.get(`${this.apiBaseUrl}${check.url}`, {
        timeout: check.timeout || this.timeoutMs,
        validateStatus: (status) => status < 500, // Accept 4xx but not 5xx
      });

      const responseTime = Date.now() - startTime;

      return {
        name: check.name,
        status: 'healthy',
        responseTime,
        statusCode: response.status,
        details: response.data,
        critical: check.critical,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        name: check.name,
        status: 'unhealthy',
        responseTime,
        error: error.message,
        statusCode: error.response?.status || 0,
        critical: check.critical,
      };
    }
  }

  /**
   * Run all health checks
   */
  async runAllHealthChecks() {
    const results = await Promise.allSettled(
      this.healthChecks.map((check) => this.performHealthCheck(check)),
    );

    const healthResults = results.map((result, index) => ({
      ...this.healthChecks[index],
      ...(result.status === 'fulfilled' ? result.value : {
        status: 'error',
        error: result.reason?.message || 'Unknown error',
      }),
    }));

    // Determine overall health
    const criticalFailures = healthResults.filter((r) => r.critical && r.status !== 'healthy');
    const overallStatus = criticalFailures.length === 0 ? 'healthy' : 'unhealthy';

    return {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      checks: healthResults,
      summary: {
        total: healthResults.length,
        healthy: healthResults.filter((r) => r.status === 'healthy').length,
        unhealthy: healthResults.filter((r) => r.status === 'unhealthy').length,
        critical_failures: criticalFailures.length,
      },
    };
  }

  /**
   * Send alert notification
   */
  async sendAlert(type, healthResult) {
    const subject = type === 'down'
      ? '🚨 TransparAI Application Down'
      : '✅ TransparAI Application Recovered';

    const alertData = {
      type,
      timestamp: new Date().toISOString(),
      consecutiveFailures: this.consecutiveFailures,
      lastSuccess: this.lastSuccessTime.toISOString(),
      healthResult,
    };

    // Email notification
    if (process.env.ALERT_EMAIL_ENABLED === 'true') {
      try {
        await this.sendEmailAlert(subject, alertData);
      } catch (error) {
        logger.error('Failed to send email alert', { error: error.message });
      }
    }

    // Slack notification
    if (process.env.ALERT_SLACK_ENABLED === 'true') {
      try {
        await this.sendSlackAlert(subject, alertData);
      } catch (error) {
        logger.error('Failed to send Slack alert', { error: error.message });
      }
    }

    // Webhook notification
    if (process.env.WEBHOOK_ALERT_URL) {
      try {
        await this.sendWebhookAlert(alertData);
      } catch (error) {
        logger.error('Failed to send webhook alert', { error: error.message });
      }
    }

    this.lastAlertTime = new Date();
    logger.info('Health alert sent', { type, subject });
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(subject, alertData) {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailBody = this.formatEmailAlert(alertData);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ALERT_EMAIL_TO,
      subject,
      text: emailBody,
      html: this.formatHtmlEmailAlert(alertData),
    });
  }

  /**
   * Send Slack alert
   */
  async sendSlackAlert(subject, alertData) {
    const { WebClient } = require('@slack/web-api');
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

    const color = alertData.type === 'down' ? 'danger' : 'good';
    const emoji = alertData.type === 'down' ? '🚨' : '✅';

    await slack.chat.postMessage({
      channel: process.env.SLACK_ALERT_CHANNEL,
      text: subject,
      attachments: [{
        color,
        title: `${emoji} ${subject}`,
        fields: [
          {
            title: 'Status',
            value: alertData.healthResult.status,
            short: true,
          },
          {
            title: 'Consecutive Failures',
            value: alertData.consecutiveFailures.toString(),
            short: true,
          },
          {
            title: 'Time',
            value: new Date(alertData.timestamp).toLocaleString(),
            short: true,
          },
        ],
        footer: 'TransparAI Health Monitor',
        ts: Math.floor(Date.now() / 1000),
      }],
    });
  }

  /**
   * Send webhook alert
   */
  async sendWebhookAlert(alertData) {
    await axios.post(process.env.WEBHOOK_ALERT_URL, {
      service: 'transparai-api',
      alert: alertData,
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Format email alert body
   */
  formatEmailAlert(alertData) {
    const lines = [
      'TransparAI Health Alert',
      '========================',
      '',
      `Alert Type: ${alertData.type.toUpperCase()}`,
      `Timestamp: ${new Date(alertData.timestamp).toLocaleString()}`,
      `Consecutive Failures: ${alertData.consecutiveFailures}`,
      `Last Success: ${new Date(alertData.lastSuccess).toLocaleString()}`,
      '',
      `Overall Status: ${alertData.healthResult.status}`,
      '',
      'Health Check Details:',
      '---------------------',
    ];

    alertData.healthResult.checks.forEach((check) => {
      lines.push(`${check.name}: ${check.status}`);
      if (check.error) {
        lines.push(`  Error: ${check.error}`);
      }
      if (check.responseTime) {
        lines.push(`  Response Time: ${check.responseTime}ms`);
      }
      lines.push('');
    });

    lines.push('This alert was generated automatically by the TransparAI Health Monitor.');

    return lines.join('\n');
  }

  /**
   * Format HTML email alert
   */
  formatHtmlEmailAlert(alertData) {
    const status = alertData.type === 'down' ? '🚨 DOWN' : '✅ RECOVERED';
    const color = alertData.type === 'down' ? '#ff4444' : '#44ff44';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1>${status}</h1>
          <p>TransparAI Application Health Alert</p>
        </div>
        
        <div style="padding: 20px;">
          <h2>Alert Details</h2>
          <ul>
            <li><strong>Type:</strong> ${alertData.type.toUpperCase()}</li>
            <li><strong>Time:</strong> ${new Date(alertData.timestamp).toLocaleString()}</li>
            <li><strong>Consecutive Failures:</strong> ${alertData.consecutiveFailures}</li>
            <li><strong>Last Success:</strong> ${new Date(alertData.lastSuccess).toLocaleString()}</li>
          </ul>
          
          <h2>Health Check Results</h2>
          <table border="1" cellpadding="5" cellspacing="0" style="width: 100%;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th>Check</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${alertData.healthResult.checks.map((check) => `
                <tr>
                  <td>${check.name}</td>
                  <td style="color: ${check.status === 'healthy' ? 'green' : 'red'};">
                    ${check.status.toUpperCase()}
                  </td>
                  <td>${check.responseTime || 'N/A'}ms</td>
                  <td>${check.error || 'OK'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px;">
          <p>Generated automatically by TransparAI Health Monitor</p>
        </div>
      </div>
    `;
  }

  /**
   * Process health check results and determine if alerts are needed
   */
  async processHealthResults(healthResult) {
    const isHealthy = healthResult.status === 'healthy';

    if (isHealthy) {
      // Reset failure count on success
      if (this.consecutiveFailures > 0) {
        logger.info('Health check recovered', {
          previousFailures: this.consecutiveFailures,
          downtime: Date.now() - this.lastSuccessTime.getTime(),
        });

        // Send recovery alert if we were in alert state
        if (this.isAlerting) {
          await this.sendAlert('recovery', healthResult);
          this.isAlerting = false;
        }
      }

      this.consecutiveFailures = 0;
      this.lastSuccessTime = new Date();
    } else {
      // Increment failure count
      this.consecutiveFailures++;

      logger.warn('Health check failed', {
        consecutiveFailures: this.consecutiveFailures,
        threshold: this.alertThreshold,
        result: healthResult.summary,
      });

      // Send alert if threshold reached and not in cooldown
      if (this.consecutiveFailures >= this.alertThreshold && !this.isAlerting) {
        const now = new Date();
        const canAlert = !this.lastAlertTime
                        || (now.getTime() - this.lastAlertTime.getTime()) > this.alertCooldownMs;

        if (canAlert) {
          await this.sendAlert('down', healthResult);
          this.isAlerting = true;
        }
      }
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    logger.info('Starting health monitoring', {
      apiBaseUrl: this.apiBaseUrl,
      checkInterval: this.checkInterval,
      alertThreshold: this.alertThreshold,
      checks: this.healthChecks.length,
    });

    // Initial check
    this.runCheck();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.runCheck();
    }, this.checkInterval);

    console.log('🏥 Health monitoring started');
    console.log(`   API URL: ${this.apiBaseUrl}`);
    console.log(`   Check interval: ${this.checkInterval}ms`);
    console.log(`   Alert threshold: ${this.alertThreshold} failures`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Health monitoring stopped');
      console.log('🛑 Health monitoring stopped');
    }
  }

  /**
   * Run a single check cycle
   */
  async runCheck() {
    try {
      const healthResult = await this.runAllHealthChecks();
      await this.processHealthResults(healthResult);

      // Log summary
      if (healthResult.status === 'healthy') {
        logger.debug('Health check passed', healthResult.summary);
      } else {
        logger.warn('Health check failed', healthResult.summary);
      }
    } catch (error) {
      logger.error('Health check error', { error: error.message, stack: error.stack });
      this.consecutiveFailures++;
    }
  }

  /**
   * Test configuration and connectivity
   */
  async testConfiguration() {
    console.log('🧪 Testing health monitor configuration...\n');

    // Test API connectivity
    try {
      const healthResult = await this.runAllHealthChecks();
      console.log('✅ API connectivity test passed');
      console.log(`   Overall status: ${healthResult.status}`);
      console.log(`   Checks completed: ${healthResult.summary.healthy}/${healthResult.summary.total}`);
    } catch (error) {
      console.error('❌ API connectivity test failed:', error.message);
      return false;
    }

    // Test email configuration
    if (process.env.ALERT_EMAIL_ENABLED === 'true') {
      try {
        await this.sendEmailAlert('🧪 Test Email Alert', {
          type: 'test',
          timestamp: new Date().toISOString(),
          consecutiveFailures: 0,
          lastSuccess: new Date().toISOString(),
          healthResult: { status: 'healthy', checks: [] },
        });
        console.log('✅ Email configuration test passed');
      } catch (error) {
        console.error('❌ Email configuration test failed:', error.message);
      }
    } else {
      console.log('⏸️  Email alerts disabled');
    }

    return true;
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new HealthMonitor();
  const command = process.argv[2];

  // Handle process termination gracefully
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    monitor.stopMonitoring();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    monitor.stopMonitoring();
    process.exit(0);
  });

  switch (command) {
    case 'test':
      monitor.testConfiguration()
        .then((success) => process.exit(success ? 0 : 1))
        .catch((error) => {
          console.error('Test failed:', error.message);
          process.exit(1);
        });
      break;

    case 'check':
      monitor.runCheck()
        .then(() => {
          console.log('✅ Manual health check completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Manual health check failed:', error.message);
          process.exit(1);
        });
      break;

    case 'start':
    default:
      monitor.startMonitoring();
      // Keep process alive
      process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception in health monitor', { error: error.message, stack: error.stack });
        console.error('Uncaught exception:', error);
      });
      break;
  }
}

module.exports = HealthMonitor;
