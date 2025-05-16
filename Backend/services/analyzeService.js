// Backend/services/analyzeService.js
// Backend/services/analyzeService.js
const User = require('../models/User');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Assure-toi que c’est bien configuré

const processAnalysis = async ({ uid, email, text, source }) => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new Error('Utilisateur introuvable');

  const { used, limit } = user.dailyQuota;
  if (used >= limit) {
    // Renvoie un objet spécifique pour indiquer le quota atteint, plutôt que de lancer une erreur
    // Le frontend pourra gérer ce cas spécifiquement.
    return { quotaReached: true, message: 'Quota quotidien atteint.' };
  }

  // Appel Gemini API (gemini-1.5-flash est souvent un bon choix récent, mais gemini-2.0-flash est ok si c'est ce que tu as)
  // NOTE: Consider using gemini-1.5-flash if available and suitable for cost/performance.
  const model = 'gemini-1.5-flash-latest'; // Ou reste sur 'gemini-pro' ou le modèle que tu utilisais si 'flash' n'est pas encore stable/dispo via cette API ou si tu préfères
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;


  let completion;
  try {
      completion = await axios.post(
        API_URL,
        {
          // Mise à jour du prompt pour être encore plus explicite
          contents: [
            {
              role: 'user',
              parts: [{
                text: `
Tu es un assistant juridique francophone spécialisé dans l'analyse de Conditions Générales d'Abonnement (CGA).
Analyse le texte CGA suivant fourni par l'utilisateur.
Réponds **UNIQUEMENT** avec un objet JSON valide. N'inclus absolument RIEN d'autre en dehors de ce JSON (pas de texte explicatif, pas de salutations, pas de markdown comme \`\`\`).
Le JSON doit contenir EXACTEMENT les clés suivantes :
- "resume": une chaîne de caractères (string) résumant le document.
- "score": une chaîne de caractères (string) représentant un score numérique entre "0" et "100", évaluant la clarté et l'équilibre des clauses pour l'utilisateur (0=très défavorable/confus, 100=très favorable/clair). Ne justifie pas le score ici.
- "clauses": un tableau (array) de chaînes de caractères (string), où chaque chaîne représente un point clé ou une clause importante du document.

Voici le texte CGA à analyser :
\`\`\`text
${text}
\`\`\`
`.trim() // .trim() est utile ici
              }]
            }
          ],
          // Ajout d'une configuration pour tenter de forcer le JSON (peut aider, mais pas garanti à 100%)
          generationConfig: {
            // responseMimeType: "application/json", // Décommente si tu utilises une version/API qui le supporte explicitement
            temperature: 0.5 // Un peu de créativité pour le résumé, mais pas trop pour la structure
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          // Ajout d'un timeout pour éviter les requêtes bloquées indéfiniment
          timeout: 30000 // 30 secondes
        }
      );
  } catch(apiError) {
      console.error("❌ Erreur lors de l'appel à l'API Gemini:", apiError.response?.data || apiError.message);
      // Remonte une erreur plus informative
      throw new Error(`Erreur de communication avec l'API d'analyse. Détails: ${apiError.message}`);
  }


  const raw = completion.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Réponse BRUTE de Gemini:', raw); // Log pour débogage

  let parsed;
  try {
    // --- DÉBUT DE LA CORRECTION ---
    // Nettoyer la réponse brute pour enlever les potentiels backticks et le mot 'json'
    let cleanedJsonString = raw
      .trim() // Enlève les espaces/newlines au début et à la fin
      .replace(/^```json\s*/, '') // Enlève ```json au début (avec espace optionnel)
      .replace(/\s*```$/, ''); // Enlève ``` à la fin (avec espace optionnel)

    console.log('Chaîne nettoyée avant parsing:', cleanedJsonString); // Log pour débogage

    // Tenter de parser la chaîne nettoyée
    parsed = JSON.parse(cleanedJsonString);
    // --- FIN DE LA CORRECTION ---

  } catch (err) {
    console.error('❌ Erreur de parsing JSON après nettoyage:', err);
    console.error('❌ Réponse brute ayant causé l\'erreur:', raw); // Log la réponse brute qui a posé problème
    // L'erreur originale indiquait que la réponse AI était invalide, gardons ce message mais précisons
    throw new Error('Réponse de l\'IA invalide ou dans un format inattendu après nettoyage. Impossible de parser le JSON.');
  }

  // Vérification plus robuste de la structure attendue
  if (!parsed || typeof parsed.resume !== 'string' || typeof parsed.score !== 'string' || !Array.isArray(parsed.clauses) || !parsed.clauses.every(item => typeof item === 'string')) {
     console.error('❌ Données JSON parsées invalides:', parsed); // Log l'objet parsé mais invalide
     throw new Error('Réponse de l\'IA invalide. Le JSON parsé ne contient pas les clés/types attendus (resume: string, score: string, clauses: array of strings).');
  }

  // --- Logique métier (inchangée) ---
  // Enregistrement
  try {
      user.analyses.push({
        source,
        summary: parsed.resume,
        score: parsed.score, // Le score est déjà une string comme demandé
        clauses: parsed.clauses,
        createdAt: new Date() // Bonne pratique d'ajouter la date de création
      });
      user.dailyQuota.used += 1;
      await user.save();
  } catch(dbError) {
      console.error("❌ Erreur lors de l'enregistrement en base de données:", dbError);
      // Il faut peut-être informer l'utilisateur que l'analyse a fonctionné mais n'a pas pu être sauvée
      // Ou simplement remonter une erreur serveur générique
      throw new Error("Erreur interne lors de l'enregistrement de l'analyse.");
  }


  return {
    summary: parsed.resume,
    score: parsed.score,
    clauses: parsed.clauses,
    remaining: user.dailyQuota.limit - user.dailyQuota.used,
    quotaReached: false // Indique que le quota n'a pas été atteint pour cette requête
  };
};

module.exports = { processAnalysis };