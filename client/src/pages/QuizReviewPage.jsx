import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, CheckCircle2, XCircle, Clock, 
    Target, HelpCircle, Lightbulb, BarChart2
} from 'lucide-react';

const QuizReviewPage = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`https://prep-pro-platform.onrender.com/api/quizzes/attempt/${attemptId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttempt(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAttempt();
    }, [attemptId]);

    const getScoreColor = (pct) => {
        if (pct >= 80) return '#22c55e';
        if (pct >= 50) return '#eab308';
        return '#f43f5e';
    };

    const formatTime = (s) => {
        if (!s) return '0s';
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', color: '#5c6589' }}>
                    Loading review...
                </div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div style={pageStyle}>
                
                <div style={{ textAlign: 'center', padding: '100px', color: '#5c6589' }}>
                    <h3>Attempt not found</h3>
                    <button style={backBtn} onClick={() => navigate('/quizzes')}>
                        <ArrowLeft size={14} /> Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    const correct = attempt.questions?.filter(q => q.isCorrect).length || 0;
    const wrong = attempt.questions?.filter(q => !q.isCorrect && q.userAnswer !== -1).length || 0;
    const skipped = attempt.questions?.filter(q => q.userAnswer === -1).length || 0;

    return (
        <div style={pageStyle}>
            
            <main style={mainStyle}>
                {/* Header */}
                <div style={headerRow}>
                    <button style={backBtn} onClick={() => navigate('/quizzes')}>
                        <ArrowLeft size={14} /> Back
                    </button>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
                            {attempt.topic} — Quiz Review
                        </h2>
                        <p style={{ fontSize: '13px', color: '#5c6589', margin: '4px 0 0' }}>
                            {new Date(attempt.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={statsBar}>
                    <div style={statBox}>
                        <Target size={16} color={getScoreColor(attempt.percentage)} />
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: getScoreColor(attempt.percentage) }}>
                                {Math.round(attempt.percentage)}%
                            </div>
                            <div style={statLabel}>Score</div>
                        </div>
                    </div>
                    <div style={statBox}>
                        <CheckCircle2 size={16} color="#22c55e" />
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>{correct}</div>
                            <div style={statLabel}>Correct</div>
                        </div>
                    </div>
                    <div style={statBox}>
                        <XCircle size={16} color="#f43f5e" />
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f43f5e' }}>{wrong}</div>
                            <div style={statLabel}>Wrong</div>
                        </div>
                    </div>
                    <div style={statBox}>
                        <HelpCircle size={16} color="#5c6589" />
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '800' }}>{skipped}</div>
                            <div style={statLabel}>Skipped</div>
                        </div>
                    </div>
                    <div style={statBox}>
                        <Clock size={16} color="#38bdf8" />
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '800' }}>{formatTime(attempt.timeTaken)}</div>
                            <div style={statLabel}>Time Taken</div>
                        </div>
                    </div>
                    <div style={statBox}>
                        <BarChart2 size={16} color="#818cf8" />
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: '800', textTransform: 'capitalize' }}>{attempt.difficulty}</div>
                            <div style={statLabel}>Difficulty</div>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div style={questionsContainer}>
                    {attempt.questions?.map((q, i) => {
                        const wasCorrect = q.isCorrect;
                        const wasSkipped = q.userAnswer === -1;
                        const optionLabels = ['A', 'B', 'C', 'D'];

                        return (
                            <div key={i} style={{
                                ...questionCard,
                                borderLeftColor: wasCorrect ? '#22c55e' : wasSkipped ? '#5c6589' : '#f43f5e',
                            }}>
                                {/* Question Header */}
                                <div style={qHeader}>
                                    <span style={qNumber}>Q{i + 1}</span>
                                    <span style={{
                                        ...qStatus,
                                        color: wasCorrect ? '#22c55e' : wasSkipped ? '#5c6589' : '#f43f5e',
                                        background: wasCorrect ? 'rgba(34,197,94,0.1)' : wasSkipped ? 'rgba(92,101,137,0.1)' : 'rgba(244,63,94,0.1)',
                                    }}>
                                        {wasCorrect ? <><CheckCircle2 size={12} /> Correct</> : 
                                         wasSkipped ? <><HelpCircle size={12} /> Skipped</> :
                                         <><XCircle size={12} /> Incorrect</>}
                                    </span>
                                </div>

                                {/* Question Text */}
                                <p style={qText}>{q.questionText}</p>

                                {/* Options */}
                                <div style={optionsGrid}>
                                    {q.options?.map((opt, oi) => {
                                        const isCorrectOption = oi === q.correctOption;
                                        const isUserPick = oi === q.userAnswer;

                                        let optStyle = { ...optionBase };
                                        if (isCorrectOption) {
                                            optStyle = { ...optStyle, ...optionCorrect };
                                        } else if (isUserPick && !isCorrectOption) {
                                            optStyle = { ...optStyle, ...optionWrong };
                                        }

                                        return (
                                            <div key={oi} style={optStyle}>
                                                <span style={{
                                                    ...optLabel,
                                                    background: isCorrectOption ? 'rgba(34,197,94,0.15)' : 
                                                               isUserPick ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.04)',
                                                    color: isCorrectOption ? '#22c55e' : isUserPick ? '#f43f5e' : '#5c6589',
                                                }}>
                                                    {optionLabels[oi]}
                                                </span>
                                                <span style={{ flex: 1 }}>{opt}</span>
                                                {isCorrectOption && <CheckCircle2 size={14} color="#22c55e" />}
                                                {isUserPick && !isCorrectOption && <XCircle size={14} color="#f43f5e" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                {q.explanation && (
                                    <div style={explanationBox}>
                                        <Lightbulb size={14} color="#eab308" />
                                        <p style={{ margin: 0, fontSize: '13px', color: '#9ba4c2', lineHeight: '1.6' }}>
                                            {q.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Actions */}
                <div style={bottomActions}>
                    <button style={retryBtn} onClick={() => navigate('/quizzes')}>
                        Try Another Quiz
                    </button>
                </div>
            </main>
        </div>
    );
};

// ============ STYLES ============
const pageStyle = { minHeight: '100vh', background: 'var(--bg-base, #0c0f1a)', color: '#e8eaf6' };
const mainStyle = { maxWidth: '860px', margin: '0 auto', padding: '28px 20px 80px' };

const headerRow = {
    display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px',
};

const backBtn = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
    color: '#9ba4c2', padding: '8px 14px', borderRadius: '10px',
    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
    whiteSpace: 'nowrap',
};

const statsBar = {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px',
    marginBottom: '28px',
};

const statBox = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '16px 14px', background: '#141828',
    borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
};

const statLabel = { fontSize: '10px', color: '#5c6589', fontWeight: '600', marginTop: '2px' };

const questionsContainer = { display: 'flex', flexDirection: 'column', gap: '16px' };

const questionCard = {
    background: '#141828', borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
    borderLeft: '4px solid', padding: '24px',
};

const qHeader = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px',
};

const qNumber = {
    fontSize: '12px', fontWeight: '700', color: '#5c6589',
    background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '8px',
};

const qStatus = {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px',
};

const qText = {
    fontSize: '15px', fontWeight: '600', lineHeight: '1.6', color: '#e8eaf6',
    marginBottom: '16px',
};

const optionsGrid = { display: 'flex', flexDirection: 'column', gap: '8px' };

const optionBase = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.04)',
    background: 'rgba(255,255,255,0.02)',
    fontSize: '13px', color: '#9ba4c2',
};

const optionCorrect = {
    background: 'rgba(34,197,94,0.06)',
    border: '1px solid rgba(34,197,94,0.2)',
    color: '#e8eaf6',
};

const optionWrong = {
    background: 'rgba(244,63,94,0.06)',
    border: '1px solid rgba(244,63,94,0.2)',
    color: '#e8eaf6',
};

const optLabel = {
    width: '26px', height: '26px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700', flexShrink: 0,
};

const explanationBox = {
    display: 'flex', gap: '10px', marginTop: '14px',
    padding: '14px', borderRadius: '12px',
    background: 'rgba(234,179,8,0.04)',
    border: '1px solid rgba(234,179,8,0.1)',
};

const bottomActions = {
    display: 'flex', justifyContent: 'center', marginTop: '32px',
};

const retryBtn = {
    padding: '12px 32px', borderRadius: '12px',
    background: '#6366f1', color: '#fff', border: 'none',
    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
};

export default QuizReviewPage;
