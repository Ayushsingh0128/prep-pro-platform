// Path: server/models/Interview.js
const mongoose = require('mongoose');

const QuestionTimestampSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    timestampStart: { type: Number, default: 0 }, // seconds from recording start
    timestampEnd: { type: Number, default: 0 },
    answerTranscript: { type: String, default: "" }
}, { _id: false });

const InterviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    role: {
        type: String,
        default: 'Frontend Developer'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    transcript: { 
        type: String,
        default: ""
    },
    fillerCount: { 
        type: Number, 
        default: 0 
    },
    gazeScore: { 
        type: Number,
        default: 0 // 0-100 percentage
    },
    overallScore: { 
        type: Number,
        default: 0
    },
    questions: [QuestionTimestampSchema],
    recordingPath: {
        type: String,
        default: ""
    },
    aiFeedback: {
        type: String,
        default: ""
    },
    duration: {
        type: Number, // total interview duration in seconds
        default: 0
    },
    status: { 
        type: String, 
        enum: ['completed', 'pending', 'reviewed'],
        default: 'completed' 
    }
}, { 
    timestamps: true
});

module.exports = mongoose.model('Interview', InterviewSchema);