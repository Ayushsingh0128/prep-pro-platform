/* Path: client/src/pages/ForgotPasswordPage.jsx */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Brain, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import '../Auth.css';


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('https://prep-pro-platform.onrender.com/api/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-container">
                <div className="auth-glass-card" style={{ textAlign: 'center' }}>
                    <div className="auth-logo" style={{ background: 'var(--color-success)', color: '#fff' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="auth-title">Link Sent!</h2>
                    <p className="auth-subtitle">
                        Please check your email (and the server console) for the password reset link.
                    </p>
                    <Link to="/login" className="btn-auth-submit" style={{ display: 'block', textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-glass-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Brain size={32} />
                    </div>
                    <h2 className="auth-title">Forgot Password?</h2>
                    <p className="auth-subtitle">No worries, it happens. Enter your email and we'll send you a link to reset it.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrapper">
                            <Mail className="auth-input-icon" size={18} />
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                className="auth-input" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    <Link to="/login" className="auth-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
