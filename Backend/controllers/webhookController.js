//controller/webhookController.js
const User = require('../models/User');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const firebaseUid = session.metadata.firebaseUid;
    const plan = session.metadata.plan;
    const customerId = session.customer;        // ✅ Stripe customer ID
    const subscriptionId = session.subscription; // ✅ Stripe subscription ID

    try {
      const user = await User.findOne({ firebaseUid });
      if (!user) throw new Error('User not found');

      user.plan = plan;
      user.dailyQuota.limit = plan === 'standard' ? 10 : -1;

      // ✅ Save Stripe details
      user.stripeCustomerId = customerId;
      user.stripeSubscriptionId = subscriptionId;

      await user.save();

      console.log(`✅ Updated user ${firebaseUid} to plan ${plan}`);
    } catch (err) {
      console.error('❌ Failed to update user after payment:', err.message);
    }
  }

  res.json({ received: true });
};

module.exports = { handleStripeWebhook };

