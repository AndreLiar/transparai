// Backend/utils/logger.js
//
// Winston logger with Elastic Common Schema (ECS) 1.x output format.
// All JSON log lines are ECS-compliant — ready to ship to Elasticsearch,
// Azure Monitor, or any ECS-aware sink without transformation.
//
// ECS field reference: https://www.elastic.co/guide/en/ecs/current/ecs-field-reference.html
//
// Key ECS fields used:
//   @timestamp       — ISO-8601 UTC
//   log.level        — lowercase: error | warn | info | debug
//   message          — human-readable description
//   service.name     — "transparai-api"
//   service.version  — APP_VERSION env var
//   service.environment — NODE_ENV
//   error.message    — error text (when applicable)
//   error.stack_trace — full stack (when applicable)
//   error.type       — error class name
//   http.request.*   — HTTP request fields
//   http.response.*  — HTTP response fields
//   url.path         — request path
//   user.id          — Firebase UID
//   event.category   — e.g. "web", "authentication", "payment"
//   event.action     — specific action name
//   event.outcome    — "success" | "failure" | "unknown"

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const ErrorTrackingTransport = require('./ErrorTrackingTransport');
const { scrubLog } = require('./logScrubber');

// ── ECS base fields (static, set once) ───────────────────────────────────────
const SERVICE = {
  name: 'transparai-api',
  version: process.env.APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};

// ── ECS log-level mapping ─────────────────────────────────────────────────────
// Winston uses custom levels; ECS expects syslog-style lowercase strings.
// "http" has no ECS equivalent — map it to "debug".
const ECS_LEVEL = {
  error: 'error',
  warn:  'warn',
  info:  'info',
  http:  'debug',
  debug: 'debug',
};

// ── Custom ECS formatter ──────────────────────────────────────────────────────
// Transforms a Winston log info object into a flat ECS JSON document.
const ecsFormat = winston.format((info) => {
  // Apply PII scrubbing first
  const scrubbed = scrubLog(info, {
    redactEmails: true,
    redactIPs: process.env.NODE_ENV === 'production',
    hashSensitiveFields: true,
  });

  const {
    level,
    message,
    timestamp,
    stack,
    // Pull out known structured fields — everything else goes to labels
    service: svcOverride,
    userId,
    method,
    url,
    statusCode,
    duration,
    userAgent,
    ip,
    error: errField,
    event: eventField,
    http: httpField,
    ...rest
  } = scrubbed;

  // Build ECS document
  const ecs = {
    '@timestamp': timestamp || new Date().toISOString(),
    'log.level': ECS_LEVEL[level] || level,
    message,
    service: {
      name: SERVICE.name,
      version: SERVICE.version,
      environment: SERVICE.environment,
      ...svcOverride,
    },
  };

  // error.* — only when an Error was logged
  if (stack || errField) {
    ecs.error = {
      message: errField?.message || message,
      type: errField?.name || errField?.type,
      stack_trace: stack || errField?.stack,
      code: errField?.code,
    };
    // Remove undefined keys
    Object.keys(ecs.error).forEach((k) => ecs.error[k] === undefined && delete ecs.error[k]);
  }

  // http.* + url.* — when HTTP context is present
  if (method || statusCode || url) {
    ecs.http = {
      request: {
        method: method?.toUpperCase(),
        ...httpField?.request,
      },
      response: {
        status_code: statusCode ? Number(statusCode) : undefined,
        ...httpField?.response,
      },
    };
    if (url) ecs.url = { path: url };
    if (userAgent) ecs.user_agent = { original: userAgent };
    if (ip) ecs.client = { ip };
    if (duration) ecs.event = { duration: Number(String(duration).replace('ms', '')) * 1e6 }; // ECS: nanoseconds
  }

  // user.id — Firebase UID
  if (userId) ecs.user = { id: userId };

  // event.* — passed explicitly by callers (e.g. logSecurityEvent)
  if (eventField) {
    ecs.event = { ...ecs.event, ...eventField };
  }

  // labels — catch-all for any remaining structured fields
  const labelKeys = Object.keys(rest).filter(
    (k) => !['splat', 'Symbol(level)', 'Symbol(splat)'].includes(k)
      && typeof rest[k] !== 'function',
  );
  if (labelKeys.length > 0) {
    ecs.labels = {};
    labelKeys.forEach((k) => {
      // ECS labels values must be strings
      ecs.labels[k] = typeof rest[k] === 'object' ? JSON.stringify(rest[k]) : String(rest[k]);
    });
  }

  // Replace the info object content with the ECS document
  // Winston needs level + message to remain on the root object
  Object.keys(info).forEach((k) => delete info[k]);
  Object.assign(info, ecs);
  info.level = level; // keep original level key for Winston transports

  return info;
});

// ── Console format (development) — readable, coloured ────────────────────────
const devConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, error, labels, user, http: h }) => {
    let out = `${timestamp} [${level}] ${message}`;
    if (user?.id) out += ` | user=${user.id}`;
    if (h?.response?.status_code) out += ` | status=${h.response.status_code}`;
    if (error?.message) out += `\n  error: ${error.message}`;
    if (error?.stack_trace) out += `\n  ${error.stack_trace}`;
    if (labels && Object.keys(labels).length) out += ` | ${JSON.stringify(labels)}`;
    return out;
  }),
);

// ── Logs directory ────────────────────────────────────────────────────────────
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ── ECS JSON format (production / file) ──────────────────────────────────────
const ecsJsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  ecsFormat(),
  winston.format.json(),
);

// ── Transports ────────────────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: process.env.NODE_ENV === 'production' ? ecsJsonFormat : devConsoleFormat,
  }),

  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: ecsJsonFormat,
    maxsize: 5242880, // 5 MB
    maxFiles: 5,
  }),

  new winston.transports.File({
    filename: path.join(logsDir, 'errors.log'),
    level: 'error',
    format: ecsJsonFormat,
    maxsize: 5242880,
    maxFiles: 10,
  }),

  new ErrorTrackingTransport({ level: 'warn' }),
];

// Slack transport — errors only, production only
if (process.env.SLACK_WEBHOOK_URL && process.env.NODE_ENV === 'production') {
  const SlackHook = require('winston-slack-webhook-transport');
  transports.push(new SlackHook({
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    level: 'error',
    formatter: (info) => ({
      text: '🚨 *TransparAI Error*',
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Error',       value: info.message,               short: false },
          { title: 'Level',       value: info['log.level'] || 'error', short: true },
          { title: 'Timestamp',   value: info['@timestamp'],          short: true },
          { title: 'Service',     value: info.service?.name,          short: true },
          { title: 'Environment', value: info.service?.environment,   short: true },
        ],
      }],
    }),
  }));
}

// ── Logger instance ───────────────────────────────────────────────────────────
const customLevels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
winston.addColors({ error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: customLevels,
  format: ecsJsonFormat,
  transports,
  exitOnError: false,
});

// Morgan stream
logger.stream = { write: (msg) => logger.http(msg.trim()) };

// ── Structured helper methods ─────────────────────────────────────────────────
// All helpers emit ECS-shaped fields directly so the formatter can map them.

logger.logRequest = (req, res, duration) => {
  const logFn = res.statusCode >= 400 ? logger.warn : logger.info;
  logFn.call(logger, 'HTTP Request', {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.uid || req.user?.id,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
    event: { category: 'web', action: 'request', outcome: res.statusCode < 400 ? 'success' : 'failure' },
  });
};

logger.logError = (error, req = null, additionalInfo = {}) => {
  const data = {
    error: { message: error.message, stack: error.stack, type: error.name, code: error.code },
    event: { category: 'web', action: 'error', outcome: 'failure' },
    ...additionalInfo,
  };
  if (req) {
    data.method = req.method;
    data.url = req.originalUrl || req.url;
    data.userId = req.user?.uid || req.user?.id;
    data.ip = req.ip;
    data.userAgent = req.get('User-Agent');
  }
  logger.error('Application Error', data);
};

logger.logAnalysis = (analysisId, userId, documentName, score, duration) => {
  logger.info('Document Analysis Completed', {
    analysisId,
    userId,
    documentName,
    score,
    duration: `${duration}ms`,
    event: { category: 'process', action: 'analysis_complete', outcome: 'success' },
  });
};

logger.logUserAction = (action, userId, details = {}) => {
  logger.info('User Action', {
    userId,
    event: { category: 'iam', action, outcome: 'success' },
    ...details,
  });
};

logger.logPayment = (event, userId, amount, currency, status) => {
  logger.info('Payment Event', {
    userId,
    amount,
    currency,
    event: { category: 'session', action: event, outcome: status === 'succeeded' ? 'success' : 'failure' },
  });
};

logger.logQuotaUsage = (userId, plan, usage, limit, action) => {
  const pct = Math.round((usage / limit) * 100);
  const logFn = pct >= 90 ? logger.warn : logger.info;
  logFn.call(logger, 'Quota Usage', {
    userId,
    plan,
    usage,
    limit,
    utilizationPercentage: pct,
    event: { category: 'process', action, outcome: pct >= 100 ? 'failure' : 'success' },
  });
};

logger.logExternalService = (service, operation, success, duration, error = null) => {
  const data = {
    event: {
      category: 'network',
      action: operation,
      outcome: success ? 'success' : 'failure',
      duration: duration * 1e6, // nanoseconds
    },
    labels: { external_service: service },
  };
  if (error) {
    data.error = { message: error.message, type: error.name };
    logger.error(`External Service Error: ${service}`, data);
  } else if (success) {
    logger.info(`External Service OK: ${service}`, data);
  } else {
    logger.warn(`External Service Warning: ${service}`, data);
  }
};

logger.logSecurityEvent = (eventType, details = {}) => {
  const { severity = 'info', ...rest } = details;
  // Remove sensitive fields
  delete rest.token;
  delete rest.password;

  const data = {
    event: {
      category: 'authentication',
      action: eventType,
      outcome: severity === 'info' ? 'success' : 'failure',
      severity,
    },
    ...rest,
  };

  if (severity === 'critical' || severity === 'high') {
    logger.error(`Security Event: ${eventType}`, data);
  } else if (severity === 'medium') {
    logger.warn(`Security Event: ${eventType}`, data);
  } else {
    logger.info(`Security Event: ${eventType}`, data);
  }
};

logger.logAdminAccess = (details) => {
  logger.logSecurityEvent('ADMIN_ACCESS', { ...details, severity: 'high' });
};

logger.logDataExport = (details) => {
  logger.logSecurityEvent('DATA_EXPORT', { ...details, severity: 'medium' });
};

logger.logAuthEvent = (eventType, details) => {
  logger.logSecurityEvent(`AUTH_${eventType.toUpperCase()}`, {
    ...details,
    severity: eventType === 'failed' ? 'medium' : 'info',
  });
};

logger.logPermissionChange = (details) => {
  logger.logSecurityEvent('PERMISSION_CHANGE', { ...details, severity: 'high' });
};

logger.logSuspiciousActivity = (activityType, details) => {
  logger.logSecurityEvent('SUSPICIOUS_ACTIVITY', { activityType, ...details, severity: 'high' });
};

// ── Exception / rejection handlers (production) ───────────────────────────────
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log'), format: ecsJsonFormat }),
  );
  logger.rejections.handle(
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log'), format: ecsJsonFormat }),
  );
}

module.exports = logger;
