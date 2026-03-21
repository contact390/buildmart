const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hitaishimatrimony@gmail.com',
    pass: 'hgkh ylho pibp bopl'
  }
});

const createSalesmanTable = `
  CREATE TABLE IF NOT EXISTS salesman_profiles (
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

db.query(createSalesmanTable, (err) => {
  if (err) {
    console.error('Error creating salesman_profiles table:', err);
  } else {                     
    console.log('✅ salesman_profiles table created');
  }
});

// Support preflight OPTIONS for clients that send CORS preflight
router.options('/salesman-profile', (req, res) => {
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.sendStatus(200);
});

router.post('/salesman-profile', (req, res) => {
  const { name, email, phone, company, address, gst, password } = req.body;

  console.log('📝 Received registration data:', { name, email, phone, company, address, gst, password: '***' });

  // Validation
  if (!name || !email || !password || !address) {
    console.log('❌ Validation failed - Missing required fields');
    return res.status(400).json({ error: 'Please fill in all required fields (Name, Email, Password, Address)' });
  }

  console.log('📝 Salesman registration attempt for:', email);

  // FIX: Check only salesman_profiles table since that's what we're registering for
  const checkQuery = `SELECT email FROM salesman_profiles WHERE email = ?`;

  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error('❌ Check query error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length > 0) {
      console.log('⚠️ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered as salesman' });
    }

    const insertQuery = `
      INSERT INTO salesman_profiles (name, email, phone, company, address, gst, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Hash password before storing
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('❌ Password hashing error:', hashErr);
        return res.status(500).json({ error: 'Error processing password' });
      }

      db.query(insertQuery, [name, email, phone || '', company || '', address, gst || '', hashedPassword], (err, result) => {
        if (err) {
          console.error('❌ Insert query error:', err);
          // Check for duplicate email error
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Error inserting salesman profile: ' + err.message });
        }

        console.log('✅ Salesman registered successfully:', email, 'ID:', result.insertId);

        // Send email
        const mailOptions = {
          from: 'hitaishimatrimony@gmail.com',
          to: email,
          subject: 'Welcome to BuildMart Sales Team',
          text: `Hello ${name},\n\nYour salesman registration is successful!\n\nThank you for joining BuildMart Sales Team!\n\nYou can now login with your email and password and start earning commissions.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('❌ Email failed:', error);
          } else {
            console.log('📧 Email sent:', info.response);
          }
        });

        res.status(200).json({
          success: true,
          message: 'Salesman profile submitted successfully',
          user: { id: result.insertId, name, email, userType: 'salesman' }
        });
      });
    });
  });
});

// Salesman Login
router.post('/salesman-login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    console.log('❌ Login validation failed - Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  console.log('📝 Salesman login attempt for:', email);

  const query = 'SELECT id, name, email, password FROM salesman_profiles WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('❌ Login query error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length === 0) {
      console.log('⚠️ Salesman not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const salesman = results[0];

    // Compare password with hash
    bcrypt.compare(password, salesman.password, (compareErr, isPasswordValid) => {
      if (compareErr) {
        console.error('❌ Password comparison error:', compareErr);
        return res.status(500).json({ error: 'Error verifying password' });
      }

      if (!isPasswordValid) {
        console.log('⚠️ Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('✅ Salesman logged in successfully:', email, 'ID:', salesman.id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: salesman.id,
          name: salesman.name,
          email: salesman.email,
          userType: 'salesman'
        }
      });
    });
  });
});

// Get Salesman Profile
router.get('/salesman-profile/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT id, name, email, phone, company, address, gst, created_at FROM salesman_profiles WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Profile query error:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Salesman profile not found' });
    }

    res.status(200).json({
      success: true,
      profile: results[0]
    });
  });
});

module.exports = router;