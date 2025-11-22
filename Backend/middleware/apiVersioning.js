// Backend/middleware/apiVersioning.js
const logger = require('../utils/logger');

// Current API version
const CURRENT_VERSION = 'v1';
const SUPPORTED_VERSIONS = ['v1'];
const DEPRECATED_VERSIONS = [];

/**
 * API versioning middleware
 * Supports version detection from:
 * 1. URL path (/api/v1/...)
 * 2. Accept header (application/vnd.transparai.v1+json)
 * 3. X-API-Version header
 */
const apiVersionMiddleware = (req, res, next) => {
  let detectedVersion = null;
  let versionSource = null;

  // 1. Check URL path for version
  const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    detectedVersion = pathMatch[1];
    versionSource = 'path';
  }

  // 2. Check X-API-Version header
  if (!detectedVersion && req.headers['x-api-version']) {
    detectedVersion = req.headers['x-api-version'].toLowerCase();
    versionSource = 'header';
  }

  // 3. Check Accept header for custom media type
  if (!detectedVersion && req.headers.accept) {
    const acceptMatch = req.headers.accept.match(/application\/vnd\.transparai\.(v\d+)\+json/);
    if (acceptMatch) {
      detectedVersion = acceptMatch[1];
      versionSource = 'accept';
    }
  }

  // Default to current version if none specified
  if (!detectedVersion) {
    detectedVersion = CURRENT_VERSION;
    versionSource = 'default';
  }

  // Validate version
  if (!SUPPORTED_VERSIONS.includes(detectedVersion)) {
    logger.warn('Unsupported API version requested', {
      requestedVersion: detectedVersion,
      source: versionSource,
      ip: req.ip,
      endpoint: req.originalUrl,
    });

    return res.status(400).json({
      error: 'Version API non supportée',
      code: 'UNSUPPORTED_API_VERSION',
      requestedVersion: detectedVersion,
      supportedVersions: SUPPORTED_VERSIONS,
      currentVersion: CURRENT_VERSION,
    });
  }

  // Check if version is deprecated
  if (DEPRECATED_VERSIONS.includes(detectedVersion)) {
    logger.info('Deprecated API version used', {
      version: detectedVersion,
      source: versionSource,
      ip: req.ip,
      endpoint: req.originalUrl,
    });

    // Add deprecation warning header
    res.set('X-API-Deprecated', 'true');
    res.set('X-API-Deprecation-Info', 'Cette version sera retirée le 2026-01-01');
    res.set('X-API-Current-Version', CURRENT_VERSION);
  }

  // Attach version info to request
  req.apiVersion = detectedVersion;
  req.apiVersionSource = versionSource;

  // Add version info to response headers
  res.set('X-API-Version', detectedVersion);
  res.set('X-API-Version-Source', versionSource);

  // Log version usage for analytics
  if (process.env.NODE_ENV !== 'test') {
    logger.debug('API version detected', {
      version: detectedVersion,
      source: versionSource,
      endpoint: req.originalUrl,
    });
  }

  next();
};

/**
 * Create version-specific router
 */
const versionRouter = (version) => {
  const express = require('express');
  const router = express.Router();

  // Add version validation middleware
  router.use((req, res, next) => {
    if (req.apiVersion !== version) {
      return res.status(400).json({
        error: 'Version incompatible',
        code: 'VERSION_MISMATCH',
        requestedVersion: req.apiVersion,
        routeVersion: version,
      });
    }
    next();
  });

  return router;
};

/**
 * Deprecate an API version
 */
const deprecateVersion = (version, sunsetDate, migrationGuideUrl) => {
  if (!DEPRECATED_VERSIONS.includes(version)) {
    DEPRECATED_VERSIONS.push(version);

    logger.info('API version deprecated', {
      version,
      sunsetDate,
      migrationGuideUrl,
    });
  }
};

/**
 * Get API version info
 */
const getVersionInfo = () => ({
  currentVersion: CURRENT_VERSION,
  supportedVersions: SUPPORTED_VERSIONS,
  deprecatedVersions: DEPRECATED_VERSIONS,
});

/**
 * Version compatibility middleware
 * Ensures the request version supports the required features
 */
const requireVersionFeature = (minVersion) => (req, res, next) => {
  const requestedVersion = req.apiVersion || CURRENT_VERSION;

  // Simple version comparison (assumes v1, v2, v3 format)
  const requestedVersionNum = parseInt(requestedVersion.substring(1));
  const minVersionNum = parseInt(minVersion.substring(1));

  if (requestedVersionNum < minVersionNum) {
    logger.warn('Feature not available in API version', {
      requestedVersion,
      requiredVersion: minVersion,
      endpoint: req.originalUrl,
    });

    return res.status(400).json({
      error: 'Fonctionnalité non disponible dans cette version',
      code: 'FEATURE_UNAVAILABLE',
      yourVersion: requestedVersion,
      requiredVersion: minVersion,
      upgradeInstructions: `/api/${minVersion}${req.path}`,
    });
  }

  next();
};

/**
 * API version info endpoint handler
 */
const versionInfoHandler = (req, res) => {
  res.json({
    success: true,
    api: {
      name: 'TransparAI API',
      current: CURRENT_VERSION,
      supported: SUPPORTED_VERSIONS,
      deprecated: DEPRECATED_VERSIONS.map((v) => ({
        version: v,
        sunsetDate: '2026-01-01',
        migrationGuide: '/docs/api/migration',
      })),
    },
    endpoints: {
      v1: '/api/v1',
    },
    documentation: '/docs/api',
  });
};

module.exports = {
  apiVersionMiddleware,
  versionRouter,
  deprecateVersion,
  getVersionInfo,
  requireVersionFeature,
  versionInfoHandler,
  CURRENT_VERSION,
  SUPPORTED_VERSIONS,
};
