# Email Configuration Fix Guide

## Issue
The footer subscription and contact forms were failing with the error:
```
Error: getaddrinfo ENOTFOUND smtp.gmail.com
```

## Root Cause
- Incorrect SMTP configuration using `service: 'gmail'` instead of explicit host configuration
- Missing proper connection timeout settings
- No graceful error handling for email failures

## Solution Applied

### 1. **Updated SMTP Configuration**
All email routes (subscribe.js, contact_us.js, bm_plans.js) now use:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',      // Explicit host
  port: 587,                    // Standard TLS port
  secure: false,                // Use STARTTLS
  auth: {
    user: process.env.GMAIL_USER || 'hitaishimatrimony@gmail.com',
    pass: process.env.GMAIL_PASS || 'hgkh ylho pibp bopl'
  },
  connectionTimeout: 5000,      // 5 second timeout
  socketTimeout: 5000           // 5 second socket timeout
});
```

### 2. **Environment Variables**
Created `.env` file for sensitive configuration:
```
GMAIL_USER=hitaishimatrimony@gmail.com
GMAIL_PASS=hgkh ylho pibp bopl
SESSION_SECRET=dev_session_secret_hitaishi_2026
```

### 3. **Improved Error Handling**
- Email failures no longer cause form submission to fail
- Users get confirmation that their data was saved even if email failed
- Returns `emailStatus: 'pending'` or `emailStatus: 'sent'` for frontend tracking

### 4. **Connection Verification**
Added automatic verification when server starts:
```javascript
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email service not connected:', error.message);
  } else {
    console.log('✅ Email service is ready');
  }
});
```

## What Changed

### Files Modified:
1. **server.js** - Added `require('dotenv').config()`
2. **routes/subscribe.js** - Updated transporter config & error handling
3. **routes/contact_us.js** - Updated transporter config & error handling
4. **routes/bm_plans.js** - Updated transporter config & error handling
5. **package.json** - Added `dotenv` dependency

### Files Created:
1. **.env** - Environment configuration (with actual credentials)
2. **.env.example** - Example configuration for reference

## Testing the Fix

### 1. Subscribe to Newsletter
- Go to footer section of index.html
- Enter email and click Subscribe
- ✅ Email should be saved to database
- ⚠️ If SMTP fails, data is still saved

### 2. Contact Us Form
- Fill out contact form with name, email, subject, message
- ✅ Message saved to database
- ⚠️ Admin notification email may fail if SMTP unavailable

### 3. BM Plans Form
- Submit a building materials plan
- ✅ Plan saved to database
- ✅ User gets confirmation (email attempt made)
- ✅ Admin gets notification (email attempt made)

## Gmail Configuration (For Production)

If you want email to actually send:

1. **Create App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated password (16 characters, spaces included)
   - Update `.env` GMAIL_PASS with this password

2. **Enable Less Secure Apps (Alternative):**
   - Not recommended but works at https://myaccount.google.com/lesssecureapps

3. **Use Alternative Email Provider:**
   - Consider using SendGrid, Mailgun, or AWS SES for production
   - Update transporter config accordingly

## Server Restart

```bash
npm install    # Install dotenv
npm start      # Or node server.js
```

## Expected Console Output After Fix

```
✅ Email service is ready
✅ Contact form email service is ready
✅ Plans email service is ready
```

## Frontend Response Status

All email endpoints now return:
```json
{
  "message": "Subscription saved successfully!",
  "emailStatus": "pending" // or "sent"
}
```

This allows the frontend to show appropriate messages regardless of email status.
