const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const analyticsService = require('../../services/analyticsService');

jest.mock('firebase-admin');
jest.mock('../../services/analyticsService');

describe('Analytics Routes', () => {
  beforeAll(async () => {
    const user = new User({ firebaseUid: 'test-uid', email: 'test@test.com', plan: 'premium' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/analytics/advanced', () => {
    it('should return a 200 response with the analytics result', async () => {
      const analyticsResult = {
        success: true,
        analytics: {
          overview: {
            totalAnalyses: 10,
            averageScore: 80,
            mostCommonRisks: [],
            improvementTrend: 0,
          },
          trends: {
            analysisVolume: [],
            scoreDistribution: [],
            riskEvolution: [],
          },
          comparativeAnalytics: {
            totalComparisons: 0,
            averageDocumentsPerComparison: 0,
            mostComparedIndustries: [],
            competitiveInsights: {
              betterThanAverage: 0,
              topPerformingAreas: [],
            },
          },
          predictions: {
            nextMonthVolume: {
              predicted: 0,
              confidence: 0,
            },
            riskTrends: [],
          },
        },
      };

      analyticsService.getAdvancedAnalytics.mockResolvedValue(analyticsResult);

      const res = await request(app)
        .get('/api/analytics/advanced')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(analyticsResult);
    });
  });
});
