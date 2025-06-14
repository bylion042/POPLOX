const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const passport = require('passport');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });

        await newUser.save();
        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}));
