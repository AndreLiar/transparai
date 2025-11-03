const Organization = require('../../models/Organization');
const User = require('../../models/User');
const {
  createOrganization,
  getOrganizationDetails,
  updateOrganizationSettings,
  getOrganizationBilling,
} = require('../../services/organizationService');

describe('organizationService', () => {
  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});
  });

  it('creates organization and upgrades admin user', async () => {
    await User.create({
      firebaseUid: 'admin-uid',
      email: 'admin@example.com',
      plan: 'starter',
    });

    const org = await createOrganization({
      name: 'TransparAI',
      domain: 'transparai.com',
      adminUserId: 'admin-uid',
    });

    expect(org.name).toBe('TransparAI');
    expect(org.adminUsers).toHaveLength(1);

    const updatedUser = await User.findOne({ firebaseUid: 'admin-uid' });
    expect(updatedUser.plan).toBe('enterprise');
    expect(updatedUser.organization.role).toBe('admin');
  });

  it('returns organization details with analytics', async () => {
    await User.create({
      firebaseUid: 'admin-org',
      email: 'owner@example.com',
    });

    const org = await createOrganization({
      name: 'Equipe Juridique',
      domain: 'legalteam.com',
      adminUserId: 'admin-org',
    });

    await User.create({
      firebaseUid: 'member-uid',
      email: 'member@example.com',
      plan: 'enterprise',
      organization: {
        id: org._id,
        role: 'analyst',
        joinedAt: new Date('2024-01-01'),
      },
      analyses: [{
        source: 'upload',
        summary: 'Analyse 1',
        score: 'Bon',
        clauses: ['Clause'],
        createdAt: new Date(),
      }],
    });

    const details = await getOrganizationDetails({ organizationId: org._id.toString() });
    expect(details.users).toHaveLength(2);
    expect(details.analytics.totalUsers).toBe(2);
    expect(details.analytics.totalAnalyses).toBeGreaterThanOrEqual(1);
  });

  it('updates organization settings with validation', async () => {
    await User.create({ firebaseUid: 'admin-change', email: 'admin@change.com' });
    const org = await createOrganization({
      name: 'Original',
      domain: 'original.com',
      adminUserId: 'admin-change',
    });

    const updated = await updateOrganizationSettings({
      organizationId: org._id.toString(),
      updates: {
        name: 'Nouvelle Organisation',
        branding: { primaryColor: '#123456' },
      },
      userId: 'admin-change',
    });

    expect(updated.name).toBe('Nouvelle Organisation');
    expect(updated.settings.branding.primaryColor).toBe('#123456');
  });

  it('returns billing information with computed totals', async () => {
    await User.create({ firebaseUid: 'billing-admin', email: 'billing@example.com' });
    const org = await createOrganization({
      name: 'Billing Org',
      domain: 'billing.com',
      adminUserId: 'billing-admin',
    });

    const billing = await getOrganizationBilling({
      organizationId: org._id.toString(),
      userId: 'billing-admin',
    });

    expect(billing.currentUsers).toBe(1);
    expect(billing.costs.monthly).toBeGreaterThan(0);
    expect(billing.costs.yearly).toBeGreaterThan(billing.costs.monthly);
    expect(billing.nextBillingDate).toBeInstanceOf(Date);
  });
});
