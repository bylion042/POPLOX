const mongoose = require("mongoose");

const PalmPayRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
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
    type: String // Filename or path to uploaded screenshot
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
