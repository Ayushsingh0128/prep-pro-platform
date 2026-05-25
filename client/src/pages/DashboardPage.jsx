import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AnalyticsChart from '../components/AnalyticsChart';
import { 
  FileText, Mic, Zap, ChevronRight, Activity, 
  Target, Clock, BarChart2, BrainCircuit, CheckCircle2,
  TrendingUp, Sparkles, Map, FilePlus, History, Search
} from 'lucide-react';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
    const [interviews, setInterviews] = useState([]);
    const [quizHistory, setQuizHistory] = useState([]);

    // Dynamic Greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return `Good Morning, ${user?.name || 'User'}! ☕`;
        if (hour < 18) return `Good Afternoon, ${user?.name || 'User'}! ☀️`;
        return `Good Evening, ${user?.name || 'User'}! 🌙`;
    };

    // Daily Goal: check if any activity happened today
    const todayStr = new Date().toLocaleDateString();
    const isGoalDone = interviews.some(i => new Date(i.createdAt).toLocaleDateString() === todayStr) 
        || quizHistory.some(q => new Date(q.completedAt || q.createdAt).toLocaleDateString() === todayStr);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch both in parallel
                const [interviewRes, quizRes] = await Promise.all([
                    axios.get('https://prep-pro-platform.onrender.com/api/interviews', config).catch(() => ({ data: [] })),
                    axios.get('https://prep-pro-platform.onrender.com/api/quizzes/history', config).catch(() => ({ data: { attempts: [] } }))
                ]);

                setInterviews(interviewRes.data || []);
                setQuizHistory(quizRes.data?.attempts || []);
            } catch (err) {
                console.error("Dashboard error:", err);
            }
        };
        fetchData();
    }, [navigate]);

    // Build unified activity feed (sorted by date)
    const unifiedFeed = [
        ...interviews.map(i => ({
            id: i._id,
            type: 'interview',
            date: i.createdAt,
            title: i.role || 'Mock Interview',
            score: i.overallScore,
            meta: `${i.fillerCount || 0} fillers • ${i.gazeScore || 0}% gaze`,
            difficulty: i.difficulty || 'medium',
            link: `/interview/review/${i._id}`,
            hasRecording: !!i.recordingPath,
        })),
        ...quizHistory.map(q => ({
            id: q._id,
            type: 'quiz',
            date: q.completedAt || q.createdAt,
            title: `${q.topic} Quiz`,
            score: q.percentage,
            meta: `${q.score}/${q.totalQuestions} correct`,
            difficulty: q.difficulty,
            link: `/quiz/review/${q._id}`,
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

    // Build chart data (combined)
    const chartData = [
        ...interviews.map(i => ({ date: i.createdAt, score: i.overallScore, type: 'interview' })),
        ...quizHistory.map(q => ({ date: q.completedAt || q.createdAt, score: q.percentage, type: 'quiz' }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Stats
    const totalQuizzes = quizHistory.length;
    const totalInterviews = interviews.length;
    const avgQuizScore = totalQuizzes > 0 ? Math.round(quizHistory.reduce((s, q) => s + (q.percentage || 0), 0) / totalQuizzes) : 0;
    const totalXP = (totalQuizzes * 25) + (totalInterviews * 50);

    if (!user) return null;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* HERO SECTION */}
            <div style={heroCard}>
                <div style={heroMain}>
                    <div style={aiBadge}>
                        <Sparkles size={14} /> AI Assistant Active
                    </div>
                    
                    <h1 style={welcomeTitle}>
                        Welcome back, <span style={nameGradient}>{user?.name?.split(' ')[0] || 'User'}</span>
                    </h1>
                    
                    <p style={heroDescription}>
                        Your career trajectory looks promising. I review your recent mock interview and you've improved your system design skills by 15%. What should we focus on today?
                    </p>

                    <div style={heroActions}>
                        <button style={primaryActionBtn} onClick={() => navigate('/interview')}>
                            Continue Practice <ChevronRight size={18} />
                        </button>
                        <button style={secondaryActionBtn} onClick={() => navigate('/roadmap')}>
                            View Roadmap
                        </button>
                    </div>
                </div>

                {/* INSIGHTS SIDE CARD */}
                <div style={insightsCard}>
                    <h3 style={insightsTitle}>
                        <Activity size={18} /> Latest Insights
                    </h3>
                    
                    <div style={insightItems}>
                        <div style={insightRow}>
                            <div style={{...iconBox, background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8'}}>
                                <FileText size={16} />
                            </div>
                            <div style={insightLabel}>Resume Score</div>
                            <div style={{...insightValue, color: '#818cf8'}}>85%</div>
                        </div>

                        <div style={insightRow}>
                            <div style={{...iconBox, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e'}}>
                                <BrainCircuit size={16} />
                            </div>
                            <div style={insightLabel}>Quiz Accuracy</div>
                            <div style={{...insightValue, color: '#22c55e'}}>{avgQuizScore}%</div>
                        </div>

                        <div style={insightRow}>
                            <div style={{...iconBox, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8'}}>
                                <TrendingUp size={16} />
                            </div>
                            <div style={insightLabel}>Roadmap Progress</div>
                            <div style={{...insightValue, color: '#38bdf8'}}>40%</div>
                        </div>

                        <div style={insightRow}>
                            <div style={{...iconBox, background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24'}}>
                                <Zap size={16} />
                            </div>
                            <div style={insightLabel}>Interview Readiness</div>
                            <div style={{...insightValue, color: '#fbbf24'}}>Strong</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CAREER TOOLS GRID */}
            <div style={{ marginTop: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={sectionTitle}>Professional Toolkit</h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Quick access to core modules</div>
                </div>

                <div style={toolsGrid}>
                    <div style={toolCard} onClick={() => navigate('/resume-builder')}>
                        <div style={{...toolIconBox, background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8'}}>
                            <FileText size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>Resume Builder</div>
                            <div style={toolDesc}>Professional PDF export</div>
                        </div>
                    </div>

                    <div style={toolCard} onClick={() => navigate('/resume-analysis')}>
                        <div style={{...toolIconBox, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e'}}>
                            <Search size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>Resume Analysis</div>
                            <div style={toolDesc}>AI-powered ATS score</div>
                        </div>
                    </div>

                    <div style={toolCard} onClick={() => navigate('/interview')}>
                        <div style={{...toolIconBox, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8'}}>
                            <Mic size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>Mock Interview</div>
                            <div style={toolDesc}>Real-time AI feedback</div>
                        </div>
                    </div>

                    <div style={toolCard} onClick={() => navigate('/quizzes')}>
                        <div style={{...toolIconBox, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}>
                            <BrainCircuit size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>Skill Quizzes</div>
                            <div style={toolDesc}>10+ Technical topics</div>
                        </div>
                    </div>

                    <div style={toolCard} onClick={() => navigate('/roadmap')}>
                        <div style={{...toolIconBox, background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24'}}>
                            <Map size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>Career Roadmap</div>
                            <div style={toolDesc}>Phase-wise guidance</div>
                        </div>
                    </div>

                    <div style={toolCard} onClick={() => navigate('/progress')}>
                        <div style={{...toolIconBox, background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e'}}>
                            <TrendingUp size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>Skill Progress</div>
                            <div style={toolDesc}>Detailed analytics</div>
                        </div>
                    </div>

                    <div style={toolCard} onClick={() => navigate('/resumes')}>
                        <div style={{...toolIconBox, background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf'}}>
                            <FilePlus size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>My Resumes</div>
                            <div style={toolDesc}>Manage your versions</div>
                        </div>
                    </div>

                    <div style={toolCard} onClick={() => navigate('/interviews')}>
                        <div style={{...toolIconBox, background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8'}}>
                            <History size={24} />
                        </div>
                        <div style={toolInfo}>
                            <div style={toolName}>Interview History</div>
                            <div style={toolDesc}>Review past performances</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Cinematic Styles ---
const toolsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px'
};

const toolCard = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#141828',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        background: '#1e293b',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
    }
};

const toolIconBox = {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
};

const toolInfo = { flex: 1 };
const toolName = { fontSize: '15px', fontWeight: '700', color: '#e8eaf6', marginBottom: '2px' };
const toolDesc = { fontSize: '11px', color: '#64748b' };
const heroCard = {
    display: 'flex',
    gap: '30px',
    padding: '40px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0c0f1a 100%)',
    borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    overflow: 'hidden'
};

const heroMain = { flex: 1, zIndex: 2 };

const aiBadge = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '24px',
    border: '1px solid rgba(99, 102, 241, 0.2)'
};

const welcomeTitle = {
    fontSize: '52px',
    fontWeight: '800',
    marginBottom: '16px',
    letterSpacing: '-2px'
};

const nameGradient = {
    background: 'linear-gradient(to right, #6366f1, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
};

const heroDescription = {
    fontSize: '18px',
    color: '#94a3b8',
    marginBottom: '40px',
    lineHeight: '1.6',
    maxWidth: '550px'
};

const heroActions = { display: 'flex', gap: '16px' };

const primaryActionBtn = {
    padding: '16px 32px',
    background: '#fff',
    color: '#020617',
    fontWeight: '700',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px'
};

const secondaryActionBtn = {
    padding: '16px 32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontWeight: '600',
    borderRadius: '14px',
    fontSize: '15px'
};

const insightsCard = {
    width: '320px',
    background: 'rgba(2, 6, 23, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    zIndex: 2
};

const insightsTitle = {
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    color: '#e8eaf6'
};

const insightItems = { display: 'flex', flexDirection: 'column', gap: '16px' };

const insightRow = { display: 'flex', alignItems: 'center', gap: '12px' };

const iconBox = {
    width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const insightLabel = { flex: 1, fontSize: '13px', color: '#94a3b8', fontWeight: '500' };

const insightValue = { fontSize: '14px', fontWeight: '800' };

const sectionTitle = {
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#64748b'
};

const viewAllBtn = {
    background: 'transparent',
    border: 'none',
    color: '#6366f1',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer'
};

const activityList = { display: 'flex', flexDirection: 'column', gap: '12px' };

const activityItem = {
    padding: '16px 20px',
    background: '#141828',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
};

const activityTypeIcon = {
    width: '40px', height: '40px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const activityTitle = { fontSize: '14px', fontWeight: '700', color: '#e8eaf6' };
const activityDate = { fontSize: '11px', color: '#64748b', marginTop: '2px' };
const activityScore = { fontSize: '16px', fontWeight: '800', marginRight: '10px' };
export default DashboardPage;