// Path: server/routes/resumes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Resume = require('../models/Resume');

// --- Middleware to protect routes ---
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Adds user id to the request object
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// @route   POST /api/resumes
// @desc    Create a new resume for the logged-in user
router.post('/', protect, async (req, res) => {
    try {
        const { title, education, experience, skills, projects, rawData } = req.body;
        const newResume = new Resume({
            userId: req.user.id,
            title,
            education,
            experience,
            skills,
            projects,
            rawData
        });
        const savedResume = await newResume.save();
        res.status(201).json(savedResume);
    } catch (err) {
        res.status(500).json({ message: 'Error creating resume', error: err.message });
    }
});

// @route   GET /api/resumes
// @desc    Get all resumes belonging to the logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user.id });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching resumes', error: err.message });
    }
});

// @route   GET /api/resumes/:id
// @desc    Get a specific resume by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching resume', error: err.message });
    }
});

// @route   PUT /api/resumes/:id
// @desc    Update a resume
router.put('/:id', protect, async (req, res) => {
    try {
        const updatedResume = await Resume.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true } // Returns the modified document
        );
        if (!updatedResume) return res.status(404).json({ message: 'Resume not found or unauthorized' });
        res.json(updatedResume);
    } catch (err) {
        res.status(500).json({ message: 'Error updating resume', error: err.message });
    }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume
router.delete('/:id', protect, async (req, res) => {
    try {
        const deletedResume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedResume) return res.status(404).json({ message: 'Resume not found or unauthorized' });
        res.json({ message: 'Resume deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting resume', error: err.message });
    }
});

module.exports = router;