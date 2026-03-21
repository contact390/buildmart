const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// Create dealer_applications table if not exists
const createDealerTable = `
  CREATE TABLE IF NOT EXISTS dealer_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealership_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    shop_area VARCHAR(50),
    preferred_categories TEXT,
    investment_capacity VARCHAR(50),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createDealerTable, (err) => {
  if (err) {
    console.error('❌ Error creating dealer_applications table:', err);
  } else {
    console.log('✅ dealer_applications table created');
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

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email service not connected for dealer applications:', error.message);
  } else {
    console.log('✅ Dealer email service is ready');
  }
});

// POST /api/dealer_application - Submit dealer application
router.post('/dealer_application', (req, res) => {
  const {
    dealership_name,
    gst_number,
    email,
    owner_name,
    phone,
    city,
    shop_area,
    preferred_categories,
    investment_capacity
  } = req.body;

  // Validation
  if (!dealership_name || !email || !owner_name || !phone || !city) {
                    console.warn('❌ Validation failed: missing required fields', { dealership_name, email, owner_name, phone, city });
    return res.status(400).json({
      success: false,
      error: 'Required fields: dealership_name, email, owner_name, phone, city'
    });
  }

  console.log('📝 Dealer application received for:', dealership_name, 'in', city);

  // Insert into database
  const insertQuery = `
    INSERT INTO dealer_applications
    (dealership_name, gst_number, email, owner_name, phone, city, shop_area, preferred_categories, investment_capacity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    dealership_name,
    gst_number || null,
    email,
    owner_name,
    phone,
    city,
    shop_area || null,
    Array.isArray(preferred_categories) ? preferred_categories.join(', ') : preferred_categories || null,
    investment_capacity || null
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to save dealer application: ' + err.message
      });
    }

    const applicationId = result.insertId;
    console.log('✅ Dealer application saved with ID:', applicationId);

    // Send confirmation email to applicant
    const applicantMailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: email,
      subject: 'Dealer Application Received - buildmarts',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✅ Application Received!</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Dealership Application for buildmarts</p>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${owner_name},</p>
            <p>Thank you for your interest in becoming a <strong>buildmarts authorized dealer</strong>! Your application has been received successfully.</p>
            
            <h3 style="color: #333; margin-top: 20px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">Application Details:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
              <p style="margin: 5px 0;"><strong>🏢 Dealership:</strong> ${dealership_name}</p>
              <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${city}</p>
              <p style="margin: 5px 0;"><strong>📏 Shop Area:</strong> ${shop_area || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>📦 Product Categories:</strong> ${Array.isArray(preferred_categories) ? preferred_categories.join(', ') : preferred_categories || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>💰 Investment Capacity:</strong> ${investment_capacity || 'Not specified'}</p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 Application ID: ${applicationId}</h4>
              <p style="margin: 0; color: #0c5460;">Please save this ID for reference.</p>
            </div>
            
            <p>Our dealer relationship manager will contact you within <strong>24 hours</strong> to discuss the next steps and opportunities.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px;">
                If you have any questions, reach out to us at:<br>
                <strong>support@buildmarts.com</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Send notification email to admin
    const adminMailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: 'hitaishimatrimony@gmail.com',
      subject: `🚨 New Dealer Application - ${dealership_name} (${city})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🚨 New Dealer Application</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Application ID: ${applicationId}</p>
          </div>
          
          <div style="padding: 20px;">
            <h3 style="color: #333; border-bottom: 2px solid #f39c12; padding-bottom: 8px;">Applicant Details:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
              <p style="margin: 5px 0;"><strong>🏢 Dealership:</strong> ${dealership_name}</p>
              <p style="margin: 5px 0;"><strong>👤 Owner:</strong> ${owner_name}</p>
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>📱 Phone:</strong> ${phone}</p>
              <p style="margin: 5px 0;"><strong>📍 City:</strong> ${city}</p>
              <p style="margin: 5px 0;"><strong>GST:</strong> ${gst_number || 'Not provided'}</p>
              <p style="margin: 5px 0;"><strong>📏 Shop Area:</strong> ${shop_area || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>📦 Categories:</strong> ${Array.isArray(preferred_categories) ? preferred_categories.join(', ') : preferred_categories || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>💰 Investment:</strong> ${investment_capacity || 'Not specified'}</p>
            </div>
            
            <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="http://localhost:5000/api/dealer_applications" style="background: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View All Applications</a>
            </div>
          </div>
        </div>
      `
    };

    // Send emails
    transporter.sendMail(applicantMailOptions, (error, info) => {
      if (error) {
        console.error('⚠️ Applicant email failed:', error.message);
      } else {
        console.log('✅ Dealer application confirmation email sent to applicant');
      }
    });

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error('⚠️ Admin email failed:', error.message);
      } else {
        console.log('✅ Dealer application notification sent to admin');
      }
    });

    res.json({
      success: true,
      message: 'Dealer application submitted successfully. Our team will contact you within 24 hours.',
      applicationId: applicationId
    });
  });
});

// GET /api/dealer_applications - Get all dealer applications (admin only)
router.get('/dealer_applications', (req, res) => {
  const query = 'SELECT * FROM dealer_applications ORDER BY created_at DESC';

  db.query(query, (err, applications) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dealer applications'
      });
    }

    res.json({
      success: true,
      applications: applications || []
    });
  });
});

// GET /api/dealer_application/:email - Get applications by email
router.get('/dealer_application/:email', (req, res) => {
  const email = req.params.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email required'
    });
  }

  const query = 'SELECT * FROM dealer_applications WHERE email = ? ORDER BY created_at DESC';

  db.query(query, [email], (err, applications) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dealer applications'
      });
    }

    res.json({
      success: true,
      applications: applications || []
    });
  });
});

module.exports = router;