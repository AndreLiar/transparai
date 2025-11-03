// Backend/controllers/userManagementController.js
const {
  inviteUser,
  acceptInvitation,
  updateUserRole,
  removeUser,
  getAuditLogs,
} = require('../services/userManagementService');

const invite = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { uid } = req.user;
    const { organizationId } = req.params;

    if (!email || !role) {
      return res.status(400).json({
        message: 'Email et rôle sont requis.',
      });
    }

    const validRoles = ['admin', 'manager', 'analyst', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Rôle invalide.',
      });
    }

    const result = await inviteUser({
      invitedByUserId: uid,
      organizationId,
      email,
      role,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    return res.status(201).json({
      message: 'Invitation envoyée avec succès.',
      ...result,
    });
  } catch (err) {
    console.error('❌ Erreur invitation utilisateur :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de l\'invitation.' });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { token } = req.body;
    const { uid } = req.user;

    if (!token) {
      return res.status(400).json({
        message: 'Token d\'invitation requis.',
      });
    }

    const result = await acceptInvitation({
      token,
      userId: uid,
    });

    return res.json({
      message: 'Invitation acceptée avec succès.',
      ...result,
    });
  } catch (err) {
    console.error('❌ Erreur acceptation invitation :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de l\'acceptation.' });
  }
};

const changeRole = async (req, res) => {
  try {
    const { targetUserId, newRole } = req.body;
    const { uid } = req.user;
    const { organizationId } = req.params;

    if (!targetUserId || !newRole) {
      return res.status(400).json({
        message: 'ID utilisateur et nouveau rôle sont requis.',
      });
    }

    const validRoles = ['admin', 'manager', 'analyst', 'viewer'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        message: 'Rôle invalide.',
      });
    }

    const result = await updateUserRole({
      currentUserId: uid,
      targetUserId,
      newRole,
      organizationId,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    return res.json({
      message: 'Rôle mis à jour avec succès.',
      ...result,
    });
  } catch (err) {
    console.error('❌ Erreur changement rôle :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors du changement de rôle.' });
  }
};

const removeUserFromOrg = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const { uid } = req.user;
    const { organizationId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({
        message: 'ID utilisateur requis.',
      });
    }

    const result = await removeUser({
      currentUserId: uid,
      targetUserId,
      organizationId,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    return res.json({
      message: 'Utilisateur supprimé avec succès.',
      ...result,
    });
  } catch (err) {
    console.error('❌ Erreur suppression utilisateur :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la suppression.' });
  }
};

const getAuditHistory = async (req, res) => {
  try {
    const { uid } = req.user;
    const { organizationId } = req.params;
    const { page = 1, limit = 50, action } = req.query;

    const result = await getAuditLogs({
      userId: uid,
      organizationId,
      page: parseInt(page),
      limit: parseInt(limit),
      action,
    });

    return res.json(result);
  } catch (err) {
    console.error('❌ Erreur récupération logs :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la récupération des logs.' });
  }
};

const getPendingInvitations = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const Invitation = require('../models/Invitation');

    const invitations = await Invitation.find({
      organization: organizationId,
      status: 'pending',
    })
      .populate('invitedBy', 'email profile')
      .sort({ createdAt: -1 });

    return res.json({
      invitations: invitations.map((inv) => ({
        id: inv._id,
        email: inv.email,
        role: inv.role,
        invitedBy: inv.invitedBy,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
      })),
    });
  } catch (err) {
    console.error('❌ Erreur récupération invitations :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la récupération des invitations.' });
  }
};

const cancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;
    const { organizationId } = req.params;
    const Invitation = require('../models/Invitation');

    const invitation = await Invitation.findOne({
      _id: invitationId,
      organization: organizationId,
      status: 'pending',
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation introuvable.' });
    }

    invitation.status = 'cancelled';
    await invitation.save();

    return res.json({ message: 'Invitation annulée avec succès.' });
  } catch (err) {
    console.error('❌ Erreur annulation invitation :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de l\'annulation.' });
  }
};

module.exports = {
  invite,
  acceptInvite,
  changeRole,
  removeUserFromOrg,
  getAuditHistory,
  getPendingInvitations,
  cancelInvitation,
};
