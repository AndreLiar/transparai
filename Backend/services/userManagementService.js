const User = require('../models/User');
const Invitation = require('../models/Invitation');
const Organization = require('../models/Organization');
const AuditLog = require('../models/AuditLog');
const { sendInvitationEmail } = require('./emailService');
const crypto = require('crypto');

const inviteUser = async ({ invitedByUserId, organizationId, email, role, metadata }) => {
  const inviter = await User.findOne({ firebaseUid: invitedByUserId });
  if (!inviter) throw new Error('Inviteur non trouvé');

  if (inviter.organization.role !== 'admin' && inviter.organization.role !== 'manager') {
    throw new Error('Action non autorisée');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.organization && existingUser.organization.id.toString() === organizationId) {
    throw new Error('Un utilisateur avec cet email existe déjà dans cette organisation');
  }

  const existingInvitation = await Invitation.findOne({ email, organization: organizationId, status: 'pending' });
  if (existingInvitation) {
    throw new Error('Une invitation a déjà été envoyée à cet email pour cette organisation');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const invitation = new Invitation({
    email,
    role,
    organization: organizationId,
    invitedBy: inviter._id,
    token,
  });

  await invitation.save();

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new Error('Organisation non trouvée.');
  }
  const inviterName = inviter.profile && inviter.profile.firstName
    ? [inviter.profile.firstName, inviter.profile.lastName].filter(Boolean).join(' ')
    : inviter.email;

  await sendInvitationEmail({
    email,
    organizationName: organization.name,
    inviterName,
    role,
    invitationToken: invitation.token,
  });

  await AuditLog.create({
    userId: inviter._id,
    organizationId,
    action: 'user_invited',
    details: { invitedEmail: email, role },
    ...metadata,
  });

  return { invitation };
};

const acceptInvitation = async ({ token, userId }) => {
  const invitation = await Invitation.findOne({ token, status: 'pending' });

  if (!invitation) {
    throw new Error('Invitation invalide ou expirée.');
  }

  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    throw new Error('Utilisateur non trouvé.');
  }

  const organization = await Organization.findById(invitation.organization);
  if (!organization) {
    throw new Error('Organisation non trouvée.');
  }

  user.organization = {
    id: organization._id,
    role: invitation.role,
    joinedAt: new Date(),
  };

  // Upgrade user plan to organization's plan
  user.plan = organization.plan || user.plan;

  await user.save();

  invitation.status = 'accepted';
  await invitation.save();

  await AuditLog.create({
    userId: user._id,
    organizationId: organization._id,
    action: 'user_joined',
    details: { role: invitation.role },
  });

  return { organization: { name: organization.name, id: organization._id }, role: invitation.role };
};

const updateUserRole = async ({ currentUserId, targetUserId, newRole, organizationId, metadata }) => {
  const currentUser = await User.findOne({ firebaseUid: currentUserId });
  const targetUser = await User.findOne({ firebaseUid: targetUserId });

  if (!currentUser || !targetUser) {
    throw new Error('Utilisateur non trouvé.');
  }

  if (currentUser.organization.id.toString() !== organizationId || targetUser.organization.id.toString() !== organizationId) {
    throw new Error('Les utilisateurs ne font pas partie de la même organisation.');
  }

  // Permission check
  const rolesHierarchy = ['viewer', 'analyst', 'manager', 'admin'];
  const currentUserRoleIndex = rolesHierarchy.indexOf(currentUser.organization.role);
  const targetUserRoleIndex = rolesHierarchy.indexOf(targetUser.organization.role);
  const newRoleIndex = rolesHierarchy.indexOf(newRole);

  if (currentUserRoleIndex < newRoleIndex || currentUserRoleIndex <= targetUserRoleIndex) {
    throw new Error('Permission refusée.');
  }

  const oldRole = targetUser.organization.role;
  targetUser.organization.role = newRole;
  await targetUser.save();

  await AuditLog.create({
    userId: currentUser._id,
    organizationId,
    action: 'user_role_changed',
    details: { targetUserId: targetUser._id, oldRole, newRole },
    ...metadata,
  });

  return { userId: targetUserId, oldRole, newRole };
};

const removeUser = async ({ currentUserId, targetUserId, organizationId, metadata }) => {
  const currentUser = await User.findOne({ firebaseUid: currentUserId });
  const targetUser = await User.findOne({ firebaseUid: targetUserId });

  if (!currentUser || !targetUser) {
    throw new Error('Utilisateur non trouvé.');
  }

  if (currentUser.organization.id.toString() !== organizationId || targetUser.organization.id.toString() !== organizationId) {
    throw new Error('Les utilisateurs ne font pas partie de la même organisation.');
  }

  // Permission check
  const rolesHierarchy = ['viewer', 'analyst', 'manager', 'admin'];
  const currentUserRoleIndex = rolesHierarchy.indexOf(currentUser.organization.role);
  const targetUserRoleIndex = rolesHierarchy.indexOf(targetUser.organization.role);

  if (currentUserRoleIndex <= targetUserRoleIndex) {
    throw new Error('Permission refusée.');
  }

  const removedEmail = targetUser.email;
  targetUser.organization = {
    id: null,
    role: null,
    joinedAt: null,
  };
  targetUser.plan = 'starter'; // Downgrade to starter plan
  await targetUser.save();

  await AuditLog.create({
    userId: currentUser._id,
    organizationId,
    action: 'user_removed',
    details: { removedUserId: targetUser._id, removedEmail },
    ...metadata,
  });

  return { userId: targetUserId, email: removedEmail };
};

const getAuditLogs = async ({ userId, organizationId, page = 1, limit = 50, action }) => {
  const user = await User.findOne({ firebaseUid: userId });
  if (!user || user.organization.id.toString() !== organizationId || user.organization.role !== 'admin') {
    throw new Error('Action non autorisée.');
  }

  const query = { organizationId };
  if (action) {
    query.action = action;
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: 'userId',
  };

  const result = await AuditLog.paginate(query, options);

  return {
    logs: result.docs,
    pagination: {
      total: result.totalDocs,
      limit: result.limit,
      page: result.page,
      pages: result.totalPages,
    },
  };
};

module.exports = {
  inviteUser,
  acceptInvitation,
  updateUserRole,
  removeUser,
  getAuditLogs,
};
