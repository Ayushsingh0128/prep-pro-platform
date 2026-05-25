const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require("dns");
const path = require('path');

// Load ENV variables first!
dotenv.config();

// 1. IMPORT ALL ROUTES
const authRoutes = require('./routes/auth');       // Login/Signup Logic
const aiRoutes = require('./routes/ai');           // <--- YEH HAI AI VALA PART (ATS Scan & Analysis)
const interviewRoutes = require('./routes/interviews'); // Interview Data
const quizRoutes = require('./routes/quizzes');     // Quiz Logic
const resumeRoutes = require('./routes/resumes');   // Resume Saving Logic
const activityRoutes = require('./routes/activities'); // Activity/Streak Tracking

// DNS setting for MongoDB Atlas stability
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// 2. MIDDLEWARE
app.use(express.json({ limit: '50mb' })); // Large limit for transcripts
app.use(cors());         // To allow frontend-backend communication

// Serve uploaded files (interview recordings)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. REGISTER ALL ROUTES (The "Bridge" between Frontend & Backend)
app.use('/api/auth', authRoutes);       // For: /api/auth/login, /api/auth/signup
app.use('/api/ai', aiRoutes);           // For: /api/ai/ats-scan, /api/ai/analyze
app.use('/api/interviews', interviewRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/activities', activityRoutes);

const seedVaultIfNeeded = require('./utils/vaultSeeder');

// 4. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected Successfully');
        await seedVaultIfNeeded(); // Seed default AI content if vault is empty
    })
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
    console.log(`🧠 AI Routes active at /api/ai`);
});