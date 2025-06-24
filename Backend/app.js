const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // ✅ Import this
const connectDB = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const exportRoutes = require('./routes/exportRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
connectDB();

// ✅ CORS must come first
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ Mount webhook FIRST with raw body parser
app.use('/api/webhook', bodyParser.raw({ type: 'application/json' }), webhookRoutes);

// ✅ Then mount JSON parser for the rest
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
app.use('/api/user', userRoutes);

// ✅ Health check
app.get('/health', (req, res) => {
  console.log('💚 Health check route hit');
  res.send('✅ Backend is working');
});

module.exports = app;
