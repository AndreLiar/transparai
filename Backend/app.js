const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
connectDB();

// ✅ CORS must come first
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ Mount webhook route BEFORE express.json
// So Stripe can read raw body to validate signature
app.use('/api/webhook', webhookRoutes);

// ✅ Then JSON body parsing middleware for everything else
app.use(express.json());

// ✅ Request logger
app.use((req, res, next) => {
  console.log('📥 Incoming request:', req.method, req.url);
  console.log('🧪 Headers:', req.headers);
  next();
});

// ✅ Other app routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/export', exportRoutes);

// ✅ Health check
app.get('/health', (req, res) => {
  console.log('💚 Health check route hit');
  res.send('✅ Backend is working');
});

module.exports = app;
