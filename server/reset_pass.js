const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = "mongodb+srv://singhayush282005_db_user:Ayush123@cluster0.mkeow2x.mongodb.net/";

const UserSchema = new mongoose.Schema({ name: String, email: String, password: String }, { strict: false });
const User = mongoose.model('User', UserSchema);

async function resetPassword() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB!');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Ayush@123', salt);

        const result = await User.updateOne(
            { email: 'test@gmail.com' },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 1) {
            console.log('✅ Password updated successfully for test@gmail.com!');
        } else {
            console.log('❌ No account found or nothing changed.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

resetPassword();
