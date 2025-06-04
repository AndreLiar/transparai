//src/services/stripeService.js

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  standard: process.env.STRIPE_PRICE_STANDARD,
  premium: process.env.STRIPE_PRICE_PREMIUM,
};

const createCheckoutSessionService = async ({ uid, email, plan }) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{
      price: PRICE_IDS[plan],
      quantity: 1,
    }],
    metadata: { firebaseUid: uid, plan },
    success_url: `${process.env.FRONTEND_URL}/upgrade-success`,
    cancel_url: `${process.env.FRONTEND_URL}/upgrade-cancel`,
  });

  return session.url;
};

module.exports = { createCheckoutSessionService };
