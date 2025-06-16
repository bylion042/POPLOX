const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Submit new review
router.post('/submit-review', async (req, res) => {
  try {
    const { name, email, title, review, rating } = req.body;

    const newReview = new Review({ name, email, title, review, rating });
    await newReview.save();

    res.json({ success: true, message: "Review submitted successfully" });
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Display all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.render('reviews', { reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).send("Error loading reviews.");
  }
});

module.exports = router;
