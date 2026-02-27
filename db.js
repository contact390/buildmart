const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'buildmarts',
  password: '2001', // ← replace with your DB password
  database: 'buildimarts',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
