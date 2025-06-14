require('dotenv').config();
const express = require("express");
const router = express.Router();
const axios = require('axios');
const PalmPayRequest = require("../models/Palmpay");
const User = require("../models/User");
const Service = require('../models/Service');
const Order = require('../models/Order');

const API_KEY = process.env.SMMYZ_API_KEY;
const API_URL = process.env.SMMYZ_API_URL;

// GET: Admin Panel - View pending PalmPay submissions
router.get("/", async (req, res) => {
  try {
    const requests = await PalmPayRequest.find({ status: "pending" })
      .sort({ created_at: -1 })
      .populate("user_id", "username email");

    res.render("admin", {
      requests,
      services: [],
      orders: []
    });
  } catch (err) {
    console.error("Error loading admin panel:", err);
    res.status(500).send("Error loading admin panel");
  }
});


// POST: Admin approves or rejects a PalmPay submission
router.post("/palmpay/verify", async (req, res) => {
  const { request_id, action } = req.body;

  try {
    const request = await PalmPayRequest.findById(request_id);
    if (!request) return res.status(404).send("Payment request not found.");

    if (request.status !== "pending") return res.status(400).send("Request already processed.");

    if (action === "approve") {
      await User.findByIdAndUpdate(request.user_id, {
        $inc: { balance: parseFloat(request.amount) }
      });
      request.status = "approved";
    } else if (action === "reject") {
      request.status = "rejected";
    } else {
      return res.status(400).send("Invalid action.");
    }

    await request.save();
    res.redirect("/admin");
  } catch (err) {
    console.error("Error verifying PalmPay request:", err);
    res.status(500).send("Something went wrong.");
  }
});

// FETCH SERVICES AND SAVE IN THE DATABASE 
router.get('/fetch-services', async (req, res) => {
  try {
    const formData = new URLSearchParams({ key: API_KEY, action: 'services' });

    const response = await axios.post(API_URL, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const services = response.data;
    let updates = 0;

    for (const s of services) {
      const existing = await Service.findOne({ service_id: s.service });

      if (existing) {
        existing.api_price = s.rate;
        existing.name = s.name;
        existing.category = s.category;
        existing.min = s.min;
        existing.max = s.max;
        existing.type = s.type;
        existing.updatedAt = new Date();
        await existing.save();
        updates++;
      } else {
        await Service.create({
          service_id: s.service,
          name: s.name,
          category: s.category,
          api_price: s.rate,
          my_price: s.rate,
          min: s.min,
          max: s.max,
          type: s.type
        });
        updates++;
      }
    }

    res.send(`✅ Synced ${updates} services.`);
  } catch (err) {
    console.error('Fetch service error:', err.message);
    res.status(500).send('Error fetching services');
  }
});

// Admin Services Page
router.get("/services", async (req, res) => {
  try {
    const services = await Service.find().sort({ category: 1 });

    res.render("admin", {
      services,
      requests: [],
      orders: []
    });
  } catch (err) {
    console.error("Error loading services:", err);
    res.status(500).send("Error loading services");
  }
});



// Update service price
router.post('/services/update/:id', async (req, res) => {
  try {
    const { my_price } = req.body;
    await Service.findByIdAndUpdate(req.params.id, { my_price });
    res.redirect('/admin/services');
  } catch (err) {
    console.error('Error updating price:', err.message);
    res.status(500).send('Failed to update service price');
  }
});



// Orders Page
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.render("admin", {
      services: [],
      requests: [],
      orders
    });
  } catch (err) {
    console.error("Error loading orders:", err);
    res.status(500).send("Error loading orders");
  }
});


// Delete an order by ID
router.delete('/delete-order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Order.deleteOne({ order_id: id });

    if (result.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete ALL orders
router.delete('/delete-all-orders', async (req, res) => {
  try {
    const result = await Order.deleteMany({}); // deletes all documents
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});



module.exports = router;
