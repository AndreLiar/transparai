// controller/webhookController.js
const Stripe = require('stripe');
const User = require('../models/User');
const WebhookEvent = require('../models/WebhookEvent');
const { PLAN_AI_BUDGETS } = require('../services/aiModelService');
const logger = require('../utils/logger');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = async (req, res) => {
  const receivedAt = new Date();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed', {
      error: err.message,
      ip: req.ip,
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ SECURITY: Validate event timestamp (reject events older than 5 minutes)
  const eventTimestamp = event.created * 1000; // Convert to milliseconds
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  if (now - eventTimestamp > maxAge) {
    logger.warn('Webhook event too old - possible replay attack', {
      eventId: event.id,
      eventAge: Math.floor((now - eventTimestamp) / 1000),
      maxAge: 300,
      ip: req.ip,
    });
    return res.status(400).json({
      error: 'Event too old',
      code: 'EVENT_EXPIRED',
    });
  }

  // ✅ SECURITY: Check for duplicate events (idempotency)
  try {
    const existingEvent = await WebhookEvent.findOne({ eventId: event.id });

    if (existingEvent) {
      logger.info('Duplicate webhook event received', {
        eventId: event.id,
        eventType: event.type,
        originalProcessedAt: existingEvent.processedAt,
      });

      // Return success for duplicate events
      return res.json({ received: true, duplicate: true });
    }
  } catch (err) {
    logger.error('Error checking webhook duplicate', {
      error: err.message,
      eventId: event.id,
    });
    // Continue processing even if duplicate check fails
  }

  // Process webhook based on event type
  let processingError = null;
  const startProcessing = Date.now();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { firebaseUid } = session.metadata;
      const { plan } = session.metadata;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (!firebaseUid || !plan) {
        throw new Error('Missing required metadata: firebaseUid or plan');
      }

      const user = await User.findOne({ firebaseUid });
      if (!user) {
        throw new Error(`User not found: ${firebaseUid}`);
      }

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

      logger.info('Subscription activated', {
        eventId: event.id,
        firebaseUid,
        plan,
        aiBudget,
      });
    }

    // Handle subscription cancellations
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;

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

        logger.info('Subscription cancelled - user downgraded', {
          eventId: event.id,
          firebaseUid: user.firebaseUid,
          subscriptionId: subscription.id,
        });
      } else {
        logger.warn('Subscription cancellation - user not found', {
          eventId: event.id,
          subscriptionId: subscription.id,
        });
      }
    }
  } catch (err) {
    processingError = err.message;
    logger.error('Webhook processing failed', {
      eventId: event.id,
      eventType: event.type,
      error: err.message,
      stack: err.stack,
    });
  }

  // ✅ Record webhook event for audit trail and idempotency
  try {
    const processingTime = Date.now() - startProcessing;

    await WebhookEvent.create({
      eventId: event.id,
      eventType: event.type,
      provider: 'stripe',
      payload: event.data.object,
      processedAt: new Date(),
      status: processingError ? 'failed' : 'processed',
      error: processingError,
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        receivedAt,
        processingTime,
      },
    });
  } catch (err) {
    logger.error('Failed to record webhook event', {
      eventId: event.id,
      error: err.message,
    });
  }

  // Return appropriate response
  if (processingError) {
    return res.status(500).json({
      error: 'Webhook processing failed',
      code: 'PROCESSING_ERROR',
    });
  }

  res.json({ received: true });
};

module.exports = { handleStripeWebhook };
