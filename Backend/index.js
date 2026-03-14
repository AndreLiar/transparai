// Backend/index.js
require('dotenv').config();

// Initialise Application Insights FIRST — must be before any other require
// so the SDK can auto-instrument Express, Mongoose, and outbound HTTP calls.
const { initAppInsights } = require('./config/appInsights');
initAppInsights();

// Validate environment variables before starting the application
const { validateEnvironmentVariables } = require('./middleware/envValidation');

validateEnvironmentVariables();

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  console.error('❌ Promise:', promise);
  process.exit(1);
});

const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('✅ Application startup completed successfully');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server Error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});
