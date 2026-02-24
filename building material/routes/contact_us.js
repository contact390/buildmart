const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// Create table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    subject VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
db.query(createTableQuery, (err) => {
  if (err) {
    console.error('❌ Error creating contact_messages table:', err);
  } else {
    console.log('✅ contact_messages table created.');
  }
});

// Setup nodemailer transporter with better configuration
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

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email service not connected for contact_us:', error.message);
  } else {
    console.log('✅ Contact form email service is ready');
  }
});

// POST endpoint to receive contact form
router.post('/contact_us', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const insertQuery = `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`;
  db.query(insertQuery, [name, email, subject, message], async (err, result) => {
    if (err) {
      console.error('❌ Error inserting data:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Mail options
    const mailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: 'hitaishimatrimony@gmail.com',
      subject: `New Contact Form: ${subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('⚠️ Email sending failed (message still saved):', error.message);
        res.status(200).json({ 
          message: 'Message received! Email notification pending.',
          emailStatus: 'pending'
        });
      } else {
        console.log('✅ Contact email sent:', info.response);
        res.status(200).json({ 
          message: 'Message sent successfully and email delivered.',
          emailStatus: 'sent'
        });
      }
    });
  });
});

// ✅ GET: Fetch all contact messages
router.get('/contact_us', (req, res) => {
  const fetchQuery = `SELECT * FROM contact_messages ORDER BY created_at DESC`;
  db.query(fetchQuery, (err, results) => {
    if (err) {
      console.error('❌ Error fetching data:', err);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
    res.status(200).json(results);
  });
});


// GET: Fetch contact messages for a specific user by email
router.get('/contact_us/:email', (req, res) => {
  const userEmail = req.params.email;
  const fetchQuery = `SELECT * FROM contact_messages WHERE email = ? ORDER BY created_at DESC`;
  db.query(fetchQuery, [userEmail], (err, results) => {
    if (err) {
      console.error('❌ Error fetching user messages:', err);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
    res.status(200).json(results);
  });
});



module.exports = router;
