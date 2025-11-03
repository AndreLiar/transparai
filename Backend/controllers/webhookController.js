// controller/webhookController.js
const Stripe = require('stripe');
const User = require('../models/User');
const { PLAN_AI_BUDGETS } = require('../services/aiModelService');

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
    const { firebaseUid } = session.metadata;
    const { plan } = session.metadata;
    const customerId = session.customer; // ✅ Stripe customer ID
    const subscriptionId = session.subscription; // ✅ Stripe subscription ID

    try {
      const user = await User.findOne({ firebaseUid });
      if (!user) throw new Error('User not found');

      // ✅ Update plan and quota limits
      user.plan = plan;
      if (plan === 'standard') {
        user.monthlyQuota.limit = 40;
      } else if (plan === 'premium' || plan === 'enterprise') {
        user.monthlyQuota.limit = -1; // Unlimited
      }

      // ✅ Initialize AI settings and budget based on plan
      const aiBudget = PLAN_AI_BUDGETS[plan] || 0;
      user.aiSettings = {
        preferredModel: 'auto',
        allowPremiumAI: true,
        monthlyAIBudget: {
          allocated: aiBudget,
          used: 0,
          lastReset: new Date(),
        },
      };

      // ✅ Initialize AI usage stats if not exists
      if (!user.aiUsageStats) {
        user.aiUsageStats = {
          totalAnalyses: 0,
          gptAnalyses: 0,
          geminiAnalyses: 0,
          totalAICost: 0,
          lastUpdated: new Date(),
        };
      }

      // ✅ Save Stripe details
      user.stripeCustomerId = customerId;
      user.stripeSubscriptionId = subscriptionId;

      await user.save();

      console.log(`✅ Updated user ${firebaseUid} to plan ${plan} with AI budget $${aiBudget}`);
    } catch (err) {
      console.error('❌ Failed to update user after payment:', err.message);
    }
  }

  // Handle subscription cancellations
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    
    try {
      const user = await User.findOne({ stripeSubscriptionId: subscription.id });
      if (user) {
        // Downgrade to starter plan
        user.plan = 'starter';
        user.monthlyQuota.limit = 20;
        
        // Reset AI budget to starter (free)
        user.aiSettings = user.aiSettings || {};
        user.aiSettings.monthlyAIBudget = {
          allocated: 0,
          used: 0,
          lastReset: new Date(),
        };

        await user.save();
        console.log(`✅ Downgraded user ${user.firebaseUid} to starter plan`);
      }
    } catch (err) {
      console.error('❌ Failed to downgrade user after cancellation:', err.message);
    }
  }

  res.json({ received: true });
};

module.exports = { handleStripeWebhook };
