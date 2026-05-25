const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = "mongodb+srv://singhayush282005_db_user:Ayush123@cluster0.mkeow2x.mongodb.net/";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function findAryan() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB!');

        // Find ALL users and show their names and emails
        const users = await User.find({}, { name: 1, email: 1, createdAt: 1, _id: 1 });
        
        console.log('\n===== ALL ACCOUNTS IN DATABASE =====');
        users.forEach((u, i) => {
            console.log(`\n[${i+1}] Name: ${u.name}`);
            console.log(`     Email: ${u.email}`);
            console.log(`     Created: ${u.createdAt}`);
            console.log(`     ID: ${u._id}`);
        });

        // Specifically search for aryan
        const aryan = await User.find({ name: { $regex: /aryan/i } }, { name: 1, email: 1 });
        console.log('\n===== ACCOUNTS WITH NAME "ARYAN" =====');
        if (aryan.length === 0) {
            console.log('No account found with name Aryan');
        } else {
            aryan.forEach(u => {
                console.log(`Name: ${u.name} | Email: ${u.email}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

findAryan();
