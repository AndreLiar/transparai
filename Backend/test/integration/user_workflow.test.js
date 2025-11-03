const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Organization = require('../../models/Organization');
const Invitation = require('../../models/Invitation');
const AuditLog = require('../../models/AuditLog');

const mockVerifyIdToken = jest.fn();

jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: mockVerifyIdToken,
    deleteUser: jest.fn(),
  }),
  credential: { cert: jest.fn() },
  initializeApp: jest.fn(),
}));

jest.mock('../../services/emailService', () => ({
  sendInvitationEmail: jest.fn().mockResolvedValue({ success: true }),
}));

const { sendInvitationEmail } = require('../../services/emailService');

describe('User Management Integration', () => {
  beforeEach(async () => {
    mockVerifyIdToken.mockReset();
    sendInvitationEmail.mockClear();

    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Invitation.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
  });

  it('invites and accepts a user through the API', async () => {
    const adminUser = await User.create({
      firebaseUid: 'admin-uid',
      email: 'admin@example.com',
      plan: 'enterprise',
    });

    const organization = await Organization.create({
      name: 'TransparAI Test Org',
      domain: `org-${Date.now()}.com`,
      adminUsers: [adminUser._id],
    });

    adminUser.organization = {
      id: organization._id,
      role: 'admin',
      joinedAt: new Date(),
    };
    await adminUser.save();

    mockVerifyIdToken.mockResolvedValueOnce({
      uid: adminUser.firebaseUid,
      email: adminUser.email,
    });

    const inviteResponse = await request(app)
      .post(`/api/user-management/${organization._id}/invite`)
      .set('Authorization', 'Bearer admin-token')
      .send({
        email: 'member@example.com',
        role: 'analyst',
      });

    expect(inviteResponse.statusCode).toBe(201);
    expect(inviteResponse.body.invitation.email).toBe('member@example.com');
    expect(sendInvitationEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: 'member@example.com',
      organizationName: 'TransparAI Test Org',
      inviterName: 'admin@example.com',
      role: 'analyst',
    }));

    const storedInvitation = await Invitation.findOne({ email: 'member@example.com' });
    expect(storedInvitation).toBeTruthy();

    const member = await User.create({
      firebaseUid: 'member-uid',
      email: 'member@example.com',
      plan: 'starter',
    });

    mockVerifyIdToken.mockResolvedValueOnce({
      uid: member.firebaseUid,
      email: member.email,
    });

    const acceptResponse = await request(app)
      .post('/api/user-management/accept-invitation')
      .set('Authorization', 'Bearer member-token')
      .send({ token: storedInvitation.token });

    expect(acceptResponse.statusCode).toBe(200);
    expect(acceptResponse.body.role).toBe('analyst');
    expect(acceptResponse.body.organization.id).toBe(organization._id.toString());

    const updatedMember = await User.findOne({ firebaseUid: member.firebaseUid });
    expect(updatedMember.organization.id.toString()).toBe(organization._id.toString());
    expect(updatedMember.plan).toBe('enterprise');

    const auditActions = await AuditLog.find({ organizationId: organization._id });
    const actions = auditActions.map((log) => log.action);

    expect(actions).toEqual(expect.arrayContaining(['user_invited', 'user_joined']));
  });

  it('rejects invitation when authenticated user lacks permissions', async () => {
    const organization = await Organization.create({
      name: 'Limited Org',
      domain: `limited-${Date.now()}.com`,
    });

    const viewer = await User.create({
      firebaseUid: 'viewer-uid',
      email: 'viewer@example.com',
      plan: 'enterprise',
      organization: {
        id: organization._id,
        role: 'viewer',
        joinedAt: new Date(),
      },
    });

    mockVerifyIdToken.mockResolvedValueOnce({
      uid: viewer.firebaseUid,
      email: viewer.email,
    });

    const response = await request(app)
      .post(`/api/user-management/${organization._id}/invite`)
      .set('Authorization', 'Bearer viewer-token')
      .send({
        email: 'other@example.com',
        role: 'analyst',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Action non autorisée/i);
    expect(await Invitation.countDocuments()).toBe(0);
  });
});
