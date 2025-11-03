// Backend/services/documentLibraryService.js
const DocumentLibrary = require('../models/DocumentLibrary');
const User = require('../models/User');

const saveDocumentToLibrary = async ({
  uid,
  name,
  originalName,
  extractedText,
  source,
  fileType,
  sizeBytes,
  pageCount,
  ocrConfidence,
}) => {
  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) throw new Error('Utilisateur introuvable');

    // Generate content hash for duplicate detection
    const contentHash = DocumentLibrary.generateContentHash(extractedText);

    // Check if document already exists for this user
    const existingDoc = await DocumentLibrary.findOne({
      userId: user._id,
      contentHash,
    });

    if (existingDoc) {
      // Document already exists, just update usage and return existing
      await existingDoc.recordUsage(null, null);
      return {
        id: existingDoc._id,
        name: existingDoc.name,
        extractedText: existingDoc.extractedText,
        isDuplicate: true,
        message: 'Document déjà en bibliothèque, réutilisation du contenu existant.',
      };
    }

    // Create new document library entry
    const newDocument = new DocumentLibrary({
      userId: user._id,
      name,
      originalName,
      contentHash,
      extractedText,
      source,
      fileType,
      sizeBytes,
      pageCount,
      ocrConfidence,
      organizationId: user.organization?.id || null,
    });

    await newDocument.save();

    return {
      id: newDocument._id,
      name: newDocument.name,
      extractedText: newDocument.extractedText,
      isDuplicate: false,
      message: 'Document ajouté à la bibliothèque.',
    };
  } catch (err) {
    console.error('❌ Erreur sauvegarde document library:', err);
    throw new Error(`Erreur lors de la sauvegarde en bibliothèque: ${err.message}`);
  }
};

const getUserDocuments = async (uid, options = {}) => {
  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) throw new Error('Utilisateur introuvable');

    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'lastUsed',
      sortOrder = 'desc',
      includeOrgDocs = false,
    } = options;

    // Build query
    let query = {
      userId: user._id,
      isActive: true,
    };

    // Include organization documents for enterprise users
    if (includeOrgDocs && user.organization?.id) {
      query = {
        $or: [
          { userId: user._id, isActive: true },
          {
            organizationId: user.organization.id,
            sharedWithOrg: true,
            isActive: true,
          },
        ],
      };
    }

    // Add search filter
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { originalName: { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const documents = await DocumentLibrary.find(query)
      .populate('userId', 'profile email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-extractedText'); // Don't send full text in list view

    const total = await DocumentLibrary.countDocuments(query);

    return {
      documents: documents.map((doc) => ({
        id: doc._id,
        name: doc.name,
        originalName: doc.originalName,
        source: doc.source,
        fileType: doc.fileType,
        sizeBytes: doc.sizeBytes,
        pageCount: doc.pageCount,
        usageCount: doc.usageCount,
        lastUsed: doc.lastUsed,
        createdAt: doc.createdAt,
        isOwnDocument: doc.userId._id.toString() === user._id.toString(),
        owner: doc.userId._id.toString() !== user._id.toString() ? {
          name: `${doc.userId.profile?.firstName} ${doc.userId.profile?.lastName}`.trim() || doc.userId.email,
        } : null,
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: documents.length,
        totalItems: total,
      },
    };
  } catch (err) {
    console.error('❌ Erreur récupération documents library:', err);
    throw new Error(`Erreur lors de la récupération des documents: ${err.message}`);
  }
};

const getDocumentContent = async (uid, documentId) => {
  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) throw new Error('Utilisateur introuvable');

    // Find document with access check
    const query = {
      _id: documentId,
      isActive: true,
      $or: [
        { userId: user._id },
        {
          organizationId: user.organization?.id,
          sharedWithOrg: true,
        },
      ],
    };

    const document = await DocumentLibrary.findOne(query);
    if (!document) {
      throw new Error('Document introuvable ou accès non autorisé.');
    }

    // Record usage
    await document.recordUsage(null, null);

    return {
      id: document._id,
      name: document.name,
      originalName: document.originalName,
      extractedText: document.extractedText,
      source: document.source,
      fileType: document.fileType,
      usageCount: document.usageCount,
      lastUsed: document.lastUsed,
    };
  } catch (err) {
    console.error('❌ Erreur récupération contenu document:', err);
    throw new Error(`Erreur lors de la récupération du contenu: ${err.message}`);
  }
};

const deleteDocument = async (uid, documentId) => {
  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) throw new Error('Utilisateur introuvable');

    // Only allow deletion of own documents
    const document = await DocumentLibrary.findOne({
      _id: documentId,
      userId: user._id,
      isActive: true,
    });

    if (!document) {
      throw new Error('Document introuvable ou accès non autorisé.');
    }

    // Soft delete
    document.isActive = false;
    document.updatedAt = new Date();
    await document.save();

    return { message: 'Document supprimé de la bibliothèque.' };
  } catch (err) {
    console.error('❌ Erreur suppression document:', err);
    throw new Error(`Erreur lors de la suppression: ${err.message}`);
  }
};

const shareDocumentWithOrg = async (uid, documentId, share = true) => {
  try {
    const user = await User.findOne({ firebaseUid: uid });
    if (!user || !user.organization?.id) {
      throw new Error('Utilisateur sans organisation.');
    }

    // Only admin/manager can share documents
    if (!['admin', 'manager'].includes(user.organization.role)) {
      throw new Error('Seuls les admins et managers peuvent partager des documents.');
    }

    const document = await DocumentLibrary.findOne({
      _id: documentId,
      userId: user._id,
      isActive: true,
    });

    if (!document) {
      throw new Error('Document introuvable.');
    }

    document.sharedWithOrg = share;
    document.organizationId = user.organization.id;
    document.updatedAt = new Date();
    await document.save();

    return {
      message: share
        ? 'Document partagé avec l\'organisation.'
        : 'Partage du document révoqué.',
    };
  } catch (err) {
    console.error('❌ Erreur partage document:', err);
    throw new Error(`Erreur lors du partage: ${err.message}`);
  }
};

module.exports = {
  saveDocumentToLibrary,
  getUserDocuments,
  getDocumentContent,
  deleteDocument,
  shareDocumentWithOrg,
};
