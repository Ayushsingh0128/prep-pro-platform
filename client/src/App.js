import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Global Components
import Navbar from './components/Navbar';

// Import Layouts
import DashboardLayout from './components/DashboardLayout';

// Import Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';

import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage'; // NEW
import RoadmapPage from './pages/RoadmapPage'; // NEW
import InterviewPage from './pages/InterviewPage';
import InterviewResultPage from './pages/InterviewResultPage';
import InterviewReviewPage from './pages/InterviewReviewPage';
import InterviewsListPage from './pages/InterviewsListPage';
import ExpertReviewsPage from './pages/ExpertReviewsPage';
import QuizzesPage from './pages/QuizzesPage';
import TakeQuizPage from './pages/TakeQuizPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizReviewPage from './pages/QuizReviewPage';
import ResumesPage from './pages/ResumesPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Private Route logic to keep unauthorized people out
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route logic - redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

// Wrapper for Public Pages (with Navbar)
const PublicLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-main-container" style={{ minHeight: '100vh' }}>
        <Routes>
          {/* Public Routes - Wrapped in Navbar */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><PublicRoute><LoginPage /></PublicRoute></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><PublicRoute><SignupPage /></PublicRoute></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
          <Route path="/reset-password/:token" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />

          {/* Protected Routes - Wrapped in DashboardLayout (Sidebar) */}
          <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/interviews" element={<InterviewsListPage />} />
            <Route path="/interview/result" element={<InterviewResultPage />} />
            <Route path="/interview/review/:id" element={<InterviewReviewPage />} />
            <Route path="/review/:id" element={<ExpertReviewsPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quiz/take" element={<TakeQuizPage />} />
            <Route path="/quiz/result" element={<QuizResultPage />} />
            <Route path="/quiz/review/:attemptId" element={<QuizReviewPage />} />
            <Route path="/resumes" element={<ResumesPage />} />
            <Route path="/resume-builder" element={<ResumeBuilderPage />} />
            <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
          </Route>

          {/* Catch-all: Send unknown paths back to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;