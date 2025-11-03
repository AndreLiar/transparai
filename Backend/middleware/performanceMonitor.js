// Backend/middleware/performanceMonitor.js

/**
 * Performance monitoring middleware that tracks API response times and logs metrics
 */
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  // Skip monitoring for health checks and docs to reduce noise
  const skipPaths = ['/health', '/docs', '/favicon.ico'];
  const shouldSkip = skipPaths.some((path) => req.path.includes(path));

  if (shouldSkip) {
    return next();
  }

  // Monitor when response finishes
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    // Calculate metrics
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

    // Create performance log entry
    const performanceData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      endpoint: req.path,
      fullUrl: req.originalUrl,
      statusCode: res.statusCode,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      memoryDelta: Math.round(memoryDelta / 1024), // Convert to KB
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.uid || 'anonymous',
      contentLength: res.get('Content-Length') || 0,
    };

    // Color-coded console output based on performance
    let logLevel = '🟢'; // Green for good performance
    if (duration > 1000) {
      logLevel = '🔴'; // Red for slow responses (>1s)
    } else if (duration > 500) {
      logLevel = '🟡'; // Yellow for moderately slow (>500ms)
    }

    console.log(`${logLevel} API Performance:`, {
      endpoint: `${req.method} ${req.path}`,
      status: res.statusCode,
      duration: `${performanceData.duration}ms`,
      memory: `${performanceData.memoryDelta}KB`,
      user: performanceData.userId,
    });

    // Log detailed performance data for analysis
    if (process.env.NODE_ENV === 'production') {
      // In production, you would send this to your monitoring service
      // Example: sendToDataDog(performanceData) or sendToNewRelic(performanceData)
    }

    // Log slow requests for immediate attention
    if (duration > 1000) {
      console.warn('🐌 Slow Request Detected:', {
        ...performanceData,
        warning: 'Response time exceeded 1 second',
      });
    }

    // Log high memory usage
    if (memoryDelta > 10 * 1024 * 1024) { // More than 10MB
      console.warn('🧠 High Memory Usage:', {
        endpoint: `${req.method} ${req.path}`,
        memoryDelta: `${Math.round(memoryDelta / 1024 / 1024)}MB`,
        warning: 'Request consumed significant memory',
      });
    }

    // Track error rates
    if (res.statusCode >= 400) {
      console.error('❌ Error Response:', {
        endpoint: `${req.method} ${req.path}`,
        status: res.statusCode,
        duration: `${performanceData.duration}ms`,
        userId: performanceData.userId,
      });
    }
  });

  // Monitor for request timeout
  const timeout = setTimeout(() => {
    console.warn('⏰ Request Timeout Warning:', {
      endpoint: `${req.method} ${req.path}`,
      duration: '30+ seconds',
      userId: req.user?.uid || 'anonymous',
      warning: 'Request is taking unusually long',
    });
  }, 30000); // 30 seconds

  // Clear timeout when response finishes
  res.on('finish', () => {
    clearTimeout(timeout);
  });

  next();
};

module.exports = performanceMonitor;
