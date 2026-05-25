import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    BrainCircuit, AlertTriangle,
    Zap, Keyboard, SkipForward
} from 'lucide-react';

const TIMER_MAP = { easy: 30, medium: 20, hard: 15 };

const TakeQuizPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { topic, difficulty, count, color, resumeFile } = location.state || {};
    
    const [phase, setPhase] = useState('loading'); // 'loading', 'quiz', 'error'
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [startTime] = useState(Date.now());
    const timerRef = useRef(null);
    const maxTime = TIMER_MAP[difficulty] || 20;

    // Dynamic Loading state
    const loadingMessages = [
        "Analyzing topic depth...",
        "Formulating question structures...",
        "Validating difficulty levels...",
        "Generating correct answers...",
        "Finalizing your quiz..."
    ];
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

    // Redirect if no state
    useEffect(() => {
        if (!topic) {
            navigate('/quizzes');
        }
    }, [topic, navigate]);

    // Fetch questions from AI (with retry)
    useEffect(() => {
        if (!topic) return;
        const generateQuiz = async (attempt = 1) => {
            try {
                const token = localStorage.getItem('token');
                let reqData = { topic, difficulty, count };
                let config = { 
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 45000 
                };

                if (resumeFile) {
                    reqData = new FormData();
                    reqData.append('topic', topic);
                    reqData.append('difficulty', difficulty);
                    reqData.append('count', count);
                    reqData.append('resumeFile', resumeFile);
                    config.headers['Content-Type'] = 'multipart/form-data';
                }

                const res = await axios.post('https://prep-pro-platform.onrender.com/api/ai/generate-quiz', reqData, config);
                setQuestions(res.data.questions);
                setAnswers(new Array(res.data.questions.length).fill(-1));
                setTimeLeft(maxTime);
                setPhase('quiz');
            } catch (err) {
                console.error(`Quiz generation error (attempt ${attempt}):`, err);
                if (attempt < 2) {
                    // Retry once automatically
                    console.log("Retrying quiz generation...");
                    generateQuiz(attempt + 1);
                } else {
                    setPhase('error');
                }
            }
        };
        generateQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic, difficulty, count, maxTime]);

    // Loading messages animation
    useEffect(() => {
        if (phase !== 'loading') return;
        const interval = setInterval(() => {
            setLoadingMsgIdx(prev => (prev + 1) % loadingMessages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [phase]);

    // Timer countdown
    useEffect(() => {
        if (phase !== 'quiz' || showFeedback) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, currentQ, showFeedback]);

    const handleTimeout = () => {
        // Mark as skipped (-1) and move to next
        moveToNext(-1);
    };

    const handleSelectOption = useCallback((index) => {
        if (showFeedback) return;
        clearInterval(timerRef.current);
        setSelectedOption(index);
        setShowFeedback(true);

        // Save answer
        const newAnswers = [...answers];
        newAnswers[currentQ] = index;
        setAnswers(newAnswers);

        // Show feedback for 1.2 seconds then move
        setTimeout(() => {
            moveToNextAfterFeedback(newAnswers);
        }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showFeedback, currentQ, answers]);

    const moveToNext = (answerIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = answerIndex;
        setAnswers(newAnswers);

        if (currentQ + 1 < questions.length) {
            setCurrentQ(prev => prev + 1);
            setTimeLeft(maxTime);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            finishQuiz(newAnswers);
        }
    };

    const moveToNextAfterFeedback = (newAnswers) => {
        if (currentQ + 1 < questions.length) {
            setCurrentQ(prev => prev + 1);
            setTimeLeft(maxTime);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            finishQuiz(newAnswers);
        }
    };

    const finishQuiz = async (finalAnswers) => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        let score = 0;
        const reviewQuestions = questions.map((q, i) => {
            const isCorrect = finalAnswers[i] === q.correctOption;
            if (isCorrect) score++;
            return {
                questionText: q.questionText,
                options: q.options,
                correctOption: q.correctOption,
                userAnswer: finalAnswers[i],
                isCorrect,
                explanation: q.explanation
            };
        });

        const percentage = Math.round((score / questions.length) * 100);

        // Save attempt to backend
        let attemptId = null;
        try {
            const token = localStorage.getItem('token');
            const saveRes = await axios.post('https://prep-pro-platform.onrender.com/api/quizzes/save-attempt',
                { topic, difficulty, score, totalQuestions: questions.length, percentage, timeTaken, questions: reviewQuestions },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            attemptId = saveRes.data?.attemptId;
            // Log activity for XP
            await axios.post('https://prep-pro-platform.onrender.com/api/activities',
                { type: 'quiz', points: 25 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Save attempt error:", err);
        }

        // Navigate to results
        navigate('/quiz/result', {
            state: {
                topic,
                difficulty,
                score,
                totalQuestions: questions.length,
                percentage,
                timeTaken,
                questions: reviewQuestions,
                color: color || '#6366f1',
                attemptId
            }
        });
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (phase !== 'quiz') return;
        const handler = (e) => {
            if (showFeedback) return;
            if (e.key >= '1' && e.key <= '4') {
                handleSelectOption(parseInt(e.key) - 1);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase, showFeedback, handleSelectOption]);

    // Timer ring calculations
    const timerPercentage = (timeLeft / maxTime) * 100;
    const timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#10b981';
    const circumference = 2 * Math.PI * 42;
    const dashOffset = circumference - (timerPercentage / 100) * circumference;

    // ===== LOADING STATE =====
    if (phase === 'loading') {
        return (
            <div style={fullScreen}>
                <div style={loadingCard}>
                    <div style={brainPulse}>
                        <BrainCircuit size={48} color="#818cf8" />
                    </div>
                    <h2 style={{ margin: '24px 0 8px', fontSize: '22px', transition: 'opacity 0.3s' }}>
                        {loadingMessages[loadingMsgIdx]}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        AI is crafting {count} {difficulty} questions on <span style={{ color: color || '#818cf8', fontWeight: '700' }}>{topic}</span>
                    </p>
                    <div style={loadingBar}>
                        <div style={loadingBarFill}></div>
                    </div>
                    <p style={{ color: '#475569', fontSize: '11px', marginTop: '20px' }}>This usually takes 5-10 seconds</p>
                </div>
            </div>
        );
    }

    // ===== ERROR STATE =====
    if (phase === 'error') {
        return (
            <div style={fullScreen}>
                <div style={loadingCard}>
                    <AlertTriangle size={48} color="#ef4444" />
                    <h2 style={{ margin: '20px 0 8px', fontSize: '22px' }}>Generation Failed</h2>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Unable to generate quiz. Please try again.</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button style={retryButton} onClick={() => window.location.reload()}>
                            Try Again
                        </button>
                        <button style={backButton} onClick={() => navigate('/quizzes')}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== ACTIVE QUIZ =====
    const question = questions[currentQ];
    if (!question) return null;

    return (
        <div style={fullScreen}>
            <div style={quizContainer}>
                {/* Top Bar */}
                <div style={topBar}>
                    <div style={topicBadge}>
                        <Zap size={12} /> {topic}
                        <span style={{ opacity: 0.5, margin: '0 6px' }}>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{difficulty}</span>
                    </div>
                    <div style={keyboardHint}>
                        <Keyboard size={12} /> Press 1-4 to answer
                    </div>
                </div>

                {/* Progress Dots */}
                <div style={dotsContainer}>
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                ...dot,
                                background: i < currentQ 
                                    ? (answers[i] === questions[i].correctOption ? '#10b981' : '#ef4444')
                                    : i === currentQ ? (color || '#818cf8') : 'rgba(255,255,255,0.08)',
                                width: i === currentQ ? '24px' : '8px',
                                borderRadius: i === currentQ ? '4px' : '50%',
                            }}
                        />
                    ))}
                </div>

                {/* Main Quiz Card */}
                <div style={mainCard}>
                    {/* Question Header */}
                    <div style={questionHeader}>
                        <div>
                            <span style={questionCounter}>QUESTION {currentQ + 1} OF {questions.length}</span>
                        </div>

                        {/* Timer Ring */}
                        <div style={timerRingContainer}>
                            <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                <circle 
                                    cx="48" cy="48" r="42" fill="none" 
                                    stroke={timerColor} strokeWidth="4" 
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                                />
                            </svg>
                            <div style={timerText}>
                                <span style={{ fontSize: '28px', fontWeight: '900', color: timerColor }}>{timeLeft}</span>
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>SEC</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Text */}
                    <h2 style={questionTextStyle}>{question.questionText}</h2>

                    {/* Options */}
                    <div style={optionsContainer}>
                        {question.options.map((opt, i) => {
                            const isSelected = selectedOption === i;
                            const isCorrect = i === question.correctOption;
                            let optStyle = { ...optionCard };
                            let labelStyle = { ...optionLabel };

                            if (showFeedback) {
                                if (isCorrect) {
                                    optStyle = { ...optStyle, borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.08)' };
                                    labelStyle = { ...labelStyle, background: '#10b981', color: '#fff' };
                                } else if (isSelected && !isCorrect) {
                                    optStyle = { ...optStyle, borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', opacity: 0.7 };
                                    labelStyle = { ...labelStyle, background: '#ef4444', color: '#fff' };
                                } else {
                                    optStyle = { ...optStyle, opacity: 0.35 };
                                }
                            } else if (isSelected) {
                                optStyle = { ...optStyle, borderColor: color || '#818cf8', background: `${color || '#818cf8'}10` };
                                labelStyle = { ...labelStyle, background: color || '#818cf8', color: '#fff' };
                            }

                            return (
                                <div
                                    key={i}
                                    style={optStyle}
                                    onClick={() => handleSelectOption(i)}
                                >
                                    <span style={labelStyle}>{String.fromCharCode(65 + i)}</span>
                                    <span style={{ flex: 1, fontSize: '15px' }}>{opt}</span>
                                    <span style={shortcutKey}>{i + 1}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Skip Button */}
                    {!showFeedback && (
                        <button style={skipBtn} onClick={() => moveToNext(-1)}>
                            <SkipForward size={14} /> Skip Question
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============ STYLES ============

const fullScreen = { minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" };

// Loading
const loadingCard = { textAlign: 'center', padding: '60px', maxWidth: '440px' };
const brainPulse = { width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(129,140,248,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: 'pulse-glow 2s ease infinite' };
const loadingBar = { height: '4px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '28px auto 0', overflow: 'hidden' };
const loadingBarFill = { height: '100%', width: '40%', background: 'linear-gradient(90deg, #6366f1, #c084fc)', borderRadius: '10px', animation: 'loading-slide 1.5s ease infinite' };

// Error
const retryButton = { padding: '12px 28px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' };
const backButton = { padding: '12px 28px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' };

// Quiz layout
const quizContainer = { width: '100%', maxWidth: '720px' };
const topBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const topicBadge = { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.08)', color: '#818cf8', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' };
const keyboardHint = { display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '11px', fontWeight: '600' };

// Dots
const dotsContainer = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' };
const dot = { height: '8px', borderRadius: '50%', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' };

// Main card
const mainCard = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px', padding: '40px' };
const questionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' };
const questionCounter = { fontSize: '11px', fontWeight: '700', color: '#64748b', letterSpacing: '2px' };

// Timer ring
const timerRingContainer = { position: 'relative', width: '96px', height: '96px' };
const timerText = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };

// Question
const questionTextStyle = { fontSize: '22px', fontWeight: '700', lineHeight: '1.5', margin: '0 0 32px 0', maxWidth: '550px' };

// Options
const optionsContainer = { display: 'flex', flexDirection: 'column', gap: '12px' };
const optionCard = { display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.25s ease', color: '#f8fafc' };
const optionLabel = { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', flexShrink: 0, transition: 'all 0.25s ease' };
const shortcutKey = { fontSize: '11px', color: '#334155', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' };

// Skip
const skipBtn = { display: 'flex', alignItems: 'center', gap: '6px', margin: '20px auto 0', background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '8px 16px', borderRadius: '10px' };

export default TakeQuizPage;