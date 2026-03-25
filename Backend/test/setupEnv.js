// Test environment variables — loaded before each test file
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb://localhost:27017/transparai_test';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long';
process.env.ENCRYPTION_KEY = 'test_encryption_key_32_chars_long!!';
process.env.SESSION_SECRET = 'test_session_secret_32_chars_long!';
process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
  type: 'service_account',
  project_id: 'test-project',
  private_key: '-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----\n',
  client_email: 'test@test-project.iam.gserviceaccount.com',
});
process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_placeholder';
process.env.STRIPE_PRICE_STANDARD = 'price_test_standard';
process.env.STRIPE_PRICE_PREMIUM = 'price_test_premium';
process.env.STRIPE_PRICE_ENTERPRISE = 'price_test_enterprise';
process.env.GEMINI_API_KEY = 'test_gemini_key';
process.env.LOG_LEVEL = 'silent';
