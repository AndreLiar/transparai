// Backend/controllers/supportController.js
const User = require('../models/User');

const sendPrioritySupport = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { subject, message, urgency } = req.body;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Check if user has priority support (Standard, Premium, or Enterprise)
    if (user.plan === 'free' || user.plan === 'starter') {
      return res.status(403).json({
        error: 'Support prioritaire réservé aux abonnés Standard, Premium et Enterprise',
        suggestion: 'Utilisez le formulaire de contact général ou passez au plan Standard',
      });
    }

    // Priority levels based on plan
    let priorityLevel; let
      responseTime;
    switch (user.plan) {
      case 'enterprise':
        priorityLevel = 'CRITICAL';
        responseTime = urgency === 'critical' ? '15-30 minutes' : '2-6 heures';
        break;
      case 'premium':
        priorityLevel = 'HIGH';
        responseTime = '2-4 heures';
        break;
      case 'standard':
        priorityLevel = 'MEDIUM';
        responseTime = '12-24 heures';
        break;
      default:
        priorityLevel = 'MEDIUM';
        responseTime = '12-24 heures';
    }

    // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
    // For now, we'll log the support request
    console.log('🎫 Support prioritaire reçu:', {
      user: email,
      plan: user.plan,
      priority: priorityLevel,
      subject,
      message,
      urgency,
      timestamp: new Date().toISOString(),
    });

    // Enterprise users get additional handling
    if (user.plan === 'enterprise') {
      console.log('🏢 Enterprise support notification sent to dedicated team');
      // In real implementation: notify dedicated account manager
    }

    // In a real implementation, you would:
    // 1. Send email to support team with priority flag
    // 2. Create ticket in support system
    // 3. Send auto-response to user
    // 4. Log the request in database

    res.status(200).json({
      success: true,
      message: 'Votre demande de support prioritaire a été transmise avec succès.',
      priority: priorityLevel,
      estimatedResponse: responseTime,
      ticketId: `TKT-${Date.now()}`,
    });
  } catch (error) {
    console.error('❌ Erreur support prioritaire:', error.message);
    res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du support' });
  }
};

const getSupportInfo = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const supportInfo = {
      hasPrioritySupport: user.plan !== 'free' && user.plan !== 'starter',
      plan: user.plan,
      features: {
        free: {
          support: 'Formulaire de contact général',
          responseTime: '3-5 jours ouvrés',
          channels: ['contact form'],
        },
        starter: {
          support: 'Formulaire de contact général',
          responseTime: '3-5 jours ouvrés',
          channels: ['contact form'],
        },
        standard: {
          support: 'Support prioritaire par email',
          responseTime: '12-24 heures',
          channels: ['email', 'contact form'],
        },
        premium: {
          support: 'Support dédié haute priorité',
          responseTime: '2-4 heures',
          channels: ['email', 'priority line', 'contact form'],
        },
        enterprise: {
          support: 'Support dédié + Formation + Manager de compte',
          responseTime: '15min-6h (24/7)',
          channels: ['email', 'chat', 'phone', 'dedicated manager'],
          features: [
            'Manager de compte dédié',
            'Formation équipe incluse',
            'Support technique avancé',
            'Assistance à l\'implémentation',
            'Support 24/7 en cas d\'urgence critique',
            'Escalade immédiate pour problèmes business-critical',
          ],
        },
      },
    };

    res.status(200).json(supportInfo);
  } catch (error) {
    console.error('❌ Erreur info support:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  sendPrioritySupport,
  getSupportInfo,
};
