// db.js
// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'buildmarts',
  password: 'buildmarts@2001', // ← replace with your DB password
  database: 'buildmarts',
  port:3306 // ← make sure this DB exists
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
  } else {
    console.log('✅ MySQL connected.');
  }
});

module.exports = db;