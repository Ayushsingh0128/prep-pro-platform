const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth'); 
const crypto = require('crypto'); // For reset tokens
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// ---------------------------------------------------------
// 1. SIGNUP ROUTE - Create New Account
// ---------------------------------------------------------
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists. Try Login!' });
        }

        // Create new user instance
        user = new User({ name, email, password });

        // Hash the password (Security)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save to Database
        await user.save();

        // Generate JWT Token so user is logged in immediately after signup
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).send('Server Error during Signup');
    }
});

// ---------------------------------------------------------
// 2. LOGIN ROUTE - Sign In Existing User
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists (explicitly select password since it has 'select: false' in model)
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'User not found. Please Signup!' });
        }

        // 2. Compare Password with Hashed Password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials (Wrong Password)' });
        }

        // 3. Create & Return JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send('Server Error during Login');
    }
});

// ---------------------------------------------------------
// 4. FORGOT PASSWORD - Generate Token
// ---------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user with that email found." });
        }

        // Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and set to user field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        // In a real app, send actual email here. For now, log to console:
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        console.log(`\n🔑 PASSWORD RESET LINK: ${resetUrl}\n`);

        res.json({ message: "Reset link sent to email (check server console for link)." });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during forgot password');
    }
});

// ---------------------------------------------------------
// 5. RESET PASSWORD - Update DB
// ---------------------------------------------------------
router.post('/reset-password/:token', async (req, res) => {
    try {
        // Hash URL token to match DB
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: "Password reset successful! You can now login." });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during reset password');
    }
});

// ---------------------------------------------------------
// 6. GOOGLE LOGIN - Social Auth
// ---------------------------------------------------------
router.post('/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        let email, name, picture, googleId;

        try {
            // Try verifying as ID token (signed JWT)
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            googleId = payload.sub;
        } catch (verificationError) {
            // Fallback: Verify as Google OAuth2 Access Token
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Invalid Google Token (failed ID token verification and Access Token fetch)');
            }
            const payload = await response.json();
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            googleId = payload.sub;
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            // Generate a random password since it's a social login
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                name,
                email,
                password: hashedPassword,
                googleId // You might want to add this field to your User model
            });
            await user.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token: jwtToken,
            user: { id: user._id, name: user.name, email: user.email, profilePic: picture }
        });

    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(401).json({ message: "Invalid Google Token" });
    }
});


module.exports = router;