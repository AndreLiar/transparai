// Backend/utils/ErrorTrackingTransport.js
const Transport = require('winston-transport');
const { v4: uuidv4 } = require('uuid');
const ErrorLog = require('../models/ErrorLog');

class ErrorTrackingTransport extends Transport {
  constructor(opts = {}) {
    super(opts);
    this.name = 'error-tracking-transport';
    this.level = opts.level || 'error';
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Only process error and warn levels
    if (!['error', 'warn'].includes(info.level)) {
      callback();
      return;
    }

    const errorId = uuidv4();
    const timestamp = new Date();

    try {
      const errorLogData = {
        errorId,
        timestamp,
        level: info.level,
        message: info.message,
        stack: info.stack || info.error?.stack,
        request: info.request || {},
        response: info.response || {},
        metadata: {
          ...info.metadata,
          name: info.error?.name,
          code: info.error?.code,
          isOperational: info.error?.isOperational || false,
          severity: this.calculateSeverity(info),
        },
        tags: info.tags || [],
      };

      // Save to database asynchronously
      ErrorLog.create(errorLogData)
        .then(() => {
          console.log(`[ErrorTrackingTransport] Saved error log: ${errorId}`);
        })
        .catch((dbErr) => {
          console.error('[ErrorTrackingTransport] Failed to save error log:', dbErr);
        });

      // Send alerts for critical errors
      if (this.shouldAlert(info)) {
        this.sendAlert(errorLogData).catch((alertErr) => {
          console.error('[ErrorTrackingTransport] Failed to send alert:', alertErr);
        });
      }
    } catch (err) {
      console.error('[ErrorTrackingTransport] Transport error:', err);
    }

    callback();
  }

  calculateSeverity(info) {
    if (info.level === 'error') {
      // Check for critical patterns
      if (info.message?.includes('database')
          || info.message?.includes('connection')
          || info.message?.includes('payment')
          || info.response?.statusCode >= 500) {
        return 'critical';
      }
      return 'high';
    }

    if (info.level === 'warn') {
      return 'medium';
    }

    return 'low';
  }

  shouldAlert(info) {
    // Send alerts for:
    // 1. All error level logs
    // 2. Critical warnings
    // 3. Multiple failed requests from same user
    return info.level === 'error'
           || (info.level === 'warn' && this.calculateSeverity(info) === 'medium');
  }

  async sendAlert(errorLogData) {
    try {
      // Email alert configuration
      if (process.env.ALERT_EMAIL_ENABLED === 'true') {
        await this.sendEmailAlert(errorLogData);
      }

      // Slack alert configuration
      if (process.env.ALERT_SLACK_ENABLED === 'true') {
        await this.sendSlackAlert(errorLogData);
      }
    } catch (err) {
      console.error('[ErrorTrackingTransport] Alert sending failed:', err);
    }
  }

  async sendEmailAlert(errorLogData) {
    const nodemailer = require('nodemailer');

    if (!process.env.SMTP_HOST || !process.env.ALERT_EMAIL_TO) {
      return; // Skip if not configured
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL_TO,
      subject: `[TransparAI] ${errorLogData.level.toUpperCase()}: ${errorLogData.message}`,
      html: this.generateEmailHTML(errorLogData),
    };

    await transporter.sendMail(mailOptions);
  }

  async sendSlackAlert(errorLogData) {
    const { WebClient } = require('@slack/web-api');

    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_ALERT_CHANNEL) {
      return; // Skip if not configured
    }

    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

    const color = errorLogData.level === 'error' ? 'danger' : 'warning';
    const emoji = errorLogData.level === 'error' ? '🚨' : '⚠️';

    await slack.chat.postMessage({
      channel: process.env.SLACK_ALERT_CHANNEL,
      text: `${emoji} TransparAI ${errorLogData.level.toUpperCase()}`,
      attachments: [{
        color,
        title: `${errorLogData.level.toUpperCase()}: ${errorLogData.message}`,
        fields: [
          {
            title: 'Error ID',
            value: errorLogData.errorId,
            short: true,
          },
          {
            title: 'Timestamp',
            value: errorLogData.timestamp.toISOString(),
            short: true,
          },
          {
            title: 'Request',
            value: `${errorLogData.request.method} ${errorLogData.request.url}`,
            short: true,
          },
          {
            title: 'User',
            value: errorLogData.request.userId || 'Anonymous',
            short: true,
          },
          {
            title: 'Severity',
            value: errorLogData.metadata.severity,
            short: true,
          },
          {
            title: 'Environment',
            value: errorLogData.environment,
            short: true,
          },
        ],
        footer: 'TransparAI Error Tracking',
        ts: Math.floor(errorLogData.timestamp.getTime() / 1000),
      }],
    });
  }

  generateEmailHTML(errorLogData) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: ${errorLogData.level === 'error' ? '#dc3545' : '#ffc107'};">
              ${errorLogData.level === 'error' ? '🚨' : '⚠️'} TransparAI ${errorLogData.level.toUpperCase()}
            </h2>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Error Details</h3>
              <p><strong>Error ID:</strong> ${errorLogData.errorId}</p>
              <p><strong>Message:</strong> ${errorLogData.message}</p>
              <p><strong>Timestamp:</strong> ${errorLogData.timestamp.toISOString()}</p>
              <p><strong>Severity:</strong> ${errorLogData.metadata.severity}</p>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Request Information</h3>
              <p><strong>Method:</strong> ${errorLogData.request.method}</p>
              <p><strong>URL:</strong> ${errorLogData.request.url}</p>
              <p><strong>User ID:</strong> ${errorLogData.request.userId || 'Anonymous'}</p>
              <p><strong>IP:</strong> ${errorLogData.request.ip}</p>
              <p><strong>User Agent:</strong> ${errorLogData.request.userAgent}</p>
            </div>

            ${errorLogData.stack ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Stack Trace</h3>
              <pre style="background: #e9ecef; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px;">${errorLogData.stack}</pre>
            </div>
            ` : ''}

            <p style="margin-top: 30px; font-size: 12px; color: #6c757d;">
              This alert was generated automatically by TransparAI Error Tracking System.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = ErrorTrackingTransport;
