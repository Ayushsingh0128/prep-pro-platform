const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const count = await User.countDocuments();
        console.log(`Total users in DB: ${count}`);
        const users = await User.find({}, 'name email').limit(5);
        console.log('Sample users:', users);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
