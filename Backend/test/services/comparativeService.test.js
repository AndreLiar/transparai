jest.mock('axios');
jest.mock('../../services/documentLibraryService', () => ({
  saveDocumentToLibrary: jest.fn().mockResolvedValue({
    id: 'doc-id',
    name: 'Doc',
    extractedText: 'Texte',
    isDuplicate: false,
    message: 'Document ajouté',
  }),
}));

const axios = require('axios');
const User = require('../../models/User');
const { processComparativeAnalysis } = require('../../services/comparativeService');

const buildDocument = (index = 1) => ({
  name: `Doc ${index}`,
  source: 'upload',
  text: `
Conditions contractuelles de service numéro ${index}.
Clauses: engagement, résiliation, données personnelles, responsabilité, recours.
    `.repeat(3),
});

describe('processComparativeAnalysis', () => {
  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'fake-gemini-key';
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});
  });

  it('throws when user plan is not premium nor enterprise', async () => {
    await User.create({
      firebaseUid: 'basic-user',
      email: 'basic@example.com',
      plan: 'standard',
    });

    await expect(processComparativeAnalysis({
      uid: 'basic-user',
      documents: [buildDocument(1), buildDocument(2)],
    })).rejects.toThrow('Premium');
  });

  it('returns structured comparative analysis for premium user', async () => {
    await User.create({
      firebaseUid: 'premium-user',
      email: 'premium@example.com',
      plan: 'premium',
    });

    axios.post.mockResolvedValue({
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                summary: 'Comparaison synthétique.',
                comparison_table: [{
                  criteria: 'Résiliation',
                  documents: [{ name: 'Doc 1', value: '30 jours', score: 3 }],
                }],
                best_practices: ['Clarté des frais'],
                red_flags: ['Engagement long'],
                recommendations: ['Simplifier la résiliation'],
                overall_ranking: [{ name: 'Doc 1', rank: 1, justification: 'Plus transparent' }],
                compliance_analysis: [],
                industry_insights: ['Tendance à clarifier les données'],
              }),
            }],
          },
        }],
      },
    });

    const result = await processComparativeAnalysis({
      uid: 'premium-user',
      documents: [buildDocument(1), buildDocument(2)],
      industry: 'saas',
    });

    expect(result.summary).toBe('Comparaison synthétique.');
    expect(result.comparisonTable).toHaveLength(1);
    expect(result.recommendations).toContain('Simplifier la résiliation');

    const user = await User.findOne({ firebaseUid: 'premium-user' });
    expect(user.comparativeAnalyses).toHaveLength(1);
  });
});
