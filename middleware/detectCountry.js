// middleware/detectCountry.js
const axios = require('axios');

module.exports = async function detectCountry(req, res, next) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
    // Use free IP API (replace with a paid API for production if needed)
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const country = response.data?.country_name || 'Unknown';

    // Save to req for use later
    req.userCountry = country;
  } catch (err) {
    console.error('Failed to detect user country:', err.message);
    req.userCountry = 'Unknown';
  }
  next();
};
