const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// Create table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS consultations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    project_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
db.query(createTableQuery, (err) => {
  if (err) {
    console.error('❌ Error creating consultations table:', err);
  } else {
    console.log('✅ consultations table created.');
  }
});

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER || 'hitaishimatrimony@gmail.com',
    pass: process.env.GMAIL_PASS || 'hgkh ylho pibp bopl'
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
});

// CORS preflight safe route
router.options('/consultations', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(204);
});

// POST endpoint to receive consultation form
router.post('/consultations', (req, res) => {
  const { name, email, phone, city, project_description } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  const insertQuery = `INSERT INTO consultations (name, email, phone, city, project_description) VALUES (?, ?, ?, ?, ?)`;
  db.query(insertQuery, [name, email, phone || null, city || null, project_description || null], async (err, result) => {
    if (err) {
      console.error('❌ Error inserting consultation data:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Mail options
    const mailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: 'hitaishimatrimony@gmail.com',
      subject: `New Consultation Request from ${name}`,
      html: `
        <h3>New Consultation Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Preferred City:</strong> ${city || 'Not specified'}</p>
        <p><strong>Project Description:</strong></p>
        <p>${project_description || 'No description provided'}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('⚠️ Email sending failed (consultation still saved):', error.message);
        res.status(200).json({
          message: 'Consultation request received! Email notification pending.',
          emailStatus: 'pending'
        });
      } else {
        console.log('✅ Consultation email sent:', info.response);
        res.status(200).json({
          message: 'Consultation request submitted successfully!',
          emailStatus: 'sent'
        });
      }
    });
  });
});

// GET endpoint to fetch all consultations (for admin purposes)
router.get('/consultations', (req, res) => {
  const fetchQuery = `SELECT * FROM consultations ORDER BY created_at DESC`;
  db.query(fetchQuery, (err, results) => {
    if (err) {
      console.error('❌ Error fetching consultations:', err);
      return res.status(500).json({ message: 'Failed to fetch consultations' });
    }
    res.status(200).json(results);
  });
});

module.exports = router;