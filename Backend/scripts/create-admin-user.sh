#!/bin/bash

# Backend/scripts/create-admin-user.js
# Script to promote an existing user to admin or create new admin user

echo "🔐 TransparAI - Create Admin User"
echo "=================================="
echo ""

# Check if MongoDB URI is set
if [ -z "$MONGO_URI" ]; then
  echo "❌ Error: MONGO_URI environment variable not set"
  echo "   Please set it and try again:"
  echo "   export MONGO_URI='your-mongodb-connection-string'"
  exit 1
fi

# Create Node.js script
cat > /tmp/create-admin.js << 'EOFSCRIPT'
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const userSchema = new mongoose.Schema({
  firebaseUid: String,
  email: String,
  isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Ask for user email
    rl.question('Enter user email to promote to admin: ', async (email) => {
      try {
        const user = await User.findOne({ email: email.trim() });
        
        if (!user) {
          console.log(`\n❌ User not found with email: ${email}`);
          console.log('   Please ensure the user has signed up first.\n');
          process.exit(1);
        }

        if (user.isAdmin) {
          console.log(`\n⚠️  User ${email} is already an admin.\n`);
          process.exit(0);
        }

        // Promote to admin
        user.isAdmin = true;
        await user.save();

        console.log(`\n✅ Successfully promoted ${email} to admin!`);
        console.log(`   Firebase UID: ${user.firebaseUid}`);
        console.log(`   Admin Status: ${user.isAdmin}\n`);
        
        process.exit(0);
      } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
}

createAdmin();
EOFSCRIPT

# Run the script
node /tmp/create-admin.js

# Clean up
rm /tmp/create-admin.js
