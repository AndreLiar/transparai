// Backend/services/analyzeService.js
const User = require('../models/User');
const axios = require('axios');
const { isPremiumUser } = require('../utils/planUtils');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const processAnalysis = async ({ uid, email, text, source }) => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new Error('Utilisateur introuvable');

  // Reset quota if a new day has started
  const today = new Date().toISOString().slice(0, 10);
  const lastReset = user.lastQuotaReset?.toISOString().slice(0, 10);
  if (today !== lastReset) {
    user.dailyQuota.used = 0;
    user.lastQuotaReset = new Date();
  }

  // 🔁 Always sync quota limit with plan
  let expectedLimit = 2;
  if (user.plan === 'standard') expectedLimit = 10;
  if (user.plan === 'premium') expectedLimit = -1;

  if (user.dailyQuota.limit !== expectedLimit) {
    user.dailyQuota.limit = expectedLimit;
  }

  await user.save();

  const { used, limit } = user.dailyQuota;
  const isUnlimited = limit === -1;

  if (!isUnlimited && used >= limit) {
    return {
      quotaReached: true,
      message: `Quota quotidien atteint pour le plan "${user.plan}".`,
      remaining: 0
    };
  }

  // === Gemini AI Call ===
  const model = 'gemini-2.0-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  let completion;
  try {
    completion = await axios.post(API_URL, {
      contents: [{
        role: 'user',
        parts: [{
          text: `
Tu es un assistant juridique francophone spécialisé dans l'analyse de Conditions Générales d'Abonnement (CGA).
Analyse le texte CGA suivant fourni par l'utilisateur.
Réponds **UNIQUEMENT** avec un objet JSON valide :
- "resume": string
- "score": string
- "clauses": array de strings

Texte à analyser :
\`\`\`text
${text}
\`\`\`
`.trim()
        }]
      }],
      generationConfig: { temperature: 0.5 }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
  } catch (apiError) {
    console.error("❌ Erreur API Gemini:", apiError.response?.data || apiError.message);
    throw new Error(`Erreur API Gemini: ${apiError.message}`);
  }

  const raw = completion.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let parsed;
  try {
    const cleaned = raw.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ JSON invalide:', raw);
    throw new Error('Réponse IA invalide. Impossible de parser le JSON.');
  }

  if (!parsed || typeof parsed.resume !== 'string' || typeof parsed.score !== 'string' || !Array.isArray(parsed.clauses)) {
    throw new Error('Structure JSON inattendue.');
  }

  // Save if user is premium/standard
  try {
    if (isPremiumUser(user.plan)) {
      user.analyses.push({
        source,
        summary: parsed.resume,
        score: parsed.score,
        clauses: parsed.clauses,
        createdAt: new Date()
      });
    }

    user.dailyQuota.used += 1;
    await user.save();
  } catch (err) {
    throw new Error("Erreur enregistrement analyse.");
  }

  return {
    summary: parsed.resume,
    score: parsed.score,
    clauses: parsed.clauses,
    remaining: isUnlimited ? -1 : user.dailyQuota.limit - user.dailyQuota.used,
    quotaReached: false
  };
};

module.exports = { processAnalysis };
