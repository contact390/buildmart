// server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config(); // Load environment variables
const profile_registerRoutes = require('./routes/profile_register');
const contactUsRoutes = require('./routes/contact_us');
const subscribeRoutes = require('./routes/subscribe');
const bm_plansRoutes = require('./routes/bm_plans'); // Import the bm_plans routes
const cartRoutes = require('./routes/cart');
const productsRoutes = require('./routes/products');
const formRoutes = require('./routes/form');
const productUploadsRoutes = require('./routes/product_uploads'); // Import product uploads routes


const app = express();
const port = 4000;

// Middleware
app.use(cors({ 
  origin: function(origin, callback) {
    // Allow localhost in development, or any origin with credentials
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // For now, allow all origins
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
// Increase payload size limit for large file uploads (images, etc.)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Simple session middleware (development). For production use a proper store.
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,  // Set to false for http (localhost)
    domain: 'localhost'
  }
}));
const path = require('path');

// Serve static files (HTML/CSS/JS) from project root so pages like allproducts.html
// can be opened from http://localhost:4000/allproducts.html
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/api', profile_registerRoutes);
app.use('/api', contactUsRoutes);
app.use('/api', subscribeRoutes);
app.use('/api', bm_plansRoutes); // Use the bm_plans routes
app.use('/api', cartRoutes);
app.use('/api', productsRoutes);
app.use('/api', formRoutes);
app.use('/api', productUploadsRoutes); // Use product uploads routes

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

