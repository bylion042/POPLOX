const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  termsAccepted: { type: Boolean },
  createdAt: { type: Date, default: Date.now },

  // 🔐 Password reset fields
  resetCode: { type: String },
  resetCodeExpires: { type: Date },

  // 💰 Add this for balance in NGN:
  balance: { type: Number, default: 0 },

  // 💵 Store USD equivalent of balance
  balance_usd: { type: Number, default: 0 },

  // total spent money 
  totalSpent: {
    type: Number,
    default: 0,
  },

  apiKey: { type: String, default: '' },
apiKeyCreatedAt: Date,
});


// Ensure either password or Google ID exists
UserSchema.path('password').validate(function (value) {
  return this.googleId || value;
}, 'Password is required unless logged in with Google');

UserSchema.path('googleId').validate(function (value) {
  return this.password || value;
}, 'Google ID is required unless using password');

const User = mongoose.model('User', UserSchema);
module.exports = User;
