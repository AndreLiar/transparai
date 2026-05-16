// Backend/routes/watchRoutes.js
const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  createWatch,
  getWatches,
  removeWatch,
  patchWatch,
  getHistory,
  manualCheck,
  getStatus,
} = require('../controllers/watchController');
const { securityLogger, sanitizeInput, noSQLInjectionProtection } = require('../middleware/security');

const applyBaseMiddleware = [securityLogger, sanitizeInput, noSQLInjectionProtection, authenticate];

// Cron status (no auth — frontend uses this before user loads watches)
router.get('/status', getStatus);

// List all watches
router.get('/', applyBaseMiddleware, getWatches);

// Create a watch (after an analysis)
router.post('/', applyBaseMiddleware, createWatch);

// Update watch settings
router.patch('/:id', applyBaseMiddleware, patchWatch);

// Delete a watch
router.delete('/:id', applyBaseMiddleware, removeWatch);

// Get change history for a watch
router.get('/:id/history', applyBaseMiddleware, getHistory);

// Manual re-check (user re-uploads new version)
router.post('/:id/check', applyBaseMiddleware, manualCheck);

module.exports = router;
