// Path: server/routes/activities.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Activity = require('../models/Activity');

// --- Auth Middleware ---
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized' });
        }
    }
    if (!token) return res.status(401).json({ message: 'No token' });
};

// @route   POST /api/activities
// @desc    Add a new activity (Called after quiz, interview, or resume edit)
router.post('/', protect, async (req, res) => {
    try {
        const { type, points } = req.body;
        const newActivity = new Activity({
            userId: req.user.id,
            type,
            points
        });
        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        res.status(500).json({ message: 'Error logging activity' });
    }
});

// @route   GET /api/activities/stats
// @desc    Get weekly stats (last 7 days total points and active days)
router.get('/stats', protect, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activities = await Activity.find({
            userId: req.user.id,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: 1 });

        // Calculate total points
        const totalPoints = activities.reduce((sum, act) => sum + act.points, 0);

        // Calculate unique days active in the last week
        const activeDays = new Set(activities.map(act => 
            new Date(act.date).toDateString()
        )).size;

        res.json({
            totalPoints,
            activeDays,
            history: activities // Sending full history for the frontend chart
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;