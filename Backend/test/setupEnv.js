// Load environment variables first
require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://root:password@localhost:27017/transparai_test?authSource=admin';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'gemini-test-key';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
process.env.STRIPE_PRICE_STANDARD = process.env.STRIPE_PRICE_STANDARD || 'price_standard';
process.env.STRIPE_PRICE_PREMIUM = process.env.STRIPE_PRICE_PREMIUM || 'price_premium';
process.env.STRIPE_PRICE_ENTERPRISE = process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://app.example.com';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_that_is_long_enough_for_security';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test_encryption_key_that_is_long_enough_too';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test_session_secret_that_is_long_enough';
process.env.FIREBASE_SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || JSON.stringify({
  type: 'service_account',
  project_id: 'test',
  private_key: 'test',
  client_email: 'test@test.com'
});
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';
process.env.PORT = process.env.PORT || '5001';
