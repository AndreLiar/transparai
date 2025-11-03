// Backend/middleware/planMiddleware.js
const User = require('../models/User');
const { hasFeature, hasRouteAccess } = require('../utils/planUtils');

// Middleware to check if user has access to a specific feature
const requireFeature = (featureName, customMessage) => {
  return async (req, res, next) => {
    try {
      const { uid: firebaseUid } = req.user;
      const user = await User.findOne({ firebaseUid });
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      const userPlan = user.plan || 'free';
      
      if (!hasFeature(userPlan, featureName)) {
        return res.status(403).json({
          message: customMessage || `Cette fonctionnalité nécessite un plan supérieur.`,
          featureRequired: featureName,
          currentPlan: userPlan,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error in requireFeature middleware:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
};

// Middleware to check route access based on plan
const requireRouteAccess = (route, customMessage) => {
  return async (req, res, next) => {
    try {
      const { uid: firebaseUid } = req.user;
      const user = await User.findOne({ firebaseUid });
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      const userPlan = user.plan || 'free';
      
      if (!hasRouteAccess(userPlan, route)) {
        return res.status(403).json({
          message: customMessage || `Accès non autorisé pour votre plan actuel.`,
          routeRequired: route,
          currentPlan: userPlan,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error in requireRouteAccess middleware:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
};

// Specific middleware for common features
const requireHistory = requireFeature('history', 'L\'historique des analyses nécessite un plan Standard ou supérieur.');
const requirePdfExport = requireFeature('pdfExport', 'L\'export PDF nécessite un plan Standard ou supérieur.');
const requireAdvancedAnalysis = requireFeature('advancedAnalysis', 'L\'analyse comparative nécessite un plan Premium ou supérieur.');
const requireTeamFeatures = requireFeature('teamFeatures', 'Les fonctionnalités d\'équipe nécessitent un plan Enterprise.');
const requireApiAccess = requireFeature('apiAccess', 'L\'accès API nécessite un plan Premium ou supérieur.');

module.exports = {
  requireFeature,
  requireRouteAccess,
  requireHistory,
  requirePdfExport,
  requireAdvancedAnalysis,
  requireTeamFeatures,
  requireApiAccess
};