const mongoose = require('mongoose');

const DeletedServiceSchema = new mongoose.Schema({
  service_id: String,
  name: String,
  category: String,
  api_price: Number,
  my_price: Number,
  min: Number,
  max: Number,
  average_time: String,
  deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedService', DeletedServiceSchema);
