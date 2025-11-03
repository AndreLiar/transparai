const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const ErrorLog = require('../../models/ErrorLog');

jest.mock('firebase-admin');

describe('Admin Routes', () => {
  beforeAll(async () => {
    const user = new User({ firebaseUid: 'test-uid', email: 'test@test.com', plan: 'starter' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/admin/quota-analytics', () => {
    it('should return quota analytics', async () => {
      const res = await request(app)
        .get('/api/admin/quota-analytics')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.analytics).toBeDefined();
    });
  });

  describe('GET /api/admin/system-metrics', () => {
    it('should return system metrics', async () => {
      const res = await request(app)
        .get('/api/admin/system-metrics')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics).toBeDefined();
    });
  });
});
