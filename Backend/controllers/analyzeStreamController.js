// Backend/controllers/analyzeStreamController.js
// SSE streaming endpoint for /api/analyze/stream
// Emits progress events as each pipeline step completes so the frontend
// can show live feedback instead of a blank loading spinner.
//
// SSE event format:
//   data: {"type":"progress","step":"...","message":"...","percent":N}\n\n
//   data: {"type":"result","data":{...}}\n\n
//   data: {"type":"error","message":"...","status":N}\n\n

const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { analyseDocument } = require('../orchestrator');
const { syncAIBudgetWithPlan, canAnalyze, getMonthlyLimit, hasFeature } = require('../utils/planUtils');

const preprocessText = (text) => {
  let cleaned = text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
  if (cleaned.length < 100) {
    throw new Error('Le texte fourni est trop court pour une analyse pertinente (minimum 100 caractères).');
  }
  if (cleaned.length > 200000) cleaned = cleaned.substring(0, 200000);
  return cleaned;
};

// Write one SSE event to the response
const emit = (res, payload) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const analyzeStream = async (req, res) => {
  // ── SSE headers ───────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering if behind proxy
  res.flushHeaders();

  // Keep-alive ping every 15s to prevent proxy/browser timeout
  const keepAlive = setInterval(() => res.write(': ping\n\n'), 15000);
  const done = (payload) => {
    clearInterval(keepAlive);
    emit(res, payload);
    res.end();
  };

  try {
    const { text, source, documentName, originalName, fileType, sizeBytes, pageCount, ocrConfidence } = req.body;

    if (!text || !source) {
      return done({ type: 'error', message: 'Champ manquant (text ou source).', status: 400 });
    }

    // ── Step 1: Load user ─────────────────────────────────────────────────
    emit(res, { type: 'progress', step: 'loading', message: 'Chargement du profil utilisateur…', percent: 5 });

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return done({ type: 'error', message: 'Utilisateur introuvable', status: 404 });

    // ── Step 2: Guards (consent, quota, features) ─────────────────────────
    emit(res, { type: 'progress', step: 'validating', message: 'Vérification des droits d\'accès…', percent: 10 });

    if (!user.consent?.aiProcessing) {
      return done({
        type: 'error',
        message: 'Consentement IA requis.',
        code: 'AI_CONSENT_REQUIRED',
        consentRequired: true,
        status: 403,
      });
    }

    if (source === 'ocr' && !hasFeature(user.plan, 'ocrProcessing')) {
      return done({
        type: 'error',
        message: "L'analyse OCR nécessite un plan Standard ou supérieur.",
        featureRequired: 'ocrProcessing',
        currentPlan: user.plan,
        upgradeRequired: true,
        status: 403,
      });
    }

    // Quota reset + budget sync (write only when dirty)
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
    if (user.monthlyQuota.limit !== expectedLimit) user.monthlyQuota.limit = expectedLimit;

    const needsBudgetSync = await syncAIBudgetWithPlan(user);
    if (needsQuotaReset || needsBudgetSync) await user.save();

    if (!canAnalyze(user.plan, user.monthlyQuota.used)) {
      const limit = getMonthlyLimit(user.plan);
      return done({
        type: 'error',
        quotaReached: true,
        message: `Quota mensuel atteint (${user.monthlyQuota.used}/${limit}).`,
        currentPlan: user.plan,
        upgradeRequired: true,
        status: 429,
      });
    }

    // ── Step 3: Preprocess text ───────────────────────────────────────────
    emit(res, { type: 'progress', step: 'preprocessing', message: 'Préparation du document…', percent: 15 });

    const processedText = preprocessText(text);
    const isLargeDoc = processedText.length > 50000;
    const isFree = user.plan === 'free';

    // ── Step 4: RAG / vector search ───────────────────────────────────────
    if (!isFree) {
      emit(res, { type: 'progress', step: 'rag', message: 'Recherche d\'analyses similaires…', percent: 25 });
    }

    // ── Step 5: LLM call ──────────────────────────────────────────────────
    if (isLargeDoc && !isFree) {
      emit(res, { type: 'progress', step: 'chunking', message: `Document long détecté (${Math.round(processedText.length / 1000)}k car.) — analyse par parties…`, percent: 35 });
    } else {
      emit(res, { type: 'progress', step: 'analysing', message: 'Analyse IA en cours…', percent: 40 });
    }

    const aiResult = await analyseDocument({ user, text: processedText, plan: user.plan });

    // ── Step 6: Parsing / guardrails (already done inside orchestrator) ───
    emit(res, { type: 'progress', step: 'guardrails', message: 'Validation des résultats…', percent: 80 });

    // ── Step 7: Save results ──────────────────────────────────────────────
    emit(res, { type: 'progress', step: 'saving', message: 'Enregistrement de l\'analyse…', percent: 90 });

    const { resume, score, clauses, _meta } = aiResult;
    const isUnlimited = user.monthlyQuota.limit === -1;

    // Atomic stats + quota update
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
      { firebaseUid: req.user.uid },
      { $inc: statsInc, $set: { 'aiUsageStats.lastUpdated': now } },
    );

    let analysisId = null;
    if (!isFree) {
      const saved = await Analysis.create({
        firebaseUid: req.user.uid,
        source,
        documentName: documentName || originalName,
        summary: resume,
        score,
        clauses,
        aiModelUsed: _meta.modelUsed,
        confidenceLevel: _meta.confidenceLevel,
        requiresHumanReview: _meta.requiresHumanReview,
        promptVersion: _meta.promptVersion,
        disclaimerVersion: _meta.disclaimerVersion,
        jurisdiction: _meta.jurisdiction,
      });
      analysisId = saved._id;
    }

    const usedAfter = user.monthlyQuota.used + 1;

    // ── Step 8: Done ──────────────────────────────────────────────────────
    emit(res, { type: 'progress', step: 'done', message: 'Analyse terminée !', percent: 100 });

    done({
      type: 'result',
      data: {
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
        chunked: _meta.chunked || false,
        chunkCount: _meta.chunkCount || 1,
      },
    });
  } catch (err) {
    console.error('❌ SSE analyzeStream error:', err.message, { uid: req.user?.uid });
    done({ type: 'error', message: err.message || 'Erreur serveur', status: 500 });
  }
};

module.exports = { analyzeStream };
