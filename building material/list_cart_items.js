const db = require('./db');

db.query(`SELECT ci.id, ci.product_id, ci.name, ci.qty, COALESCE(ci.image, p.image, pe.imageUrl) as image_src, LENGTH(COALESCE(ci.image, p.image, pe.imageUrl)) as img_len
FROM cart_items ci LEFT JOIN products p ON p.id = ci.product_id LEFT JOIN products_extended pe ON pe.id = ci.product_id ORDER BY ci.id DESC`, (err, rows) => {
  if (err) {
    console.error('SELECT error:', err);
    db.end();
    return;
  }
  console.log('Cart items:');
  console.table(rows.map(r => ({ id: r.id, product_id: r.product_id, name: r.name, qty: r.qty, image_len: r.img_len })));
  db.end();
});
