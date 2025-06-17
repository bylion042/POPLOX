const mongoose = require("mongoose");

const PalmPayRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  amount: {
    type: Number,
    required: true
  },
  txid: {
    type: String,
    required: true
  },
  screenshot: {
    type: String
  },
  method: {
    type: String,
    enum: ["PalmPay", "BinancePay"],
    required: true
  },
  currency: {
    type: String,
    enum: ["NGN", "USD"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("PalmPayRequest", PalmPayRequestSchema);
