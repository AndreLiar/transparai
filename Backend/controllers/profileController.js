// Backend/controllers/profileController.js
const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const { uid: firebaseUid } = req.user;

    const user = await User.findOne({ firebaseUid }).select('profile email');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      email: user.email,
      profile: user.profile || {
        firstName: '',
        lastName: '',
        phone: '',
        country: '',
        isComplete: false,
      },
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { uid: firebaseUid } = req.user;
    const {
      firstName, lastName, phone, country,
    } = req.body;

    // Validation des données
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Le prénom et nom sont requis' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Mise à jour du profil
    user.profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || '',
      country: country?.trim() || '',
      isComplete: true,
    };

    await user.save();

    res.json({
      message: 'Profil mis à jour avec succès',
      profile: user.profile,
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
