const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + Math.random().toString(36).substring(7) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Ensure table exists
const createTableQuery = `
CREATE TABLE IF NOT EXISTS specials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  special VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  originalPrice DECIMAL(10, 2),
  cuisine VARCHAR(100),
  offer VARCHAR(100),
  image VARCHAR(255),
  searchTerms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.query(createTableQuery, err => {
  if (err) console.error('❌ Table creation error:', err);
  else console.log('✅ "specials" table is ready.');
});

// POST: Create special with image
router.post('/specials', upload.single('image'), (req, res) => {
  try {
    const {
      name, special, description,
      price, originalPrice, cuisine,
      offer, searchTerms
    } = req.body;

    console.log('📝 Received special submission:', { name, special, description, price, originalPrice, cuisine, offer, searchTerms });

    // Validate required fields
    if (!name || !special || !description || !price || !cuisine || !offer || !searchTerms) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!req.file) {
      console.error('❌ No image file provided');
      return res.status(400).json({ error: 'Image file is required' });
    }

    const image = req.file.filename;

    const query = `
      INSERT INTO specials 
      (name, special, description, price, originalPrice, cuisine, offer, image, searchTerms) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [name, special, description, parseFloat(price), parseFloat(originalPrice) || 0, cuisine, offer, image, searchTerms], (err, result) => {
      if (err) {
        console.error('❌ Insert error:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      console.log('✅ Special added successfully with ID:', result.insertId);
      res.status(201).json({ 
        message: 'Special added successfully', 
        id: result.insertId,
        image: image
      });
    });
  } catch (error) {
    console.error('⚠️ Exception in /specials POST:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// GET all specials
router.get('/specials', (req, res) => {
  db.query('SELECT * FROM specials ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('❌ Fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch specials' });
    }
    res.json(results);
  });
});

module.exports = router;