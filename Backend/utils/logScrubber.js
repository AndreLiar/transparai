// Backend/utils/logScrubber.js
/**
 * Log scrubbing utility to redact sensitive data from logs
 */

// Patterns to detect and redact
const SENSITIVE_PATTERNS = {
  email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  password: /(password|passwd|pwd)[\s:=]+[\S]+/gi,
  apiKey: /(api[_-]?key|token|secret)[\s:=]+[\S]+/gi,
  jwt: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g,
};

// Fields that should always be redacted
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'creditCard',
  'credit_card',
  'ssn',
  'social_security',
  'pin',
  'cvv',
  'cvc',
  'privateKey',
  'private_key',
];

/**
 * Redact email addresses
 */
const redactEmail = (email) => {
  if (!email || typeof email !== 'string') return email;

  const [local, domain] = email.split('@');
  if (!local || !domain) return '[REDACTED_EMAIL]';

  // Show first 2 and last 1 characters of local part
  const redactedLocal = local.length > 3
    ? `${local.substring(0, 2)}***${local.substring(local.length - 1)}`
    : '***';

  return `${redactedLocal}@${domain}`;
};

/**
 * Redact phone numbers
 */
const redactPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return phone;
  const digits = phone.replace(/\D/g, '');

  if (digits.length >= 10) {
    return `***-***-${digits.slice(-4)}`;
  }
  return '[REDACTED_PHONE]';
};

/**
 * Redact IP addresses (keep first octet)
 */
const redactIP = (ip) => {
  if (!ip || typeof ip !== 'string') return ip;
  const parts = ip.split('.');

  if (parts.length === 4) {
    return `${parts[0]}.***.***.***`;
  }
  return '[REDACTED_IP]';
};

/**
 * Hash sensitive value with SHA-256
 */
const hashValue = (value) => {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex')
    .substring(0, 16);
};

/**
 * Scrub string content for patterns
 */
const scrubString = (str) => {
  if (!str || typeof str !== 'string') return str;

  let scrubbed = str;

  // Redact emails with partial masking
  scrubbed = scrubbed.replace(SENSITIVE_PATTERNS.email, (match) => redactEmail(match));

  // Redact phone numbers
  scrubbed = scrubbed.replace(SENSITIVE_PATTERNS.phone, (match) => redactPhone(match));

  // Redact credit cards
  scrubbed = scrubbed.replace(SENSITIVE_PATTERNS.creditCard, '[REDACTED_CC]');

  // Redact SSN
  scrubbed = scrubbed.replace(SENSITIVE_PATTERNS.ssn, '[REDACTED_SSN]');

  // Redact passwords
  scrubbed = scrubbed.replace(SENSITIVE_PATTERNS.password, '$1: [REDACTED]');

  // Redact API keys and tokens
  scrubbed = scrubbed.replace(SENSITIVE_PATTERNS.apiKey, '$1: [REDACTED]');

  // Redact JWTs
  scrubbed = scrubbed.replace(SENSITIVE_PATTERNS.jwt, '[REDACTED_JWT]');

  return scrubbed;
};

/**
 * Scrub object recursively
 */
const scrubObject = (obj, options = {}) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const {
    redactEmails = true,
    redactIPs = true,
    hashSensitiveFields = true,
  } = options;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => scrubObject(item, options));
  }

  // Handle objects
  const scrubbed = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Check if field is sensitive
    const isSensitiveField = SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field.toLowerCase()));

    if (isSensitiveField) {
      // Completely redact sensitive fields
      if (hashSensitiveFields && value) {
        scrubbed[key] = `[HASH:${hashValue(value)}]`;
      } else {
        scrubbed[key] = '[REDACTED]';
      }
    } else if (typeof value === 'string') {
      // Scrub string content
      let scrubbedValue = value;

      if (redactEmails && key === 'email') {
        scrubbedValue = redactEmail(value);
      } else if (redactIPs && key === 'ip') {
        scrubbedValue = redactIP(value);
      } else {
        scrubbedValue = scrubString(value);
      }

      scrubbed[key] = scrubbedValue;
    } else if (typeof value === 'object' && value !== null) {
      // Recursively scrub nested objects
      scrubbed[key] = scrubObject(value, options);
    } else {
      // Keep other values as-is
      scrubbed[key] = value;
    }
  }

  return scrubbed;
};

/**
 * Main scrubbing function
 */
const scrubLog = (data, options = {}) => {
  if (!data) return data;

  if (typeof data === 'string') {
    return scrubString(data);
  }

  if (typeof data === 'object') {
    return scrubObject(data, options);
  }

  return data;
};

/**
 * Middleware to scrub request data before logging
 */
const scrubRequestMiddleware = (req, res, next) => {
  // Store original data
  const originalBody = req.body;
  const originalQuery = req.query;
  const originalParams = req.params;

  // Override toString for scrubbed logging
  if (req.body && typeof req.body === 'object') {
    req.body.toJSON = function () {
      return scrubObject(originalBody);
    };
  }

  // Scrub authorization header for logging
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      req.headers.authorization = `Bearer ${authHeader.substring(7, 15)}...`;
    }
  }

  next();
};

/**
 * Get scrubbed request info for logging
 */
const getScrubbedRequestInfo = (req) => ({
  method: req.method,
  url: req.originalUrl,
  ip: redactIP(req.ip),
  userAgent: req.get('User-Agent'),
  body: scrubObject(req.body, { redactEmails: true, redactIPs: true }),
  query: scrubObject(req.query),
  params: scrubObject(req.params),
});

module.exports = {
  scrubLog,
  scrubObject,
  scrubString,
  redactEmail,
  redactPhone,
  redactIP,
  hashValue,
  scrubRequestMiddleware,
  getScrubbedRequestInfo,
  SENSITIVE_FIELDS,
};
