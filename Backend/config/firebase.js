//Backend/config/firebase.js
const admin = require('firebase-admin');

const serviceAccount = require('./transparai-f544f-firebase-adminsdk-fbsvc-3f24ae6c23.json'); // Your Firebase service account JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
