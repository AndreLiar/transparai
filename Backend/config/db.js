const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (mongoose.connection.readyState >= 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    const error = 'MongoDB connection error: missing MONGODB_URI/MONGO_URI environment variable';
    console.error('❌', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw new Error(error);
  }

  console.log('🔄 Connecting to MongoDB...');
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // 15 second timeout
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name || 'default'}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Ready State: ${mongoose.connection.readyState}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error:', err.message);
    console.error('   Stack:', err.stack);
    console.error('❌ Application cannot start without database connection');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Exiting application due to database connection failure');
      process.exit(1);
    }
    throw err;
  }
};

module.exports = connectDB;
