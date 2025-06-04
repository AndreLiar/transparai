
//controller/exportController.js

const PDFDocument = require('pdfkit');
const User = require('../models/User');
const { isPremiumUser } = require('../utils/planUtils');

const exportAnalysisPDF = async (req, res) => {
  try {
    const { uid } = req.user;
    const { analysisId } = req.params;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (!isPremiumUser(user.plan)) {
      return res.status(403).json({ message: 'Fonction réservée aux abonnés payants.' });
    }

    const analysis = user.analyses.id(analysisId);
    if (!analysis) {
      return res.status(404).json({ message: 'Analyse non trouvée' });
    }

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analyse_${analysisId}.pdf`);

    doc.pipe(res);
    doc.fontSize(20).text('Analyse Juridique', { align: 'center' }).moveDown();

    doc.fontSize(14).text(`Résumé : ${analysis.summary}`).moveDown();
    doc.text(`Score : ${analysis.score}`).moveDown();
    doc.text(`Clauses :`).moveDown();

    analysis.clauses.forEach((clause, index) => {
      doc.text(`• ${clause}`);
    });

    doc.end();
  } catch (err) {
    console.error('❌ Erreur export PDF :', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { exportAnalysisPDF };
