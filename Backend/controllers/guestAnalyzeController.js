// Backend/controllers/guestAnalyzeController.js
// Anonymous (guest) analysis — 1 per IP per day, text only, no DB writes, no user record.
// SSE streaming so the frontend gets live progress feedback.

const { analyseDocument } = require('../orchestrator');

const preprocessText = (text) => {
  let cleaned = text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
  if (cleaned.length < 100) {
    throw new Error('Le texte fourni est trop court pour une analyse pertinente (minimum 100 caractères).');
  }
  // Guests get a smaller cap — keeps cost predictable
  if (cleaned.length > 10000) cleaned = cleaned.substring(0, 10000);
  return cleaned;
};

const emit = (res, payload) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const guestAnalyzeStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const keepAlive = setInterval(() => res.write(': ping\n\n'), 15000);
  const done = (payload) => {
    clearInterval(keepAlive);
    emit(res, payload);
    res.end();
  };

  try {
    const { text } = req.body;

    if (!text) {
      return done({ type: 'error', message: 'Champ manquant (text).', status: 400 });
    }

    emit(res, {
      type: 'progress', step: 'preprocessing', message: 'Préparation du document…', percent: 15,
    });

    const processedText = preprocessText(text);

    emit(res, {
      type: 'progress', step: 'analysing', message: 'Analyse IA en cours…', percent: 40,
    });

    // Guest analyses use a minimal free-tier user-like object — no DB record
    const guestUser = { plan: 'free', aiSettings: { preferredModel: 'auto', monthlyAIBudget: { limit: 5, used: 0 } } };
    const aiResult = await analyseDocument({ user: guestUser, text: processedText, plan: 'free' });

    emit(res, {
      type: 'progress', step: 'guardrails', message: 'Validation des résultats…', percent: 80,
    });
    emit(res, {
      type: 'progress', step: 'done', message: 'Analyse terminée !', percent: 100,
    });

    const {
      resume, score, clauses, _meta,
    } = aiResult;

    done({
      type: 'result',
      data: {
        summary: resume,
        score,
        clauses,
        analysisId: null,
        canExportPdf: false,
        isGuest: true,
        aiModelUsed: _meta.modelUsed,
        confidenceLevel: _meta.confidenceLevel,
        requiresHumanReview: _meta.requiresHumanReview,
        promptVersion: _meta.promptVersion,
        jurisdiction: _meta.jurisdiction,
      },
    });
  } catch (err) {
    console.error('❌ Guest SSE analyzeStream error:', err.message);
    done({ type: 'error', message: err.message || 'Erreur serveur', status: 500 });
  }
};

module.exports = { guestAnalyzeStream };
