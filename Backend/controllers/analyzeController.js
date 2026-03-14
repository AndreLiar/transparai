// Backend/controllers/analyzeController.js
const { processAnalysis } = require('../services/analyzeService');

const analyzeText = async (req, res) => {
  try {
    const {
      text, source, documentName, originalName,
      fileType, sizeBytes, pageCount, ocrConfidence,
    } = req.body;

    if (!text || !source) {
      return res.status(400).json({ message: 'Champ manquant (text ou source).' });
    }

    const result = await processAnalysis({
      firebaseUid: req.user.uid,
      text, source, documentName, originalName,
      fileType, sizeBytes, pageCount, ocrConfidence,
    });

    return res.status(result.status).json(result.body);
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
