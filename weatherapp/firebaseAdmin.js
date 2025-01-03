const admin = require('firebase-admin');
const firebasesecret = require('./weather-app-login-a5f37-firebase-adminsdk-vs2xw-bba3278afd.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(firebasesecret),
});

module.exports = admin;
