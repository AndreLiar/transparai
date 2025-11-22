// Backend/scripts/unlockAccount.js
/**
 * Script to unlock a user account that has been locked due to failed attempts
 * Usage: node scripts/unlockAccount.js <email_or_uid>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const FailedAttempt = require('../models/FailedAttempt');

const unlockAccount = async (identifier) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all failed attempts for this identifier
    const result = await FailedAttempt.deleteMany({ identifier });

    if (result.deletedCount === 0) {
      console.log(`ℹ️  No failed attempts found for: ${identifier}`);
      console.log('   Account is not locked');
    } else {
      console.log(`✅ Unlocked account: ${identifier}`);
      console.log(`   Removed ${result.deletedCount} failed attempt(s)`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Get identifier from command line
const identifier = process.argv[2];

if (!identifier) {
  console.error('❌ Usage: node scripts/unlockAccount.js <email_or_uid>');
  process.exit(1);
}

unlockAccount(identifier);
