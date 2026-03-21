const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust path to your database connection
const nodemailer = require('nodemailer');

// Configure email transporter (optional - for sending notifications)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

// Create table if not exists
const createFactoryOutletsTable = `
  CREATE TABLE IF NOT EXISTS factory_outlets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    location VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    materials TEXT NOT NULL,
    image_url TEXT,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_phone (phone),
    INDEX idx_zip_code (zip_code)
  )
`;

// Initialize table
db.query(createFactoryOutletsTable, (err) => {
  if (err) {
    console.error('❌ Error creating factory_outlets table:', err);
  } else {
    console.log('✅ factory_outlets table created/verified');
  }
});

// OPTIONS preflight (CORS) for factory outlet registration
router.options('/factory-outlet-register', (req, res) => {
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// POST endpoint for factory outlet registration
// In your factory.js file, update the validation section:

router.post('/factory-outlet-register', async (req, res) => {
  try {
    const {
      manufacturer_name,
      owner_name,
      phone,
      alternate_phone,
      location,
      zip_code,
      materials,
      image_url
    } = req.body;

    // Validation
    if (!manufacturer_name || !owner_name || !phone || !location || !zip_code || !materials) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Manufacturer Name, Owner Name, Phone, Location, Zip Code, Materials)'
      });
    }

    // FIXED: Validate phone number - accept 10-15 digits only
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid phone number with 10-15 digits'
      });
    }

    // Validate zip code - exactly 6 digits
    const cleanZip = zip_code.replace(/[^\d]/g, '');
    if (cleanZip.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 6-digit zip code'
      });
    }

    console.log('📝 Factory outlet registration attempt:', manufacturer_name, phone);

    // Check for duplicate registration (same phone number within last 24 hours)
    const checkDuplicateQuery = `
      SELECT id, created_at 
      FROM factory_outlets 
      WHERE phone = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `;
    
    db.query(checkDuplicateQuery, [cleanPhone], (err, results) => {
      if (err) {
        console.error('❌ Duplicate check error:', err);
        return res.status(500).json({
          success: false,
          error: 'Database error: ' + err.message
        });
      }

      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'You have already registered within the last 24 hours. Our team will contact you soon.'
        });
      }

      // Insert new factory outlet with cleaned phone number
      const insertQuery = `
        INSERT INTO factory_outlets (
          manufacturer_name, 
          owner_name, 
          phone, 
          alternate_phone, 
          location, 
          zip_code, 
          materials, 
          image_url,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `;

      db.query(
        insertQuery,
        [
          manufacturer_name,
          owner_name,
          cleanPhone, // Store cleaned phone number
          alternate_phone ? alternate_phone.replace(/[^\d]/g, '') : null, // Clean alternate phone
          location,
          cleanZip, // Store cleaned zip code
          materials,
          image_url || null
        ],
        (err, result) => {
          if (err) {
            console.error('❌ Insert query error:', err);
            return res.status(500).json({
              success: false,
              error: 'Error registering factory outlet: ' + err.message
            });
          }

          console.log('✅ Factory outlet registered successfully, ID:', result.insertId);

          res.status(200).json({
            success: true,
            message: 'Factory outlet registration submitted successfully! Our team will verify and contact you within 2-3 business days.',
            registrationId: result.insertId
          });
        }
      );
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
});
// GET endpoint to fetch all factory outlets (admin only)
router.get('/factory-outlets', (req, res) => {
  const query = `
    SELECT id, manufacturer_name, owner_name, phone, location, 
           zip_code, materials, image_url, status, created_at 
    FROM factory_outlets 
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Fetch error:', err);
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + err.message
      });
    }

    res.status(200).json({
      success: true,
      outlets: results
    });
  });
});

// GET endpoint to fetch pending outlets (admin only)
router.get('/factory-outlets/pending', (req, res) => {
  const query = `
    SELECT id, manufacturer_name, owner_name, phone, location, 
           zip_code, materials, image_url, created_at 
    FROM factory_outlets 
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Fetch pending error:', err);
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + err.message
      });
    }

    res.status(200).json({
      success: true,
      pendingOutlets: results
    });
  });
});

// PUT endpoint to update outlet status (admin only)
router.put('/factory-outlet/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'verified', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be pending, verified, or rejected'
    });
  }

  const updateQuery = `
    UPDATE factory_outlets 
    SET status = ? 
    WHERE id = ?
  `;

  db.query(updateQuery, [status, id], (err, result) => {
    if (err) {
      console.error('❌ Update error:', err);
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Factory outlet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Outlet status updated to ${status}`
    });
  });
});

// DELETE endpoint to remove outlet (admin only)
router.delete('/factory-outlet/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM factory_outlets WHERE id = ?';

  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error('❌ Delete error:', err);
      return res.status(500).json({
        success: false,
        error: 'Database error: ' + err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Factory outlet not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Factory outlet deleted successfully'
    });
  });
});

module.exports = router;