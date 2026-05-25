/* Path: client/src/pages/LandingPage.jsx */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  FileSearch, 
  Video, 
  ArrowRight, 
  Upload,
  Target,
  Sparkles,
  Award,
  Zap,
  Shield,
  BookOpen,
  Code,
  Database
} from 'lucide-react';
import '../LandingPage.css';

import heroImg from '../assets/ai_career_hero.png'; 


const LandingPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('token');
    const statsRef = useRef(null);

    const handleNavigation = (path) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="landing-container">

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content animate-fadeIn">
                    <div className="hero-badge">
                        <Sparkles size={14} style={{ marginRight: '6px' }} />
                        Powered by Google Gemini AI & MERN Stack
                    </div>
                    <h1 className="hero-title">Master Your Next Interview with AI</h1>
                    <p className="hero-description">
                        The all-in-one career platform that uses advanced Artificial Intelligence to build your resume, sharpen your skills with quizzes, and conduct realistic mock interviews.
                    </p>
                    <div className="hero-btns">
                        <button onClick={() => handleNavigation('/resume-analysis')} className="btn-hero-primary">
                            <FileSearch size={20} style={{ marginRight: '8px' }} /> Analyze Resume
                        </button>
                        <button onClick={() => handleNavigation('/interview')} className="btn-hero-secondary">
                            <Video size={20} style={{ marginRight: '8px' }} /> Start Mock Interview
                        </button>
                    </div>
                    <div className="hero-trust">
                        <div className="hero-tech-stack">
                            <div className="tech-badge" title="React"><Code size={14} /></div>
                            <div className="tech-badge" title="Node.js"><Zap size={14} /></div>
                            <div className="tech-badge" title="MongoDB"><Database size={14} /></div>
                            <div className="tech-badge" title="Gemini AI"><Sparkles size={14} /></div>
                        </div>
                        <span className="hero-trust-text">
                            Built with <strong>Production-Grade</strong> AI & MERN Stack
                        </span>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-image-container">
                        <img 
                            src={heroImg} 
                            alt="AI Career Coach Hero" 
                            className="hero-image" 
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop"
                            }}
                        />
                    </div>
                    <div className="hero-glow"></div>
                </div>
            </section>

            {/* Technical Stats Bar */}
            <section className="stats-bar" ref={statsRef}>
                <div className="stat-item">
                    <BookOpen size={22} className="stat-icon" />
                    <div className="stat-number">10+</div>
                    <div className="stat-label">Tech Topics</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <Brain size={22} className="stat-icon" />
                    <div className="stat-number">AI</div>
                    <div className="stat-label">Real-time Analysis</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <Shield size={22} className="stat-icon" />
                    <div className="stat-number">ATS</div>
                    <div className="stat-label">Scoring System</div>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                    <Zap size={22} className="stat-icon" />
                    <div className="stat-number">JWT</div>
                    <div className="stat-label">Secure Access</div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <span className="section-tag">Core Capabilities</span>
                <h2 className="section-title">Everything you need to get hired.</h2>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><FileSearch size={28} /></div>
                        <h3>AI Resume Analysis</h3>
                        <p>Our ATS-optimized scanner analyzes your resume against job descriptions and provides instant feedback to boost your score.</p>
                        <div className="feature-tag">ATS Score</div>
                    </div>

                    <div className="feature-card feature-card-highlight">
                        <div className="feature-popular">Key Feature</div>
                        <div className="feature-icon"><Brain size={28} /></div>
                        <h3>Smart Quizzes</h3>
                        <p>Adaptive technical quizzes generated specifically for your role. Practice coding, system design, and behavioral theory.</p>
                        <div className="feature-tag">AI-Powered</div>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon"><Video size={28} /></div>
                        <h3>Mock Interviews</h3>
                        <p>Realistic video interviews with real-time feedback on your speech patterns, confidence, and technical accuracy.</p>
                        <div className="feature-tag">Live Analysis</div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="how-it-works-section">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="section-tag">Simple & Powerful</span>
                    <h2 className="section-title">Get Interview-Ready in 3 Steps</h2>
                    <p className="section-subtitle">No complicated setups. Just sign up, practice, and land your dream job.</p>
                </div>

                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <div className="step-icon-wrap">
                            <Upload size={32} />
                        </div>
                        <h3>Upload & Analyze</h3>
                        <p>Upload your resume and get an instant ATS compatibility score with actionable improvement tips from our AI.</p>
                        <div className="step-connector" />
                    </div>

                    <div className="step-card">
                        <div className="step-number">02</div>
                        <div className="step-icon-wrap">
                            <Target size={32} />
                        </div>
                        <h3>Practice & Sharpen</h3>
                        <p>Take role-specific quizzes that adapt to your skill level. Build confidence with technical and behavioral questions.</p>
                        <div className="step-connector" />
                    </div>

                    <div className="step-card">
                        <div className="step-number">03</div>
                        <div className="step-icon-wrap">
                            <Award size={32} />
                        </div>
                        <h3>Interview & Succeed</h3>
                        <p>Record mock video interviews, get real-time AI feedback on body language, filler words, and technical depth.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-glow" />
                <div className="cta-content">
                    <Shield size={40} className="cta-icon" />
                    <h2 className="cta-title">Ready to Ace Your Next Interview?</h2>
                    <p className="cta-description">
                        Elevate your career preparation with our comprehensive, AI-driven assessment and resume analysis platform.
                    </p>
                    <button onClick={() => navigate('/signup')} className="btn-hero-primary" style={{ fontSize: '1.1rem', padding: '1.1rem 2.5rem' }}>
                        Create Your Free Account <Zap size={20} style={{ marginLeft: '8px' }} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="landing-logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Brain size={28} /> PrepPro AI
                </div>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Empowering the next generation of professionals with intelligence.</p>
                <div className="footer-links">
                    <span>&copy; 2026 PrepPro AI Platform</span>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact Us</a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
