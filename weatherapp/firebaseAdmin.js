// firebaseAdmin.js

const admin = require('firebase-admin');
const serviceAccount = require('./weather-app-login-a5f37-firebase-adminsdk-vs2xw-b06883ae23.json');

// Initialize the Admin SDK with your service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;