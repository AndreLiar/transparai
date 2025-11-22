// Backend/config/firebase.js
const admin = require('firebase-admin');

// Validate that service account is provided via environment variable
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.NODE_ENV !== 'test') {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is required. '
    + 'Please set it with your Firebase service account JSON string.',
  );
}

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

    // Validate service account structure
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email', 'private_key_id'];
    const missingFields = requiredFields.filter((field) => !serviceAccount[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Invalid Firebase service account: missing required fields: ${missingFields.join(', ')}`,
      );
    }

    // Validate service account type
    if (serviceAccount.type !== 'service_account') {
      throw new Error('Invalid Firebase service account: type must be "service_account"');
    }

    console.log('✅ Firebase service account validated successfully');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);
  } catch (error) {
    console.error('❌ Failed to parse or validate Firebase service account:', error.message);
    throw error;
  }
}

// Initialize Firebase Admin SDK
if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }
}

module.exports = admin;
