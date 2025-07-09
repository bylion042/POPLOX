const axios = require('axios');
const User = require('../models/User'); // adjust path

const detectUserCurrency = async (req, res, next) => {
  try {
    if (req.session.user && (!req.session.user.currency || req.session.user.currency === 'USD')) {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;

      const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
      const detectedCurrency = geo.data.currency;

      if (detectedCurrency) {
        await User.findByIdAndUpdate(req.session.user._id, { currency: detectedCurrency });
        req.session.user.currency = detectedCurrency;
        console.log(`🌍 Detected & set user currency to: ${detectedCurrency}`);
      }
    }
  } catch (err) {
    console.error("🌍 GeoIP detection failed:", err.message);
  }
  next();
};

module.exports = detectUserCurrency;
