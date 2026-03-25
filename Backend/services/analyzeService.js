// Backend/services/analyzeService.js
const crypto = require('crypto');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { analyseDocument } = require('../orchestrator');
const {
  syncAIBudgetWithPlan, canAnalyze, getMonthlyLimit, hasFeature,
} = require('../utils/planUtils');

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

const preprocessText = (text) => {
  let cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  if (cleaned.length < 100) {
    throw new Error('Le texte fourni est trop court pour une analyse pertinente (minimum 100 caractères).');
  }

  // Hard limit before sending to orchestrator — orchestrator applies plan-specific limits
  if (cleaned.length > 200000) {
    cleaned = cleaned.substring(0, 200000);
  }

  return cleaned;
};

const processAnalysis = async ({
  firebaseUid, text, source, documentName, originalName, fileType, sizeBytes, pageCount, ocrConfidence,
}) => {
  const user = await User.findOne({ firebaseUid });
  if (!user) return { status: 404, body: { message: 'Utilisateur introuvable' } };

  // ── Guard: GDPR Art. 22 — AI processing consent ──────────────────────────
  if (!user.consent?.aiProcessing) {
    return {
      status: 403,
      body: {
        message: 'Vous devez accepter le traitement de vos documents par notre IA avant de pouvoir analyser. Activez le consentement dans Confidentialité > Consentement IA.',
        code: 'AI_CONSENT_REQUIRED',
        consentRequired: true,
      },
    };
  }

  // ── Guard: OCR feature gate ───────────────────────────────────────────────
  if (source === 'ocr' && !hasFeature(user.plan, 'ocrProcessing')) {
    return {
      status: 403,
      body: {
        message: "L'analyse OCR nécessite un plan Standard ou supérieur.",
        featureRequired: 'ocrProcessing',
        currentPlan: user.plan,
        upgradeRequired: true,
      },
    };
  }

  // ── Quota reset + AI budget sync (write only when dirty) ─────────────────
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastResetMonth = user.lastQuotaReset
    ? `${user.lastQuotaReset.getFullYear()}-${String(user.lastQuotaReset.getMonth() + 1).padStart(2, '0')}`
    : null;

  const needsQuotaReset = currentMonth !== lastResetMonth;
  if (needsQuotaReset) {
    user.monthlyQuota.used = 0;
    user.lastQuotaReset = now;
  }

  const expectedLimit = getMonthlyLimit(user.plan);
  if (user.monthlyQuota.limit !== expectedLimit) {
    user.monthlyQuota.limit = expectedLimit;
  }

  const needsBudgetSync = await syncAIBudgetWithPlan(user);

  if (needsQuotaReset || needsBudgetSync) {
    await user.save(); // write #1 — only fires when state actually changed
  }

  // ── Guard: quota check ────────────────────────────────────────────────────
  if (!canAnalyze(user.plan, user.monthlyQuota.used)) {
    const limit = getMonthlyLimit(user.plan);
    return {
      status: 429,
      body: {
        quotaReached: true,
        message: `Quota mensuel atteint (${user.monthlyQuota.used}/${limit}). Passez à un plan supérieur pour continuer.`,
        currentPlan: user.plan,
        usedAnalyses: user.monthlyQuota.used,
        limit,
        upgradeRequired: true,
      },
    };
  }

  // ── AI analysis ───────────────────────────────────────────────────────────
  const processedText = preprocessText(text);
  const inputHash = sha256(processedText);

  // ── Idempotency: return cached result if same text was already analysed ───
  // Saves LLM cost + latency for duplicate submissions (refresh, double-click, retry).
  // Free plan: we still check the cache but we do not store (no Analysis record).
  const cachedAnalysis = await Analysis.findOne({ inputHash, firebaseUid }).lean();
  if (cachedAnalysis) {
    const usedAfter = user.monthlyQuota.used + 1;
    return {
      status: 200,
      body: {
        summary: cachedAnalysis.summary,
        score: cachedAnalysis.score,
        clauses: cachedAnalysis.clauses,
        analysisId: cachedAnalysis._id,
        canExportPdf: user.plan !== 'free',
        remaining: user.monthlyQuota.limit === -1 ? -1 : user.monthlyQuota.limit - usedAfter,
        quotaReached: false,
        aiModelUsed: cachedAnalysis.aiModelUsed,
        confidenceLevel: cachedAnalysis.confidenceLevel,
        requiresHumanReview: cachedAnalysis.requiresHumanReview,
        promptVersion: cachedAnalysis.promptVersion,
        disclaimerVersion: cachedAnalysis.disclaimerVersion,
        jurisdiction: cachedAnalysis.jurisdiction,
        cached: true,
      },
    };
  }

  let aiResult;
  try {
    aiResult = await analyseDocument({ user, text: processedText, plan: user.plan });
  } catch (aiError) {
    throw new Error(`Erreur d'analyse IA: ${aiError.message}`);
  }

  const {
    resume, score, clauses, _meta,
  } = aiResult;
  const isFree = user.plan === 'free';
  const isUnlimited = user.monthlyQuota.limit === -1;

  // ── Atomic post-analysis write (write #2) ─────────────────────────────────
  // Combines: quota increment + AI usage stats — one findOneAndUpdate
  const statsInc = {
    'monthlyQuota.used': 1,
    'aiUsageStats.totalAnalyses': 1,
    'aiUsageStats.totalAICost': _meta.actualCost || 0,
  };
  statsInc['aiSettings.monthlyAIBudget.used'] = _meta.actualCost || 0;
  if (_meta.modelUsed === 'gpt-4o') {
    statsInc['aiUsageStats.gpt4oAnalyses'] = 1;
  } else {
    statsInc['aiUsageStats.gpt4oMiniAnalyses'] = 1;
  }

  await User.findOneAndUpdate(
    { firebaseUid },
    { $inc: statsInc, $set: { 'aiUsageStats.lastUpdated': now } },
  );

  // ── Analysis record (write #3, skipped for free plan) ────────────────────
  let analysisId = null;
  if (!isFree) {
    const saved = await Analysis.create({
      firebaseUid,
      source,
      documentName: documentName || originalName,
      summary: resume,
      score,
      clauses,
      inputHash,
      aiModelUsed: _meta.modelUsed,
      confidenceLevel: _meta.confidenceLevel,
      requiresHumanReview: _meta.requiresHumanReview,
      promptVersion: _meta.promptVersion,
      disclaimerVersion: _meta.disclaimerVersion,
      jurisdiction: _meta.jurisdiction,
    });
    analysisId = saved._id;
  }

  // Audit log is written async inside the orchestrator (fire-and-forget, non-blocking)

  const usedAfter = user.monthlyQuota.used + 1;
  return {
    status: 200,
    body: {
      summary: resume,
      score,
      clauses,
      analysisId,
      canExportPdf: !isFree,
      remaining: isUnlimited ? -1 : user.monthlyQuota.limit - usedAfter,
      quotaReached: false,
      aiModelUsed: _meta.modelUsed,
      confidenceLevel: _meta.confidenceLevel,
      requiresHumanReview: _meta.requiresHumanReview,
      promptVersion: _meta.promptVersion,
      disclaimerVersion: _meta.disclaimerVersion,
      jurisdiction: _meta.jurisdiction,
      fromPromptCache: _meta.fromPromptCache || false,
    },
  };
};

module.exports = { processAnalysis };
