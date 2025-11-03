// Backend/config/firebase.js
const admin = require('firebase-admin');

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  serviceAccount = require('../serviceAccountKey.json');
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
