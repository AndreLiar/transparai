const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const analyzeService = require('../../services/analyzeService');

jest.mock('firebase-admin');
jest.mock('../../services/analyzeService');

describe('Analyze Routes', () => {
  beforeAll(async () => {
    const user = new User({ firebaseUid: 'test-uid', email: 'test@test.com', plan: 'starter' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/analyze', () => {
    it('should return a 200 response with the analysis result', async () => {
      const analysisResult = {
        success: true,
        analysis: {
          id: 'test-analysis-id',
          fileName: 'test.txt',
          source: 'text',
          score: 80,
          grade: 'A',
          summary: 'This is a test summary.',
          risks: [],
          createdAt: new Date().toISOString(),
        },
        quotaRemaining: 19,
      };

      analyzeService.processAnalysis.mockResolvedValue(analysisResult);

      const res = await request(app)
        .post('/api/analyze')
        .set('Authorization', 'Bearer test-token')
        .send({ text: 'This is a test.', source: 'text' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(analysisResult);
    });
  });
});
