const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require('../models/User');
const PalmPayRequest = require("../models/Palmpay");
const { getExchangeRate } = require('../utils/exchangeRate'); // ✅ USE FLEXIBLE VERSION

// Screenshot upload setup
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


// 🔁 GET /wallet – Show user's wallet + payment history
router.get("/wallet", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const statusFilter = req.query.status;

    let query = { user_id: userId };
    if (statusFilter) query.status = statusFilter;

    const payments = await PalmPayRequest.find(query).sort({ created_at: -1 });
    const freshUser = await User.findById(userId);

    // Get user’s selected currency or fallback
    const currency = freshUser.currency || 'NGN';
    const rate = await getExchangeRate(currency);

    // Convert USD balance to selected currency
    let convertedBalance = 0;
    if (rate && freshUser.balance_usd) {
      convertedBalance = parseFloat((freshUser.balance_usd * rate).toFixed(2));
    }

    res.render("wallet", {
      user: freshUser,
      usdBalance: freshUser.balance_usd,
      convertedBalance, // 🆕 based on selected currency
      payments,
      msg: req.query.msg
    });

  } catch (err) {
    console.error("Error loading wallet:", err);
    res.status(500).send("Failed to load wallet");
  }
});


// ✅ POST /submit – Submit payment (PalmPay or Binance)
router.post("/submit", upload.single("screenshot"), async (req, res) => {
  try {
    const { amount, txid, method } = req.body;
    const screenshot = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.session.user._id;

    const currency = method === 'BinancePay' ? 'USD' : 'NGN';

    const request = new PalmPayRequest({
      user_id: userId,
      amount,
      txid,
      method,
      currency,
      screenshot,
      status: "pending"
    });

    await request.save();

    res.redirect("/wallet?msg=Payment submitted. Please wait for admin approval, if not approved for 5min click the whatsapp icon to message the admin.");
  } catch (err) {
    console.error("Error submitting payment request:", err);
    res.status(500).send("Something went wrong");
  }
});


// ✅ Update user currency preference
router.post('/settings/currency', async (req, res) => {
  const userId = req.session.user._id;
  const { currency } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { currency });
    res.json({ success: true });
  } catch (err) {
    console.error('Currency update failed:', err);
    res.json({ success: false });
  }
});

module.exports = router;
