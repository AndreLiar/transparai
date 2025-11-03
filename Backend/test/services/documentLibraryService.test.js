const mongoose = require('mongoose');
const DocumentLibrary = require('../../models/DocumentLibrary');
const Organization = require('../../models/Organization');
const User = require('../../models/User');
const {
  saveDocumentToLibrary,
  getUserDocuments,
  getDocumentContent,
  deleteDocument,
  shareDocumentWithOrg,
} = require('../../services/documentLibraryService');

const createUser = (overrides = {}) => User.create({
  firebaseUid: `uid-${new mongoose.Types.ObjectId().toString()}`,
  email: `user-${Math.random().toString(36).slice(2)}@example.com`,
  plan: 'starter',
  monthlyQuota: { used: 0, limit: 20 },
  ...overrides,
});

describe('documentLibraryService', () => {
  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      DocumentLibrary.deleteMany({}),
      Organization.deleteMany({}),
    ]);
  });

  it('saves new documents and detects duplicates', async () => {
    const user = await createUser();

    const firstSave = await saveDocumentToLibrary({
      uid: user.firebaseUid,
      name: 'Contrat.pdf',
      originalName: 'Contrat.pdf',
      extractedText: 'Contenu juridique détaillé',
      source: 'upload',
      fileType: 'pdf',
    });

    expect(firstSave.isDuplicate).toBe(false);

    const secondSave = await saveDocumentToLibrary({
      uid: user.firebaseUid,
      name: 'Contrat.pdf',
      originalName: 'Contrat.pdf',
      extractedText: 'Contenu juridique détaillé',
      source: 'upload',
      fileType: 'pdf',
    });

    expect(secondSave.isDuplicate).toBe(true);

    const storedDoc = await DocumentLibrary.findOne({ userId: user._id });
    expect(storedDoc.usageCount).toBe(2);
  });

  it('returns paginated library metadata without extracted text', async () => {
    const user = await createUser();

    await saveDocumentToLibrary({
      uid: user.firebaseUid,
      name: 'Guide interne',
      originalName: 'guide.pdf',
      extractedText: 'Texte pour la première version.',
      source: 'upload',
      fileType: 'pdf',
    });

    const library = await getUserDocuments(user.firebaseUid, { page: 1, limit: 10 });
    expect(library.documents).toHaveLength(1);
    expect(library.documents[0]).toEqual(expect.objectContaining({
      name: 'Guide interne',
      originalName: 'guide.pdf',
      usageCount: 1,
    }));
    expect(library.documents[0].extractedText).toBeUndefined();
    expect(library.pagination.total).toBe(1);
  });

  it('retrieves document content and tracks usage', async () => {
    const user = await createUser();

    const saved = await saveDocumentToLibrary({
      uid: user.firebaseUid,
      name: 'Politique',
      originalName: 'politique.pdf',
      extractedText: 'Texte complet de la politique.',
      source: 'upload',
      fileType: 'pdf',
    });

    const content = await getDocumentContent(user.firebaseUid, saved.id);
    expect(content).toEqual(expect.objectContaining({
      name: 'Politique',
      extractedText: 'Texte complet de la politique.',
    }));

    const stored = await DocumentLibrary.findById(saved.id);
    expect(stored.usageCount).toBe(2); // initial save + direct access
  });

  it('soft deletes documents owned by the user', async () => {
    const user = await createUser();
    const saved = await saveDocumentToLibrary({
      uid: user.firebaseUid,
      name: 'Clause',
      originalName: 'clause.pdf',
      extractedText: 'Clause contractuelle importante.',
      source: 'upload',
      fileType: 'pdf',
    });

    await deleteDocument(user.firebaseUid, saved.id);

    const stored = await DocumentLibrary.findById(saved.id);
    expect(stored.isActive).toBe(false);
  });

  it('shares document with organization when user is admin', async () => {
    const organization = await Organization.create({ name: 'TransparAI', domain: 'transparai.com' });
    const user = await createUser({
      plan: 'enterprise',
      organization: {
        id: organization._id,
        role: 'admin',
        joinedAt: new Date(),
      },
    });

    const saved = await saveDocumentToLibrary({
      uid: user.firebaseUid,
      name: 'Audit interne',
      originalName: 'audit.pdf',
      extractedText: 'Données internes confidentielles.',
      source: 'upload',
      fileType: 'pdf',
    });

    await shareDocumentWithOrg(user.firebaseUid, saved.id, true);
    const stored = await DocumentLibrary.findById(saved.id);
    expect(stored.sharedWithOrg).toBe(true);
    expect(stored.organizationId.toString()).toBe(organization._id.toString());
  });

  it('throws when sharing without organization context', async () => {
    const user = await createUser({ plan: 'enterprise' });
    const saved = await saveDocumentToLibrary({
      uid: user.firebaseUid,
      name: 'Document',
      originalName: 'document.pdf',
      extractedText: 'Contenu du document.',
      source: 'upload',
      fileType: 'pdf',
    });

    await expect(shareDocumentWithOrg(user.firebaseUid, saved.id, true))
      .rejects.toThrow('Utilisateur sans organisation.');
  });
});
