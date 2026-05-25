// Path: server/models/Quiz.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String], // Array of 4 strings (A, B, C, D)
        validate: [v => v.length === 4, 'Each question must have exactly 4 options']
    },
    correctOption: {
        type: Number, // Index (0 for A, 1 for B, 2 for C, 3 for D)
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
});

const QuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a quiz title']
    },
    category: {
        type: String,
        required: [true, 'Please add a category (e.g., DSA, HR, System Design)']
    },
    questions: [QuestionSchema] // Array of nested question objects
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);