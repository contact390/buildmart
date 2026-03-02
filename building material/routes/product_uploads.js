const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============ MULTER IMAGE UPLOAD CONFIGURATION ============
const uploadsDir = path.join(__dirname, '../uploads/products');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads/products directory');
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP allowed'));
    }
  }
});

// ============ CREATE TABLES ============

// Products table with all category-specific fields
const createProductsTable = `
  CREATE TABLE IF NOT EXISTS products_extended (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productName VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    description LONGTEXT,
    price DECIMAL(12,2) NOT NULL,
    discount INT DEFAULT 0,
    finalPrice DECIMAL(12,2),
    quantity INT DEFAULT 1,
    quantityUnit VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0,
    moq INT DEFAULT 1,
    warranty INT DEFAULT 0,
    color VARCHAR(100),
    imageUrl VARCHAR(500),
    imagePath VARCHAR(500),
    
    -- Cement Specific
    cementType VARCHAR(50),
    cementGrade VARCHAR(50),
    settingTime INT,
    compressiveStrength DECIMAL(6,2),
    
    -- Bricks Specific
    brickType VARCHAR(50),
    brickSize VARCHAR(50),
    weight DECIMAL(6,2),
    
    -- Building Materials Specific
    materialType VARCHAR(100),
    thickness INT,
    density INT,
    application VARCHAR(200),
    
    -- Iron & Steel Specific
    steelType VARCHAR(50),
    diameter DECIMAL(6,2),
    steelGrade VARCHAR(50),
    yieldStrength INT,
    
    -- Plumbing Specific
    plumbingType VARCHAR(50),
    material VARCHAR(50),
    pressureRating INT,
    
    -- Home Interior Specific
    interiorType VARCHAR(50),
    finishType VARCHAR(50),
    coverage DECIMAL(8,2),
    installation VARCHAR(50),
    
    -- Meta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    createdBy VARCHAR(255),
    seller_id INT
  )
`;

db.query(createProductsTable, (err) => {
  if (err) {
    console.error('❌ Error creating products_extended table:', err.message);
  } else {
    console.log('✅ products_extended table ready');
  }
});

// ============ UPLOAD PRODUCT WITH IMAGE ============
// POST /api/product_uploads - Upload product with file
router.post('/product_uploads', upload.single('image'), (req, res) => {
  try {
    const {
      productName,
      brand,
      category,
      description,
      price,
      discount,
      quantity,
      quantityUnit,
      rating,
      moq,
      warranty,
      color,
      finalPrice,
      
      // Cement
      cementType,
      grade: cementGrade,
      settingTime,
      compressiveStrength,
      
      // Bricks
      brickType,
      size: brickSize,
      weight,
      
      // Building Materials
      materialType,
      thickness,
      density,
      application,
      
      // Iron & Steel
      steelType,
      diameter,
      steelGrade: stGrade,
      yieldStrength,
      
      // Plumbing
      plumbingType,
      material,
      pressureRating,
      
      // Home Interior
      interiorType,
      finishType,
      coverage,
      installation
    } = req.body;

    // Validation
    if (!productName || !category || !price) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete uploaded file if validation fails
      }
      return res.status(400).json({
        success: false,
        error: 'Product name, category, and price are required'
      });
    }

    // Prepare file paths
    let imageUrl = null;
    let imagePath = null;
    
    if (req.file) {
      imagePath = req.file.filename;
      imageUrl = `http://localhost:5000/uploads/products/${req.file.filename}`;
    }

    // Calculate final price if not provided
    const finalPriceValue = finalPrice || (parseFloat(price) - (parseFloat(price) * (parseFloat(discount || 0) / 100)));

    // Insert into database
    const query = `
      INSERT INTO products_extended (
        productName, brand, category, description, price, discount, finalPrice,
        quantity, quantityUnit, rating, moq, warranty, color,
        imageUrl, imagePath,
        cementType, cementGrade, settingTime, compressiveStrength,
        brickType, brickSize, weight,
        materialType, thickness, density, application,
        steelType, diameter, steelGrade, yieldStrength,
        plumbingType, material, pressureRating,
        interiorType, finishType, coverage, installation,
        status, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      productName,
      brand || null,
      category,
      description || null,
      price,
      discount || 0,
      finalPriceValue,
      quantity || 1,
      quantityUnit || 'piece',
      rating || 0,
      moq || 1,
      warranty || 0,
      color || null,
      imageUrl,
      imagePath,
      // Cement
      cementType || null,
      cementGrade || null,
      settingTime || null,
      compressiveStrength || null,
      // Bricks
      brickType || null,
      brickSize || null,
      weight || null,
      // Building Materials
      materialType || null,
      thickness || null,
      density || null,
      application || null,
      // Iron & Steel
      steelType || null,
      diameter || null,
      stGrade || null,
      yieldStrength || null,
      // Plumbing
      plumbingType || null,
      material || null,
      pressureRating || null,
      // Home Interior
      interiorType || null,
      finishType || null,
      coverage || null,
      installation || null,
      // Meta
      'active',
      'admin'
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Database error:', err);
        // Delete file if database insert fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
          success: false,
          error: 'Failed to save product to database'
        });
      }

      res.json({
        success: true,
        message: 'Product uploaded successfully',
        productId: result.insertId,
        product: {
          id: result.insertId,
          productName,
          category,
          price: finalPriceValue,
          imageUrl,
          createdAt: new Date()
        }
      });
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

// ============ GET ALL PRODUCTS ============
// GET /api/product_uploads - Get all products with filters
router.get('/product_uploads', (req, res) => {
  const { category, status = 'active', limit = 100, offset = 0 } = req.query;

  let query = 'SELECT * FROM products_extended WHERE status = ?';
  const params = [status];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.query(query, params, (err, products) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }

    res.json({
      success: true,
      total: products.length,
      products
    });
  });
});

// ============ GET PRODUCTS BY CATEGORY ============
// GET /api/product_uploads/category/:category - MUST BE BEFORE /:id route
router.get('/product_uploads/category/:category', (req, res) => {
  const category = req.params.category;
  const { limit = 50 } = req.query;

  const query = 'SELECT * FROM products_extended WHERE category = ? AND status = ? ORDER BY created_at DESC LIMIT ?';

  db.query(query, [category, 'active', parseInt(limit)], (err, products) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch products'
      });
    }

    res.json({
      success: true,
      category,
      total: products.length,
      products
    });
  });
});

// ============ GET SINGLE PRODUCT ============
// GET /api/product_uploads/:id - Get single product
router.get('/product_uploads/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  if (!productId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID'
    });
  }

  const query = 'SELECT * FROM products_extended WHERE id = ? LIMIT 1';

  db.query(query, [productId], (err, products) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });
  });
});

// ============ UPDATE PRODUCT ============
// PUT /api/product_uploads/:id - Update product
router.put('/product_uploads/:id', upload.single('image'), (req, res) => {
  const productId = parseInt(req.params.id);

  if (!productId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID'
    });
  }

  // Get current product to check for old image
  const selectQuery = 'SELECT imagePath FROM products_extended WHERE id = ?';

  db.query(selectQuery, [productId], (selectErr, products) => {
    if (selectErr) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch product'
      });
    }

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const oldImagePath = products[0].imagePath;
    const {
      productName, brand, category, description, price, discount, quantity,
      quantityUnit, rating, moq, warranty, color, finalPrice,
      cementType, grade, settingTime, compressiveStrength,
      brickType, size, weight,
      materialType, thickness, density, application,
      steelType, diameter, steelGrade, yieldStrength,
      plumbingType, material, pressureRating,
      interiorType, finishType, coverage, installation,
      status
    } = req.body;

    let imageUrl = products[0].imageUrl;
    let imagePath = oldImagePath;

    // Handle new image upload
    if (req.file) {
      imagePath = req.file.filename;
      imageUrl = `http://localhost:5000/uploads/products/${req.file.filename}`;

      // Delete old image if exists
      if (oldImagePath) {
        const oldFilePath = path.join(uploadsDir, oldImagePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    const finalPriceValue = finalPrice || (parseFloat(price) - (parseFloat(price) * (parseFloat(discount || 0) / 100)));

    const updateQuery = `
      UPDATE products_extended SET
        productName = ?, brand = ?, category = ?, description = ?,
        price = ?, discount = ?, finalPrice = ?, quantity = ?, quantityUnit = ?,
        rating = ?, moq = ?, warranty = ?, color = ?, imageUrl = ?, imagePath = ?,
        cementType = ?, cementGrade = ?, settingTime = ?, compressiveStrength = ?,
        brickType = ?, brickSize = ?, weight = ?,
        materialType = ?, thickness = ?, density = ?, application = ?,
        steelType = ?, diameter = ?, steelGrade = ?, yieldStrength = ?,
        plumbingType = ?, material = ?, pressureRating = ?,
        interiorType = ?, finishType = ?, coverage = ?, installation = ?,
        status = ?
      WHERE id = ?
    `;

    const values = [
      productName, brand, category, description, price, discount, finalPriceValue,
      quantity, quantityUnit, rating, moq, warranty, color, imageUrl, imagePath,
      cementType, grade, settingTime, compressiveStrength,
      brickType, size, weight,
      materialType, thickness, density, application,
      steelType, diameter, steelGrade, yieldStrength,
      plumbingType, material, pressureRating,
      interiorType, finishType, coverage, installation,
      status || 'active',
      productId
    ];

    db.query(updateQuery, values, (updateErr, result) => {
      if (updateErr) {
        console.error('❌ Update error:', updateErr);
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
          success: false,
          error: 'Failed to update product'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        productId
      });
    });
  });
});

// ============ DELETE PRODUCT ============
// DELETE /api/product_uploads/:id - Delete product
router.delete('/product_uploads/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  if (!productId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID'
    });
  }

  const selectQuery = 'SELECT imagePath FROM products_extended WHERE id = ?';

  db.query(selectQuery, [productId], (selectErr, products) => {
    if (selectErr) {
      return res.status(500).json({
        success: false,
        error: 'Database error'
      });
    }

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const imagePath = products[0].imagePath;

    // Delete product from database
    const deleteQuery = 'DELETE FROM products_extended WHERE id = ?';

    db.query(deleteQuery, [productId], (deleteErr) => {
      if (deleteErr) {
        console.error('❌ Delete error:', deleteErr);
        return res.status(500).json({
          success: false,
          error: 'Failed to delete product'
        });
      }

      // Delete image file if exists
      if (imagePath) {
        const filePath = path.join(uploadsDir, imagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    });
  });
});

module.exports = router;
