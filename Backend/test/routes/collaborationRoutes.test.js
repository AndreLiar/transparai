const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const SharedAnalysis = require('../../models/SharedAnalysis');
const Organization = require('../../models/Organization');

jest.mock('firebase-admin');

describe('Collaboration Routes', () => {
  let user;
  let organization;
  let analysis;

  beforeAll(async () => {
    organization = new Organization({ name: 'Test Org' });
    await organization.save();

    user = new User({
      firebaseUid: 'test-uid',
      email: 'test@test.com',
      plan: 'enterprise',
      organization: {
        id: organization._id,
        role: 'admin',
      },
    });
    await user.save();

    analysis = {
      analysisId: new mongoose.Types.ObjectId(),
      analysisType: 'single',
      title: 'Test Analysis',
      description: 'Test Description',
    };
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Organization.deleteMany({});
    await SharedAnalysis.deleteMany({});
  });

  describe('POST /api/collaboration/share', () => {
    it('should share an analysis', async () => {
      const res = await request(app)
        .post('/api/collaboration/share')
        .set('Authorization', 'Bearer test-token')
        .send(analysis);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Analyse partagée avec succès');
    });
  });

  describe('GET /api/collaboration/shared', () => {
    it('should get shared analyses', async () => {
      const res = await request(app)
        .get('/api/collaboration/shared')
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.sharedAnalyses).toBeDefined();
    });
  });

  describe('GET /api/collaboration/shared/:analysisId', () => {
    it('should get shared analysis details', async () => {
      const sharedAnalysis = new SharedAnalysis({ ...analysis, organizationId: organization._id, sharedBy: user._id, permissions: { canView: [user._id] } });
      await sharedAnalysis.save();

      const res = await request(app)
        .get(`/api/collaboration/shared/${sharedAnalysis._id}`)
        .set('Authorization', 'Bearer test-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(sharedAnalysis._id.toString());
    });
  });

  describe('POST /api/collaboration/shared/:analysisId/comments', () => {
    it('should add a comment to a shared analysis', async () => {
      const sharedAnalysis = new SharedAnalysis({ ...analysis, organizationId: organization._id, sharedBy: user._id, permissions: { canComment: [user._id] }, allowComments: true });
      await sharedAnalysis.save();

      const res = await request(app)
        .post(`/api/collaboration/shared/${sharedAnalysis._id}/comments`)
        .set('Authorization', 'Bearer test-token')
        .send({ content: 'This is a test comment.' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Commentaire ajouté avec succès');
    });
  });
});
