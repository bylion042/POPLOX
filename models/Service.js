// models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  service_id: { type: Number, required: true, unique: true },
  category: String,
  name: String,
  api_price: Number,     // Original price from SMMYZ in USD
  my_price: Number,      // Your custom price (editable)
  type: String,
  min: Number,
  max: Number,
  average_time: { type: String, default: 'Instant' },
  // average_time: { type: String, default: 'N/A' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
postedToTelegram: { type: Boolean, default: false }

});

module.exports = mongoose.model('Service', ServiceSchema);
