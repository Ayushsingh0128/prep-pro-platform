const mongoose = require('mongoose');

const AIVaultSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['quiz', 'interview_questions'],
        required: true
    },
    topic: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // The actual JSON from the AI
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create index for fast searching
AIVaultSchema.index({ type: 1, topic: 1, difficulty: 1 });

module.exports = mongoose.model('AIVault', AIVaultSchema);
