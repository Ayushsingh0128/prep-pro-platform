// Path: server/models/QuizAttempt.js
const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    },
    questions: [{
        questionText: String,
        options: [String],
        correctOption: Number,
        userAnswer: Number, // -1 means skipped/timed out
        isCorrect: Boolean,
        explanation: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
