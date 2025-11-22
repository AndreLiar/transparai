// Backend/controllers/gdprController.js
const User = require('../models/User');
const SharedAnalysis = require('../models/SharedAnalysis');
const Session = require('../models/Session');
const logger = require('../utils/logger');

/**
 * Export user data (GDPR Article 20 - Right to data portability)
 */
const exportUserData = async (req, res) => {
  try {
    const { uid } = req.user;

    // Get user data
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    // Get user analyses (stored in user document)
    const analyses = user.analyses || [];
    
    // Get shared analyses
    const sharedAnalyses = await SharedAnalysis.find({ 'collaborators.firebaseUid': uid })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Get active sessions
    const sessions = await Session.find({ firebaseUid: uid, isActive: true })
      .select('deviceInfo createdAt lastActivity -_id');

    // Compile user data
    const userData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        analysisCount: user.analysisCount,
        quota: {
          monthly: user.monthlyQuota,
          currentUsage: user.currentUsage,
        },
        aiSettings: user.aiSettings,
        preferences: user.preferences,
      },
      analyses: analyses.map((a) => ({
        id: a._id,
        documentName: a.documentName,
        source: a.source,
        score: a.score,
        createdAt: a.createdAt,
        issues: a.issues,
        summary: a.summary,
      })),
      sharedAnalyses: sharedAnalyses.map((sa) => ({
        id: sa._id,
        documentName: sa.documentName,
        createdAt: sa.createdAt,
        role: sa.collaborators.find(c => c.firebaseUid === uid)?.role || 'viewer',
      })),
      activeSessions: sessions,
      statistics: {
        totalAnalyses: analyses.length,
        totalSharedAnalyses: sharedAnalyses.length,
        averageScore: analyses.length > 0
          ? (analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length).toFixed(2)
          : 0,
      },
    };

    // Log export event
    logger.logDataExport({
      uid,
      email: user.email,
      dataTypes: ['user', 'analyses', 'sessions'],
      recordCount: analyses.length,
      ip: req.ip,
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="transparai-data-${uid}-${Date.now()}.json"`);

    res.json(userData);
  } catch (error) {
    logger.error('Data export failed', {
      error: error.message,
      stack: error.stack,
      uid: req.user?.uid,
    });

    res.status(500).json({
      error: 'Échec de l\'exportation des données',
      code: 'EXPORT_FAILED',
    });
  }
};

/**
 * Delete user account and all data (GDPR Article 17 - Right to erasure)
 */
const deleteUserAccount = async (req, res) => {
  try {
    const { uid } = req.user;
    const { confirmation } = req.body;

    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        error: 'Confirmation requise',
        code: 'CONFIRMATION_REQUIRED',
        required: 'DELETE_MY_ACCOUNT',
      });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    // Log deletion request
    logger.logSecurityEvent('USER_ACCOUNT_DELETION', {
      uid,
      email: user.email,
      plan: user.plan,
      analysisCount: user.analysisCount,
      severity: 'high',
      ip: req.ip,
    });

    // Delete all user data
    await Promise.all([
      Session.deleteMany({ firebaseUid: uid }),
      SharedAnalysis.updateMany(
        { 'collaborators.firebaseUid': uid },
        { $pull: { collaborators: { firebaseUid: uid } } }
      ),
      User.deleteOne({ firebaseUid: uid }),
    ]);

    logger.info('User account deleted', {
      uid,
      email: user.email,
    });

    res.json({
      success: true,
      message: 'Votre compte et toutes vos données ont été supprimés',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Account deletion failed', {
      error: error.message,
      stack: error.stack,
      uid: req.user?.uid,
    });

    res.status(500).json({
      error: 'Échec de la suppression du compte',
      code: 'DELETION_FAILED',
    });
  }
};

/**
 * Get user consent status
 */
const getConsentStatus = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    const consent = user.consent || {
      analytics: false,
      marketing: false,
      dataProcessing: true, // Required for service
      lastUpdated: user.createdAt,
    };

    res.json({
      success: true,
      consent,
    });
  } catch (error) {
    logger.error('Failed to fetch consent status', {
      error: error.message,
      uid: req.user?.uid,
    });

    res.status(500).json({
      error: 'Échec de la récupération du consentement',
      code: 'CONSENT_FETCH_FAILED',
    });
  }
};

/**
 * Update user consent
 */
const updateConsent = async (req, res) => {
  try {
    const { uid } = req.user;
    const { analytics, marketing } = req.body;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    // Update consent
    user.consent = {
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      dataProcessing: true, // Always true (required for service)
      lastUpdated: new Date(),
    };

    await user.save();

    logger.info('User consent updated', {
      uid,
      consent: user.consent,
    });

    res.json({
      success: true,
      consent: user.consent,
      message: 'Préférences de consentement mises à jour',
    });
  } catch (error) {
    logger.error('Consent update failed', {
      error: error.message,
      uid: req.user?.uid,
    });

    res.status(500).json({
      error: 'Échec de la mise à jour du consentement',
      code: 'CONSENT_UPDATE_FAILED',
    });
  }
};

/**
 * Get data retention policy
 */
const getRetentionPolicy = (req, res) => {
  res.json({
    success: true,
    policy: {
      analyses: {
        retention: '2 years',
        description: 'Analyses are retained for 2 years after creation',
      },
      sessions: {
        retention: '30 days',
        description: 'Session data is deleted after 30 days of inactivity',
      },
      failedAttempts: {
        retention: '24 hours',
        description: 'Failed login attempts are deleted after 24 hours',
      },
      webhookEvents: {
        retention: '90 days',
        description: 'Webhook events are deleted after 90 days',
      },
      accountDeletion: {
        process: 'immediate',
        description: 'All data is deleted immediately upon account deletion',
      },
    },
    contact: {
      dpo: 'dpo@transparai.com',
      privacy: 'privacy@transparai.com',
    },
  });
};

module.exports = {
  exportUserData,
  deleteUserAccount,
  getConsentStatus,
  updateConsent,
  getRetentionPolicy,
};
