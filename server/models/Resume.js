// Path: server/models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title for this resume']
    },
    education: [{
        degree: String,
        institute: String,
        year: String
    }],
    experience: [{
        role: String,
        company: String,
        duration: String,
        description: String
    }],
    skills: [String],
    projects: [{
        title: String,
        description: String,
        tech: [String]
    }],
    rawData: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', ResumeSchema);