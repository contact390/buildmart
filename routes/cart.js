const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Create tables if not exists
const createCarts = `
  CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const createCartItems = `
  CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    product_id INT,
    name VARCHAR(255),
    price DECIMAL(10,2),
    qty INT DEFAULT 1,
    image LONGTEXT,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
  )
`;

const createOrders = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    address TEXT,
    total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const createOrderItems = `
  CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    name VARCHAR(255),
    price DECIMAL(10,2),
    qty INT,
    image LONGTEXT
  )
`;

db.query(createCarts, (e) => { if (e) console.error('carts table:', e); });
db.query(createCartItems, (e) => { if (e) console.error('cart_items table:', e); });
db.query(createOrders, (e) => { if (e) console.error('orders table:', e); });
db.query(createOrderItems, (e) => { if (e) console.error('order_items table:', e); });

// Ensure cart_items.image and order_items.image can hold large base64 strings
db.query("ALTER TABLE cart_items MODIFY COLUMN image LONGTEXT", (errAlt) => {
  if (errAlt) console.warn('ALTER cart_items.image:', errAlt.message || errAlt);
  else console.log('cart_items.image ensured LONGTEXT');
});
db.query("ALTER TABLE order_items MODIFY COLUMN image LONGTEXT", (errAlt2) => {
  if (errAlt2) console.warn('ALTER order_items.image:', errAlt2.message || errAlt2);
  else console.log('order_items.image ensured LONGTEXT');
});

// Create or return cart by key
router.post('/cart/create', (req, res) => {
  const cart_key = uuidv4();
  const q = 'INSERT INTO carts (cart_key) VALUES (?)';
  db.query(q, [cart_key], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to create cart' });
    res.json({ cart_key });
  });
});

// Add item to cart (creates cart if needed)
router.post('/cart/add', (req, res) => {
  const { cart_key, product_id, name, price, image, qty } = req.body;
  
  // Accept both formats: product object or individual fields
  let product = { product_id, name, price, image, qty };
  if (req.body.product) {
    product = req.body.product;
  }
  
  if (!product.product_id) return res.status(400).json({ error: 'product_id required' });

  function insertToCart(cartId, returnedCartKey){
    // check if same product exists
    const findQ = 'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1';
    db.query(findQ, [cartId, product.product_id], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (rows.length > 0) {
        const upd = 'UPDATE cart_items SET qty = qty + ? WHERE id = ?';
        db.query(upd, [product.qty || 1, rows[0].id], (e) => {
          if (e) return res.status(500).json({ error: 'DB error' });
          const payload = { message: 'Quantity updated' };
          if (returnedCartKey) payload.cart_key = returnedCartKey;
          return res.json(payload);
        });
      } else {
        const ins = 'INSERT INTO cart_items (cart_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(ins, [cartId, product.product_id, product.name, product.price, product.qty || 1, product.image], (e2) => {
          if (e2) return res.status(500).json({ error: 'DB error' });
          const payload = { message: 'Added to cart' };
          if (returnedCartKey) payload.cart_key = returnedCartKey;
          return res.json(payload);
        });
      }
    });
  }

  if (cart_key) {
    // find cart id
    const q = 'SELECT id FROM carts WHERE cart_key = ? LIMIT 1';
    db.query(q, [cart_key], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (rows.length === 0) {
        // create
        const createQ = 'INSERT INTO carts (cart_key) VALUES (?)';
        db.query(createQ, [cart_key], (ce, r) => {
          if (ce) return res.status(500).json({ error: 'DB error' });
          insertToCart(r.insertId, cart_key);
        });
      } else {
        insertToCart(rows[0].id);
      }
    });
  } else {
    // create cart and insert
    const newKey = uuidv4();
    const createQ = 'INSERT INTO carts (cart_key) VALUES (?)';
    db.query(createQ, [newKey], (ce, r) => {
      if (ce) return res.status(500).json({ error: 'DB error' });
      // insert item and return the new cart_key from the insertToCart callback
      insertToCart(r.insertId, newKey);
    });
  }
});

// Get cart items
router.get('/cart/:cart_key', (req, res) => {
  const key = req.params.cart_key;
  if (!key) return res.status(400).json({ error: 'cart_key required' });
  // Join with products and products_extended to use product images when cart_items.image is null
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
             LEFT JOIN products_extended pe ON pe.id = ci.product_id
             WHERE c.cart_key = ?`;
  db.query(q, [key], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!rows || rows.length === 0) return res.json({ cart: null, items: [] });
    const cart_id = rows[0].cart_id;
    try {
      // debug: log image presence/length for first row
      const firstImage = rows[0] && rows[0].image;
      console.log('DEBUG /cart: first image type=', typeof firstImage, 'len=', firstImage ? firstImage.length : null);
    } catch (e) { console.warn('DEBUG /cart log failed', e && e.message); }
    const items = rows.filter(r => r.id !== null).map(r => ({ id: r.id, product_id: r.product_id, name: r.name, price: r.price, qty: r.qty, image: r.image ? String(r.image) : null }));
    return res.json({ cart: { id: cart_id, cart_key: key }, items });
  });
});

// Update quantity
router.post('/cart/update', (req, res) => {
  const { cart_key, item_id, qty } = req.body;
  if (!cart_key || !item_id) return res.status(400).json({ error: 'cart_key and item_id required' });
  const q = 'UPDATE cart_items SET qty = ? WHERE id = ?';
  db.query(q, [qty, item_id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'Updated' });
  });
});

// Remove item
router.post('/cart/remove', (req, res) => {
  const { cart_key, item_id } = req.body;
  if (!cart_key || !item_id) return res.status(400).json({ error: 'cart_key and item_id required' });
  const q = 'DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id = c.id WHERE c.cart_key = ? AND ci.id = ?';
  db.query(q, [cart_key, item_id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'Removed' });
  });
});

// Checkout: create order from cart
router.post('/checkout', (req, res) => {
  const { cart_key, customer_name, email, address, payment_method } = req.body;
  
  if (!cart_key || !customer_name || !email || !address) {
    console.warn('❌ Checkout: missing required fields', { cart_key, customer_name, email, address });
    return res.status(400).json({ success: false, error: 'Missing required fields: cart_key, customer_name, email, address' });
  }

  console.log('=====================================');
  console.log('📦 CHECKOUT REQUEST STARTED');
  console.log('Cart Key:', cart_key);
  console.log('Customer:', customer_name);
  console.log('Email:', email);
  console.log('=====================================');
  
  // fetch cart and items; prefer cart_items.image, otherwise use product image or product_uploads.imageUrl
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
             LEFT JOIN products_extended pe ON pe.id = ci.product_id
             WHERE c.cart_key = ?`;
  db.query(q, [cart_key], (err, rows) => {
    if (err) {
      console.error('Checkout: cart query error', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if (!rows || rows.length === 0) {
      console.warn('Checkout: cart empty or not found:', cart_key);
      return res.status(400).json({ success: false, error: 'Cart empty or not found' });
    }
    const cartId = rows[0].cart_id;
    const items = rows.filter(r => r.id !== null).map(r => ({ product_id: r.product_id, name: r.name, price: r.price, qty: r.qty, image: r.image ? String(r.image) : null }));
    if (items.length === 0) {
      console.warn('❌ Checkout: cart has no items:', cart_key);
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    console.log('✅ Cart found with', items.length, 'items');
    items.forEach((item, idx) => {
      console.log(`   Item ${idx + 1}: ${item.name} | Qty: ${item.qty} | Price: ₹${item.price}`);
    });

    const total = items.reduce((s,it)=> s + (it.price * it.qty), 0);

    const insOrder = 'INSERT INTO orders (cart_id, customer_name, email, address, total) VALUES (?, ?, ?, ?, ?)';
    db.query(insOrder, [cartId, customer_name, email, address, total], (e, r) => {
      if (e) {
        console.error('❌ Checkout: insert order error', e);
        return res.status(500).json({ success: false, error: 'Failed to create order' });
      }
      const orderId = r.insertId;
      console.log('✅ Order created with ID:', orderId);
      console.log('   Total:', total);
      
      const insItemsQ = 'INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES ?';
      const vals = items.map(it => [orderId, it.product_id, it.name, it.price, it.qty, it.image]);
      console.log('💾 Inserting', vals.length, 'items into order_items table...');
      db.query(insItemsQ, [vals], (ie) => {
        if (ie) {
          console.error('❌ Checkout: insert order_items error', ie);
          return res.status(500).json({ success: false, error: 'Failed to save order items' });
        }
        console.log('✅ All order items inserted successfully');
        // clear cart items
        const del = 'DELETE FROM cart_items WHERE cart_id = ?';
        db.query(del, [cartId], (de) => {
          if (de) console.error('❌ Checkout: failed to clear cart items', de);
          else console.log('✅ Cart cleared');
          console.log('=====================================');
          console.log('✅ ORDER COMPLETED SUCCESSFULLY!');
          console.log('Order ID:', orderId);
          console.log('Total:', total);
          console.log('=====================================');
          return res.status(200).json({ success: true, message: 'Order placed successfully', orderId: orderId });
        });
      });
    });
  });
});

// Get all orders by email
router.get('/orders/:email', (req, res) => {
  const email = req.params.email;
  
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email required' });
  }
  
  console.log('Fetching orders for email:', email);
  
  const q = 'SELECT id, customer_name, email, total, status, created_at FROM orders WHERE email = ? ORDER BY created_at DESC';
  db.query(q, [email], (err, orders) => {
    if (err) {
      console.error('Orders query error:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    console.log('✓ Found', orders.length, 'orders for', email);
    return res.status(200).json({
      success: true,
      orders: orders || []
    });
  });
});

// Get order details by ID
router.get('/order/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  
  if (!orderId || isNaN(orderId)) {
    console.warn('❌ Invalid order ID requested:', orderId);
    return res.status(400).json({ success: false, error: 'Invalid order ID' });
  }
  
  console.log('');
  console.log('=====================================');
  console.log('🔍 FETCHING ORDER DETAILS');
  console.log('Order ID:', orderId);
  console.log('=====================================');
  
  // Get order info
  const orderQuery = 'SELECT id, customer_name, email, address, total, status, created_at FROM orders WHERE id = ?';
  db.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error('❌ Order query error:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (!orderResults || orderResults.length === 0) {
      console.warn('❌ Order not found:', orderId);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    const order = orderResults[0];
    console.log('✅ Order found:');
    console.log('   Customer:', order.customer_name);
    console.log('   Email:', order.email);
    console.log('   Total:', order.total);
    
    // Get order items
    const itemsQuery = 'SELECT product_id, name, price, qty, image FROM order_items WHERE order_id = ?';
    db.query(itemsQuery, [orderId], (itemErr, items) => {
      if (itemErr) {
        console.error('❌ Order items query error:', itemErr);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      console.log('✅ Order items retrieved:', items ? items.length : 0);
      if (items && items.length > 0) {
        items.forEach((item, idx) => {
          console.log(`   Item ${idx + 1}: ${item.name} | Qty: ${item.qty} | Price: ₹${item.price}`);
        });
      }
      console.log('=====================================');
      
      return res.status(200).json({
        success: true,
        order: order,
        items: items || []
      });
    });
  });
});

// Get all orders with product details
router.get('/all-orders', (req, res) => {
  console.log('');
  console.log('=====================================');
  console.log('📋 FETCHING ALL ORDERS WITH PRODUCTS');
  console.log('=====================================');
  
  const ordersQuery = 'SELECT id, customer_name, email, address, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 50';
  
  db.query(ordersQuery, (err, orders) => {
    if (err) {
      console.error('❌ Orders query error:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (!orders || orders.length === 0) {
      console.log('ℹ️ No orders found');
      return res.status(200).json({
        success: true,
        orders: []
      });
    }
    
    console.log('✅ Found', orders.length, 'orders');
    
    // Get items for each order
    let completedOrders = 0;
    let ordersWithItems = [];
    
    orders.forEach((order, idx) => {
      const itemsQuery = 'SELECT product_id, name, price, qty, image FROM order_items WHERE order_id = ?';
      db.query(itemsQuery, [order.id], (itemErr, items) => {
        if (!itemErr && items) {
          console.log(`   Order ${order.id}: ${order.customer_name} | Items: ${items.length} | Total: ₹${order.total}`);
          items.forEach((item) => {
            console.log(`      - ${item.name} (Qty: ${item.qty})`);
          });
        }
        
        ordersWithItems.push({
          ...order,
          items: items || []
        });
        
        completedOrders++;
        
        // When all orders are processed, send response
        if (completedOrders === orders.length) {
          console.log('=====================================');
          return res.status(200).json({
            success: true,
            orders: ordersWithItems
          });
        }
      });
    });
  });
});

module.exports = router;
