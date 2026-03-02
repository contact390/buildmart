const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// Create table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS bm_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    company VARCHAR(255),
    plan VARCHAR(100) NOT NULL,
    price VARCHAR(50) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating bm_plans table:', err);
  } else {
    console.log('✅ bm_plans table is ready.');
  }
});

// Configure Nodemailer transporter
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
    console.warn('⚠️ Email service not connected for bm_plans:', error.message);
  } else {
    console.log('✅ Plans email service is ready');
  }
});

// Handle POST request
router.post('/bm_plans', (req, res) => {
  const { fullName, email, phone, company, plan, price } = req.body;

  if (!fullName || !email || !phone || !plan || !price) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  const insertQuery = `
    INSERT INTO bm_plans (fullName, email, phone, company, plan, price)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [fullName, email, phone, company, plan, price], (err, result) => {
    if (err) {
      console.error('Error inserting into bm_plans:', err);
      return res.status(500).json({ message: 'Database insertion error' });
    }

    const adminMailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: 'hitaishimatrimony@gmail.com', // Admin email
      subject: `New Plan Submission: ${plan}`,
      html: `
        <h3>New Plan Submission Received</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Selected Plan:</strong> ${plan}</p>
        <p><strong>Price:</strong> ${price}</p>
        <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
      `
    };

    const userMailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: email, // User's email
      subject: 'Your Plan Submission was Successful!',
      html: `
        <h3>Thank you, ${fullName}!</h3>
        <p>Your plan submission has been received successfully.</p>
        <p><strong>Selected Plan:</strong> ${plan}</p>
        <p><strong>Price:</strong> ${price}</p>
        <p>We will get in touch with you shortly.</p>
        <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
        <p>Regards,<br>Hitaishi Matrimony Team</p>
      `
    };

    // Send admin and user emails
    transporter.sendMail(adminMailOptions, (adminErr, adminInfo) => {
      if (adminErr) {
        console.error('⚠️ Failed to send admin email:', adminErr.message);
      } else {
        console.log('✅ Admin email sent:', adminInfo.response);
      }

      transporter.sendMail(userMailOptions, (userErr, userInfo) => {
        if (userErr) {
          console.error('⚠️ Failed to send confirmation to user:', userErr.message);
          // Still return success as plan is saved
          return res.status(200).json({ 
            message: 'Plan submitted successfully! Confirmation email pending.',
            emailStatus: 'pending'
          });
        } else {
          console.log('✅ User confirmation email sent:', userInfo.response);
          return res.status(200).json({ 
            message: 'Plan submitted successfully. Confirmation email sent.',
            emailStatus: 'sent'
          });
        }
      });
    });
  });
});

// GET all plan submissions
router.get('/bm_plans', (req, res) => {
  const selectQuery = 'SELECT * FROM bm_plans ORDER BY submitted_at DESC';

  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching plans:', err);
      return res.status(500).json({ message: 'Error fetching data' });
    }
    return res.status(200).json(results);
  });
});


// ✅ GET method to fetch plan submission details by email (from bm_plans)
router.get('/bm_plans/:email', (req, res) => {
  const email = req.params.email;

  const query = 'SELECT * FROM bm_plans WHERE email = ? ORDER BY submitted_at DESC';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('❌ Error fetching plan details:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No plans found for this email.' });
    }

    res.status(200).json(results);
  });
});





module.exports = router;
