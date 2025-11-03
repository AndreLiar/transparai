const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const comparativeService = require('../../services/comparativeService');

jest.mock('firebase-admin');
jest.mock('../../services/comparativeService');

describe('Comparative Routes', () => {
  beforeAll(async () => {
    const user = new User({ firebaseUid: 'test-uid', email: 'test@test.com', plan: 'enterprise' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/comparative/compare', () => {
    it('should return a 200 response with the comparison result', async () => {
      const comparisonResult = {
        success: true,
        comparison: {
          id: 'test-comparison-id',
          documents: [],
          summary: 'This is a test summary.',
          strengths: [],
          improvements: [],
          detailedComparison: [],
          createdAt: new Date().toISOString(),
        },
      };

      comparativeService.processComparativeAnalysis.mockResolvedValue(comparisonResult);

      const res = await request(app)
        .post('/api/comparative/compare')
        .set('Authorization', 'Bearer test-token')
        .send({ documents: [{ text: 'doc1' }, { text: 'doc2' }] });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(comparisonResult);
    });
  });

  describe('GET /api/comparative/templates', () => {
    it('should return a 200 response with the templates', async () => {
      const res = await request(app)
        .get('/api/comparative/templates')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.templates).toBeDefined();
    });
  });
});
