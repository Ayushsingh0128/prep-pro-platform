// Path: server/routes/expert.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ExpertReview = require('../models/ExpertReview');
const Interview = require('../models/Interview');

// --- Auth Middleware (Standard Protection) ---
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

// @route   GET /api/expert/interviews
// @desc    Get all interviews that haven't been reviewed yet
router.get('/interviews', protect, async (req, res) => {
    try {
        const interviews = await Interview.find({ status: 'pending' })
            .populate('userId', 'name email')
            .populate('resumeId', 'title')
            .sort({ createdAt: 1 }); // Oldest first
        res.json(interviews);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching interviews for review' });
    }
});

// @route   POST /api/expert/review
// @desc    Submit professional feedback for a student's interview
router.post('/review', protect, async (req, res) => {
    try {
        const { 
            userId, resumeId, interviewId, videoUrl, 
            expertComments, confidenceRating, 
            communicationRating, bodyLanguageRating 
        } = req.body;

        const newReview = new ExpertReview({
            userId,
            resumeId,
            interviewId,
            videoUrl,
            expertComments,
            confidenceRating,
            communicationRating,
            bodyLanguageRating,
            aiScore: Math.floor(Math.random() * 30) + 70 // Mock AI score (70-100)
        });

        await newReview.save();

        // Mark the interview as finished so it disappears from the pending list
        await Interview.findByIdAndUpdate(interviewId, { status: 'reviewed' });

        res.status(201).json({ message: 'Review submitted successfully', review: newReview });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting review', error: err.message });
    }
});

// @route   GET /api/expert/user-reviews/:userId
// @desc    Get all reviews for a specific student to show on their profile
router.get('/user-reviews/:userId', protect, async (req, res) => {
    try {
        const reviews = await ExpertReview.find({ userId: req.params.userId })
            .populate('interviewId')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user reviews' });
    }
});

module.exports = router;