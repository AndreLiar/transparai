// Backend/config/db.js
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
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);

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
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('❌ Application cannot start without database connection');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1); // Exit in production if DB connection fails
    }
  }
};

module.exports = connectDB;
