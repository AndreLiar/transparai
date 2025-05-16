//Backend/app.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();
connectDB();

// ✅ CORS must come first
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ Body parser second
app.use(express.json());

// ✅ Log every request
app.use((req, res, next) => {
  console.log('📥 Incoming request:', req.method, req.url);
  console.log('🧪 Headers:', req.headers);
  next();
});

// ✅ Then routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analyze', analyzeRoutes);

console.log('🟢 Defining health check route');
app.get('/health', (req, res) => {
  console.log('💚 Health check route hit');
  res.send('✅ Backend is working');
});

  

module.exports = app;

