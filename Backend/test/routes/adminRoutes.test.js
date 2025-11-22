const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const ErrorLog = require('../../models/ErrorLog');

jest.mock('firebase-admin');

describe('Admin Routes', () => {
  let regularUser;
  let adminUser;

  beforeAll(async () => {
    // Create regular user
    regularUser = new User({
      firebaseUid: 'test-uid',
      email: 'test@test.com',
      plan: 'starter',
      isAdmin: false,
    });
    await regularUser.save();

    // Create admin user
    adminUser = new User({
      firebaseUid: 'admin-uid',
      email: 'admin@test.com',
      plan: 'premium',
      isAdmin: true,
    });
    await adminUser.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/admin/quota-analytics', () => {
    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .get('/api/admin/quota-analytics')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(403);
      expect(res.body.code).toBe('ADMIN_ACCESS_REQUIRED');
    });

    it('should return quota analytics for admin user', async () => {
      // Mock Firebase to return admin user
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'admin-uid' });
      require('firebase-admin').auth = jest.fn().mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });

      const res = await request(app)
        .get('/api/admin/quota-analytics')
        .set('Authorization', 'Bearer admin-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.analytics).toBeDefined();
    });
  });

  describe('GET /api/admin/system-metrics', () => {
    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .get('/api/admin/system-metrics')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(403);
      expect(res.body.code).toBe('ADMIN_ACCESS_REQUIRED');
    });

    it('should return system metrics for admin user', async () => {
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'admin-uid' });
      require('firebase-admin').auth = jest.fn().mockReturnValue({
        verifyIdToken: mockVerifyIdToken,
      });

      const res = await request(app)
        .get('/api/admin/system-metrics')
        .set('Authorization', 'Bearer admin-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics).toBeDefined();
    });
  });
});
