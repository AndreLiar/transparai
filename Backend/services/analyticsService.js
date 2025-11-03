// Backend/services/analyticsService.js
const User = require('../models/User');

const getAdvancedAnalytics = async ({ uid }) => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new Error('Utilisateur introuvable');

  // Only Premium users can access advanced analytics
  if (user.plan !== 'premium') {
    throw new Error('Les analytics avancés sont réservés aux abonnés Premium.');
  }

  const analyses = user.analyses || [];
  const comparativeAnalyses = user.comparativeAnalyses || [];

  // Calculate analytics
  const totalAnalyses = analyses.length;
  const totalComparativeAnalyses = comparativeAnalyses.length;

  // Score distribution
  const scoreDistribution = {
    Excellent: 0,
    Bon: 0,
    Moyen: 0,
    Médiocre: 0,
    Problématique: 0,
  };

  analyses.forEach((analysis) => {
    if (scoreDistribution.hasOwnProperty(analysis.score)) {
      scoreDistribution[analysis.score]++;
    }
  });

  // Monthly trend (last 12 months)
  const monthlyTrend = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const monthlyCount = analyses.filter((analysis) => {
      const analysisDate = new Date(analysis.createdAt || analysis.date);
      return analysisDate >= monthDate && analysisDate < nextMonth;
    }).length;

    monthlyTrend.push({
      month: monthDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      analyses: monthlyCount,
    });
  }

  // Source breakdown
  const sourceBreakdown = {
    upload: 0,
    ocr: 0,
  };

  analyses.forEach((analysis) => {
    if (sourceBreakdown.hasOwnProperty(analysis.source)) {
      sourceBreakdown[analysis.source]++;
    }
  });

  // Most common clauses
  const clauseFrequency = {};
  analyses.forEach((analysis) => {
    if (analysis.clauses && Array.isArray(analysis.clauses)) {
      analysis.clauses.forEach((clause) => {
        // Extract first few words to group similar clauses
        const key = clause.substring(0, 50).trim();
        clauseFrequency[key] = (clauseFrequency[key] || 0) + 1;
      });
    }
  });

  const topClauses = Object.entries(clauseFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([clause, count]) => ({ clause, count }));

  // Weekly activity (last 4 weeks)
  const weeklyActivity = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));

    const weeklyCount = analyses.filter((analysis) => {
      const analysisDate = new Date(analysis.createdAt || analysis.date);
      return analysisDate >= weekStart && analysisDate < weekEnd;
    }).length;

    weeklyActivity.push({
      week: `Semaine ${i === 0 ? 'actuelle' : `-${i}`}`,
      analyses: weeklyCount,
    });
  }

  return {
    overview: {
      totalAnalyses,
      totalComparativeAnalyses,
      averageScore: calculateAverageScore(analyses),
      mostCommonScore: getMostCommonScore(scoreDistribution),
    },
    scoreDistribution,
    monthlyTrend,
    weeklyActivity,
    sourceBreakdown,
    topClauses,
    insights: generateInsights(analyses, scoreDistribution),
  };
};

const calculateAverageScore = (analyses) => {
  if (analyses.length === 0) return 0;

  const scoreValues = {
    Excellent: 5,
    Bon: 4,
    Moyen: 3,
    Médiocre: 2,
    Problématique: 1,
  };

  const totalScore = analyses.reduce((sum, analysis) => sum + (scoreValues[analysis.score] || 3), 0);

  return Math.round((totalScore / analyses.length) * 100) / 100;
};

const getMostCommonScore = (scoreDistribution) => Object.entries(scoreDistribution)
  .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Moyen';

const generateInsights = (analyses, scoreDistribution) => {
  const insights = [];

  // Score-based insights
  const problematicCount = scoreDistribution['Problématique'] + scoreDistribution['Médiocre'];
  const goodCount = scoreDistribution.Excellent + scoreDistribution.Bon;

  if (problematicCount > goodCount) {
    insights.push({
      type: 'warning',
      message: `Attention: ${problematicCount} documents analysés présentent des clauses problématiques. Considérez une révision juridique.`,
    });
  }

  if (goodCount > analyses.length * 0.7) {
    insights.push({
      type: 'success',
      message: `Excellente qualité: ${Math.round((goodCount / analyses.length) * 100)}% de vos documents ont une qualité satisfaisante.`,
    });
  }

  // Usage insights
  if (analyses.length > 20) {
    insights.push({
      type: 'info',
      message: `Utilisateur actif: Vous avez analysé ${analyses.length} documents. Votre expertise juridique s'améliore!`,
    });
  }

  return insights;
};

module.exports = { getAdvancedAnalytics };
