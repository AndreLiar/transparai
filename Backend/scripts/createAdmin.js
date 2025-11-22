// Backend/scripts/createAdmin.js
/**
 * Script to promote a user to admin
 * Usage: node scripts/createAdmin.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Check if already admin
    if (user.isAdmin) {
      console.log(`ℹ️  User ${email} is already an admin`);
      process.exit(0);
    }

    // Promote to admin
    user.isAdmin = true;
    await user.save();

    console.log(`✅ User ${email} promoted to admin`);
    console.log(`   Firebase UID: ${user.firebaseUid}`);
    console.log(`   Current Plan: ${user.plan}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node scripts/createAdmin.js <email>');
  process.exit(1);
}

createAdmin(email);
