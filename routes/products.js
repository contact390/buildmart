const express = require('express');
const router = express.Router();
const db = require('../db');

// Create products table if not exists
const createProducts = `
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    price DECIMAL(10,2) DEFAULT 0,
    discount INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    image LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createProducts, (e) => { if (e) console.error('products table:', e); });

// Ensure image column can hold large base64 strings; alter if it's too small
db.query("ALTER TABLE products MODIFY COLUMN image LONGTEXT", (alterErr) => {
  if (alterErr) {
    // log but don't crash; ALTER may fail if table doesn't exist yet or lacks column
    console.warn('products table alter image column:', alterErr.message || alterErr);
  } else {
    console.log('products.image column ensured as LONGTEXT');
  }
});

// GET /api/products - list products (optional ?limit=)
router.get('/products', (req, res) => {
  const limit = parseInt(req.query.limit) || 999; // default 999 products to show all
  // return newest products first so recently added items appear on top
  const q = 'SELECT id, name, category, price, discount, rating, image FROM products ORDER BY id DESC LIMIT ?';
  db.query(q, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json({ products: rows });
  });
});

// GET /api/product/:id - return single product
router.get('/product/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const q = 'SELECT id, name, category, price, discount, rating, image FROM products WHERE id = ? LIMIT 1';
  db.query(q, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'not found' });
    return res.json({ product: rows[0] });
  });
});

// POST /api/products - add a product (simple endpoint, no auth)
router.post('/products', (req, res) => {
  const { name, category, price, discount, rating, image } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    if (image) {
      console.log('products POST: incoming image length chars =', image.length);
      console.log('products POST: incoming image size bytes =', Buffer.byteLength(image, 'utf8'));
    } else {
      console.log('products POST: no image provided');
    }
  } catch (logErr) {
    console.warn('products POST: error measuring image size', logErr && logErr.message);
  }
  const q = 'INSERT INTO products (name, category, price, discount, rating, image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(q, [name, category || null, price || 0, discount || 0, rating || 0, image || null], (err, result) => {
    if (err) {
      console.error('products POST error:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    return res.json({ message: 'Product added', id: result.insertId });
  });
});

// PUT /api/products/:id - update a product
router.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  
  const { name, category, price, discount, rating, image } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  
  const q = 'UPDATE products SET name=?, category=?, price=?, discount=?, rating=?, image=? WHERE id=?';
  db.query(q, [name, category || null, price || 0, discount || 0, rating || 0, image || null, id], (err, result) => {
    if (err) {
      console.error('products PUT error:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'product not found' });
    return res.json({ message: 'Product updated', id: id });
  });
});

// DELETE /api/products/:id - delete a product
router.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  
  const q = 'DELETE FROM products WHERE id=?';
  db.query(q, [id], (err, result) => {
    if (err) {
      console.error('products DELETE error:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'product not found' });
    return res.json({ message: 'Product deleted', id: id });
  });
});

module.exports = router;
