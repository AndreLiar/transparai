//src/controllers/stripeController.js

const { createCheckoutSessionService } = require('../services/stripeService');

const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const { uid, email } = req.user;

    if (!['standard', 'premium'].includes(plan)) {
      return res.status(400).json({ message: 'Plan invalide.' });
    }

    const sessionUrl = await createCheckoutSessionService({ uid, email, plan });
    res.status(200).json({ url: sessionUrl });
  } catch (err) {
    console.error('❌ Stripe session error:', err.message);
    res.status(500).json({ message: 'Erreur lors de la création de la session Stripe' });
  }
};

module.exports = { createCheckoutSession };
