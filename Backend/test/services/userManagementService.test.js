jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked' }),
    verify: jest.fn().mockResolvedValue(true),
  })),
}));

const mongoose = require('mongoose');
const Invitation = require('../../models/Invitation');
const Organization = require('../../models/Organization');
const AuditLog = require('../../models/AuditLog');
const User = require('../../models/User');
const {
  inviteUser,
  acceptInvitation,
  updateUserRole,
  removeUser,
  getAuditLogs,
} = require('../../services/userManagementService');

describe('userManagementService', () => {
  beforeAll(() => {
    process.env.FRONTEND_URL = 'https://app.example.com';
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Invitation.deleteMany({}),
      Organization.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
  });

  const createOrganizationWithAdmin = async () => {
    const admin = await User.create({
      firebaseUid: `admin-${new mongoose.Types.ObjectId()}`,
      email: 'admin@example.com',
      plan: 'enterprise',
    });

    const organization = await Organization.create({
      name: 'Equipe IA',
      domain: `org-${Math.random().toString(36).slice(2)}.com`,
      adminUsers: [admin._id],
    });

    admin.organization = {
      id: organization._id,
      role: 'admin',
      joinedAt: new Date(),
    };
    await admin.save();

    return { admin, organization };
  };

  it('creates invitations and logs activity', async () => {
    const { admin, organization } = await createOrganizationWithAdmin();

    const result = await inviteUser({
      invitedByUserId: admin.firebaseUid,
      organizationId: organization._id,
      email: 'invitee@example.com',
      role: 'analyst',
    });

    expect(result.invitation.email).toBe('invitee@example.com');
    expect(await Invitation.countDocuments()).toBe(1);

    const logs = await AuditLog.find({ organizationId: organization._id });
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('user_invited');
  });

  it('accepts invitations and upgrades user organization state', async () => {
    const { admin, organization } = await createOrganizationWithAdmin();

    const { invitation } = await inviteUser({
      invitedByUserId: admin.firebaseUid,
      organizationId: organization._id,
      email: 'member@example.com',
      role: 'viewer',
    });

    await User.create({
      firebaseUid: 'member-uid',
      email: 'member@example.com',
      plan: 'starter',
    });

    const acceptance = await acceptInvitation({
      token: invitation.token,
      userId: 'member-uid',
    });

    expect(acceptance.role).toBe('viewer');

    const updated = await User.findOne({ firebaseUid: 'member-uid' });
    expect(updated.plan).toBe('enterprise');
    expect(updated.organization.id.toString()).toBe(organization._id.toString());
  });

  it('updates user roles respecting permissions', async () => {
    const { admin, organization } = await createOrganizationWithAdmin();

    const manager = await User.create({
      firebaseUid: 'manager-uid',
      email: 'manager@example.com',
      plan: 'enterprise',
      organization: {
        id: organization._id,
        role: 'manager',
        joinedAt: new Date(),
      },
    });

    await updateUserRole({
      currentUserId: admin.firebaseUid,
      targetUserId: manager.firebaseUid,
      newRole: 'analyst',
      organizationId: organization._id.toString(),
    });

    const refreshed = await User.findOne({ firebaseUid: manager.firebaseUid });
    expect(refreshed.organization.role).toBe('analyst');

    const logs = await AuditLog.find({ action: 'user_role_changed' });
    expect(logs.length).toBe(1);
  });

  it('removes users from organization and logs the action', async () => {
    const { admin, organization } = await createOrganizationWithAdmin();

    const target = await User.create({
      firebaseUid: 'remove-uid',
      email: 'remove@example.com',
      plan: 'enterprise',
      organization: {
        id: organization._id,
        role: 'analyst',
        joinedAt: new Date(),
      },
    });

    await removeUser({
      currentUserId: admin.firebaseUid,
      targetUserId: target.firebaseUid,
      organizationId: organization._id.toString(),
    });

    const refreshed = await User.findOne({ firebaseUid: target.firebaseUid });
    expect(refreshed.plan).toBe('starter');
    expect(refreshed.organization.id).toBeNull();

    const logs = await AuditLog.find({ action: 'user_removed' });
    expect(logs.length).toBeGreaterThan(0);
  });

  it('returns paginated audit logs', async () => {
    const { admin, organization } = await createOrganizationWithAdmin();

    for (let i = 0; i < 3; i += 1) {
      await AuditLog.create({
        userId: admin._id,
        organizationId: organization._id,
        action: 'user_invited',
        details: { idx: i },
      });
    }

    const logs = await getAuditLogs({
      userId: admin.firebaseUid,
      organizationId: organization._id.toString(),
      page: 1,
      limit: 2,
    });

    expect(logs.logs).toHaveLength(2);
    expect(logs.pagination.total).toBe(3);
  });
});
