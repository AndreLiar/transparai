// Backend/services/supportService.js
const User = require('../models/User');

const getSupportInfo = async (firebaseUid) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) throw new Error('Utilisateur non trouvé');

  const supportFeatures = {
    starter: {
      support: 'Email communautaire',
      responseTime: '48-72h',
      channels: ['email'],
      priority: 'normal',
    },
    standard: {
      support: 'Email prioritaire',
      responseTime: '24-48h',
      channels: ['email'],
      priority: 'high',
    },
    premium: {
      support: 'Email + Chat',
      responseTime: '12-24h',
      channels: ['email', 'chat'],
      priority: 'urgent',
    },
    enterprise: {
      support: 'Support dédié + Formation',
      responseTime: '4-12h (24/7)',
      channels: ['email', 'chat', 'phone', 'dedicated'],
      priority: 'critical',
      features: [
        'Manager de compte dédié',
        'Formation équipe incluse',
        'Support technique avancé',
        'Assistance à l\'implémentation',
        'Support 24/7 en cas d\'urgence',
      ],
    },
  };

  const currentPlan = user.plan || 'starter';
  const hasPrioritySupport = ['standard', 'premium', 'enterprise'].includes(currentPlan);

  return {
    plan: currentPlan,
    hasPrioritySupport,
    features: supportFeatures,
    userInfo: {
      email: user.email,
      organization: user.organization || null,
      teamSize: user.teamSize || 1,
    },
  };
};

const createSupportTicket = async (firebaseUid, ticketData) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) throw new Error('Utilisateur non trouvé');

  const {
    subject, message, urgency, category,
  } = ticketData;

  // Generate ticket ID
  const ticketId = `TPAI-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Determine response time based on plan and urgency
  const responseTimeMap = {
    starter: { low: '72h', medium: '48h', high: '24h' },
    standard: { low: '48h', medium: '24h', high: '12h' },
    premium: { low: '24h', medium: '12h', high: '6h' },
    enterprise: {
      low: '12h', medium: '6h', high: '2h', critical: '30min',
    },
  };

  const estimatedResponse = responseTimeMap[user.plan]?.[urgency] || '48h';

  // Here you would typically save to database or send to external ticketing system
  console.log('📧 Support ticket created:', {
    ticketId,
    user: user.email,
    plan: user.plan,
    subject,
    urgency,
    category,
    estimatedResponse,
  });

  // For enterprise users, trigger additional notifications
  if (user.plan === 'enterprise') {
    console.log('🏢 Enterprise support notification sent to dedicated team');
  }

  return {
    ticketId,
    estimatedResponse,
    status: 'created',
    message: `Votre demande a été enregistrée avec succès. Notre équipe vous répondra dans ${estimatedResponse}.`,
  };
};

const getTicketHistory = async (firebaseUid) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) throw new Error('Utilisateur non trouvé');

  // Mock ticket history - in real app, fetch from database
  const mockTickets = [
    {
      id: 'TPAI-1633024800-ABC123',
      subject: 'Question sur l\'analyse PDF',
      status: 'resolved',
      createdAt: new Date('2023-12-01'),
      resolvedAt: new Date('2023-12-01'),
      category: 'technical',
    },
  ];

  return mockTickets;
};

module.exports = {
  getSupportInfo,
  createSupportTicket,
  getTicketHistory,
};
