// Backend/services/watcherCron.js
// Scheduled job: check URL-based watched documents for changes.
// Run this with node-cron or an external scheduler (e.g. Render cron job).
// Called from index.js on startup — schedules itself internally.
const WatchedDocument = require('../models/WatchedDocument');
const { checkForChanges } = require('./watchService');
const logger = require('../utils/logger');

// How often the scheduler loop ticks (every 6 hours)
// The per-document frequency (weekly/monthly) is enforced inside the loop.
const TICK_MS = 6 * 60 * 60 * 1000;

const FREQUENCY_MS = {
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

/**
 * Process all URL-based watched documents that are due for a check.
 * Documents without a URL cannot be auto-fetched — they rely on user re-upload.
 */
const runWatcherTick = async () => {
  logger.info('WatcherCron: tick started');

  const now = new Date();

  // Find all URL-based watches where next check is due
  const dueWatches = await WatchedDocument.find({ url: { $ne: null } }).lean();

  const pending = dueWatches.filter((w) => {
    const freqMs = FREQUENCY_MS[w.checkFrequency] || FREQUENCY_MS.weekly;
    const nextCheck = new Date((w.lastCheckedAt || w.createdAt).getTime() + freqMs);
    return now >= nextCheck;
  });

  logger.info(`WatcherCron: ${pending.length} documents due for check`);

  for (const watch of pending) {
    try {
      const text = await fetchTextFromUrl(watch.url);
      if (!text || text.trim().length < 100) {
        logger.warn('WatcherCron: fetched text too short', { watchId: watch._id, url: watch.url });
        continue;
      }

      const result = await checkForChanges({
        watchId: watch._id,
        firebaseUid: watch.firebaseUid,
        newText: text,
      });

      if (result.changed) {
        logger.info('WatcherCron: change detected', {
          watchId: watch._id,
          documentName: watch.name,
          riskLevel: result.changeRecord?.riskLevel,
        });
      }
    } catch (err) {
      logger.error('WatcherCron: error processing watch', {
        watchId: watch._id,
        error: err.message,
      });
    }
  }

  logger.info('WatcherCron: tick complete');
};

/**
 * Fetch plain text from a URL.
 * Strips basic HTML tags to get the readable content.
 */
const fetchTextFromUrl = async (url) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'TransparAI-Watcher/1.0' },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);

  const html = await response.text();
  // Strip HTML tags and decode basic entities
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Start the background scheduler.
 * Called once from index.js. Waits for the Mongoose connection to be open
 * before running the first tick so the DB is guaranteed to be ready.
 */
const startWatcherCron = () => {
  if (process.env.NODE_ENV === 'test') return; // Never run in tests

  const mongoose = require('mongoose');

  const start = () => {
    logger.info(`WatcherCron: started — ticking every ${TICK_MS / 1000 / 60 / 60}h`);

    // Run once immediately at startup (catches any missed checks after deploy)
    runWatcherTick().catch((err) => logger.error('WatcherCron: startup tick failed', { error: err.message }));

    // Then repeat on interval
    setInterval(() => {
      runWatcherTick().catch((err) => logger.error('WatcherCron: tick failed', { error: err.message }));
    }, TICK_MS);
  };

  // If already connected, start immediately; otherwise wait for the open event
  if (mongoose.connection.readyState === 1) {
    start();
  } else {
    mongoose.connection.once('open', start);
  }
};

module.exports = { startWatcherCron, runWatcherTick };
