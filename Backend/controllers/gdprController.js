// Backend/controllers/gdprController.js
const User = require('../models/User');
const Analysis = require('../models/Analysis');
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

    const analyses = await Analysis.find(
      { firebaseUid: uid },
      { _id: 1, source: 1, score: 1, summary: 1, createdAt: 1 },
    ).lean();

    const userData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.1',
      user: {
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt,
        quota: user.monthlyQuota,
        consent: user.consent,
      },
      analyses: analyses.map((a) => ({
        id: a._id,
        source: a.source,
        score: a.score,
        summary: a.summary,
        createdAt: a.createdAt,
      })),
      statistics: {
        totalAnalyses: analyses.length,
      },
    };

    logger.logDataExport({
      uid,
      email: user.email,
      dataTypes: ['user', 'analyses'],
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

    // Delete all user data (GDPR Art. 17 — includes all linked analyses)
    await Promise.all([
      User.deleteOne({ firebaseUid: uid }),
      Analysis.deleteMany({ firebaseUid: uid }),
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

/**
 * Record explicit AI processing consent (GDPR Art. 22 — automated decision-making,
 * and third-party processor notice: Google Gemini + OpenAI)
 */
const updateAIConsent = async (req, res) => {
  try {
    const { uid } = req.user;
    const { aiProcessing } = req.body;

    if (typeof aiProcessing !== 'boolean') {
      return res.status(400).json({
        error: 'Le champ aiProcessing doit être un booléen',
        code: 'INVALID_INPUT',
      });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé', code: 'USER_NOT_FOUND' });
    }

    user.consent.aiProcessing = aiProcessing;
    user.consent.aiProcessingDate = new Date();
    user.consent.lastUpdated = new Date();
    await user.save();

    logger.info('AI processing consent updated', { uid, aiProcessing });

    res.json({
      success: true,
      consent: {
        aiProcessing: user.consent.aiProcessing,
        aiProcessingDate: user.consent.aiProcessingDate,
      },
      message: aiProcessing
        ? 'Consentement au traitement IA accordé. Vos documents seront traités par Google Gemini et/ou OpenAI.'
        : 'Consentement au traitement IA retiré. Vous ne pourrez plus utiliser les fonctions d\'analyse.',
    });
  } catch (error) {
    logger.error('AI consent update failed', { error: error.message, uid: req.user?.uid });
    res.status(500).json({ error: 'Échec de la mise à jour du consentement IA', code: 'AI_CONSENT_UPDATE_FAILED' });
  }
};

module.exports = {
  exportUserData,
  deleteUserAccount,
  getConsentStatus,
  updateConsent,
  updateAIConsent,
  getRetentionPolicy,
};
