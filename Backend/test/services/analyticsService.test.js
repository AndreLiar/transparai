const User = require('../../models/User');
const { getAdvancedAnalytics } = require('../../services/analyticsService');

const buildAnalysis = (overrides = {}) => ({
  source: 'upload',
  summary: 'Synthèse',
  score: 'Bon',
  clauses: ['Clause 1'],
  createdAt: new Date(),
  ...overrides,
});

describe('analyticsService.getAdvancedAnalytics', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('throws when user is not premium', async () => {
    const user = await User.create({
      firebaseUid: 'non-premium',
      email: 'basic@example.com',
      plan: 'starter',
    });

    await expect(getAdvancedAnalytics({ uid: user.firebaseUid }))
      .rejects.toThrow('Premium');
  });

  it('returns aggregated analytics for premium user', async () => {
    const now = new Date();
    const earlier = new Date(now.getFullYear(), now.getMonth() - 2, 10);

    await User.create({
      firebaseUid: 'premium-uid',
      email: 'premium@example.com',
      plan: 'premium',
      analyses: [
        buildAnalysis({ score: 'Excellent', createdAt: now }),
        buildAnalysis({ score: 'Moyen', createdAt: earlier }),
        buildAnalysis({ score: 'Problématique', clauses: ['⚠️ Problème'], createdAt: now }),
        buildAnalysis({ score: 'Problématique', clauses: ['⚠️ Autre Problème'], createdAt: now }),
      ],
      comparativeAnalyses: [{
        documents: [{ name: 'Doc 1', source: 'upload' }],
        industry: 'saas',
        template: 'Template',
        summary: 'Comparaison',
        comparisonTable: [],
        bestPractices: [],
        redFlags: [],
        recommendations: [],
        overallRanking: [],
        createdAt: now,
      }],
    });

    const analytics = await getAdvancedAnalytics({ uid: 'premium-uid' });

    expect(analytics.overview.totalAnalyses).toBe(4);
    expect(analytics.overview.totalComparativeAnalyses).toBe(1);
    expect(analytics.scoreDistribution.Excellent).toBe(1);
    expect(analytics.scoreDistribution['Problématique']).toBe(2);
    expect(analytics.monthlyTrend).toHaveLength(12);
    expect(analytics.topClauses.length).toBeGreaterThan(0);
    expect(analytics.insights.length).toBeGreaterThan(0);
  });
});
