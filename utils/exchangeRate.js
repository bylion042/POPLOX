const axios = require("axios");
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

async function getUsdRate() {
  try {
    const res = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
    return res.data.conversion_rates.NGN; // How much 1 USD = ? NGN
  } catch (err) {
    console.error("Error fetching exchange rate:", err.message);
    return null;
  }
}

module.exports = { getUsdRate };
