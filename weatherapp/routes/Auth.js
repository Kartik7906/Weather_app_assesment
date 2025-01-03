const express = require('express');
const router = express.Router();
const db = require('../db');
const admin = require('../firebaseAdmin');

// 1. Registration Route
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please fill in all fields' });
  }

  const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  db.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.status(500).json({ msg: 'Server error' });
    }
    return res.status(200).json({ msg: 'User registered successfully' });
  });
});

// 2. Login Route 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], async (err, rows) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (rows.length === 0) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const user = rows[0];

    let fetchedWeatherTemp = '25';

    return res.status(200).json({
      msg: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        weather_temperature: fetchedWeatherTemp
      }
    });
  });
});

// 3. Store search
router.post('/storeSearch', (req, res) => {
  const { userId, city, temperature, humidity, wind } = req.body;

  if (!userId || !city) {
    return res.status(400).json({ msg: 'Missing userId or city' });
  }

  const sql = `
    INSERT INTO search_history (user_id, city, temperature, humidity, wind)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [userId, city, temperature, humidity, wind], (err, result) => {
    if (err) {
      console.error('Error storing search data:', err);
      return res.status(500).json({ msg: 'DB insertion error' });
    }
    return res.status(200).json({ msg: 'Search saved successfully.' });
  });
});

// 4. Google Login Route
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ msg: 'Missing ID token' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const googleUid = decodedToken.uid;
    const email = decodedToken.email;
    const displayName = decodedToken.name || 'Google User';

    const sqlCheck = 'SELECT * FROM users WHERE email = ?';
    db.query(sqlCheck, [email], (err, rows) => {
      if (err) {
        console.error('DB error checking user:', err);
        return res.status(500).json({ msg: 'Server error' });
      }

      if (rows.length === 0) {
        const sqlInsert = `
          INSERT INTO users (username, email, password, google_uid)
          VALUES (?, ?, ?, ?)
        `;
        db.query(sqlInsert, [displayName, email, 'GOOGLE_USER', googleUid], (insertErr, result) => {
          if (insertErr) {
            console.error('Error inserting new Google user:', insertErr);
            return res.status(500).json({ msg: 'Error creating user' });
          }
          const newUserId = result.insertId;
          return res.status(200).json({
            msg: 'Google login successful (new user created)',
            user: {
              id: newUserId,
              username: displayName,
              email: email
            }
          });
        });
      } else {
        const existingUser = rows[0];

        if (!existingUser.google_uid) {
          const sqlUpdate = `
            UPDATE users
            SET google_uid = ?
            WHERE id = ?
          `;
          db.query(sqlUpdate, [googleUid, existingUser.id], (updateErr) => {
            if (updateErr) {
              console.error('Error updating user with google_uid:', updateErr);
              return res.status(500).json({ msg: 'Error updating user' });
            }
            return res.status(200).json({
              msg: 'Google login successful (existing user, google_uid updated)',
              user: {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email
              }
            });
          });
        } else {
          return res.status(200).json({
            msg: 'Google login successful (existing user)',
            user: {
              id: existingUser.id,
              username: existingUser.username,
              email: existingUser.email
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return res.status(401).json({ msg: 'Invalid or expired Google token' });
  }
});

module.exports = router;
