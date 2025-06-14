const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /email
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,     // Your Gmail address
        pass: process.env.EMAIL_PASS,     // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Poplox Contact" <${process.env.EMAIL_USER}>`,
      to: 'poplox042@gmail.com',
      subject: `📩 New Message from ${name}`,
      html: `
        <h2>Poplox Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});




module.exports = router;
