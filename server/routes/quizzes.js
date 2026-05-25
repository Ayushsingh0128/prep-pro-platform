// Path: server/routes/quizzes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Simple middleware to protect routes
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

// @route   GET /api/quizzes
// @desc    Get all available quizzes (List view)
router.get('/', protect, async (req, res) => {
    try {
        const quizzes = await Quiz.find().select('-questions.correctOption');
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
});

// @route   GET /api/quizzes/history
// @desc    Get user's quiz attempt history (last 20)
router.get('/history', protect, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('-questions'); // Don't send full question data in list view
        
        // Calculate aggregate stats
        const allAttempts = await QuizAttempt.find({ userId: req.user.id });
        const totalQuizzes = allAttempts.length;
        const avgScore = totalQuizzes > 0 
            ? Math.round(allAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalQuizzes) 
            : 0;
        const bestScore = totalQuizzes > 0 
            ? Math.round(Math.max(...allAttempts.map(a => a.percentage))) 
            : 0;
        
        // Count per-topic attempts
        const topicMap = {};
        allAttempts.forEach(a => {
            topicMap[a.topic] = (topicMap[a.topic] || 0) + 1;
        });

        res.json({
            attempts,
            stats: {
                totalQuizzes,
                avgScore,
                bestScore,
                topicBreakdown: topicMap
            }
        });
    } catch (err) {
        console.error("Quiz history error:", err);
        res.status(500).json({ message: 'Error fetching quiz history' });
    }
});

// @route   GET /api/quizzes/:id
// @desc    Get a specific quiz with questions
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching quiz' });
    }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz (Admin/Teacher functionality)
router.post('/', protect, async (req, res) => {
    try {
        const { title, category, questions } = req.body;
        const newQuiz = new Quiz({ title, category, questions });
        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch (err) {
        res.status(500).json({ message: 'Error creating quiz', error: err.message });
    }
});

// @route   POST /api/quizzes/save-attempt
// @desc    Save a completed quiz attempt
router.post('/save-attempt', protect, async (req, res) => {
    try {
        const { topic, difficulty, score, totalQuestions, percentage, timeTaken, questions } = req.body;
        
        const attempt = new QuizAttempt({
            userId: req.user.id,
            topic,
            difficulty,
            score,
            totalQuestions,
            percentage,
            timeTaken,
            questions
        });

        await attempt.save();
        res.status(201).json({ message: 'Quiz attempt saved', attemptId: attempt._id });
    } catch (err) {
        console.error("Save attempt error:", err);
        res.status(500).json({ message: 'Error saving quiz attempt' });
    }
});

// @route   GET /api/quizzes/attempt/:attemptId
// @desc    Get a specific quiz attempt (with full question data for review)
router.get('/attempt/:attemptId', protect, async (req, res) => {
    try {
        const attempt = await QuizAttempt.findOne({ 
            _id: req.params.attemptId, 
            userId: req.user.id 
        });
        if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
        res.json(attempt);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching attempt' });
    }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers and calculate score
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { answers } = req.body;
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        const results = quiz.questions.map((question, index) => {
            const isCorrect = question.correctOption === answers[index];
            if (isCorrect) score++;
            
            return {
                question: question.questionText,
                correctOption: question.correctOption,
                userChoice: answers[index],
                isCorrect
            };
        });

        res.json({
            score,
            totalQuestions: quiz.questions.length,
            percentage: ((score / quiz.questions.length) * 100).toFixed(2),
            results
        });
    } catch (err) {
        res.status(500).json({ message: 'Error processing quiz results' });
    }
});

module.exports = router;