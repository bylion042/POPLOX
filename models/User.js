const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  googlePhoto: { type: String },           // 🆕 Google profile photo
  termsAccepted: { type: Boolean },
  createdAt: { type: Date, default: Date.now },

  // 🔐 Password reset fields
  resetCode: { type: String },
  resetCodeExpires: { type: Date },

  // 💰 Balance in NGN
  balance: { type: Number, default: 0 },

  // 💵 USD equivalent of balance
  balance_usd: { type: Number, default: 0 },

  // Total spent
  totalSpent: { type: Number, default: 0 },

  currency: { type: String, default: 'USD' },

  apiKey: { type: String, default: '' },
  apiKeyCreatedAt: Date,

  // 🐦 Twitter fields
  twitter_id: { type: String, unique: true, sparse: true },
  username: { type: String },
  profile_image_url: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
});

// ✅ Ensure user has at least one login method
UserSchema.path('password').validate(function (value) {
  return this.googleId || this.twitter_id || value;
}, 'Password is required unless logged in with Google or Twitter');

UserSchema.path('googleId').validate(function (value) {
  return this.password || this.twitter_id || value;
}, 'Google ID required unless using password or Twitter');

UserSchema.path('twitter_id').validate(function (value) {
  return this.password || this.googleId || value;
}, 'Twitter ID required unless using password or Google');

const User = mongoose.model('User', UserSchema);
module.exports = User;
