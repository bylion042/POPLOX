const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service_id: String,
  order_id: String,
  api_order_id: String,
  service_name: String,
  link: String,
  quantity: Number,
  charge: Number,       // User pays this
  api_price: Number,    // You pay this to provider
  profit: Number,       // Your profit
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
