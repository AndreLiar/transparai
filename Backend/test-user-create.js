// Test script to create a user for testing
const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid: 'test-uid-kanmegnea' });
    if (existingUser) {
      console.log('👤 User already exists:', existingUser.email);
      console.log('Current plan:', existingUser.plan);
      return;
    }

    // Create test user
    const testUser = new User({
      firebaseUid: 'test-uid-kanmegnea',
      email: 'kanmegnea@gmail.com',
      profile: {
        firstName: 'Kan',
        lastName: 'Megnea',
        isComplete: true,
      },
      plan: 'starter',
      monthlyQuota: {
        used: 0,
        limit: 20,
      },
    });

    const savedUser = await testUser.save();
    console.log('✅ Test user created successfully:');
    console.log('Email:', savedUser.email);
    console.log('Firebase UID:', savedUser.firebaseUid);
    console.log('Plan:', savedUser.plan);
    console.log('Quota:', savedUser.monthlyQuota);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

createTestUser();
