require('dotenv').config(); 
const axios = require('axios'); 
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require("../models/User");
const PalmPayRequest = require("../models/Palmpay");
const Service = require('../models/Service');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { getUsdRate } = require('../utils/exchangeRate'); // make sure this exists
const fs = require('fs');



// 🛡️ Middleware to check login
function isLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login'); // or show error if preferred
}



// Index/Homepage
router.get('/', (req, res) => {
  res.render('index');
});

// Terms and Conditions
router.get('/t&c', (req, res) => {
  res.render('t&c');
});

// Contact Us
router.get('/contact-us', (req, res) => {
  res.render('contact-us');
});

// surport Us
router.get('/support', (req, res) => {
  res.render('support');
});

// Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// Register Page
router.get('/register', (req, res) => {
  res.render('register');
});

// Forgot Password Page
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password');
});

// API Page
router.get('/api', (req, res) => {
  res.render('api');
});

// API-iniT Page
router.get('/api-init', (req, res) => {
  res.render('api-init');
});

// PHP Page
router.get('/php', (req, res) => {
  res.render('php');
});

// PHP example page
router.get('/php-example', (req, res) => {
  fs.readFile('./php/api-example.php', 'utf8', (err, phpCode) => {
    if (err) return res.status(500).send('Error loading PHP example.');
    res.render('php', { phpCode });
  });
});


// Services Page
router.get('/services', (req, res) => {
  res.render('services');
});

// engagement Page
router.get('/engagement', (req, res) => {
  res.render('engagement');
});

// reviews Page
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }); // show latest first
    res.render('reviews', { reviews }); // ✅ send to EJS
  } catch (err) {
    console.error("Error loading reviews:", err);
    res.status(500).send("Failed to load reviews");
  }
});

// mine Page (Protected)
router.get('/mine', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const userId = req.session.user._id;

    // ✅ Fetch fresh user from DB
    const freshUser = await User.findById(userId);

    // ✅ Convert balance to USD
    const usdRate = await getUsdRate();
    let usdBalance = 0;

    if (usdRate && freshUser.balance) {
      usdBalance = parseFloat((freshUser.balance / usdRate).toFixed(2));

      // Save USD balance if it changed
      if (usdBalance !== freshUser.balance_usd) {
        freshUser.balance_usd = usdBalance;
        await freshUser.save();
      }
    }

    // ✅ Count total orders
    const totalOrders = await Order.countDocuments({ user: userId });

    // ✅ Render 'mine' page
    res.render('mine', {
      user: freshUser,
      usdBalance,
      totalSpent: freshUser.totalSpent || 0,
      totalOrders
    });

  } catch (err) {
    console.error("Error loading mine page:", err);
    res.status(500).send("Something went wrong");
  }
});




// 🧾 Account Page
// 🔧 API Key generator
function generateApiKey(length = 30) {
  return crypto.randomBytes(64)
    .toString('base64')               // long random string
    .replace(/[^a-zA-Z0-9]/g, '')     // remove special characters
    .slice(0, length);                // trim to 30 chars
}

// 🧾 Account Page
router.get('/account', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);

    // ✅ Generate API key if missing
    if (!user.apiKey) {
      user.apiKey = generateApiKey();
      user.apiKeyCreatedAt = new Date();
      await user.save();
    }

    // ✅ Convert balance to USD
    const usdRate = await getUsdRate();
    let usdBalance = 0;
    if (usdRate && user.balance) {
      usdBalance = parseFloat((user.balance / usdRate).toFixed(2));

      if (usdBalance !== user.balance_usd) {
        user.balance_usd = usdBalance;
        await user.save();
      }
    }

    // ✅ Fetch PalmPay payment history
    const payments = await PalmPayRequest.find({ user_id: userId }).sort({ created_at: -1 });

    // ✅ Fetch services and group by category
    const services = await Service.find().sort({ category: 1 });
    const servicesByCategory = {};
    services.forEach(service => {
      const category = service.category || 'Uncategorized';
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });

    // ✅ Count total orders
    const totalOrders = await Order.countDocuments({ user: userId });

    // ✅ Render account page with all dashboard data
    res.render('account', {
      user,
      payments,
      usdBalance,
      servicesByCategory,
      totalSpent: user.totalSpent || 0,
      totalOrders
    });

  } catch (err) {
    console.error("Error loading account page:", err);
    res.status(500).send("Something went wrong");
  }
});

// 🔑 Generate API key only if not exists
router.post('/account/api/generate', isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.userId);

  if (!user.apiKey) {
    user.apiKey = generateApiKey();
    user.apiKeyCreatedAt = new Date();
    await user.save();
  }

  res.redirect('/account');
});

// 🔁 Force regenerate API key
router.post('/account/api/regenerate', isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.userId);

  user.apiKey = generateApiKey();
  user.apiKeyCreatedAt = new Date();
  await user.save();

  res.redirect('/account');
});




// EVERYTHING ABOUT DASHBOARD 
router.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const userId = req.session.user._id;

    // ✅ Fetch user
    const freshUser = await User.findById(userId);

    // ✅ Convert balance to USD
    const usdRate = await getUsdRate();
    let usdBalance = 0;

    if (usdRate && freshUser.balance) {
      usdBalance = parseFloat((freshUser.balance / usdRate).toFixed(2));

      // Save USD balance if it changed
      if (usdBalance !== freshUser.balance_usd) {
        freshUser.balance_usd = usdBalance;
        await freshUser.save();
      }
    }

    // ✅ Fetch PalmPay payment history
    const payments = await PalmPayRequest.find({ user_id: userId }).sort({ created_at: -1 });

    // ✅ Fetch services and group by category (for order form)
    const services = await Service.find().sort({ category: 1 });
    const servicesByCategory = {};
    services.forEach(service => {
      const category = service.category || 'Uncategorized';
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });

    // ✅ Count total orders for this user
    const totalOrders = await Order.countDocuments({ user: userId });

    // ✅ Render dashboard
    res.render('dashboard', {
      user: freshUser,
      payments,
      usdBalance,
      servicesByCategory,
      totalSpent: freshUser.totalSpent || 0,
      totalOrders // pass total orders to the view
    });

  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Something went wrong");
  }
});




// MY ORDER PAGE 
// ✅ ALL ABOUT MY ORDER PAGE
router.get('/my-order', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const userId = req.session.user._id;

    // ✅ Fetch user data
    const freshUser = await User.findById(userId);

    // ✅ Build filter query based on status
    const statusFilter = req.query.status;
    const query = { user: userId };

    if (statusFilter) {
      switch (statusFilter.toLowerCase()) {
        case 'pending':
          query.status = 'Pending';
          break;
        case 'canceled':
          query.status = 'Canceled';
          break;
        case 'inprogress':
          query.status = { $in: ['In progress', 'Processing'] };
          break;
        case 'completed':
          query.status = { $in: ['Completed', 'Success'] };
          break;
      }
    }

    // ✅ Fetch user's orders
    const orders = await Order.find(query).sort({ createdAt: -1 });

    // ✅ Fetch USD rate and convert balance
    const usdRate = await getUsdRate();
    const usdBalance = usdRate ? parseFloat((freshUser.balance / usdRate).toFixed(2)) : 0;

    // ✅ Count total orders
    const totalOrders = await Order.countDocuments({ user: userId });

    // ✅ Render the orders page
    res.render('my-order', {
      user: freshUser, // ✅ This makes <%- include('partials/sidebar') %> work
      orders,
      order: null,
      status: statusFilter || null,
      usdBalance,
      totalOrders,
      totalSpent: freshUser.totalSpent || 0
    });

  } catch (err) {
    console.error("Error in /my-order:", err);
    res.status(500).send("Something went wrong");
  }
});



// 🚀 New Updates Page
router.get('/new-update', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    const userId = req.session.user._id;

    // ✅ Fetch user
    const freshUser = await User.findById(userId);

    // ✅ Convert balance to USD
    const usdRate = await getUsdRate();
    let usdBalance = 0;

    if (usdRate && freshUser.balance) {
      usdBalance = parseFloat((freshUser.balance / usdRate).toFixed(2));

      // Save USD balance if it changed
      if (usdBalance !== freshUser.balance_usd) {
        freshUser.balance_usd = usdBalance;
        await freshUser.save();
      }
    }

    // ✅ Fetch PalmPay payment history
    const payments = await PalmPayRequest.find({ user_id: userId }).sort({ created_at: -1 });

    // ✅ Fetch services and group by category
    const services = await Service.find().sort({ category: 1 });
    const servicesByCategory = {};
    services.forEach(service => {
      const category = service.category || 'Uncategorized';
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });

    // ✅ Count total orders
    const totalOrders = await Order.countDocuments({ user: userId });

    // ✅ Fetch new services from API
const response = await axios.post(process.env.SMMYZ_API_URL, {
  key: process.env.SMMYZ_API_KEY, // ✅ Correct usage
  action: 'services'
});

    const apiServices = response.data;
    const existingServiceIds = await Service.find().distinct('service_id');
    const newServices = apiServices.filter(svc => !existingServiceIds.includes(svc.service));

    // ✅ Render new-update view with newServices
    res.render('new-update', {
      user: freshUser,
      payments,
      usdBalance,
      servicesByCategory,
      totalSpent: freshUser.totalSpent || 0,
      totalOrders,
      newServices // ✅ passed to EJS
    });

  } catch (err) {
    console.error("Error loading new-update page:", err);
    res.status(500).send("Something went wrong");
  }
});





// Logout
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });
});

// Note: NO /admin route here — it's handled in routes/admin.js
module.exports = router;
