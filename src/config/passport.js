require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { v4:uuidv4 } = require('uuid');
const User = require('../modules/auth/auth.model');
const logger = require('../utils/logger');

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            return done(null, user);
        }

        user = await User.create({
            name:       profile.displayName,
            email:      profile.emails[0].value,
            password:   uuidv4(),
            googleId:   profile.id,
            isVerified: true,
        })

        logger.info(`New user via Google: ${user.email}`);
        return done(null, user)
    } catch (error) {
        logger.error(`Google OAuth error: ${error.message}`);
        return done(error, null)
    }
})) 