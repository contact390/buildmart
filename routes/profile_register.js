

const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hitaishimatrimony@gmail.com', 
    pass: 'hgkh ylho pibp bopl' 
  }
});


const createSellerTable = `
  CREATE TABLE IF NOT EXISTS seller_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    company VARCHAR(255),
    address TEXT,
    gst VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createSellerTable, (err) => {
  if (err) {
    console.error('Error creating seller_profiles table:', err);
  } else {
    console.log('✅ seller_profiles table created');
  }
});


const createBuyerTable = `
  CREATE TABLE IF NOT EXISTS buyer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createBuyerTable, (err) => {
  if (err) {
    console.error('Error creating buyer_profiles table:', err);
  } else {
    console.log('✅ buyer_profiles table created');
  }
});


router.post('/seller-profile', (req, res) => {
  const { name, email, phone, company, address, gst, password } = req.body;

  // Validation
  if (!name || !email || !password || !address) {
    console.log('❌ Validation failed - Missing required fields');
    return res.status(400).json({ error: 'Please fill in all required fields (Name, Email, Password, Address)' });
  }

  console.log('📝 Seller registration attempt for:', email);

  const checkQuery = `
    SELECT email FROM seller_profiles WHERE email = ?
    UNION
    SELECT email FROM buyer_profiles WHERE email = ?
  `;

  db.query(checkQuery, [email, email], (err, results) => {
    if (err) {
      console.error('❌ Check query error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length > 0) {
      console.log('⚠️ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered as buyer or seller' });
    }

    const insertQuery = `
      INSERT INTO seller_profiles (name, email, phone, company, address, gst, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [name, email, phone || '', company || '', address, gst || '', password], (err, result) => {
      if (err) {
        console.error('❌ Insert query error:', err);
        return res.status(500).json({ error: 'Error inserting seller profile: ' + err.message });
      }

      console.log('✅ Seller registered successfully:', email, 'ID:', result.insertId);

      // Send email
      const mailOptions = {
        from: 'hitaishimatrimony@gmail.com',
        to: email,
        subject: 'Welcome to Hitaishi Seller Platform',
        text: `Hello ${name},\n\nYour seller registration is successful!\n\nThank you for joining Hitaishi Constructions!\n\nYou can now login with your email and password.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Email failed:', error);
        } else {
          console.log('📧 Email sent:', info.response);
        }
      });

      res.status(200).json({ message: 'Seller profile submitted successfully' });
    });
  });
});


router.post('/buyer-profile', (req, res) => {
  const { name, email, phone, address, password } = req.body;

  // Validation
  if (!name || !email || !password || !address) {
    console.log('❌ Validation failed - Missing required fields');
    return res.status(400).json({ error: 'Please fill in all required fields (Name, Email, Password, Address)' });
  }

  console.log('📝 Buyer registration attempt for:', email);

  const checkQuery = `
    SELECT email FROM seller_profiles WHERE email = ?
    UNION
    SELECT email FROM buyer_profiles WHERE email = ?
  `;

  db.query(checkQuery, [email, email], (err, results) => {
    if (err) {
      console.error('❌ Check query error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length > 0) {
      console.log('⚠️ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered as buyer or seller' });
    }

    const insertQuery = `
      INSERT INTO buyer_profiles (name, email, phone, address, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [name, email, phone || '', address, password], (err, result) => {
      if (err) {
        console.error('❌ Insert query error:', err);
        return res.status(500).json({ error: 'Error inserting buyer profile: ' + err.message });
      }

      console.log('✅ Buyer registered successfully:', email, 'ID:', result.insertId);

      // Send email
      const mailOptions = {
        from: 'hitaishimatrimony@gmail.com',
        to: email,
        subject: 'Welcome to Hitaishi Buyer Platform',
        text: `Hello ${name},\n\nYour buyer registration is successful!\n\nThank you for joining Hitaishi Constructions!\n\nYou can now login with your email and password and start shopping.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Email failed:', error);
        } else {
          console.log('📧 Email sent:', info.response);
        }
      });

      res.status(200).json({ message: 'Buyer profile submitted successfully' });
    });
  });
});


router.post('/api/login', (req, res) => {
  const { identifier, password, userType } = req.body;

  if (!['buyer', 'seller'].includes(userType)) {
    return res.status(400).json({ success: false, message: "Invalid user type" });
  }

  const table = userType === 'buyer' ? 'buyer_profiles' : 'seller_profiles';

  const query = `
    SELECT * FROM ${table}
    WHERE (email = ? OR phone = ?) AND password = ?
  `;

  db.query(query, [identifier, identifier, password], (err, results) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      const userRow = results[0];
      const user = { id: userRow.id, name: userRow.name, email: userRow.email };
      req.session.user = { ...user, userType };

      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Session save failed" });
        }
        return res.json({ success: true, message: "Login successful", user });
      });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  });
});

// Return current session user
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ success: true, user: req.session.user });
  }
  return res.json({ success: false, user: null });
});

// Logout - destroy session
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Logged out' });
    });
  } else {
    return res.json({ success: true, message: 'No active session' });
  }
});


router.get('/buyer-profile', (req, res) => {
  const query = 'SELECT * FROM buyer_profiles ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching buyers:', err);
      return res.status(500).json({ success: false, message: 'Error fetching buyers' });
    }
    res.json({ success: true, buyers: results });
  });
});



router.get('/seller-profile', (req, res) => {
  const query = 'SELECT * FROM seller_profiles ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sellers:', err);
      return res.status(500).json({ success: false, message: 'Error fetching sellers' });
    }
    res.json({ success: true, sellers: results });
  });
});


module.exports = router;


