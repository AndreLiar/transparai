//backend/controllers/userController.js
const admin = require('../config/firebase');
const User = require('../models/User');

const deleteUserAccount = async (req, res) => {
  const { uid } = req.user;

  try {
    // 1. Delete from Firebase
    await admin.auth().deleteUser(uid);

    // 2. Delete from MongoDB
    await User.findOneAndDelete({ firebaseUid: uid });

    return res.status(200).json({ message: 'Compte supprimé avec succès.' });
  } catch (err) {
    console.error('❌ Erreur suppression compte:', err.message);
    return res.status(500).json({ message: 'Erreur lors de la suppression du compte.' });
  }
};

module.exports = { deleteUserAccount };
