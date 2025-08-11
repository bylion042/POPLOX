const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Middleware for session-based authentication
const authenticateUser = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
};

// Register Route
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword, phone, terms, agreedToTerms } = req.body;

    if (password !== confirmPassword) {
        return res.render('register', {
            message: 'Passwords do not match',
            messageType: 'error'
        });
    }

    if (!terms && !agreedToTerms) {
        return res.render('register', {
            message: 'You must accept the Terms and Conditions.',
            messageType: 'error'
        });
    }

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.render('register', {
                message: 'User already exists with this email.',
                messageType: 'error'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            termsAccepted: true
        });

        await newUser.save();

        req.session.user = newUser;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', {
                message: 'Invalid email or password',
                messageType: 'error'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', {
                message: 'Invalid email or password',
                messageType: 'error'
            });
        }

        req.session.userId = user._id;
        req.session.user = user;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// ✅ Google OAuth Route
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// ✅ Callback with env-based URL
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
}), (req, res) => {
    req.session.user = req.user;
    req.session.userId = req.user._id;
    res.redirect('/dashboard');
});

// Logout Route
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});

// Update Profile
router.post('/update-profile', authenticateUser, async (req, res) => {
    const { name, email, phone, newPassword } = req.body;
    const userId = req.session.user._id;

    try {
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.findByIdAndUpdate(userId, {
                name,
                email,
                phone,
                password: hashedPassword
            }, { new: true });
        } else {
            await User.findByIdAndUpdate(userId, {
                name,
                email,
                phone
            }, { new: true });
        }

        const updatedUser = await User.findById(userId);
        req.session.user = updatedUser;

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed', error });
    }
});

module.exports = router;
