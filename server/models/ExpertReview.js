// Path: server/models/ExpertReview.js
const mongoose = require('mongoose');

const ExpertReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    videoUrl: { type: String, required: true },
    aiScore: { type: Number, default: 0 },
    expertComments: { type: String, required: true },
    confidenceRating: { type: Number, min: 1, max: 5, required: true },
    communicationRating: { type: Number, min: 1, max: 5, required: true },
    bodyLanguageRating: { type: Number, min: 1, max: 5, required: true },
    cheatingFlag: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ExpertReview', ExpertReviewSchema);