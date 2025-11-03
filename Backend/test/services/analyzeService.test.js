jest.mock('axios');
jest.mock('../../services/documentLibraryService', () => {
  const mongoose = require('mongoose');
  return {
    saveDocumentToLibrary: jest.fn().mockResolvedValue({
      id: new mongoose.Types.ObjectId().toString(),
      name: 'Test doc',
      extractedText: 'processed',
      isDuplicate: false,
      message: 'Document ajouté à la bibliothèque.',
    }),
  };
});

const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../../models/User');
const { processAnalysis } = require('../../services/analyzeService');
const { saveDocumentToLibrary } = require('../../services/documentLibraryService');

const LONG_TEXT = `
Conditions Générales de Vente
Article 1 : Objet du contrat. Ce document décrit les obligations des parties.
Article 2 : Engagements. L'utilisateur s'engage à respecter les clauses et à régler les frais applicables.
Article 3 : Résiliation. La résiliation est possible avec un préavis de trente jours et entraîne des frais.
Article 4 : Données personnelles. Les données sont traitées selon le RGPD et conservées douze mois.
Article 5 : Responsabilité. La responsabilité de l'entreprise est limitée conformément aux dispositions légales.
`.repeat(3);

describe('processAnalysis', () => {
  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'fake-key';
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await User.deleteMany({});
  });

  it('stores analysis for paying user and returns parsed response', async () => {
    await User.create({
      firebaseUid: 'uid-standard',
      email: 'user@example.com',
      plan: 'standard',
      monthlyQuota: { used: 0, limit: 20 },
      lastQuotaReset: new Date('2023-12-01'),
    });

    axios.post.mockResolvedValue({
      data: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                resume: 'Analyse complète du document.',
                score: 'Bon',
                clauses: ['⚠️ Clause critique', '✅ Clause favorable'],
              }),
            }],
          },
        }],
      },
    });

    const result = await processAnalysis({
      uid: 'uid-standard',
      text: LONG_TEXT,
      source: 'text',
      documentName: 'doc.txt',
      originalName: 'doc.txt',
      fileType: 'text/plain',
    });

    expect(result).toEqual(expect.objectContaining({
      summary: 'Analyse complète du document.',
      score: 'Bon',
      clauses: ['⚠️ Clause critique', '✅ Clause favorable'],
      quotaReached: false,
      canExportPdf: true,
      remaining: 40,
    }));
    expect(result.analysisId).toBeDefined();
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(saveDocumentToLibrary).toHaveBeenCalledWith(expect.objectContaining({
      uid: 'uid-standard',
      name: 'doc.txt',
      originalName: 'doc.txt',
    }));

    const refreshedUser = await User.findOne({ firebaseUid: 'uid-standard' });
    expect(refreshedUser.analyses).toHaveLength(1);
    expect(refreshedUser.monthlyQuota.limit).toBe(40);
  });

  it('returns quotaReached when starter plan limit is exhausted', async () => {
    await User.create({
      firebaseUid: 'uid-starter',
      email: 'starter@example.com',
      plan: 'starter',
      monthlyQuota: { used: 20, limit: 20 },
    });

    const result = await processAnalysis({
      uid: 'uid-starter',
      text: LONG_TEXT,
      source: 'text',
    });

    expect(result.quotaReached).toBe(true);
    expect(result.message).toMatch(/Quota mensuel atteint/);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('throws when text is below minimum length', async () => {
    await User.create({
      firebaseUid: 'uid-short',
      email: 'short@example.com',
      plan: 'standard',
      monthlyQuota: { used: 0, limit: 20 },
    });

    await expect(processAnalysis({
      uid: 'uid-short',
      text: 'Texte trop court',
      source: 'text',
    })).rejects.toThrow('trop court');

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('throws when Gemini returns invalid JSON', async () => {
    await User.create({
      firebaseUid: 'uid-json',
      email: 'json@example.com',
      plan: 'standard',
      monthlyQuota: { used: 0, limit: 20 },
    });

    axios.post.mockResolvedValue({
      data: {
        candidates: [{
          content: {
            parts: [{
              text: 'non-json-response',
            }],
          },
        }],
      },
    });

    await expect(processAnalysis({
      uid: 'uid-json',
      text: LONG_TEXT,
      source: 'text',
    })).rejects.toThrow('Réponse IA invalide');
  });
});
