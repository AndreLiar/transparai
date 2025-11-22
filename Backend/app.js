const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const connectDB = require('./config/db');
const performanceMonitor = require('./middleware/performanceMonitor');
const { runAllHealthChecks } = require('./middleware/healthChecks');
const logger = require('./utils/logger');
const { errorTracker, requestTimer, globalErrorHandler } = require('./middleware/errorTracker');

// Initialize Sentry for error monitoring
const {
  initSentry,
  requestHandler: sentryRequestHandler,
  tracingHandler: sentryTracingHandler,
  errorHandler: sentryErrorHandler,
} = require('./config/sentry');
const { apiLimiter, analysisLimiter } = require('./middleware/rateLimiter');
const { corsOptions } = require('./middleware/corsConfig');
const { apiVersionMiddleware, versionInfoHandler } = require('./middleware/apiVersioning');
const {
  securityHeaders,
  environmentSecurity,
  sanitizeInput,
  noSQLInjectionProtection,
  securityLogger,
} = require('./middleware/security');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const exportRoutes = require('./routes/exportRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const supportRoutes = require('./routes/supportRoutes');
const comparativeRoutes = require('./routes/comparativeRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const documentLibraryRoutes = require('./routes/documentLibraryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiSettingsRoutes = require('./routes/aiSettingsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const gdprRoutes = require('./routes/gdprRoutes');

const app = express();
connectDB();

// ✅ Initialize Sentry error monitoring
initSentry(app);

// ✅ Sentry request handler (must be first middleware)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// ✅ SECURITY: HTTPS enforcement must come FIRST (before CORS)
app.use(environmentSecurity);

// ✅ SECURITY: Apply security headers globally
app.use(securityHeaders);

// ✅ CORS configuration with strict whitelist validation
app.use(cors(corsOptions));

// ✅ Request timing middleware
app.use(requestTimer);

// ✅ SECURITY: Input sanitization and NoSQL injection protection
app.use(sanitizeInput);
app.use(noSQLInjectionProtection);

// ✅ SECURITY: Security event logging
app.use(securityLogger);

// ✅ Mount webhook FIRST with raw body parser (before JSON parser)
app.use('/api/webhook', bodyParser.raw({ type: 'application/json' }), webhookRoutes);

// ✅ Then mount JSON parser for the rest
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Performance monitoring middleware
app.use(performanceMonitor);

// ✅ API Versioning middleware
app.use('/api', apiVersionMiddleware);

// ✅ API Version info endpoint
app.get('/api/version', versionInfoHandler);

// ✅ Rate limiting for all API routes
app.use('/api', apiLimiter);

// ✅ API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TransparAI API Documentation',
}));

// ✅ Request logger using Winston
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });

  next();
});

// ✅ Other app routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analyze', analysisLimiter, analyzeRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/comparative', comparativeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/documents', documentLibraryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-settings', aiSettingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/gdpr', gdprRoutes);

// ✅ Root route for health checks
app.get('/', (_req, res) => {
  console.log('🏠 Root endpoint accessed');
  res.json({
    status: 'healthy',
    message: '✅ TransparAI Backend API',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    nodeEnv: process.env.NODE_ENV,
  });
});

// ✅ Basic Health check
app.get('/health', (_req, res) => {
  logger.info('Basic health check accessed');
  res.json({
    status: 'healthy',
    message: '✅ Backend is working',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
  });
});

// ✅ Detailed Health check
app.get('/health/detailed', async (_req, res) => {
  logger.info('Detailed health check accessed');
  try {
    const healthData = await runAllHealthChecks();
    const statusCode = healthData.status === 'healthy' ? 200
      : healthData.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error: error.message, stack: error.stack });
    res.status(503).json({
      status: 'unhealthy',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ✅ Error tracking middleware
app.use(errorTracker);

// ✅ Sentry error handler (must be before global error handler)
app.use(sentryErrorHandler());

// ✅ Global error handler (must be last)
app.use(globalErrorHandler);

module.exports = app;
