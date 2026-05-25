// Path: server/models/Activity.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now // Records exactly when the action happened
    },
    type: {
        type: String,
        enum: ['quiz', 'interview', 'resume_edit'],
        required: [true, 'Activity type is required']
    },
    points: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

// Indexing the date and userId makes fetching the "Last 7 Days" stats much faster
ActivitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);