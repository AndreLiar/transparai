const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'gemini-test-key';
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
  process.env.STRIPE_PRICE_STANDARD = process.env.STRIPE_PRICE_STANDARD || 'price_standard';
  process.env.STRIPE_PRICE_PREMIUM = process.env.STRIPE_PRICE_PREMIUM || 'price_premium';
  process.env.STRIPE_PRICE_ENTERPRISE = process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise';
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'https://app.example.com';

  mongoServer = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      port: 0,
    },
  });

  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
