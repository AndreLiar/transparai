//Backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MongoDB connection error: missing MONGODB_URI/MONGO_URI environment variable');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
    
    // Run plan migration on startup to fix any existing users
    // Temporarily disabled to debug startup issues
    /*
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Running plan migration for production...');
      const { migratePlans } = require('../scripts/migratePlans');
      await migratePlans();
    }
    */
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

module.exports = connectDB;
