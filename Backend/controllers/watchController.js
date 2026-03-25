// Backend/controllers/watchController.js
const {
  watchDocument,
  listWatches,
  deleteWatch,
  updateWatch,
  getChangeHistory,
  checkForChanges,
} = require('../services/watchService');

// POST /api/watch — start watching a document
const createWatch = async (req, res) => {
  try {
    const {
      name, analysisId, text, url, checkFrequency,
    } = req.body;

    if (!name || !analysisId || !text) {
      return res.status(400).json({ message: 'name, analysisId et text sont requis.' });
    }

    const { watch, created } = await watchDocument({
      firebaseUid: req.user.uid,
      name,
      analysisId,
      text,
      url: url || null,
      checkFrequency: checkFrequency || 'weekly',
    });

    return res.status(created ? 201 : 200).json({ watch, created });
  } catch (err) {
    console.error('❌ createWatch error:', err.message);
    return res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

// GET /api/watch — list all watches for the user
const getWatches = async (req, res) => {
  try {
    const watches = await listWatches(req.user.uid);
    return res.json({ watches });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

// DELETE /api/watch/:id — stop watching
const removeWatch = async (req, res) => {
  try {
    const deleted = await deleteWatch(req.user.uid, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Document surveillé introuvable.' });
    return res.json({ message: 'Surveillance supprimée.' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

// PATCH /api/watch/:id — update watch settings
const patchWatch = async (req, res) => {
  try {
    const watch = await updateWatch(req.user.uid, req.params.id, req.body);
    if (!watch) return res.status(404).json({ message: 'Document surveillé introuvable.' });
    return res.json({ watch });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

// GET /api/watch/:id/history — change history for a watch
const getHistory = async (req, res) => {
  try {
    const result = await getChangeHistory(req.user.uid, req.params.id);
    if (!result) return res.status(404).json({ message: 'Document surveillé introuvable.' });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

// POST /api/watch/:id/check — user manually re-uploads to check for changes
const manualCheck = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text est requis.' });

    const result = await checkForChanges({
      watchId: req.params.id,
      firebaseUid: req.user.uid,
      newText: text,
    });

    return res.json(result);
  } catch (err) {
    console.error('❌ manualCheck error:', err.message);
    return res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
};

module.exports = {
  createWatch, getWatches, removeWatch, patchWatch, getHistory, manualCheck,
};
