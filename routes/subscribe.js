// routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// Create 'newsletter_subscriptions' table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('❌ Error creating newsletter_subscriptions table:', err);
  } else {
    console.log('✅ newsletter_subscriptions table ensured.');
  }
});

// Nodemailer transporter setup with error handling
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER || 'hitaishimatrimony@gmail.com',
    pass: process.env.GMAIL_PASS || 'hgkh ylho pibp bopl',
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email service not connected. Emails will be logged only:', error.message);
  } else {
    console.log('✅ Email service is ready');
  }
});

// API route for subscribing
router.post('/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required.');
  }

  const insertQuery = 'INSERT INTO newsletter_subscriptions (email) VALUES (?)';
  db.query(insertQuery, [email], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).send('Email already subscribed.');
      }
      console.error('❌ Error inserting into newsletter_subscriptions:', err);
      return res.status(500).send('Server error.');
    }

    // Send confirmation email
    const mailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: email,
      subject: 'Thank you for subscribing to Hitaishi Constructions!',
      html: `<p>Hello,</p>
             <p>Thank you for subscribing to <strong>Hitaishi Constructions</strong> newsletter!</p>
             <p>You'll now receive regular updates and offers.</p>
             <p style="margin-top:20px;">Best Regards,<br>Team Hitaishi</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('⚠️ Email sending failed (subscription still saved):', error.message);
        // Still return success since email is optional for subscription
        return res.status(200).json({ 
          message: 'Subscription saved successfully!',
          emailStatus: 'pending'
        });
      } else {
        console.log('✅ Email sent: ' + info.response);
        return res.status(200).json({ 
          message: 'Subscribed and confirmation email sent.',
          emailStatus: 'sent'
        });
      }
    });
  });
});

module.exports = router;
