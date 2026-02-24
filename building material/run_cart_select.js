const db = require('./db');
const key = '3261069b-e576-40d9-9641-82a62f70fe49';

const q = `SELECT c.id as cart_id,
                    ci.id as id,
                    ci.product_id,
                    ci.name,
                    ci.price,
                    ci.qty,
                    COALESCE(ci.image, p.image, pe.imageUrl) as image
             FROM carts c
             LEFT JOIN cart_items ci ON ci.cart_id = c.id
             LEFT JOIN products p ON p.id = ci.product_id
             WHERE c.cart_key = ?`;

db.query(q, [key], (err, rows) => {
  if (err) { console.error('query error', err); db.end(); return; }
  console.log('Rows count', rows.length);
  rows.forEach(r => {
    console.log('id', r.id, 'product_id', r.product_id, 'image_len', r.image ? r.image.length : null, 'image_sample', (r.image ? r.image.substring(0,80) : null));
  });
  db.end();
});
