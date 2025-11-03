const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const dashboardService = require('../../services/dashboardService');

jest.mock('firebase-admin');
jest.mock('../../services/dashboardService');

describe('Dashboard Routes', () => {
  beforeAll(async () => {
    const user = new User({ firebaseUid: 'test-uid', email: 'test@test.com', plan: 'starter' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/dashboard', () => {
    it('should return a 200 response with the dashboard data', async () => {
      const dashboardData = {
        success: true,
        data: {
          user: {},
          quota: {},
          recentAnalyses: [],
          statistics: {},
        },
      };

      dashboardService.getDashboardData.mockResolvedValue(dashboardData);

      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(dashboardData);
    });
  });
});
