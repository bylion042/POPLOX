const axios = require("axios");
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

// Still works for NGN-only legacy use
async function getUsdRate() {
  try {
    const res = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
    return res.data.conversion_rates.NGN;
  } catch (err) {
    console.error("Error fetching USD→NGN rate:", err.message);
    return null;
  }
}

// New flexible version
async function getExchangeRate(toCurrency) {
  try {
    const res = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
    const rate = res.data.conversion_rates[toCurrency];
    return rate || null;
  } catch (err) {
    console.error(`Error fetching USD→${toCurrency} rate:`, err.message);
    return null;
  }
}

module.exports = { getUsdRate, getExchangeRate };
