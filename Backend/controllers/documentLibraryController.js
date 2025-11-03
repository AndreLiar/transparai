// Backend/controllers/documentLibraryController.js
const {
  getUserDocuments,
  getDocumentContent,
  deleteDocument,
  shareDocumentWithOrg,
} = require('../services/documentLibraryService');

// Get user's document library
const getLibrary = async (req, res) => {
  try {
    const { uid } = req.user;
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      includeOrgDocs = 'false',
    } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search: search || '',
      sortBy: sortBy || 'lastUsed',
      sortOrder: sortOrder || 'desc',
      includeOrgDocs: includeOrgDocs === 'true',
    };

    const result = await getUserDocuments(uid, options);
    res.json(result);
  } catch (err) {
    console.error('❌ Erreur récupération bibliothèque:', err.message);
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

// Get specific document content
const getDocumentById = async (req, res) => {
  try {
    const { uid } = req.user;
    const { documentId } = req.params;

    const document = await getDocumentContent(uid, documentId);
    res.json(document);
  } catch (err) {
    console.error('❌ Erreur récupération document:', err.message);
    const status = err.message.includes('introuvable') || err.message.includes('autorisé') ? 404 : 500;
    res.status(status).json({ message: err.message || 'Erreur serveur' });
  }
};

// Delete document from library
const removeDocument = async (req, res) => {
  try {
    const { uid } = req.user;
    const { documentId } = req.params;

    const result = await deleteDocument(uid, documentId);
    res.json(result);
  } catch (err) {
    console.error('❌ Erreur suppression document:', err.message);
    const status = err.message.includes('introuvable') || err.message.includes('autorisé') ? 404 : 500;
    res.status(status).json({ message: err.message || 'Erreur serveur' });
  }
};

// Share/unshare document with organization
const toggleOrgSharing = async (req, res) => {
  try {
    const { uid } = req.user;
    const { documentId } = req.params;
    const { share = true } = req.body;

    const result = await shareDocumentWithOrg(uid, documentId, share);
    res.json(result);
  } catch (err) {
    console.error('❌ Erreur partage document:', err.message);
    const status = err.message.includes('introuvable') || err.message.includes('autorisé') ? 404
      : err.message.includes('organisation') ? 403 : 500;
    res.status(status).json({ message: err.message || 'Erreur serveur' });
  }
};

module.exports = {
  getLibrary,
  getDocumentById,
  removeDocument,
  toggleOrgSharing,
};
