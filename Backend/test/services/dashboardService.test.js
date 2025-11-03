const User = require('../../models/User');
const { getDashboardData } = require('../../services/dashboardService');

describe('dashboardService.getDashboardData', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('creates a new user record when none exists', async () => {
    const data = await getDashboardData('new-firebase-uid', 'new@example.com');

    expect(data).toEqual(expect.objectContaining({
      plan: 'starter',
      quota: expect.objectContaining({ used: 0, limit: 20 }),
      analyses: [],
    }));

    const stored = await User.findOne({ firebaseUid: 'new-firebase-uid' });
    expect(stored).not.toBeNull();
    expect(stored.email).toBe('new@example.com');
  });

  it('resets monthly quota when month has changed', async () => {
    await User.create({
      firebaseUid: 'existing-uid',
      email: 'existing@example.com',
      plan: 'standard',
      monthlyQuota: { used: 5, limit: 20 },
      lastQuotaReset: new Date('2023-12-01'),
      analyses: [{
        source: 'text',
        summary: 'Ancienne analyse',
        score: 'Bon',
        clauses: ['Clause 1'],
        createdAt: new Date('2023-11-01'),
      }],
    });

    const data = await getDashboardData('existing-uid', 'existing@example.com');

    expect(data.plan).toBe('standard');
    expect(data.quota.used).toBe(0);
    expect(data.quota.limit).toBe(40);
    expect(data.analyses).toHaveLength(1);
  });
});
