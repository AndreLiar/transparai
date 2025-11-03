const request = require('supertest');
const crypto = require('crypto');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const Invitation = require('../../models/Invitation');

jest.mock('firebase-admin');

describe('User Management Routes', () => {
  let organization;

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Invitation.deleteMany({}),
    ]);

    const adminUser = await User.create({
      firebaseUid: 'admin-uid',
      email: 'admin@example.com',
      plan: 'enterprise',
    });

    organization = await Organization.create({
      name: 'TransparAI Org',
      domain: `org-${Date.now()}.com`,
      adminUsers: [adminUser._id],
    });

    adminUser.organization = {
      id: organization._id,
      role: 'admin',
      joinedAt: new Date(),
    };
    await adminUser.save();
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Invitation.deleteMany({}),
    ]);
  });

  describe('GET /api/user-management/:organizationId/pending-invitations', () => {
    it('returns pending invitations ordered by recency', async () => {
      const oldInvitation = await Invitation.create({
        organization: organization._id,
        email: 'old@example.com',
        role: 'viewer',
        status: 'pending',
        invitedBy: null,
        token: crypto.randomBytes(16).toString('hex'),
        createdAt: new Date(Date.now() - 1000 * 60),
      });

      const newInvitation = await Invitation.create({
        organization: organization._id,
        email: 'new@example.com',
        role: 'analyst',
        status: 'pending',
        invitedBy: null,
        token: crypto.randomBytes(16).toString('hex'),
        createdAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/user-management/${organization._id}/pending-invitations`)
        .set('Authorization', 'Bearer admin-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.invitations).toHaveLength(2);
      expect(res.body.invitations[0].email).toBe('new@example.com');
      expect(res.body.invitations[1].email).toBe('old@example.com');
      expect(res.body.invitations[0]).toEqual(expect.objectContaining({
        id: newInvitation._id.toString(),
        role: 'analyst',
      }));
    });
  });

  describe('POST /api/user-management/:organizationId/cancel-invitation', () => {
    it('marks invitation as cancelled and returns confirmation message', async () => {
      const invitation = await Invitation.create({
        organization: organization._id,
        email: 'pending@example.com',
        role: 'viewer',
        status: 'pending',
        invitedBy: null,
        token: crypto.randomBytes(16).toString('hex'),
        createdAt: new Date(),
      });

      const res = await request(app)
        .post(`/api/user-management/${organization._id}/cancel-invitation`)
        .set('Authorization', 'Bearer admin-token')
        .send({ invitationId: invitation._id.toString() });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Invitation annulée avec succès.');

      const refreshed = await Invitation.findById(invitation._id);
      expect(refreshed.status).toBe('cancelled');
    });

    it('returns 404 when invitation does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/user-management/${organization._id}/cancel-invitation`)
        .set('Authorization', 'Bearer admin-token')
        .send({ invitationId: fakeId.toString() });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Invitation introuvable.');
    });
  });
});
