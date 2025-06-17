const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');

router.post('/v2', async (req, res) => {
  const { key, action, service, link, quantity, order } = req.body;

  console.log('📥 Incoming API request:');
  console.log('Key:', key);
  console.log('Action:', action);
  console.log('Body:', req.body);

  try {
    const user = await User.findOne({ apiKey: key });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid API key' });
    }

    // ✅ BALANCE CHECK
    if (action === 'balance') {
      return res.json({
        status: 'success',
        balance: user.balance_usd.toFixed(2),
        currency: 'USD'
      });
    }

    // ✅ PLACE ORDER
    if (action === 'add') {
      if (!service || !link || !quantity) {
        return res.status(400).json({ status: 'error', message: 'Missing parameters' });
      }

      const selectedService = await Service.findOne({ service_id: service });
      if (!selectedService) {
        return res.status(404).json({ status: 'error', message: 'Service not found' });
      }

      const totalCharge = selectedService.my_price * quantity;

      if (user.balance_usd < totalCharge) {
        return res.status(400).json({ status: 'error', message: 'Insufficient balance' });
      }

      user.balance_usd -= totalCharge;
      await user.save();

      // Use a numeric order_id for tracking
      const api_order_id = Math.floor(10000 + Math.random() * 99999).toString();

      const newOrder = await Order.create({
        user: user._id,
        service_id: selectedService.service_id,
        service_name: selectedService.name,
        quantity,
        link,
        charge: totalCharge,
        api_price: selectedService.api_price,
        profit: totalCharge - selectedService.api_price,
        status: 'Pending',
        fromAPI: true,
        api_order_id,
        order_id: api_order_id
      });

      return res.json({
        status: 'success',
        order: newOrder.order_id
      });
    }

    // ✅ ORDER STATUS CHECK
    if (action === 'status') {
      if (!order) {
        return res.status(400).json({ status: 'error', message: 'Missing order ID' });
      }

      const existingOrder = await Order.findOne({ order_id: order, user: user._id });
      if (!existingOrder) {
        return res.status(404).json({ status: 'error', message: 'Order not found' });
      }

      return res.json({
        status: 'success',
        order: {
          id: existingOrder.order_id,
          service: existingOrder.service_id,
          status: existingOrder.status,
          charge: existingOrder.charge,
          quantity: existingOrder.quantity,
          link: existingOrder.link,
          created: existingOrder.createdAt,
          remains: existingOrder.remains || 0
        }
      });
    }

    // ✅ LIST SERVICES
    if (action === 'services') {
      const services = await Service.find({});
      const result = services.map(s => ({
        service: s.service_id,
        name: s.name,
        category: s.category,
        rate: s.my_price,
        min: s.min,
        max: s.max,
        average_time: s.average_time || 'N/A'
      }));

      return res.json({
        status: 'success',
        services: result
      });
    }

    // ❌ Unknown Action
    console.log('❌ Invalid action received:', action);
    return res.status(400).json({ status: 'error', message: 'Invalid action' });

  } catch (err) {
    console.error('🔥 Server error in /v2:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
