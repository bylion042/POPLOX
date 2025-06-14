const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Import User model
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const router = express.Router();


// Middleware for session-based authentication
const authenticateUser = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
};



// ALL ABOUT FORGOTEN PASSWORD 
// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or another provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Rate limiter setup for sensitive routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many requests, please try again later.'
});

// Send reset code
router.post("/send-reset-code", limiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  console.log(`Sending reset code to: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(404).json({ message: "Email not found" });
    }

    const resetCode = crypto.randomInt(1000, 9999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetCode = resetCode;
    user.resetCodeExpires = expires;
    const savedUser = await user.save();

    console.log(`Saved reset code: ${savedUser.resetCode}, Expires: ${savedUser.resetCodeExpires}`);

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Password Reset Code",
      text: `Your 4-digit reset code is: ${resetCode}. It expires in 10 minutes.`
    });

    console.log(`Reset code sent to: ${email}`);
    res.json({ message: "Verification code sent to your email" });

  } catch (error) {
    console.error('Error sending reset code:', error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Verify reset code
router.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!/^\d{4}$/.test(code)) {
    return res.status(400).json({ message: "Invalid code format" });
  }

  console.log(`Verifying reset code for email: ${email} with code: ${code}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(404).json({ message: "Email not found" });
    }

    if (
      String(user.resetCode) !== String(code) ||
      Date.now() > new Date(user.resetCodeExpires).getTime()
    ) {
      console.log(`Invalid or expired code for email: ${email}`);
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    console.log(`Code verified successfully for email: ${email}`);

    // Optional: clear code after verification to prevent reuse
    // user.resetCode = undefined;
    // user.resetCodeExpires = undefined;
    // await user.save();

    res.json({ message: "Verification successful" });

  } catch (error) {
    console.error('Error verifying reset code:', error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  console.log(`Resetting password for email: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(404).json({ message: "Email not found" });
    }

    if (!user.resetCode || Date.now() > new Date(user.resetCodeExpires).getTime()) {
      console.log(`Reset code expired or invalid for email: ${email}`);
      return res.status(400).json({ message: "Reset code expired or invalid" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    console.log(`Password reset successfully for email: ${email}`);
    res.json({ message: "Password reset successfully" });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
