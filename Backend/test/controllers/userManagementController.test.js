const {
  invite,
  acceptInvite,
  changeRole,
} = require('../../controllers/userManagementController');
const userManagementService = require('../../services/userManagementService');

jest.mock('../../services/userManagementService', () => ({
  inviteUser: jest.fn(),
  acceptInvitation: jest.fn(),
  updateUserRole: jest.fn(),
  removeUser: jest.fn(),
  getAuditLogs: jest.fn(),
}));

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const baseRequest = () => ({
  body: {},
  params: { organizationId: 'org-123' },
  user: { uid: 'inviter-uid' },
  ip: '127.0.0.1',
  get: jest.fn().mockImplementation((header) => {
    if (header === 'User-Agent') {
      return 'jest-agent';
    }
    return undefined;
  }),
});

describe('userManagementController.invite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userManagementService.inviteUser.mockResolvedValue({
      invitation: { id: 'inv-1' },
    });
  });

  it('returns 400 when email or role is missing', async () => {
    const req = baseRequest();
    const res = createMockResponse();

    await invite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email et rôle sont requis.',
    });
    expect(userManagementService.inviteUser).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid role', async () => {
    const req = baseRequest();
    req.body = { email: 'member@example.com', role: 'superadmin' };
    const res = createMockResponse();

    await invite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rôle invalide.',
    });
    expect(userManagementService.inviteUser).not.toHaveBeenCalled();
  });

  it('calls inviteUser service with metadata and returns 201 on success', async () => {
    const req = baseRequest();
    req.body = { email: 'member@example.com', role: 'analyst' };
    const res = createMockResponse();

    await invite(req, res);

    expect(userManagementService.inviteUser).toHaveBeenCalledWith(expect.objectContaining({
      invitedByUserId: 'inviter-uid',
      organizationId: 'org-123',
      email: 'member@example.com',
      role: 'analyst',
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'jest-agent',
      },
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invitation envoyée avec succès.',
      invitation: { id: 'inv-1' },
    }));
  });
});

describe('userManagementController.acceptInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when token is missing', async () => {
    const req = baseRequest();
    const res = createMockResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token d\'invitation requis.',
    });
    expect(userManagementService.acceptInvitation).not.toHaveBeenCalled();
  });

  it('delegates to acceptInvitation service and returns payload', async () => {
    const req = baseRequest();
    req.body = { token: 'invite-token' };
    const res = createMockResponse();

    userManagementService.acceptInvitation.mockResolvedValue({
      organization: { id: 'org-123', name: 'TransparAI' },
      role: 'analyst',
    });

    await acceptInvite(req, res);

    expect(userManagementService.acceptInvitation).toHaveBeenCalledWith({
      token: 'invite-token',
      userId: 'inviter-uid',
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invitation acceptée avec succès.',
      organization: { id: 'org-123', name: 'TransparAI' },
      role: 'analyst',
    }));
  });
});

describe('userManagementController.changeRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when target user id or new role is missing', async () => {
    const req = baseRequest();
    const res = createMockResponse();

    await changeRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'ID utilisateur et nouveau rôle sont requis.',
    });
    expect(userManagementService.updateUserRole).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid new role', async () => {
    const req = baseRequest();
    req.body = { targetUserId: 'member-uid', newRole: 'guest' };
    const res = createMockResponse();

    await changeRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rôle invalide.',
    });
    expect(userManagementService.updateUserRole).not.toHaveBeenCalled();
  });

  it('updates role via service and returns success payload', async () => {
    const req = baseRequest();
    req.body = { targetUserId: 'member-uid', newRole: 'manager' };
    const res = createMockResponse();

    userManagementService.updateUserRole.mockResolvedValue({
      targetUserId: 'member-uid',
      oldRole: 'analyst',
      newRole: 'manager',
    });

    await changeRole(req, res);

    expect(userManagementService.updateUserRole).toHaveBeenCalledWith(expect.objectContaining({
      currentUserId: 'inviter-uid',
      targetUserId: 'member-uid',
      newRole: 'manager',
      organizationId: 'org-123',
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Rôle mis à jour avec succès.',
      newRole: 'manager',
    }));
  });
});
