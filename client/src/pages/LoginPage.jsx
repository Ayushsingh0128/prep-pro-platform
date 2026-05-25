/* Path: client/src/pages/LoginPage.jsx */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Brain, Mail, Lock, LogIn, Github } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import '../Auth.css';


const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('https://prep-pro-platform.onrender.com/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Social Login Implementation
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // The frontend lib usually returns an access_token or code. 
                // We'll send it to our backend to verify and get a JWT.
                const res = await axios.post('https://prep-pro-platform.onrender.com/api/auth/google-login', { 
                    token: tokenResponse.access_token 
                });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/dashboard');
            } catch (err) {
                console.error("Google Login Error:", err);
                alert("Google Login failed. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => alert("Google Login Failed"),
    });

    const handleFacebookLogin = () => {
        alert("Facebook Login initialization... You need to set up Facebook App ID in the .env file locally.");
    };

    return (
        <div className="auth-container">
            <div className="auth-glass-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Brain size={32} />
                    </div>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Login to continue your career journey.</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrapper">
                            <Mail className="auth-input-icon" size={18} />
                            <input 
                                name="email"
                                type="email" 
                                placeholder="name@company.com" 
                                className="auth-input" 
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                            <Lock className="auth-input-icon" size={18} />
                            <input 
                                name="password"
                                type="password" 
                                placeholder="••••••••" 
                                className="auth-input" 
                                value={password}
                                onChange={onChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-links">
                        <Link to="/forgot-password" size={18} className="auth-forgot-link">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider">Or continue with</div>

                <div className="social-grid">
                    <button onClick={() => handleGoogleLogin()} className="btn-social" type="button" disabled={loading}>
                        <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                    </button>
                    <button onClick={handleFacebookLogin} className="btn-social">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                    </button>
                </div>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-footer-link">Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;