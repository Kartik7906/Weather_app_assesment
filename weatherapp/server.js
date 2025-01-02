const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/Auth');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());             
app.use(express.urlencoded({ extended: true })); 

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);

// Default route (optional): serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
