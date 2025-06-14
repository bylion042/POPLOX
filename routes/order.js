const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');

const API_URL = process.env.SMMYZ_API_URL;
const API_KEY = process.env.SMMYZ_API_KEY;

// ✅ GET / → show services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().sort({ category: 1 });

        const servicesByCategory = {};
        services.forEach(service => {
            const category = service.category || 'Uncategorized';
            if (!servicesByCategory[category]) {
                servicesByCategory[category] = [];
            }
            servicesByCategory[category].push(service);
        });

        res.render('orders', { servicesByCategory });
    } catch (error) {
        console.error('Error loading services from DB:', error.message);
        res.render('orders', { servicesByCategory: {} });
    }
});

// ✅ POST /order → place order
router.post('/order', async (req, res) => {
    const { service, link, quantity } = req.body;
    const userId = req.session.userId;

    try {
        if (!service || !link || !quantity) {
            return res.render('my-order', {
                user: req.session.user || null,
                order: null,
                status: { error: '❌ All fields are required.' },
                orders: []
            });
        }

        const dbService = await Service.findOne({ service_id: service });
        if (!dbService) return res.render('my-order', {
            user: req.session.user || null,
            order: null,
            status: { error: '❌ Service not found' },
            orders: []
        });

        const cost_usd = (dbService.my_price / 1000) * quantity;

        const user = await User.findById(userId);
        if (!user) return res.render('my-order', {
            user: req.session.user || null,
            order: null,
            status: { error: '❌ User not found' },
            orders: []
        });

        if (user.balance_usd < cost_usd) {
            return res.render('my-order', {
                user: req.session.user || null,
                order: null,
                status: { error: '❌ Insufficient balance' },
                orders: []
            });
        }

        const formData = new URLSearchParams({
            key: API_KEY,
            action: 'add',
            service,
            link,
            quantity
        });

        const response = await axios.post(API_URL, formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!response.data || !response.data.order) {
            const apiError = response.data?.error || 'Order failed. Please try again.';
            return res.render('my-order', {
                user: req.session.user || null,
                order: null,
                status: { error: `❌ ${apiError}` },
                orders: []
            });
        }

        // await Order.create({
        //     user: user._id,
        //     service_id: service,
        //     order_id: response.data.order,
        //     api_order_id: response.data.order,
        //     service_name: dbService.name,
        //     link,
        //     quantity,
        //     charge: cost_usd,
        //     status: 'pending'
        // });
const api_price = (dbService.api_price / 1000) * quantity;
const profit = cost_usd - api_price;

await Order.create({
    user: user._id,
    service_id: service,
    order_id: response.data.order,
    api_order_id: response.data.order,
    service_name: dbService.name,
    link,
    quantity,
    charge: cost_usd,
    api_price,
    profit,
    status: 'pending'
});

        // Update balance
        user.balance_usd -= cost_usd;
        const exchangeRate = 1553;
        user.balance = Math.round(user.balance_usd * exchangeRate);
        user.totalSpent += cost_usd;
        await user.save();

        res.render('my-order', {
            user: req.session.user || null,
            order: {
                order: response.data.order,
                link
            },
            status: {},
            orders: []
        });

    } catch (error) {
        console.error('❌ Error placing order:', error.message);
        return res.render('my-order', {
            user: req.session.user || null,
            order: null,
            status: { error: '❌ Error placing order. Please try again.' },
            orders: []
        });
    }
});





// ✅ POST /status → check order status
// ✅ POST /status → check order status
router.post('/status', async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findOne({ order_id: orderId });

        // if order not found, show error (skip user check)
        if (!order) {
            return res.render('my-order', {
                user: req.session.user || null,
                order: {},
                status: { error: '❌ order not found.' },
                orders: []
            });
        }

        // ✅ always check live status from the API
        const formData = new URLSearchParams({
            key: API_KEY,
            action: 'status',
            order: orderId
        });

        const response = await axios.post(API_URL, formData.toString(), {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
        });

        // optional: update status in db
        if (response.data.status) {
            order.status = response.data.status.toLowerCase();
            await order.save();
        }

        // fetch user orders if user is logged in
        let userOrders = [];
        if (req.session.userId) {
            userOrders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 });
        }

        res.render('my-order', {
            user: req.session.user || null,
            order,
            status: response.data,
            orders: userOrders
        });

    } catch (error) {
        console.error('❌ error checking status:', error.message);
        res.render('my-order', {
            user: req.session.user || null,
            order: {},
            status: { error: '❌ error checking order status.' },
            orders: []
        });
    }
});



// ✅ GET /my-orders → load all orders
router.get('/my-orders', async (req, res) => {
    const userId = req.session.userId;

    try {
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.render('my-order', {
            order: {},
            status: {},
            orders
        });
    } catch (error) {
        console.error('❌ Error fetching orders:', error.message);
        res.render('my-order', {
            order: {},
            status: {},
            orders: []
        });
    }
});

module.exports = router;
