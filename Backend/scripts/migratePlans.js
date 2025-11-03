// Backend/scripts/migratePlans.js
// Script to migrate users from 'starter' plan to 'free' plan

const mongoose = require('mongoose');
const User = require('../models/User');

const migratePlans = async () => {
  try {
    console.log('🔄 Starting plan migration...');
    
    // Update all users with 'starter' plan to 'free'
    const result = await User.updateMany(
      { plan: 'starter' },
      { plan: 'free' }
    );
    
    console.log(`✅ Migrated ${result.modifiedCount} users from 'starter' to 'free' plan`);
    
    // Also update any users with null/undefined plans
    const nullResult = await User.updateMany(
      { $or: [{ plan: null }, { plan: { $exists: false } }] },
      { plan: 'free' }
    );
    
    console.log(`✅ Fixed ${nullResult.modifiedCount} users with null/undefined plans`);
    
    console.log('🎉 Plan migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during plan migration:', error);
  }
};

module.exports = { migratePlans };

// Run if called directly
if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/transparai';
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('📡 Connected to MongoDB');
      return migratePlans();
    })
    .then(() => {
      console.log('🔌 Disconnecting from MongoDB');
      return mongoose.disconnect();
    })
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}