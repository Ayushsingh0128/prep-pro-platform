/* Path: client/src/pages/ResetPasswordPage.jsx */
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Brain, Lock, CheckCircle } from 'lucide-react';
import '../Auth.css';


const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return alert("Passwords do not match.");
        }
        
        setLoading(true);
        try {
            await axios.post(`https://prep-pro-platform.onrender.com/api/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Reset failed. Token might be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-glass-card" style={{ textAlign: 'center' }}>
                    <div className="auth-logo" style={{ background: 'var(--color-success)', color: '#fff' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="auth-title">Success!</h2>
                    <p className="auth-subtitle">Your password has been reset. Redirecting to login...</p>
                    <Link to="/login" className="btn-auth-submit" style={{ display: 'block', textDecoration: 'none' }}>
                        Go to Login
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
                    <h2 className="auth-title">Reset Password</h2>
                    <p className="auth-subtitle">Enter your new secure password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-group">
                        <label className="auth-label">New Password</label>
                        <div className="auth-input-wrapper">
                            <Lock className="auth-input-icon" size={18} />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="auth-input" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Confirm New Password</label>
                        <div className="auth-input-wrapper">
                            <Lock className="auth-input-icon" size={18} />
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="auth-input" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
