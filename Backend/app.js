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

const { apiLimiter, analysisBurstLimiter, analysisLimiter } = require('./middleware/rateLimiter');
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
const aiSettingsRoutes = require('./routes/aiSettingsRoutes');
const gdprRoutes = require('./routes/gdprRoutes');
const watchRoutes = require('./routes/watchRoutes');

const app = express();

// Initialize database connection immediately and synchronously
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('✅ Database initialization completed');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Exiting due to database connection failure');
      process.exit(1);
    }
    throw err;
  }
};

// Call database initialization
initializeDatabase();

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

// ✅ MVP routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analyze', analysisBurstLimiter, analysisLimiter, analyzeRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai-settings', aiSettingsRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/watch', watchRoutes);

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

// ✅ Basic Health check with uptime
app.get('/health', (_req, res) => {
  logger.info('Basic health check accessed');
  
  const uptimeSeconds = process.uptime();
  const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`;
  
  res.json({
    status: 'healthy',
    message: '✅ TransparAI Backend API is running',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: uptimeFormatted,
    monitoring: {
      appInsights: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? 'enabled' : 'disabled',
    },
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

// ✅ Global error handler (must be last)
app.use(globalErrorHandler);

module.exports = app;
