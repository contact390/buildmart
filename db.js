
const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'buildmarts',
  password: '2001', // ← replace with your DB password
  database: 'buildimarts',
  port:3306, // ← make sure this DB exists
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB connection error:', err);
    return;
  }
  console.log('✅ buildmart DB connected');
  connection.release();
});

module.exports = db;