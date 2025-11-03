// Backend/controllers/organizationController.js
const {
  createOrganization,
  getOrganizationDetails,
  updateOrganizationSettings,
  getOrganizationBilling,
} = require('../services/organizationService');

const createOrg = async (req, res) => {
  try {
    const { name, domain, branding } = req.body;
    const { uid } = req.user;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de l\'organisation est requis.' });
    }

    const organization = await createOrganization({
      name,
      domain,
      adminUserId: uid,
      branding,
    });

    return res.status(201).json({
      message: 'Organisation créée avec succès.',
      organization: {
        id: organization._id,
        name: organization.name,
        domain: organization.domain,
        branding: organization.settings.branding,
      },
    });
  } catch (err) {
    console.error('❌ Erreur création organisation :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la création de l\'organisation.' });
  }
};

const getOrgDetails = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { uid } = req.user;

    const orgDetails = await getOrganizationDetails({ organizationId });

    return res.json(orgDetails);
  } catch (err) {
    console.error('❌ Erreur détails organisation :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la récupération des détails.' });
  }
};

const updateOrgSettings = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { uid } = req.user;
    const updates = req.body;

    const organization = await updateOrganizationSettings({
      organizationId,
      updates,
      userId: uid,
    });

    return res.json({
      message: 'Paramètres mis à jour avec succès.',
      organization,
    });
  } catch (err) {
    console.error('❌ Erreur mise à jour organisation :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la mise à jour.' });
  }
};

const getOrgBilling = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { uid } = req.user;

    const billing = await getOrganizationBilling({ organizationId, userId: uid });

    return res.json(billing);
  } catch (err) {
    console.error('❌ Erreur facturation organisation :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la récupération de la facturation.' });
  }
};

const getMyOrganization = async (req, res) => {
  try {
    const { uid } = req.user;
    const User = require('../models/User');

    const user = await User.findOne({ firebaseUid: uid }).populate('organization.id');

    if (!user.organization.id) {
      return res.status(404).json({ message: 'Aucune organisation trouvée.' });
    }

    const orgDetails = await getOrganizationDetails({
      organizationId: user.organization.id._id,
    });

    return res.json({
      ...orgDetails,
      userRole: user.organization.role,
    });
  } catch (err) {
    console.error('❌ Erreur organisation utilisateur :', err.message);
    res.status(400).json({ message: err.message || 'Erreur lors de la récupération de l\'organisation.' });
  }
};

module.exports = {
  createOrg,
  getOrgDetails,
  updateOrgSettings,
  getOrgBilling,
  getMyOrganization,
};
