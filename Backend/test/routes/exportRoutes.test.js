const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

jest.mock('firebase-admin');

describe('Export Routes', () => {
  let user;

  beforeAll(async () => {
    user = new User({
      firebaseUid: 'test-uid',
      email: 'test@test.com',
      plan: 'premium',
      analyses: [
        {
          _id: new mongoose.Types.ObjectId(),
          score: 'Excellent',
          summary: 'This is a test summary.',
          clauses: ['clause 1', 'clause 2'],
        },
      ],
    });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/export/:analysisId', () => {
    it('should return a 200 response with a PDF file', async () => {
      const analysisId = user.analyses[0]._id;

      const res = await request(app)
        .get(`/api/export/${analysisId}`)
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('application/pdf');
    });
  });
});
