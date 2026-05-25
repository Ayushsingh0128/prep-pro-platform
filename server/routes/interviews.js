// Path: server/routes/interviews.js
const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '..', 'uploads', 'interviews');
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${req.user.id}_${Date.now()}.webm`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max for video
    fileFilter: (req, file, cb) => {
        // Accept video files
        if (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    }
});

// @route   POST /api/interviews/upload-recording
// @desc    Upload interview video recording
// @access  Private
router.post('/upload-recording', auth, upload.single('recording'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }
        // Return the relative path for storage in DB
        const recordingPath = `/uploads/interviews/${req.file.filename}`;
        res.json({ 
            success: true, 
            recordingPath,
            message: 'Recording uploaded successfully' 
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: 'Failed to upload recording' });
    }
});

// @route   POST /api/interviews/save
// @desc    Save interview with all data (metrics, questions, recording, AI feedback)
// @access  Private
router.post('/save', auth, async (req, res) => {
    try {
        const { 
            role, difficulty, transcript, fillerCount, 
            gazeScore, overallScore, questions, 
            recordingPath, aiFeedback, duration 
        } = req.body;

        const newInterview = new Interview({
            userId: req.user.id,
            role: role || 'Frontend Developer',
            difficulty: difficulty || 'medium',
            transcript,
            fillerCount,
            gazeScore,
            overallScore,
            questions: questions || [],
            recordingPath: recordingPath || '',
            aiFeedback: aiFeedback || '',
            duration: duration || 0
        });

        const savedInterview = await newInterview.save();
        
        res.status(201).json({
            success: true,
            message: "Interview data saved successfully!",
            data: savedInterview
        });
    } catch (err) {
        console.error("Save Interview Error:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: Could not save interview data" 
        });
    }
});

// @route   GET /api/interviews
// @desc    Get all interviews for the logged-in user (for Dashboard)
router.get('/', auth, async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(interviews);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/interviews/:id
// @desc    Get a specific interview (for Review page)
router.get('/:id', auth, async (req, res) => {
    try {
        const interview = await Interview.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        res.json(interview);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching interview' });
    }
});

module.exports = router;