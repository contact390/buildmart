const db = require('./db');

db.query('SELECT id, name, category, price, discount, rating, LENGTH(image) as image_len FROM products ORDER BY id DESC LIMIT 10', (err, rows) => {
  if (err) {
    console.error('SELECT error:', err);
    db.end();
    return;
  }
  console.log('Latest products:');
  console.table(rows);
  db.end();
});
