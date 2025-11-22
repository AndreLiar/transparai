// Backend/utils/logger.js
const winston = require('winston');
const path = require('path');
const ErrorTrackingTransport = require('./ErrorTrackingTransport');
const { scrubLog } = require('./logScrubber');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format to scrub sensitive data
const scrubFormat = winston.format((info) => {
  // Scrub the entire info object
  const scrubbed = scrubLog(info, {
    redactEmails: true,
    redactIPs: process.env.NODE_ENV === 'production',
    hashSensitiveFields: true,
  });

  return scrubbed;
});

// Define log format with scrubbing
const logFormat = winston.format.combine(
  scrubFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => {
      const {
        timestamp, level, message, ...meta
      } = info;
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level}]: ${message} ${metaStr}`;
    },
  ),
);

// Create logs directory if it doesn't exist
const fs = require('fs');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // File transport for error logs only
  new winston.transports.File({
    filename: path.join(logsDir, 'errors.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  }),

  // Custom error tracking transport
  new ErrorTrackingTransport({
    level: 'warn',
  }),
];

// Add Slack transport if configured
if (process.env.SLACK_WEBHOOK_URL && process.env.NODE_ENV === 'production') {
  const SlackHook = require('winston-slack-webhook-transport');
  transports.push(
    new SlackHook({
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      level: 'error',
      formatter: (info) => ({
        text: '🚨 *TransparAI Error*',
        attachments: [{
          color: 'danger',
          fields: [{
            title: 'Error',
            value: info.message,
            short: false,
          }, {
            title: 'Level',
            value: info.level,
            short: true,
          }, {
            title: 'Timestamp',
            value: info.timestamp,
            short: true,
          }],
        }],
      }),
    }),
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper methods for structured logging
logger.logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.uid || req.user?.id,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

logger.logError = (error, req = null, additionalInfo = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...additionalInfo,
  };

  if (req) {
    errorData.request = {
      method: req.method,
      url: req.originalUrl || req.url,
      userId: req.user?.uid || req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };
  }

  logger.error('Application Error', errorData);
};

logger.logAnalysis = (analysisId, userId, documentName, score, duration) => {
  logger.info('Document Analysis Completed', {
    analysisId,
    userId,
    documentName,
    score,
    duration: `${duration}ms`,
    service: 'analysis',
  });
};

logger.logUserAction = (action, userId, details = {}) => {
  logger.info('User Action', {
    action,
    userId,
    ...details,
    service: 'user',
  });
};

logger.logPayment = (event, userId, amount, currency, status) => {
  logger.info('Payment Event', {
    event,
    userId,
    amount,
    currency,
    status,
    service: 'payment',
  });
};

logger.logQuotaUsage = (userId, plan, usage, limit, action) => {
  const logLevel = usage >= limit * 0.9 ? 'warn' : 'info';
  logger[logLevel]('Quota Usage', {
    userId,
    plan,
    usage,
    limit,
    utilizationPercentage: Math.round((usage / limit) * 100),
    action,
    service: 'quota',
  });
};

logger.logExternalService = (service, operation, success, duration, error = null) => {
  const logData = {
    service,
    operation,
    success,
    duration: `${duration}ms`,
  };

  if (error) {
    logData.error = error.message;
    logger.error('External Service Error', logData);
  } else if (success) {
    logger.info('External Service Success', logData);
  } else {
    logger.warn('External Service Warning', logData);
  }
};

/**
 * Log security events with structured format
 */
logger.logSecurityEvent = (eventType, details = {}) => {
  const securityEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    severity: details.severity || 'info',
    ...details,
  };

  // Remove sensitive data
  if (securityEvent.token) delete securityEvent.token;
  if (securityEvent.password) delete securityEvent.password;

  switch (details.severity) {
    case 'critical':
    case 'high':
      logger.error(`Security Event: ${eventType}`, securityEvent);
      break;
    case 'medium':
      logger.warn(`Security Event: ${eventType}`, securityEvent);
      break;
    default:
      logger.info(`Security Event: ${eventType}`, securityEvent);
  }
};

/**
 * Log admin access attempts
 */
logger.logAdminAccess = (details) => {
  logger.logSecurityEvent('ADMIN_ACCESS', {
    ...details,
    severity: 'high',
  });
};

/**
 * Log data export events
 */
logger.logDataExport = (details) => {
  logger.logSecurityEvent('DATA_EXPORT', {
    ...details,
    severity: 'medium',
  });
};

/**
 * Log authentication events
 */
logger.logAuthEvent = (eventType, details) => {
  logger.logSecurityEvent(`AUTH_${eventType.toUpperCase()}`, {
    ...details,
    severity: eventType === 'failed' ? 'medium' : 'info',
  });
};

/**
 * Log permission changes
 */
logger.logPermissionChange = (details) => {
  logger.logSecurityEvent('PERMISSION_CHANGE', {
    ...details,
    severity: 'high',
  });
};

/**
 * Log suspicious activity
 */
logger.logSuspiciousActivity = (activityType, details) => {
  logger.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
    activityType,
    ...details,
    severity: 'high',
  });
};

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    }),
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    }),
  );
}

module.exports = logger;
