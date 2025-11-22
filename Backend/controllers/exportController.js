// controller/exportController.js

const PDFDocument = require('pdfkit');
const User = require('../models/User');
const { hasFeature } = require('../utils/planUtils');

// Helper function for score colors
const getScoreColor = (score) => {
  switch (score.toLowerCase()) {
    case 'excellent': return '#10b981';
    case 'bon': return '#3b82f6';
    case 'moyen': return '#f59e0b';
    case 'médiocre': return '#f97316';
    case 'problématique': return '#ef4444';
    default: return '#6b7280';
  }
};

const exportAnalysisPDF = async (req, res) => {
  try {
    const { uid } = req.user;
    const { analysisId } = req.params;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    // Check if user has PDF export feature
    const userPlan = user.plan || 'free';
    if (!hasFeature(userPlan, 'pdfExport')) {
      return res.status(403).json({
        message: 'L\'export PDF nécessite un plan Standard ou supérieur.',
        featureRequired: 'pdfExport',
        currentPlan: userPlan,
        upgradeRequired: true,
      });
    }

    const analysis = user.analyses.id(analysisId);
    if (!analysis) {
      return res.status(404).json({ message: 'Analyse non trouvée' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analyse_transparai_${Date.now()}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24)
      .fillColor('#4f46e5')
      .text('TransparAI', { align: 'center' })
      .fontSize(16)
      .fillColor('#6b7280')
      .text('Analyse de Conditions Générales d\'Abonnement', { align: 'center' })
      .moveDown(2);

    // Analysis date
    doc.fontSize(12)
      .fillColor('#9ca3af')
      .text(`Généré le ${new Date(analysis.createdAt).toLocaleDateString('fr-FR')}`, { align: 'right' })
      .moveDown(1);

    // Score section
    doc.fontSize(16)
      .fillColor('#1f2937')
      .text('Score de Transparence', { underline: true })
      .moveDown(0.5);

    const scoreColor = getScoreColor(analysis.score);
    doc.fontSize(14)
      .fillColor(scoreColor)
      .text(`${analysis.score}`, { indent: 20 })
      .fillColor('#1f2937')
      .moveDown(1);

    // Summary section
    doc.fontSize(16)
      .text('Résumé Exécutif', { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(analysis.summary, {
        align: 'justify',
        indent: 20,
        width: doc.page.width - 120,
      })
      .moveDown(1.5);

    // Clauses section
    doc.fontSize(16)
      .text('Clauses Importantes', { underline: true })
      .moveDown(0.5);

    analysis.clauses.forEach((clause, index) => {
      doc.fontSize(11)
        .text(`${index + 1}. ${clause}`, {
          indent: 20,
          width: doc.page.width - 120,
          align: 'justify',
        })
        .moveDown(0.3);
    });

    // Footer
    doc.fontSize(8)
      .fillColor('#9ca3af')
      .text(
        `Analyse générée par TransparAI | ${new Date().toLocaleDateString('fr-FR')}`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );

    doc.end();
  } catch (err) {
    console.error('❌ Erreur export PDF :', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = { exportAnalysisPDF };
