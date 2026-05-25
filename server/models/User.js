// Path: server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [false, 'Password is not required for Social Login'],
        minlength: 6,
        select: false 
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values for non-Google users
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);