// updateProfitForOrders.js

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Service = require('../models/Service');

const MONGODB_URI = process.env.MONGO_URI; // <-- Update this!

async function updateOrders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const orders = await Order.find({});

    let updatedCount = 0;

    for (const order of orders) {
      const service = await Service.findOne({ service_id: order.service_id });

      if (!service) {
        console.log(`❌ Service not found for order ${order._id}`);
        continue;
      }

      const api_price = (service.api_price / 1000) * order.quantity;
      const profit = (order.charge || 0) - api_price;

      order.api_price = api_price;
      order.profit = profit;

      await order.save();
      updatedCount++;
    }

    console.log(`✅ Updated ${updatedCount} orders with profit and API price`);
    process.exit();
  } catch (error) {
    console.error('❌ Error updating orders:', error);
    process.exit(1);
  }
}

updateOrders();
