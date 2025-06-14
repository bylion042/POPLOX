const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const PalmPayRequest = require("../models/Palmpay"); // Mongoose model

// Screenshot upload setup
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 🔁 GET /wallet – Show user's payment history with optional status filter
router.get("/wallet", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const statusFilter = req.query.status;

    let query = { user_id: userId };
    if (statusFilter) {
      query.status = statusFilter;
    }

    const payments = await PalmPayRequest.find(query).sort({ created_at: -1 });

    res.render("wallet", {
      user: req.session.user,
      payments,
      msg: req.query.msg
    });
  } catch (err) {
    console.error("Error loading wallet:", err);
    res.status(500).send("Failed to load wallet");
  }
});

// ✅ POST /palmpay/submit – Submit new payment
router.post("/submit", upload.single("screenshot"), async (req, res) => {
  try {
    const { amount, txid } = req.body;
    const screenshot = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.session.user._id;

    const request = new PalmPayRequest({
      user_id: userId,
      amount,
      txid,
      screenshot,
      status: "pending"
    });

    await request.save();

    res.redirect("/wallet?msg=Payment submitted. Please wait for admin approval.");
  } catch (err) {
    console.error("Error submitting PalmPay request:", err);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
