require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  // host: 'localhost',       
  // user: 'root',           
  // password: 'Kartik@790',        
  // database: 'testing_platform'  
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database: weather_app');
});

module.exports = db;
