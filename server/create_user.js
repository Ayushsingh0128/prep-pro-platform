const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAccount = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'test@example.com';
        const password = 'password123';
        
        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`Account ${email} already exists!`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({
                name: 'Test User',
                email,
                password: hashedPassword
            });
            await user.save();
            console.log('Account created successfully.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAccount();
