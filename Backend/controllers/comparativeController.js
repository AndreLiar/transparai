// Backend/controllers/comparativeController.js
const { processComparativeAnalysis } = require('../services/comparativeService');
const { INDUSTRY_TEMPLATES } = require('../utils/analysisTemplates');

const compareDocuments = async (req, res) => {
  try {
    const { documents, industry = 'default' } = req.body; // Array of {text, source, name} + industry
    const { uid } = req.user;

    if (!documents || !Array.isArray(documents) || documents.length < 2) {
      return res.status(400).json({
        message: 'Au moins 2 documents sont requis pour la comparaison.',
      });
    }

    // Get user to determine document limits
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid: uid });
    const maxDocuments = user?.plan === 'enterprise' ? 20 : 5;

    if (documents.length > maxDocuments) {
      return res.status(400).json({
        message: `Maximum ${maxDocuments} documents peuvent être comparés à la fois${user?.plan === 'enterprise' ? ' (Plan Enterprise)' : ''}.`,
      });
    }

    const result = await processComparativeAnalysis({ uid, documents, industry });

    if (result.quotaReached) {
      return res.status(429).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('❌ Erreur analyse comparative :', err.message);
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

const getIndustryTemplates = async (_req, res) => {
  try {
    const templates = Object.keys(INDUSTRY_TEMPLATES).map((key) => ({
      id: key,
      name: INDUSTRY_TEMPLATES[key].name,
      criteria: INDUSTRY_TEMPLATES[key].criteria,
      compliance: INDUSTRY_TEMPLATES[key].compliance,
    }));

    res.json({ templates });
  } catch (err) {
    console.error('❌ Erreur récupération templates :', err.message);
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

module.exports = { compareDocuments, getIndustryTemplates };
