// Backend/scripts/cleanupSecurityData.js
/**
 * Scheduled cleanup for old sessions, webhook events, and security logs
 * Run this with a cron job: 0 2 * * * (daily at 2 AM)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Session = require('../models/Session');
const WebhookEvent = require('../models/WebhookEvent');
const logger = require('../utils/logger');

const cleanup = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Cleanup job started', { timestamp: new Date() });

    // Clean up old sessions (revoked or expired > 30 days)
    const sessionResult = await Session.cleanupOldSessions(30);
    logger.info('Old sessions cleaned up', {
      deletedCount: sessionResult.deletedCount,
    });

    // Clean up old webhook events (> 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const webhookResult = await WebhookEvent.deleteMany({
      processedAt: { $lt: ninetyDaysAgo },
    });
    logger.info('Old webhook events cleaned up', {
      deletedCount: webhookResult.deletedCount,
    });

    // Clean up inactive sessions (no activity > 30 days)
    const inactivityCutoff = new Date();
    inactivityCutoff.setDate(inactivityCutoff.getDate() - 30);

    const inactiveResult = await Session.updateMany(
      {
        isActive: true,
        lastActivity: { $lt: inactivityCutoff },
      },
      {
        $set: {
          isActive: false,
          revokedAt: new Date(),
          revokedReason: 'expired',
        },
      },
    );
    logger.info('Inactive sessions expired', {
      modifiedCount: inactiveResult.modifiedCount,
    });

    logger.info('Cleanup job completed successfully', {
      totalSessionsRemoved: sessionResult.deletedCount + inactiveResult.modifiedCount,
      webhookEventsRemoved: webhookResult.deletedCount,
    });
  } catch (error) {
    logger.error('Cleanup job failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run cleanup
cleanup();
