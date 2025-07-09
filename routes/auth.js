const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// ------------------ TWITTER AUTH ------------------
const twitterClient = require('../config/twitter'); // adjust if needed

// ✅ NEW: Country detect middleware
const detectCountry = require('../middleware/detectCountry');

// Middleware for session-based authentication
const authenticateUser = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next();
};

// ------------------ REGISTER ------------------
router.post('/register', detectCountry, async (req, res) => {
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

        // ✅ Set currency based on detected country
        let currency = 'USD';
        if (req.userCountry && req.userCountry.toLowerCase() === 'nigeria') {
            currency = 'NGN';
        }

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            termsAccepted: true,
            currency
        });

        await newUser.save();

        req.session.user = newUser;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// ------------------ LOGIN ------------------
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

        if (!password || !user.password) {
            return res.render('login', {
                message: 'Invalid login method. Try resetting password or use Google login.',
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

// ------------------ GOOGLE AUTH ------------------
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// ✅ Google callback + detect country
router.get('/google/callback', detectCountry, passport.authenticate('google', {
    failureRedirect: '/login'
}), async (req, res) => {
    try {
        let user = req.user;

        // If user is new, set currency
        if (user && !user.currency) {
            let currency = 'USD';
            if (req.userCountry && req.userCountry.toLowerCase() === 'nigeria') {
                currency = 'NGN';
            }
            user.currency = currency;
            await user.save();
        }

        req.session.user = user;
        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
});

// ------------------ TWITTER AUTH ------------------
// Step 1: Start OAuth flow
router.get('/twitter', async (req, res) => {
    try {
        const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
            process.env.TWITTER_CALLBACK_URL,
            { scope: ['tweet.read', 'users.read', 'offline.access'] }
        );

        req.session.codeVerifier = codeVerifier;
        req.session.state = state;

        return res.redirect(url);
    } catch (error) {
        console.error('Error starting Twitter login:', error);
        res.send('Error connecting to Twitter!');
    }
});

// Step 2: Handle Twitter callback + detect country
router.get('/twitter/callback', detectCountry, async (req, res) => {
    const { state, code } = req.query;

    if (!state || !code || state !== req.session.state) {
        return res.status(400).send('Invalid state or code.');
    }

    try {
        const {
            client: loggedClient,
            accessToken,
            refreshToken
        } = await twitterClient.loginWithOAuth2({
            code,
            codeVerifier: req.session.codeVerifier,
            redirectUri: process.env.TWITTER_CALLBACK_URL,
        });

        const userData = await loggedClient.v2.me({
            "user.fields": ["profile_image_url", "name", "username"]
        });

        const twitter_id = userData.data.id;
        const username = userData.data.username || 'TwitterUser';
        const name = userData.data.name || 'Twitter User';
        const profile_image_url = userData.data.profile_image_url || null;
        const fakeEmail = `${twitter_id}@twitter.com`;

        let user = await User.findOne({ twitter_id });

        if (!user) {
            let currency = 'USD';
            if (req.userCountry && req.userCountry.toLowerCase() === 'nigeria') {
                currency = 'NGN';
            }

            user = new User({
                twitter_id,
                username,
                name,
                profile_image_url,
                accessToken,
                refreshToken,
                email: fakeEmail,
                termsAccepted: true,
                currency
            });
        } else {
            user.username = username;
            user.name = name;
            user.profile_image_url = profile_image_url;
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.email = fakeEmail;
        }

        await user.save();

        req.session.userId = user._id;
        req.session.user = user;

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error handling Twitter callback:', error);
        res.send('Twitter login failed!');
    }
});

// ------------------ UPDATE PROFILE ------------------
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

// ------------------ LOGOUT ------------------
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});

module.exports = router;
