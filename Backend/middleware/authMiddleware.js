// Backend/middleware/authMiddleware.js
const admin = require('../config/firebase'); // ✅ Must import initialized instance

const authenticate = async (req, res, next) => {
  // Only log minimal info in production, exclude sensitive headers
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧪 Auth middleware - Request:', req.method, req.url);
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ Missing or malformed token');
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Only log email in dev, never log tokens
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Token verified for user:', decodedToken.email);
    } else {
      console.log('✅ Token verified successfully');
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false
    };

    next();
  } catch (err) {
    // Sanitize error messages in production
    const sanitizedError = process.env.NODE_ENV === 'production' 
      ? 'Token validation failed' 
      : err.message;
    
    console.error('❌ Token verification error:', sanitizedError);
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authenticate;
