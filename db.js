// db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "31.97.186.211",
  user: 'buildmarts',
  password: 'buildmarts@2001', // ← replace with your DB password
  database: 'buildimarts',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
  } else {
    console.log("MySQL Connected Successfully");
  }
});

module.exports = db;