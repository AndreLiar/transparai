const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

jest.mock('firebase-admin');

describe('User Routes', () => {
  let token;

  beforeAll(async () => {
    const user = new User({ firebaseUid: 'test-uid', email: 'test@test.com', plan: 'starter' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('DELETE /api/user/me', () => {
    it('should delete the user account', async () => {
      const res = await request(app)
        .delete('/api/user/me')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Compte supprimé avec succès.');
    });
  });
});
