# PrepPro - AI-Powered Career Prep Platform 🚀

![PrepPro Banner](https://prep-pro-platform.vercel.app/favicon.ico) <!-- You can replace this with an actual screenshot of your dashboard -->

**Live Demo:** [https://prep-pro-platform.vercel.app](https://prep-pro-platform.vercel.app)

PrepPro is a comprehensive, full-stack MERN application designed to help students and professionals prepare for their dream jobs. By integrating advanced Google Gemini AI, the platform offers real-time ATS resume scoring, dynamic mock interviews, and adaptive skill quizzes.

---

## ✨ Core Features

*   **🤖 AI Mock Interviews:** Conducts live, timed technical and behavioral interviews using your webcam and microphone. The AI analyzes your spoken transcript, filler word usage, and provides a detailed performance score.
*   **📄 ATS Resume Analyzer:** Upload your PDF resume and receive a brutal, realistic ATS score along with actionable feedback on missing keywords and formatting.
*   **📝 Smart Resume Builder:** A dedicated builder that lets you craft a professional, ATS-friendly resume from scratch and export it directly as a PDF.
*   **🧠 Adaptive Skill Quizzes:** Generates dynamic, multiple-choice technical quizzes based on your target role and difficulty level.
*   **🗺️ Career Roadmap & Progress Tracking:** Visualizes your growth and tracks your scores across interviews and quizzes in a beautifully designed, modern dashboard.
*   **🔐 Secure Authentication:** Full JWT-based authentication system alongside Google OAuth for quick, secure social logins.

---

## 🛠️ Technology Stack

**Frontend:**
*   React.js (v18)
*   React Router DOM
*   Vanilla CSS (Modern UI, Glassmorphism, CSS Modules)
*   Lucide React (Icons)
*   Google OAuth Provider

**Backend:**
*   Node.js & Express.js
*   MongoDB (Atlas) & Mongoose
*   Google Generative AI SDK (Gemini Flash Model)
*   JWT & bcryptjs (Security)
*   Multer & PDF-Parse (Resume file handling)

**Deployment:**
*   **Frontend:** Vercel
*   **Backend:** Render
*   **Database:** MongoDB Atlas

---

## 🚀 How to Run Locally

If you want to run this project on your local machine for development or testing:

### 1. Clone the repository
```bash
git clone https://github.com/Ayushsingh0128/prep-pro-platform.git
cd prep-pro-platform
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```
Start the backend server:
```bash
npm start
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd client
npm install
```
Start the React development server:
```bash
npm start
```

---

## 💡 Architecture & Smart Fallback System

This platform is built with production-grade resilience. The backend features an **AI Vault Fallback System**. If the Google Gemini AI API experiences high traffic, rate limits, or downtime, the backend automatically intercepts the error and serves high-quality, pre-cached questions from the MongoDB `AIVault` collection. This guarantees zero downtime and a seamless user experience.

---

*Built with ❤️ by Ayush Singh*
