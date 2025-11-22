// Backend/index.js
require('dotenv').config();

// Initialize New Relic FIRST (must be before any other requires)
const { initNewRelic } = require('./config/newrelic');

const newrelic = initNewRelic();

// Validate environment variables before starting the application
const { validateEnvironmentVariables } = require('./middleware/envValidation');

validateEnvironmentVariables();

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL}`);
});
