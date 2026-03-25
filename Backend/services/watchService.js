// Backend/services/watchService.js
// Core logic for Document Watch: create watches, check for changes, run diffs.
const crypto = require('crypto');
const WatchedDocument = require('../models/WatchedDocument');
const DocumentChange = require('../models/DocumentChange');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const { analyseDocument } = require('../orchestrator');
const { sendWatchAlertEmail } = require('./emailService');
const logger = require('../utils/logger');

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

const preprocessText = (text) => text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start watching a document after it has been analyzed.
 * Called from the analyze flow when user clicks "Watch".
 */
const watchDocument = async ({ firebaseUid, name, analysisId, text, url = null, checkFrequency = 'weekly' }) => {
  const processedText = preprocessText(text);
  const hash = sha256(processedText);

  const analysis = await Analysis.findById(analysisId).lean();

  // Upsert — if user already watches a doc with the same hash, update it
  const existing = await WatchedDocument.findOne({ firebaseUid, lastHash: hash });
  if (existing) {
    return { watch: existing, created: false };
  }

  const watch = await WatchedDocument.create({
    firebaseUid,
    name,
    url,
    lastHash: hash,
    lastAnalysisId: analysisId,
    lastSummary: analysis?.summary || '',
    lastScore: analysis?.score || '',
    checkFrequency,
  });

  return { watch, created: true };
};

/**
 * List all watched documents for a user.
 */
const listWatches = async (firebaseUid) => {
  return WatchedDocument.find({ firebaseUid }).sort({ createdAt: -1 }).lean();
};

/**
 * Delete a watch.
 */
const deleteWatch = async (firebaseUid, watchId) => {
  const result = await WatchedDocument.deleteOne({ _id: watchId, firebaseUid });
  return result.deletedCount > 0;
};

/**
 * Update watch settings (frequency, alerts, name).
 */
const updateWatch = async (firebaseUid, watchId, updates) => {
  const allowed = {};
  if (updates.checkFrequency) allowed.checkFrequency = updates.checkFrequency;
  if (typeof updates.alertsEnabled === 'boolean') allowed.alertsEnabled = updates.alertsEnabled;
  if (updates.name) allowed.name = updates.name;

  return WatchedDocument.findOneAndUpdate(
    { _id: watchId, firebaseUid },
    { $set: allowed },
    { new: true }
  ).lean();
};

/**
 * Get change history for a watch.
 */
const getChangeHistory = async (firebaseUid, watchId, limit = 20) => {
  const watch = await WatchedDocument.findOne({ _id: watchId, firebaseUid }).lean();
  if (!watch) return null;

  const changes = await DocumentChange.find({ watchedDocumentId: watchId })
    .sort({ detectedAt: -1 })
    .limit(limit)
    .lean();

  return { watch, changes };
};

/**
 * Check a single watched document for changes given new text.
 * Called manually (user re-uploads) or by the cron job (URL-based).
 * Returns { changed, changeRecord } or { changed: false }.
 */
const checkForChanges = async ({ watchId, firebaseUid, newText }) => {
  const watch = await WatchedDocument.findOne({ _id: watchId, firebaseUid });
  if (!watch) throw new Error('Watch not found');

  const processedText = preprocessText(newText);
  const newHash = sha256(processedText);

  // Mark as checked regardless
  watch.lastCheckedAt = new Date();

  if (newHash === watch.lastHash) {
    await watch.save();
    return { changed: false };
  }

  // Document changed — run a new analysis
  const user = await User.findOne({ firebaseUid });
  if (!user) throw new Error('User not found');

  const aiResult = await analyseDocument({ user, text: processedText, plan: user.plan });
  const { resume, score, clauses } = aiResult;

  // Save new analysis record
  const newAnalysis = await Analysis.create({
    firebaseUid,
    source: 'watch',
    documentName: watch.name,
    summary: resume,
    score,
    clauses,
    inputHash: newHash,
    aiModelUsed: aiResult._meta?.modelUsed,
    confidenceLevel: aiResult._meta?.confidenceLevel,
    requiresHumanReview: aiResult._meta?.requiresHumanReview,
    promptVersion: aiResult._meta?.promptVersion,
    disclaimerVersion: aiResult._meta?.disclaimerVersion,
    jurisdiction: aiResult._meta?.jurisdiction || 'FR',
  });

  // Run a diff to identify what specifically changed
  const diffResult = await runDiffAnalysis({
    user,
    previousSummary: watch.lastSummary,
    previousClauses: [],
    newSummary: resume,
    newClauses: clauses,
    previousScore: watch.lastScore,
    newScore: score,
  });

  // Record the change
  const changeRecord = await DocumentChange.create({
    watchedDocumentId: watch._id,
    firebaseUid,
    newAnalysisId: newAnalysis._id,
    previousAnalysisId: watch.lastAnalysisId,
    diffSummary: diffResult.diffSummary,
    addedClauses: diffResult.addedClauses,
    removedClauses: diffResult.removedClauses,
    modifiedClauses: diffResult.modifiedClauses,
    riskLevel: diffResult.riskLevel,
    previousScore: watch.lastScore,
    newScore: score,
  });

  // Update the watch with new state
  watch.lastHash = newHash;
  watch.lastAnalysisId = newAnalysis._id;
  watch.lastSummary = resume;
  watch.lastScore = score;
  watch.lastChangedAt = new Date();
  watch.changeCount += 1;
  await watch.save();

  // Send alert email if enabled
  if (watch.alertsEnabled) {
    try {
      await sendWatchAlertEmail({
        firebaseUid,
        documentName: watch.name,
        riskLevel: diffResult.riskLevel,
        diffSummary: diffResult.diffSummary,
        addedClauses: diffResult.addedClauses,
        newScore: score,
        previousScore: watch.lastScore,
        watchId: watch._id.toString(),
      });
    } catch (emailErr) {
      logger.warn('Watch alert email failed', { error: emailErr.message, watchId: watch._id });
    }
  }

  return { changed: true, changeRecord, newAnalysis };
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Ask the AI to summarize what changed between two versions.
 */
const runDiffAnalysis = async ({ user, previousSummary, newSummary, previousClauses, newClauses, previousScore, newScore }) => {
  // Simple heuristic diff on clauses
  const prevSet = new Set(previousClauses.map((c) => c.toLowerCase().trim()));
  const newSet = new Set(newClauses.map((c) => c.toLowerCase().trim()));

  const addedClauses = newClauses.filter((c) => !prevSet.has(c.toLowerCase().trim()));
  const removedClauses = previousClauses.filter((c) => !newSet.has(c.toLowerCase().trim()));
  const modifiedClauses = [];

  // Determine risk level based on score change and clause count
  const scoreRank = { 'Excellent': 5, 'Bon': 4, 'Moyen': 3, 'Médiocre': 2, 'Problématique': 1 };
  const prevRank = scoreRank[previousScore] || 3;
  const newRank = scoreRank[newScore] || 3;
  const scoreDelta = prevRank - newRank; // positive = got worse

  let riskLevel = 'low';
  if (scoreDelta >= 2 || addedClauses.length >= 3) riskLevel = 'critical';
  else if (scoreDelta === 1 || addedClauses.length >= 2) riskLevel = 'high';
  else if (addedClauses.length >= 1) riskLevel = 'medium';

  const diffSummary = buildDiffSummary({ addedClauses, removedClauses, riskLevel, previousScore, newScore });

  return { diffSummary, addedClauses, removedClauses, modifiedClauses, riskLevel };
};

const buildDiffSummary = ({ addedClauses, removedClauses, riskLevel, previousScore, newScore }) => {
  const parts = [];
  if (previousScore !== newScore) {
    parts.push(`Le score est passé de ${previousScore} à ${newScore}.`);
  }
  if (addedClauses.length > 0) {
    parts.push(`${addedClauses.length} nouvelle(s) clause(s) détectée(s).`);
  }
  if (removedClauses.length > 0) {
    parts.push(`${removedClauses.length} clause(s) supprimée(s).`);
  }
  if (parts.length === 0) {
    parts.push('Des modifications mineures ont été détectées dans le document.');
  }
  return parts.join(' ');
};

module.exports = {
  watchDocument,
  listWatches,
  deleteWatch,
  updateWatch,
  getChangeHistory,
  checkForChanges,
};
