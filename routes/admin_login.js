const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const isAdmin = require('../middleware/isAdmin');

// GET: Show email form (protected)
router.get('/mail_all', isAdmin, (req, res) => {
  res.render('mail_all', { emailStatus: null });
});

// GET: Admin login form
router.get('/admin-login', (req, res) => {
  res.render('admin_login', { error: null });
});

// POST: Admin login logic
router.post('/admin-login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admin'); // Redirect to the protected page
  } else {
    res.render('admin_login', { error: 'Incorrect password' });
  }
});

// POST: Handle email send to all users (protected)
router.post('/send-email', isAdmin, async (req, res) => {
  const { subject, message } = req.body;

  try {
    const users = await User.find({}, 'email name');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (let user of users) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html: `
          <div style="background-color: #f4f6f9; color: #1f2125; padding: 25px; font-family: 'Arial', sans-serif; font-weight: bold; border-radius: 30px; max-width: 620px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="https://i.postimg.cc/d1QBRQwf/logo.png" alt="Polplox Logo" style="width: 80%; margin-bottom: 20px;" />
            </div>
            <h1 style="font-size: 30px; color: #696fdd; text-align: center;">📢QUICK NOTICE📢</h1>
            <p style="font-size: 20px; color: #333;">Hello <strong>${user.name || 'there'}</strong>,</p>
            <p style="font-size: 20px; line-height: 1.8;">
              ${message}
            </p>
            <hr style="border: 0; border-top: 1px solid #ffffff; margin: 24px 0;">
            <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
              This is an automated message from <strong>Code Lab</strong>. Do not reply directly to this email.
            </p>
          </div>
        `
      });
    }

    res.render('mail_all', { emailStatus: 'Emails sent successfully!' });
  } catch (error) {
    console.error(error);
    res.render('mail_all', { emailStatus: 'Error sending emails.' });
  }
});

// Optional: Add logout
router.get('/admin-logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin-login');
  });
});

module.exports = router;
