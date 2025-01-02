const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Parse Firebase config from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
