const db = require('./db');

db.query('SELECT id, LENGTH(image) as len, SUBSTRING(image,1,120) as sample FROM products WHERE id IN (1,2,3)', (err, rows) => {
  if (err) { console.error('products inspect error', err); db.end(); return; }
  console.log('Products images:');
  console.table(rows);

  db.query('SELECT id, product_id, LENGTH(image) as len, image FROM cart_items ORDER BY id DESC LIMIT 20', (err2, rows2) => {
    if (err2) { console.error('cart_items inspect error', err2); db.end(); return; }
    console.log('\nCart items image cols:');
    console.table(rows2.map(r => ({ id: r.id, product_id: r.product_id, len: r.len, image_is_null: r.image === null })));
    db.end();
  });
});
