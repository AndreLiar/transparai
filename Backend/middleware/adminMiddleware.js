// Backend/middleware/adminMiddleware.js
const User = require('../models/User');
const logger = require('../utils/logger');

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      logger.warn('Admin access denied - user not found', {
        uid: req.user.uid,
        endpoint: req.originalUrl,
        ip: req.ip,
      });

      return res.status(403).json({
        error: 'Accès administrateur requis',
        code: 'ADMIN_ACCESS_REQUIRED',
      });
    }

    if (!user.isAdmin) {
      logger.warn('Admin access denied - insufficient privileges', {
        uid: req.user.uid,
        email: user.email,
        endpoint: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      return res.status(403).json({
        error: 'Accès administrateur requis',
        code: 'ADMIN_ACCESS_REQUIRED',
      });
    }

    // Log successful admin access
    logger.info('Admin access granted', {
      uid: req.user.uid,
      email: user.email,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    req.adminUser = user;
    next();
  } catch (error) {
    logger.error('Admin middleware error', {
      error: error.message,
      stack: error.stack,
      uid: req.user?.uid,
    });

    return res.status(500).json({
      error: 'Erreur de vérification des privilèges',
      code: 'ADMIN_CHECK_ERROR',
    });
  }
};

module.exports = { requireAdmin };
