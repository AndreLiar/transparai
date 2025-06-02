// Backend/controllers/analyzeController.js
const { processAnalysis } = require('../services/analyzeService');

const analyzeText = async (req, res) => {
  try {
    const { text, source } = req.body;
    const { uid, email } = req.user;

    if (!text || !source) {
      return res.status(400).json({ message: 'Champ manquant (text ou source).' });
    }

    const result = await processAnalysis({ uid, email, text, source });
    res.json(result);
  } catch (err) {
    console.error('❌ Erreur analyse :', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { analyzeText };

