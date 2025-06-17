const express = require('express');
const router = express.Router();
const axios = require('axios');
const Service = require('../models/Service');

const API_URL = process.env.SMMYZ_API_URL;
const API_KEY = process.env.SMMYZ_API_KEY;

// Helper to normalize average_time
function normalizeAvgTime(time) {
  if (
    !time ||
    time === '0' ||
    time.toLowerCase() === 'n/a' ||
    time.toLowerCase() === 'null' ||
    time.trim() === '' ||
    time.toLowerCase() === 'instant'
  ) {
    return '3–4 hours';
  }
  return time;
}

// Render static services page
router.get('/', (req, res) => {
  res.render('services');
});

// Return grouped services in JSON
router.get('/json', async (req, res) => {
  try {
    const formData = new URLSearchParams({
      key: API_KEY,
      action: 'services',
    });

    const response = await axios.post(API_URL, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    console.log('🔥 API Response Sample:', response.data[0]);

    const services = response.data;
    const servicesByCategory = {};

    services.forEach((service) => {
      const category = service.category || 'Uncategorized';
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }

      servicesByCategory[category].push({
        ...service,
        average_time: normalizeAvgTime(service.average_time),
      });
    });

    res.json(servicesByCategory);
  } catch (error) {
    console.error('Error fetching services:', error.message);
    res.status(500).json({});
  }
});

// 🔁 Sync API services to database
router.get('/sync', async (req, res) => {
  try {
    const formData = new URLSearchParams({
      key: API_KEY,
      action: 'services',
    });

    const response = await axios.post(API_URL, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    console.log('🔥 API Response Sample:', response.data[0]);

    const services = response.data;
    let savedCount = 0;

    for (const s of services) {
      await Service.findOneAndUpdate(
        { service_id: s.service },
        {
          service_id: s.service,
          name: s.name,
          category: s.category || 'Uncategorized',
          api_price: s.rate,
          my_price: s.rate * 2,
          min: s.min,
          max: s.max,
          average_time: normalizeAvgTime(s.average_time),
        },
        { upsert: true }
      );
      savedCount++;
    }

    console.log(`✅ Synced ${savedCount} services`);
    res.send(`✅ Synced ${savedCount} services to DB`);
  } catch (error) {
    console.error('❌ Failed to sync services:', error.message);
    res.status(500).send('❌ Failed to sync services');
  }
});

// 🔄 Show new services that are not yet in your DB
router.get('/admin/new-update', async (req, res) => {
  try {
    require('dotenv').config();

    const response = await axios.post(process.env.SMMYZ_API_URL, {
      key: process.env.SMMYZ_API_KEY,
      action: 'services',
    });

    const apiServices = response.data;
    const existingServiceIds = await Service.find().distinct('service_id');
    const newServices = apiServices.filter(
      (svc) => !existingServiceIds.includes(svc.service)
    );

    res.render('new-update', { newServices });
  } catch (err) {
    console.error('Failed to fetch services:', err.response?.data || err.message);
    res.status(500).send('Failed to load new services.');
  }
});

module.exports = router;
