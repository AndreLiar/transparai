// Backend/services/analyzeService.js
const User = require('../models/User');
const { saveDocumentToLibrary } = require('./documentLibraryService');
const { generateAnalysisPrompt } = require('../utils/analysisTemplates');
const { performSmartAnalysis } = require('./aiModelService');
const { syncAIBudgetWithPlan } = require('../utils/planUtils');

const preprocessText = (text) => {
  // Clean and normalize the text
  let cleaned = text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();

  // Validate text length and quality
  if (cleaned.length < 100) {
    throw new Error('Le texte fourni est trop court pour une analyse pertinente (minimum 100 caractères).');
  }

  if (cleaned.length > 200000) {
    // Truncate if too long but keep structure
    cleaned = `${cleaned.substring(0, 200000)}...`;
  }

  return cleaned;
};

const processAnalysis = async ({
  uid, text, source, documentName, originalName, fileType, sizeBytes, pageCount, ocrConfidence,
}) => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new Error('Utilisateur introuvable');

  // Reset quota if a new month has started
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastResetMonth = user.lastQuotaReset
    ? `${user.lastQuotaReset.getFullYear()}-${String(user.lastQuotaReset.getMonth() + 1).padStart(2, '0')}`
    : null;

  if (currentMonth !== lastResetMonth) {
    user.monthlyQuota.used = 0;
    user.lastQuotaReset = new Date();
  }

  // 🔄 Sync AI budget with current plan
  const aiSettingsChanged = await syncAIBudgetWithPlan(user);
  if (aiSettingsChanged) {
    console.log(`🔄 Synced AI budget for user ${uid}: $${user.aiSettings.monthlyAIBudget.allocated}`);
  }

  // 🔁 Always sync quota limit with plan
  let expectedLimit = 20;
  if (user.plan === 'standard') expectedLimit = 40;
  if (user.plan === 'premium') expectedLimit = -1;

  if (user.monthlyQuota.limit !== expectedLimit) {
    user.monthlyQuota.limit = expectedLimit;
  }

  await user.save();

  const { used, limit } = user.monthlyQuota;
  const isUnlimited = limit === -1;

  if (!isUnlimited && used >= limit) {
    return {
      quotaReached: true,
      message: `Quota mensuel atteint pour le plan "${user.plan}".`,
      remaining: 0,
    };
  }

  // Preprocess the text for better analysis
  const processedText = preprocessText(text);

  // Save document to library (with duplicate detection)
  let documentLibraryInfo = null;
  if (documentName && originalName) {
    try {
      documentLibraryInfo = await saveDocumentToLibrary({
        uid,
        name: documentName,
        originalName,
        extractedText: processedText,
        source,
        fileType,
        sizeBytes,
        pageCount,
        ocrConfidence,
      });

      console.log(`📚 Document library: ${documentLibraryInfo.message}`);
    } catch (libError) {
      console.warn('⚠️ Erreur sauvegarde bibliothèque:', libError.message);
      // Continue with analysis even if library save fails
    }
  }

  // === Smart AI Analysis ===
  const prompt = generateAnalysisPrompt(user.plan || 'standard', processedText);

  let aiResult;
  try {
    aiResult = await performSmartAnalysis(user, processedText, prompt);
    console.log(`🎯 AI Analysis completed with ${aiResult.model} (Cost: $${aiResult.actualCost.toFixed(4)})`);
  } catch (aiError) {
    console.error('❌ Smart AI Analysis Error:', aiError.message);
    throw new Error(`Erreur d'analyse IA: ${aiError.message}`);
  }

  const raw = aiResult.response;
  let parsed;
  try {
    // Multiple cleaning attempts for better JSON extraction
    let cleaned = raw.trim()
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');

    // Try to find JSON object if wrapped in text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ JSON invalide:', raw.substring(0, 500));
    throw new Error('Réponse IA invalide. Veuillez réessayer.');
  }

  // Enhanced validation
  const validScores = ['Excellent', 'Bon', 'Moyen', 'Médiocre', 'Problématique'];
  if (!parsed
      || typeof parsed.resume !== 'string'
      || typeof parsed.score !== 'string'
      || !Array.isArray(parsed.clauses)
      || !validScores.includes(parsed.score)
      || parsed.clauses.length === 0) {
    console.error('❌ Structure JSON invalide:', parsed);
    throw new Error('Analyse incomplète. Veuillez réessayer.');
  }

  // Save if user is standard/premium (for export and history)
  let analysisId = null;
  try {
    if (user.plan !== 'free') {
      const newAnalysis = {
        source,
        summary: parsed.resume,
        score: parsed.score,
        clauses: parsed.clauses,
        createdAt: new Date(),
      };
      user.analyses.push(newAnalysis);

      // Get the ID of the newly added analysis
      await user.save();
      analysisId = user.analyses[user.analyses.length - 1]._id;
    } else {
      // For free users, just update quota
      user.monthlyQuota.used += 1;
      await user.save();
    }
  } catch (err) {
    throw new Error('Erreur enregistrement analyse.');
  }

  return {
    summary: parsed.resume,
    score: parsed.score,
    clauses: parsed.clauses,
    analysisId, // Include ID for Standard/Premium users
    canExportPdf: user.plan !== 'free',
    remaining: isUnlimited ? -1 : user.monthlyQuota.limit - user.monthlyQuota.used,
    quotaReached: false,
    // AI Model Information for transparency
    aiModelUsed: aiResult.model,
    analysisComplexity: aiResult.selection.complexity,
    aiCost: aiResult.actualCost,
    remainingAIBudget: user.aiSettings?.monthlyAIBudget?.allocated - user.aiSettings?.monthlyAIBudget?.used || 0,
  };
};

module.exports = { processAnalysis };
