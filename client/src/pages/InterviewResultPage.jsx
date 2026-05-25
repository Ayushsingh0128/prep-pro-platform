import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Trophy, Target, Mic, Eye, Clock, CheckCircle2,
    ArrowLeft, RefreshCcw, Star, TrendingUp, MessageSquare,
    Lightbulb, AlertCircle, Video
} from 'lucide-react';

const InterviewResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { role, duration, fillerCount, gazeScore, recordingPath, aiAnalysis, color } = location.state || {};

    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        if (!role) { navigate('/interview'); return; }
        const target = aiAnalysis?.overallScore || 50;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            setAnimatedScore(current);
        }, 30);
        return () => clearInterval(interval);
    }, [aiAnalysis, role, navigate]);

    if (!role) return null;

    const overallScore = aiAnalysis?.overallScore || 50;
    const circumference = 2 * Math.PI * 72;
    const dashOffset = circumference - (animatedScore / 100) * circumference;

    const getScoreColor = (s) => {
        if (s >= 80) return '#10b981';
        if (s >= 60) return '#22c55e';
        if (s >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const scoreColor = getScoreColor(overallScore);

    const scores = [
        { label: 'Communication', score: aiAnalysis?.communicationScore || 0, icon: MessageSquare, color: '#818cf8' },
        { label: 'Technical', score: aiAnalysis?.technicalScore || 0, icon: TrendingUp, color: '#06b6d4' },
        { label: 'Confidence', score: aiAnalysis?.confidenceScore || 0, icon: Star, color: '#f59e0b' },
        { label: 'Eye Contact', score: aiAnalysis?.eyeContactScore || 0, icon: Eye, color: '#10b981' },
    ];

    const formatTime = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

    return (
        <div style={pageStyle}>
            <div style={contentWrapper}>
                {/* XP Badge */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={xpBadge}>
                        <Trophy size={14} color="#fbbf24" /> +50 XP Earned!
                    </div>
                </div>

                {/* Score Ring */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={ringWrapper}>
                        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                            <circle cx="90" cy="90" r="72" fill="none" stroke={scoreColor} strokeWidth="8"
                                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                        </svg>
                        <div style={ringInner}>
                            <span style={{ fontSize: '48px', fontWeight: '900', color: scoreColor }}>{animatedScore}</span>
                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>/ 100</span>
                        </div>
                    </div>
                    <h2 style={{ margin: '16px 0 4px', fontSize: '22px' }}>
                        {overallScore >= 80 ? 'Excellent Performance! 🏆' : overallScore >= 60 ? 'Good Job! 🎯' : overallScore >= 40 ? 'Room to Improve 💪' : 'Keep Practicing! 📚'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
                        {aiAnalysis?.summary || 'Your interview has been analyzed.'}
                    </p>
                </div>

                {/* Quick Stats */}
                <div style={quickRow}>
                    <div style={quickItem}><Target size={14} color={color} /> <span style={{ textTransform: 'capitalize' }}>{role}</span></div>
                    <div style={quickDivider} />
                    <div style={quickItem}><Clock size={14} color="#06b6d4" /> {formatTime(duration || 0)}</div>
                    <div style={quickDivider} />
                    <div style={quickItem}><Mic size={14} color={fillerCount > 10 ? '#ef4444' : '#818cf8'} /> {fillerCount} fillers</div>
                    <div style={quickDivider} />
                    <div style={quickItem}><Eye size={14} color="#10b981" /> {gazeScore}% gaze</div>
                </div>

                {/* Score Breakdown */}
                <div style={scoresGrid}>
                    {scores.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} style={scoreCard}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Icon size={16} color={s.color} />
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{s.label}</span>
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: '900', color: getScoreColor(s.score) }}>{s.score}</div>
                                <div style={scoreBar}>
                                    <div style={{ ...scoreBarFill, width: `${s.score}%`, background: s.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* AI Feedback Sections */}
                {aiAnalysis?.strengths && (
                    <div style={feedbackSection}>
                        <h3 style={feedbackTitle}><CheckCircle2 size={16} color="#10b981" /> Strengths</h3>
                        {aiAnalysis.strengths.map((s, i) => (
                            <div key={i} style={feedbackItem}>
                                <Star size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                )}

                {aiAnalysis?.improvements && (
                    <div style={feedbackSection}>
                        <h3 style={feedbackTitle}><AlertCircle size={16} color="#f59e0b" /> Areas to Improve</h3>
                        {aiAnalysis.improvements.map((s, i) => (
                            <div key={i} style={feedbackItem}>
                                <Target size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                )}

                {aiAnalysis?.tips && (
                    <div style={feedbackSection}>
                        <h3 style={feedbackTitle}><Lightbulb size={16} color="#818cf8" /> Pro Tips</h3>
                        {aiAnalysis.tips.map((s, i) => (
                            <div key={i} style={feedbackItem}>
                                <Lightbulb size={14} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div style={actionRow}>
                    <button style={primaryBtn} onClick={() => navigate('/interview')}>
                        <RefreshCcw size={16} /> Try Again
                    </button>
                    {recordingPath && (
                        <button style={secondaryBtn} onClick={() => navigate('/dashboard')}>
                            <Video size={16} /> Dashboard
                        </button>
                    )}
                    <button style={ghostBtn} onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============ STYLES ============
const pageStyle = { minHeight: '100vh', background: '#0c0f1a', color: '#f8fafc', padding: '40px 20px 80px' };
const contentWrapper = { maxWidth: '760px', margin: '0 auto' };
const xpBadge = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid rgba(251,191,36,0.15)' };

const ringWrapper = { position: 'relative', width: '180px', height: '180px', margin: '0 auto' };
const ringInner = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };

const quickRow = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '14px 24px', background: 'rgba(15,23,42,0.5)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '28px', flexWrap: 'wrap' };
const quickItem = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' };
const quickDivider = { width: '1px', height: '20px', background: 'rgba(255,255,255,0.06)' };

const scoresGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '32px' };
const scoreCard = { padding: '18px', background: 'rgba(15,23,42,0.4)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.04)' };
const scoreBar = { height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', marginTop: '8px', overflow: 'hidden' };
const scoreBarFill = { height: '100%', borderRadius: '4px', transition: 'width 1.5s ease' };

const feedbackSection = { background: 'rgba(15,23,42,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', padding: '24px', marginBottom: '16px' };
const feedbackTitle = { fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', margin: '0 0 16px 0' };
const feedbackItem = { display: 'flex', gap: '10px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '10px' };

const actionRow = { display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'center', flexWrap: 'wrap' };
const primaryBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };
const secondaryBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };
const ghostBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };

export default InterviewResultPage;
