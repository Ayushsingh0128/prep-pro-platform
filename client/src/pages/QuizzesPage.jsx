import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BrainCircuit, Timer, ChevronRight, Flame, Trophy, Target,
  Code2, Database, GitBranch, Layout, Server, Terminal, FileCode, Cpu,
  Zap, Clock, Star, Sparkles, X, Upload, FileText
} from 'lucide-react';

const CATEGORIES = [
  { id: 'react', name: 'React.js', icon: Code2, color: '#61dafb', bg: 'rgba(97, 218, 251, 0.08)', desc: 'Hooks, Components, Virtual DOM, State Management', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
  { id: 'node', name: 'Node.js', icon: Server, color: '#339933', bg: 'rgba(51, 153, 51, 0.08)', desc: 'Event Loop, APIs, Middleware, Streams', gradient: 'linear-gradient(135deg, #16a34a, #22c55e)' },
  { id: 'javascript', name: 'JavaScript', icon: FileCode, color: '#f7df1e', bg: 'rgba(247, 223, 30, 0.08)', desc: 'ES6+, Closures, Promises, Prototypes', gradient: 'linear-gradient(135deg, #ca8a04, #eab308)' },
  { id: 'python', name: 'Python', icon: Terminal, color: '#3776ab', bg: 'rgba(55, 118, 171, 0.08)', desc: 'OOP, Data Structures, Django, Flask', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  { id: 'dsa', name: 'DSA', icon: Cpu, color: '#e879f9', bg: 'rgba(232, 121, 249, 0.08)', desc: 'Arrays, Trees, Graphs, Sorting, DP', gradient: 'linear-gradient(135deg, #a855f7, #d946ef)' },
  { id: 'system-design', name: 'System Design', icon: Layout, color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', desc: 'Scalability, Load Balancing, Caching', gradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
  { id: 'sql', name: 'SQL', icon: Database, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)', desc: 'Joins, Indexes, Normalization, Queries', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
  { id: 'mongodb', name: 'MongoDB', icon: Database, color: '#00ed64', bg: 'rgba(0, 237, 100, 0.08)', desc: 'Aggregation, Indexing, Schema Design', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  { id: 'html-css', name: 'HTML & CSS', icon: Layout, color: '#e44d26', bg: 'rgba(228, 77, 38, 0.08)', desc: 'Flexbox, Grid, Animations, Semantics', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
  { id: 'git-devops', name: 'Git & DevOps', icon: GitBranch, color: '#f05032', bg: 'rgba(240, 80, 50, 0.08)', desc: 'Branching, CI/CD, Docker, Kubernetes', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', emoji: '🟢', color: '#10b981', desc: 'Fundamentals & basics', timer: '30s per question' },
  { id: 'medium', label: 'Medium', emoji: '🟡', color: '#f59e0b', desc: 'Practical & scenario-based', timer: '20s per question' },
  { id: 'hard', label: 'Hard', emoji: '🔴', color: '#ef4444', desc: 'Advanced & tricky', timer: '15s per question' },
];

const QUESTION_COUNTS = [5, 10, 15];

const QuizzesPage = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
    const [selectedCount, setSelectedCount] = useState(10);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ totalQuizzes: 0, avgScore: 0, bestScore: 0 });
    const [hoveredCard, setHoveredCard] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://prep-pro-platform.onrender.com/api/quizzes/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data.attempts || []);
            setStats(res.data.stats || { totalQuizzes: 0, avgScore: 0, bestScore: 0 });
        } catch (err) {
            console.error("History fetch error:", err);
        }
    };

    const openModal = (category) => {
        setSelectedCategory(category);
        setSelectedDifficulty('medium');
        setSelectedCount(10);
        setResumeFile(null);
        setShowModal(true);
    };

    const startQuiz = () => {
        navigate('/quiz/take', { 
            state: { 
                topic: selectedCategory.name, 
                difficulty: selectedDifficulty, 
                count: selectedCount,
                color: selectedCategory.color,
                resumeFile
            } 
        });
    };

    const getScoreColor = (pct) => {
        if (pct >= 80) return '#10b981';
        if (pct >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base, #0c0f1a)', color: '#e8eaf6' }}>
            
            
            <main style={container}>
                {/* ===== HERO SECTION ===== */}
                <section style={heroSection}>
                    <div>
                        <div style={heroBadge}>
                            <Sparkles size={14} /> AI-POWERED QUIZZES
                        </div>
                        <h1 style={heroTitle}>
                            Test Your <span style={gradientText}>Knowledge</span>
                        </h1>
                        <p style={heroSubtitle}>
                            Choose a topic, select difficulty, and challenge yourself with AI-generated questions. 
                            Track your progress and master every domain.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div style={statsRow}>
                        <div style={statCard}>
                            <Trophy size={20} color="#fbbf24" />
                            <div>
                                <div style={statNumber}>{stats.totalQuizzes}</div>
                                <div style={statLabel}>Quizzes Taken</div>
                            </div>
                        </div>
                        <div style={statCard}>
                            <Target size={20} color="#818cf8" />
                            <div>
                                <div style={statNumber}>{stats.avgScore}%</div>
                                <div style={statLabel}>Avg Score</div>
                            </div>
                        </div>
                        <div style={statCard}>
                            <Flame size={20} color="#f97316" />
                            <div>
                                <div style={statNumber}>{stats.bestScore}%</div>
                                <div style={statLabel}>Best Score</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== CATEGORY GRID ===== */}
                <section style={{ marginBottom: '60px' }}>
                    <h2 style={sectionHeading}>
                        <BrainCircuit size={20} /> Choose Your Domain
                    </h2>
                    <div style={categoryGrid}>
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isHovered = hoveredCard === cat.id;
                            const topicAttempts = stats.topicBreakdown?.[cat.name] || 0;
                            return (
                                <div
                                    key={cat.id}
                                    style={{
                                        ...categoryCard,
                                        background: isHovered ? cat.bg : 'rgba(15, 23, 42, 0.5)',
                                        borderColor: isHovered ? `${cat.color}40` : 'rgba(255,255,255,0.04)',
                                        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                                        boxShadow: isHovered ? `0 20px 40px ${cat.color}15` : 'none',
                                    }}
                                    onMouseEnter={() => setHoveredCard(cat.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    onClick={() => openModal(cat)}
                                >
                                    <div style={{
                                        ...iconWrapper,
                                        background: cat.bg,
                                        boxShadow: isHovered ? `0 0 20px ${cat.color}30` : 'none',
                                    }}>
                                        <Icon size={24} color={cat.color} />
                                    </div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700' }}>{cat.name}</h3>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{cat.desc}</p>
                                    
                                    <div style={cardFooter}>
                                        {topicAttempts > 0 && (
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                {topicAttempts} attempt{topicAttempts !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        <div style={{
                                            ...startQuizBadge,
                                            background: isHovered ? cat.gradient : 'rgba(255,255,255,0.05)',
                                            color: isHovered ? '#fff' : '#94a3b8',
                                        }}>
                                            Start <ChevronRight size={12} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ===== QUIZ HISTORY ===== */}
                {history.length > 0 && (
                    <section style={{ marginBottom: '60px' }}>
                        <h2 style={sectionHeading}>
                            <Clock size={20} /> My Quiz History
                        </h2>
                        <div style={historyContainer}>
                            {history.slice(0, 10).map((attempt, i) => (
                                <div 
                                    key={attempt._id || i} 
                                    style={historyRow}
                                    onClick={() => navigate(`/quiz/review/${attempt._id}`)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                        <div style={{
                                            ...historyIcon,
                                            background: `${getScoreColor(attempt.percentage)}15`,
                                        }}>
                                            {attempt.percentage >= 80 
                                                ? <Star size={16} color={getScoreColor(attempt.percentage)} /> 
                                                : <Target size={16} color={getScoreColor(attempt.percentage)} />
                                            }
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{attempt.topic}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                {new Date(attempt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                <span style={{ margin: '0 6px', opacity: 0.3 }}>•</span>
                                                <span style={{ textTransform: 'capitalize' }}>{attempt.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '800', fontSize: '16px', color: getScoreColor(attempt.percentage) }}>
                                                {Math.round(attempt.percentage)}%
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                {attempt.score}/{attempt.totalQuestions}
                                            </div>
                                        </div>
                                        {attempt.timeTaken > 0 && (
                                            <div style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Timer size={12} /> {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', fontSize: '12px', fontWeight: '700', marginLeft: '8px' }}>
                                            Review <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* ===== DIFFICULTY MODAL ===== */}
            {showModal && selectedCategory && (
                <div style={modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={modalContent} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    ...iconWrapper,
                                    background: selectedCategory.bg,
                                    width: '44px',
                                    height: '44px',
                                }}>
                                    {React.createElement(selectedCategory.icon, { size: 22, color: selectedCategory.color })}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '20px' }}>{selectedCategory.name}</h3>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Configure your quiz</p>
                                </div>
                            </div>
                            <button style={closeBtn} onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Resume Upload */}
                        <div style={{ marginBottom: '28px' }}>
                            <label style={modalLabel}>Upload Resume</label>
                            <div 
                                style={uploadDropzone}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    style={{ display: 'none' }} 
                                    ref={fileInputRef} 
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                />
                                {resumeFile ? (
                                    <div style={{ color: '#34d399', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                        <FileText size={16} /> {resumeFile.name}
                                    </div>
                                ) : (
                                    <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                        <Upload size={16} /> Click to upload PDF to personalize questions
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Difficulty Selection */}
                        <div style={{ marginBottom: '28px' }}>
                            <label style={modalLabel}>Difficulty Level</label>
                            <div style={difficultyGrid}>
                                {DIFFICULTIES.map(d => (
                                    <div
                                        key={d.id}
                                        style={{
                                            ...difficultyCard,
                                            borderColor: selectedDifficulty === d.id ? d.color : 'rgba(255,255,255,0.06)',
                                            background: selectedDifficulty === d.id ? `${d.color}10` : 'rgba(15, 23, 42, 0.5)',
                                        }}
                                        onClick={() => setSelectedDifficulty(d.id)}
                                    >
                                        <div style={{ fontSize: '22px' }}>{d.emoji}</div>
                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{d.label}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{d.desc}</div>
                                        <div style={{ fontSize: '10px', color: d.color, fontWeight: '700', marginTop: '4px' }}>
                                            <Timer size={10} /> {d.timer}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={modalLabel}>Number of Questions</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {QUESTION_COUNTS.map(c => (
                                    <button
                                        key={c}
                                        style={{
                                            ...countBtn,
                                            borderColor: selectedCount === c ? selectedCategory.color : 'rgba(255,255,255,0.06)',
                                            background: selectedCount === c ? `${selectedCategory.color}15` : 'transparent',
                                            color: selectedCount === c ? selectedCategory.color : '#94a3b8',
                                        }}
                                        onClick={() => setSelectedCount(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            style={{
                                ...generateBtn,
                                background: selectedCategory.gradient,
                            }}
                            onClick={startQuiz}
                        >
                            <Zap size={18} />
                            Generate {selectedCount} Questions
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============ STYLES ============

const container = { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px 80px' };

const heroSection = { marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '30px' };
const heroBadge = { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '16px' };
const heroTitle = { fontSize: '42px', fontWeight: '900', lineHeight: '1.1', margin: '0 0 14px 0', letterSpacing: '-0.02em' };
const gradientText = { background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };
const heroSubtitle = { fontSize: '15px', color: '#64748b', maxWidth: '480px', lineHeight: '1.7', margin: 0 };

const statsRow = { display: 'flex', gap: '14px', flexWrap: 'wrap' };
const statCard = { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 22px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '18px', minWidth: '140px' };
const statNumber = { fontSize: '20px', fontWeight: '800' };
const statLabel = { fontSize: '11px', color: '#64748b', fontWeight: '600' };

const sectionHeading = { fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' };

const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' };
const categoryCard = { padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' };
const iconWrapper = { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', transition: 'all 0.35s ease' };
const cardFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' };
const startQuizBadge = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', transition: 'all 0.3s ease' };

const historyContainer = { background: '#141828', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' };
const historyRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s ease' };
const historyIcon = { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

// Modal
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' };
const modalContent = { background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', padding: '36px', maxWidth: '520px', width: '100%', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', animation: 'fadeIn 0.3s ease', maxHeight: '90vh', overflowY: 'auto' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' };
const closeBtn = { background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '10px' };
const modalLabel = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '12px' };
const difficultyGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' };
const difficultyCard = { padding: '16px', borderRadius: '16px', border: '1px solid', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' };
const countBtn = { flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid', background: 'transparent', cursor: 'pointer', fontSize: '18px', fontWeight: '800', transition: 'all 0.25s ease' };
const uploadDropzone = { padding: '16px', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.25s ease' };
const generateBtn = { width: '100%', padding: '16px', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 30px rgba(99,102,241,0.3)', transition: 'all 0.3s ease' };

export default QuizzesPage;