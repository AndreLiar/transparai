// Backend/controllers/analyzeController.js
const { processAnalysis } = require('../services/analyzeService');
const { canAnalyze, getMonthlyLimit, hasFeature } = require('../utils/planUtils');
const User = require('../models/User');

const analyzeText = async (req, res) => {
  try {
    console.log('📊 Analysis request received from user:', req.user?.uid);
    const {
      text,
      source,
      documentName,
      originalName,
      fileType,
      sizeBytes,
      pageCount,
      ocrConfidence,
    } = req.body;
    const { uid } = req.user;

    console.log('📝 Analysis details:', {
      source,
      documentName,
      fileType,
      textLength: text?.length || 0,
      hasText: !!text,
    });

    if (!text || !source) {
      return res.status(400).json({ message: 'Champ manquant (text ou source).' });
    }

    // Get user plan and quota information
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const userPlan = user.plan || 'free';
    const usedAnalyses = user.monthlyQuota?.used || 0;

    // Check if user can analyze based on their plan
    if (!canAnalyze(userPlan, usedAnalyses)) {
      const limit = getMonthlyLimit(userPlan);
      return res.status(429).json({
        quotaReached: true,
        message: `Quota mensuel atteint (${usedAnalyses}/${limit}). Passez à un plan supérieur pour continuer.`,
        currentPlan: userPlan,
        usedAnalyses,
        limit,
        upgradeRequired: true,
      });
    }

    // Check if specific source type is allowed for the plan
    if (source === 'ocr' && !hasFeature(userPlan, 'ocrProcessing')) {
      return res.status(403).json({
        message: 'L\'analyse OCR nécessite un plan Standard ou supérieur.',
        featureRequired: 'ocrProcessing',
        currentPlan: userPlan,
        upgradeRequired: true,
      });
    }

    const result = await processAnalysis({
      uid,
      text,
      source,
      documentName,
      originalName,
      fileType,
      sizeBytes,
      pageCount,
      ocrConfidence,
    });

    if (result.quotaReached) {
      return res.status(429).json(result); // ⛔ Quota exceeded
    }

    return res.json(result);
  } catch (err) {
    console.error('❌ Erreur analyse complète:', {
      message: err.message,
      stack: err.stack,
      uid: req.user?.uid,
      source: req.body?.source,
      textLength: req.body?.text?.length || 0,
    });
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

module.exports = { analyzeText };
