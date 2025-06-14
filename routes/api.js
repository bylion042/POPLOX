const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path if needed

router.post('/v2', async (req, res) => {
  const { key, action } = req.body;

  const user = await User.findOne({ apiKey: key });
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid API key' });
  }

  if (action === 'balance') {
    return res.json({
      status: 'success',
      balance: user.balance.toFixed(2),
      currency: 'NGN'
    });
  }

  res.status(400).json({ status: 'error', message: 'Invalid action' });
});

module.exports = router; // ✅ MAKE SURE THIS IS PRESENT
