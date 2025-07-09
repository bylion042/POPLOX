const express = require("express");
const router = express.Router();
const axios = require("axios");
const PalmPayRequest = require("../models/Palmpay");
const User = require("../models/User");

// ✅ Load secrets from .env
const FLW_SECRET = process.env.FLW_SECRET_KEY;
const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL;

// ✅ Detect environment
const isProd = process.env.NODE_ENV === "production";
const BASE_URL = isProd ? "https://poplox.com" : "http://localhost:3000";

// Step 1: Create payment & redirect user
router.post("/pay", async (req, res) => {
  const { amount } = req.body;
  const user = req.session.user;

  if (!user) return res.redirect("/login");
  if (!amount || Number(amount) <= 0) {
    return res.send("Invalid amount");
  }

  if (user.currency === "NGN" && Number(amount) < 500) {
    return res.send("Minimum amount is ₦500");
  }

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: `poplox_${Date.now()}`,
        amount: Number(amount),
        currency: user.currency || "USD",  // dynamically use user's preferred currency
        redirect_url: `${BASE_URL}/flutterwave/callback`,
        customer: {
          email: user.email,
          name: user.name
        },
        customizations: {
          title: "Wallet Funding",
          description: "Add funds to your Poplox wallet",
          logo: "https://i.postimg.cc/vmz11cx9/poplox.jpg"
        }
      },
      {
        headers: { Authorization: `Bearer ${FLW_SECRET}` }
      }
    );

    if (response.data?.status === "success" && response.data.data?.link) {
      return res.redirect(response.data.data.link);
    } else {
      console.error("Unexpected Flutterwave response:", response.data);
      return res.send("Failed to initiate payment. Please try again later.");
    }
  } catch (err) {
    console.error("Flutterwave create payment error:", err.response?.data || err);
    return res.send("Payment initiation failed. Please check your network or try again.");
  }
});

// Step 2: Handle callback & verify payment
router.get("/callback", async (req, res) => {
  const transaction_id = req.query.transaction_id;

  if (!transaction_id) {
    console.warn("Missing transaction_id in callback.");
    return res.redirect("/wallet?msg=Missing transaction ID.");
  }

  try {
    // ✅ Verify transaction with Flutterwave
    const verify = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET}` } }
    );

    const data = verify.data?.data;
    if (!data || data.status !== "successful") {
      console.warn("Payment verification failed:", verify.data);
      return res.redirect("/wallet?msg=Payment verification failed.");
    }

    const paidCurrency = data.currency;
    const paidAmount = Number(data.amount);

    // ✅ Find user
    const user = await User.findById(req.session.user._id);
    if (!user) {
      console.warn("User not found in database.");
      return res.redirect("/wallet?msg=User not found.");
    }

    let amountInUSD = paidAmount;

    if (paidCurrency !== "USD") {
      // ✅ Convert paidAmount to USD using your exchange rate API
      const exchangeRes = await axios.get(EXCHANGE_API_URL);
      const rates = exchangeRes.data?.conversion_rates;

      if (!rates || !rates[paidCurrency]) {
        console.error("Exchange rate missing for:", paidCurrency);
        return res.redirect("/wallet?msg=Exchange rate error.");
      }

      // paidAmount is in NGN → convert to USD: amount / rate
      amountInUSD = paidAmount / rates[paidCurrency];
      console.log(`Converted ${paidAmount} ${paidCurrency} → ${amountInUSD.toFixed(2)} USD`);
    }

    // ✅ Update user's master USD balance
    user.balance_usd += amountInUSD;
    user.totalSpent += amountInUSD;

    // ✅ Update user's view balance in preferred currency
    let viewRate = 1;
    if (user.currency && user.currency !== "USD") {
      const exchangeRes = await axios.get(EXCHANGE_API_URL);
      const rates = exchangeRes.data?.conversion_rates;
      if (rates && rates[user.currency]) {
        viewRate = rates[user.currency];
      }
    }
    user.balance = user.balance_usd * viewRate;

    await user.save();

    // ✅ Save transaction record
    await new PalmPayRequest({
      user_id: user._id,
      amount: paidAmount,
      txid: transaction_id,
      method: "Flutterwave",
      currency: paidCurrency,
      status: "approved"
    }).save();

    // ✅ Refresh session
    req.session.user = user;

    return res.redirect("/wallet?msg=Funding successful!");
  } catch (err) {
    console.error("Flutterwave callback verify error:", err.response?.data || err);
    return res.redirect("/wallet?msg=Error verifying payment. Please try again.");
  }
});

module.exports = router;
