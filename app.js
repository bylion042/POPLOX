require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');

// Import routes
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

// about site map
const sitemapRoute = require('./routes/sitemap');


// Passport config
require('./config/passport');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI,)
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
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/services', servicesRoutes);
app.use('/email', emailRoutes);
app.use('/auth', forgotpasswordRoutes);
app.use('/admin', adminRoutes);
app.use('/', palmpayRoutes);
app.use('/', orderroutes);
app.use('/', reviewRoutes);
app.use('/api', apiRoutes);


app.use('/', sitemapRoute);
// about site map


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
