import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Target, CheckCircle2, XCircle, MinusCircle,
    ChevronDown, ChevronUp, RefreshCcw, ArrowLeft, Sparkles, Zap,
    BrainCircuit, BarChart2, Clock, Star
} from 'lucide-react';

const QuizResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { topic, difficulty, totalQuestions, percentage, timeTaken, questions, color, attemptId } = location.state || {};
    
    const [expandedQ, setExpandedQ] = useState(null);
    const [animatedScore, setAnimatedScore] = useState(0);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!topic) {
            navigate('/quizzes');
            return;
        }
        // Animate score counter
        let current = 0;
        const target = percentage;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            setAnimatedScore(current);
        }, 30);

        // Show content with delay for animation
        setTimeout(() => setShowContent(true), 500);

        return () => clearInterval(interval);
    }, [percentage, topic, navigate]);

    if (!topic) return null;

    const correct = questions?.filter(q => q.isCorrect).length || 0;
    const wrong = questions?.filter(q => !q.isCorrect && q.userAnswer !== -1).length || 0;
    const skipped = questions?.filter(q => q.userAnswer === -1).length || 0;

    const getVerdict = () => {
        if (percentage >= 90) return { text: 'Outstanding! 🏆', desc: 'You absolutely crushed it. Expert-level knowledge!', color: '#10b981' };
        if (percentage >= 75) return { text: 'Great Job! 🎯', desc: 'Strong performance. Just a few areas to polish.', color: '#22c55e' };
        if (percentage >= 50) return { text: 'Not Bad! 💪', desc: 'Decent knowledge. Review the wrong answers to improve.', color: '#f59e0b' };
        if (percentage >= 25) return { text: 'Keep Trying! 📚', desc: 'Needs more practice. Focus on the fundamentals.', color: '#f97316' };
        return { text: 'Room to Grow! 🌱', desc: 'Don\'t worry, every expert was once a beginner.', color: '#ef4444' };
    };

    const verdict = getVerdict();

    // Score ring
    const circumference = 2 * Math.PI * 72;
    const dashOffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div style={pageContainer}>
            <div style={contentWrapper}>
                {/* ===== SCORE HERO ===== */}
                <section style={scoreHero}>
                    {/* XP Badge */}
                    <div style={xpBadge}>
                        <Zap size={14} color="#fbbf24" /> +25 XP Earned!
                    </div>

                    {/* Score Ring */}
                    <div style={scoreRingWrapper}>
                        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                            <circle 
                                cx="90" cy="90" r="72" fill="none" 
                                stroke={verdict.color} strokeWidth="8" 
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                        </svg>
                        <div style={scoreInner}>
                            <span style={{ fontSize: '48px', fontWeight: '900', color: verdict.color }}>{animatedScore}</span>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#64748b' }}>%</span>
                        </div>
                    </div>

                    <h2 style={{ margin: '20px 0 4px', fontSize: '24px', fontWeight: '800' }}>{verdict.text}</h2>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px', maxWidth: '400px', textAlign: 'center' }}>
                        {verdict.desc}
                    </p>

                    {/* Quick Stats Row */}
                    <div style={quickStatsRow}>
                        <div style={quickStat}>
                            <BrainCircuit size={16} color={color || '#818cf8'} />
                            <span style={{ fontWeight: '700', textTransform: 'capitalize' }}>{topic}</span>
                        </div>
                        <div style={quickStatDivider}></div>
                        <div style={quickStat}>
                            <Target size={16} color="#f59e0b" />
                            <span style={{ fontWeight: '700', textTransform: 'capitalize' }}>{difficulty}</span>
                        </div>
                        <div style={quickStatDivider}></div>
                        <div style={quickStat}>
                            <Clock size={16} color="#06b6d4" />
                            <span style={{ fontWeight: '700' }}>
                                {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                            </span>
                        </div>
                    </div>
                </section>

                {/* ===== BREAKDOWN CARDS ===== */}
                <div style={breakdownGrid}>
                    <div style={{ ...breakdownCard, borderLeft: '3px solid #10b981' }}>
                        <CheckCircle2 size={20} color="#10b981" />
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>{correct}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Correct</div>
                        </div>
                    </div>
                    <div style={{ ...breakdownCard, borderLeft: '3px solid #ef4444' }}>
                        <XCircle size={20} color="#ef4444" />
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#ef4444' }}>{wrong}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Wrong</div>
                        </div>
                    </div>
                    <div style={{ ...breakdownCard, borderLeft: '3px solid #64748b' }}>
                        <MinusCircle size={20} color="#64748b" />
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#94a3b8' }}>{skipped}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Skipped</div>
                        </div>
                    </div>
                </div>

                {/* ===== QUESTION REVIEW ===== */}
                {showContent && questions && (
                    <section style={{ marginTop: '40px' }}>
                        <h3 style={sectionTitle}>
                            <BarChart2 size={16} /> Question-by-Question Review
                        </h3>

                        <div style={reviewContainer}>
                            {questions.map((q, i) => {
                                const isExpanded = expandedQ === i;
                                const statusIcon = q.isCorrect 
                                    ? <CheckCircle2 size={18} color="#10b981" /> 
                                    : q.userAnswer === -1 
                                    ? <MinusCircle size={18} color="#64748b" />
                                    : <XCircle size={18} color="#ef4444" />;
                                
                                return (
                                    <div key={i} style={reviewItem}>
                                        {/* Question Row (always visible) */}
                                        <div 
                                            style={reviewHeader}
                                            onClick={() => setExpandedQ(isExpanded ? null : i)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                <div style={{
                                                    ...qNumber,
                                                    background: q.isCorrect ? 'rgba(16,185,129,0.1)' : q.userAnswer === -1 ? 'rgba(100,116,139,0.1)' : 'rgba(239,68,68,0.1)',
                                                }}>
                                                    {i + 1}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.5' }}>{q.questionText}</div>
                                                </div>
                                                {statusIcon}
                                            </div>
                                            <div style={{ marginLeft: '12px', color: '#475569' }}>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div style={expandedContent}>
                                                {/* Options Review */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                                    {q.options.map((opt, optIdx) => {
                                                        const isCorrectOption = optIdx === q.correctOption;
                                                        const isUserChoice = optIdx === q.userAnswer;
                                                        let bg = 'rgba(255,255,255,0.02)';
                                                        let border = 'rgba(255,255,255,0.04)';
                                                        let labelBg = 'rgba(255,255,255,0.05)';
                                                        let labelColor = '#64748b';

                                                        if (isCorrectOption) {
                                                            bg = 'rgba(16,185,129,0.06)';
                                                            border = 'rgba(16,185,129,0.3)';
                                                            labelBg = '#10b981';
                                                            labelColor = '#fff';
                                                        } else if (isUserChoice && !isCorrectOption) {
                                                            bg = 'rgba(239,68,68,0.06)';
                                                            border = 'rgba(239,68,68,0.3)';
                                                            labelBg = '#ef4444';
                                                            labelColor = '#fff';
                                                        }

                                                        return (
                                                            <div key={optIdx} style={{
                                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                                padding: '12px 16px', borderRadius: '12px',
                                                                background: bg, border: `1px solid ${border}`,
                                                            }}>
                                                                <span style={{
                                                                    width: '28px', height: '28px', borderRadius: '8px',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '12px', fontWeight: '800',
                                                                    background: labelBg, color: labelColor,
                                                                    flexShrink: 0,
                                                                }}>
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                <span style={{ fontSize: '13px', flex: 1 }}>{opt}</span>
                                                                {isCorrectOption && <CheckCircle2 size={14} color="#10b981" />}
                                                                {isUserChoice && !isCorrectOption && <XCircle size={14} color="#ef4444" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explanation */}
                                                {q.explanation && (
                                                    <div style={explanationBox}>
                                                        <Sparkles size={14} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#818cf8', letterSpacing: '1px', marginBottom: '4px' }}>EXPLANATION</div>
                                                            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{q.explanation}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ===== ACTION BUTTONS ===== */}
                <div style={actionRow}>
                    <button
                        style={primaryActionBtn}
                        onClick={() => navigate('/quiz/take', {
                            state: { topic, difficulty, count: totalQuestions, color }
                        })}
                    >
                        <RefreshCcw size={16} /> Try Again
                    </button>
                    <button style={secondaryActionBtn} onClick={() => navigate('/quizzes')}>
                        <Star size={16} /> Different Topic
                    </button>
                    {attemptId && (
                        <button style={secondaryActionBtn} onClick={() => navigate(`/quiz/review/${attemptId}`)}>
                            <BarChart2 size={16} /> Review Later
                        </button>
                    )}
                    <button style={ghostActionBtn} onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============ STYLES ============

const pageContainer = { minHeight: '100vh', background: 'var(--bg-base, #0c0f1a)', color: '#e8eaf6', fontFamily: "'Inter', sans-serif", padding: '40px 20px 80px' };
const contentWrapper = { maxWidth: '760px', margin: '0 auto' };

// Score Hero
const scoreHero = { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' };
const xpBadge = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '28px', border: '1px solid rgba(251,191,36,0.15)' };

const scoreRingWrapper = { position: 'relative', width: '180px', height: '180px', margin: '0 auto' };
const scoreInner = { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' };

const quickStatsRow = { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', background: 'rgba(15,23,42,0.5)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', justifyContent: 'center' };
const quickStat = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#e2e8f0' };
const quickStatDivider = { width: '1px', height: '20px', background: 'rgba(255,255,255,0.06)' };

// Breakdown
const breakdownGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' };
const breakdownCard = { display: 'flex', alignItems: 'center', gap: '14px', padding: '20px', background: 'rgba(15,23,42,0.4)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.04)' };

// Review
const sectionTitle = { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' };
const reviewContainer = { display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(15,23,42,0.3)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' };
const reviewItem = { borderBottom: '1px solid rgba(255,255,255,0.03)' };
const reviewHeader = { display: 'flex', alignItems: 'center', padding: '18px 20px', cursor: 'pointer', transition: 'background 0.2s' };
const qNumber = { width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 };
const expandedContent = { padding: '0 20px 20px', animation: 'fadeIn 0.3s ease' };
const explanationBox = { display: 'flex', gap: '10px', padding: '14px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.1)' };

// Actions
const actionRow = { display: 'flex', gap: '12px', marginTop: '40px', justifyContent: 'center', flexWrap: 'wrap' };
const primaryActionBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(99,102,241,0.3)' };
const secondaryActionBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };
const ghostActionBtn = { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };

export default QuizResultPage;
