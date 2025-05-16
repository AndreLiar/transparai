//Backend/middleware/authMiddleware.js
const admin = require('../config/firebase'); // ✅ Must import initialized instance

const authenticate = async (req, res, next) => {
  console.log('🧪 Middleware reached.');
  console.log('📥 Incoming request:', req.method, req.url);
  console.log('🧾 Request headers:', req.headers);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ Token manquant ou mal formaté');
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Firebase token verified:', decodedToken.email);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };

    next();
  } catch (err) {
    console.error('❌ Erreur de vérification du token Firebase :', err.message);
    return res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authenticate;
