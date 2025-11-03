// Backend/services/organizationService.js
const Organization = require('../models/Organization');
const User = require('../models/User');

const createOrganization = async ({
  name, domain, adminUserId, branding = {},
}) => {
  // Check if domain is already taken
  if (domain) {
    const existingOrg = await Organization.findOne({ domain });
    if (existingOrg) {
      throw new Error('Ce domaine est déjà utilisé par une autre organisation.');
    }
  }

  // Find the admin user to get their MongoDB ObjectId
  const adminUser = await User.findOne({ firebaseUid: adminUserId });
  if (!adminUser) {
    throw new Error('Utilisateur administrateur introuvable.');
  }

  // Create organization
  const organization = new Organization({
    name,
    domain,
    settings: {
      branding: {
        logo: branding.logo || '',
        primaryColor: branding.primaryColor || '#4f46e5',
        secondaryColor: branding.secondaryColor || '#6b7280',
        companyName: branding.companyName || name,
      },
    },
    adminUsers: [adminUser._id], // Use MongoDB ObjectId instead of Firebase UID
    usage: {
      currentUsers: 1,
      totalAnalyses: 0,
      monthlyAnalyses: 0,
      lastMonthReset: new Date(),
    },
  });

  await organization.save();

  // Update the admin user
  await User.findOneAndUpdate(
    { firebaseUid: adminUserId },
    {
      plan: 'enterprise',
      organization: {
        id: organization._id,
        role: 'admin',
        joinedAt: new Date(),
      },
    },
  );

  return organization;
};

const getOrganizationDetails = async ({ organizationId }) => {
  const organization = await Organization.findById(organizationId)
    .populate('adminUsers', 'email profile.firstName profile.lastName');

  if (!organization) {
    throw new Error('Organisation introuvable.');
  }

  // Get all organization users
  const users = await User.find({ 'organization.id': organizationId })
    .select('email profile plan organization createdAt analyses');

  // Calculate usage analytics
  const totalAnalyses = users.reduce((sum, user) => sum + (user.analyses?.length || 0), 0);
  const monthlyAnalyses = users.reduce((sum, user) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCount = user.analyses?.filter((analysis) => {
      const analysisDate = new Date(analysis.createdAt || analysis.date);
      return analysisDate.getMonth() === currentMonth && analysisDate.getFullYear() === currentYear;
    }).length || 0;
    return sum + monthlyCount;
  }, 0);

  // Update usage statistics
  await Organization.findByIdAndUpdate(organizationId, {
    'usage.currentUsers': users.length,
    'usage.totalAnalyses': totalAnalyses,
    'usage.monthlyAnalyses': monthlyAnalyses,
  });

  return {
    ...organization.toObject(),
    users: users.map((user) => ({
      id: user._id,
      email: user.email,
      name: `${user.profile.firstName} ${user.profile.lastName}`.trim(),
      role: user.organization.role,
      joinedAt: user.organization.joinedAt,
      analysesCount: user.analyses?.length || 0,
    })),
    analytics: {
      totalUsers: users.length,
      totalAnalyses,
      monthlyAnalyses,
      averageAnalysesPerUser: users.length > 0 ? Math.round(totalAnalyses / users.length) : 0,
    },
  };
};

const updateOrganizationSettings = async ({ organizationId, updates, userId }) => {
  // Verify user is admin
  const user = await User.findOne({ firebaseUid: userId });
  if (!user || !user.organization.id || user.organization.id.toString() !== organizationId || user.organization.role !== 'admin') {
    throw new Error('Accès non autorisé. Seuls les administrateurs peuvent modifier les paramètres.');
  }

  const allowedUpdates = ['name', 'domain', 'settings.branding'];
  const updateData = {};

  // Safely extract allowed updates
  if (updates.name) updateData.name = updates.name;
  if (updates.domain) {
    // Check if new domain is available
    const existingOrg = await Organization.findOne({
      domain: updates.domain,
      _id: { $ne: organizationId },
    });
    if (existingOrg) {
      throw new Error('Ce domaine est déjà utilisé par une autre organisation.');
    }
    updateData.domain = updates.domain;
  }
  if (updates.branding) {
    updateData['settings.branding'] = {
      ...updates.branding,
    };
  }

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!organization) {
    throw new Error('Organisation introuvable.');
  }

  return organization;
};

const getOrganizationBilling = async ({ organizationId, userId }) => {
  // Verify user is admin
  const user = await User.findOne({ firebaseUid: userId });
  if (!user || !user.organization.id || user.organization.id.toString() !== organizationId
      || !['admin', 'manager'].includes(user.organization.role)) {
    throw new Error('Accès non autorisé. Seuls les administrateurs et managers peuvent voir la facturation.');
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new Error('Organisation introuvable.');
  }

  const { currentUsers } = organization.usage;
  const { pricePerUser } = organization.billing;
  const { billingCycle } = organization.billing;

  const monthlyTotal = currentUsers * pricePerUser;
  const yearlyTotal = monthlyTotal * 12 * 0.85; // 15% yearly discount

  return {
    currentUsers,
    maxUsers: organization.billing.maxUsers,
    pricePerUser,
    billingCycle,
    costs: {
      monthly: monthlyTotal,
      yearly: yearlyTotal,
    },
    nextBillingDate: getNextBillingDate(billingCycle),
    stripeCustomerId: organization.billing.stripeCustomerId,
  };
};

const getNextBillingDate = (cycle) => {
  const now = new Date();
  if (cycle === 'yearly') {
    return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  }
  return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

module.exports = {
  createOrganization,
  getOrganizationDetails,
  updateOrganizationSettings,
  getOrganizationBilling,
};
