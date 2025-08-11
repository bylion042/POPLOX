require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');

// Passport config
require('./config/passport'); // Make sure this is correctly setup

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const emailRoutes = require('./routes/email');
const forgotpasswordRoutes = require('./routes/forgotpassword');
const adminRoutes = require('./routes/admin');
const palmpayRoutes = require('./routes/palmpay');
const orderroutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const apiRoutes = require('./routes/api');
const admin_login = require('./routes/admin_login');
const sitemapRoute = require('./routes/sitemap'); // For SEO

// Use Routes
app.use('/', mainRoutes);
app.use('/auth', authRoutes);                    // Login, Register, Google Auth
app.use('/services', servicesRoutes);
app.use('/email', emailRoutes);
app.use('/auth', forgotpasswordRoutes);          // Still under /auth — good
app.use('/admin', adminRoutes);                  // Admin panel routes
app.use('/', palmpayRoutes);                     // Payment handlers
app.use('/', orderroutes);                       // Orders (engagement)
app.use('/', reviewRoutes);                      // Reviews page
app.use('/api', apiRoutes);                      // API v2 endpoint
app.use(admin_login);                            // Admin login form route
app.use('/', sitemapRoute);                      // Sitemap.xml for SEO

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
