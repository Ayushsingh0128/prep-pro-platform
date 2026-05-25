import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, BarChart2, Zap, BrainCircuit, Target, Clock, Mic, ChevronRight } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';

const ProgressPage = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [quizHistory, setQuizHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [interviewRes, quizRes] = await Promise.all([
                    axios.get('https://prep-pro-platform.onrender.com/api/interviews', config).catch(() => ({ data: [] })),
                    axios.get('https://prep-pro-platform.onrender.com/api/quizzes/history', config).catch(() => ({ data: { attempts: [] } }))
                ]);

                setInterviews(interviewRes.data || []);
                setQuizHistory(quizRes.data?.attempts || []);
            } catch (err) {
                console.error("Progress fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const unifiedFeed = [
        ...interviews.map(i => ({
            id: i._id,
            type: 'interview',
            date: i.createdAt,
            title: i.role || 'Mock Interview',
            score: i.overallScore,
            meta: `${i.fillerCount || 0} fillers • ${i.difficulty || 'med'}`,
            link: `/interview/review/${i._id}`
        })),
        ...quizHistory.map(q => ({
            id: q._id,
            type: 'quiz',
            date: q.completedAt || q.createdAt,
            title: `${q.topic} Quiz`,
            score: q.percentage,
            meta: `${q.score}/${q.totalQuestions} correct`,
            link: `/quiz/review/${q._id}`
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const avgQuizScore = quizHistory.length > 0 
        ? Math.round(quizHistory.reduce((s, q) => s + (q.percentage || 0), 0) / quizHistory.length) : 0;

    const avgInterviewScore = interviews.length > 0 
        ? Math.round(interviews.reduce((s, i) => s + (i.overallScore || 0), 0) / interviews.length) : 0;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Performance Analytics</h1>
                <p style={{ color: '#94a3b8' }}>Deep dive into your progress and skill development trends.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '40px' }}>
                {/* Chart Section */}
                <section style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={sectionTitle}><BarChart2 size={18} /> Skill Proficiency Trend</h3>
                        <div style={badgeStyle}>Overall Progress: +15%</div>
                    </div>
                    <div style={{ height: '400px' }}>
                        <AnalyticsChart data={unifiedFeed.map(item => ({ date: item.date, score: item.score, type: item.type }))} />
                    </div>
                </section>

                {/* Breakdown Section */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={cardStyle}>
                        <h3 style={sectionTitle}><BrainCircuit size={18} /> Quiz Mastery</h3>
                        <div style={{ fontSize: '32px', fontWeight: '800', margin: '15px 0' }}>{avgQuizScore}%</div>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Average across all technical topics.</p>
                    </div>

                    <div style={cardStyle}>
                        <h3 style={sectionTitle}><Target size={18} /> Interview Readiness</h3>
                        <div style={{ fontSize: '32px', fontWeight: '800', margin: '15px 0' }}>{avgInterviewScore}%</div>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Based on recent mock interview feedback.</p>
                    </div>
                </section>
            </div>

            {/* ACTIVITY FEED */}
            <div style={{ marginTop: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={sectionTitle}>Activity History</h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{unifiedFeed.length} Total sessions</div>
                </div>

                <div style={tableBox}>
                    {unifiedFeed.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                            <Zap size={32} style={{ marginBottom: '10px', opacity: 0.2 }} />
                            <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                        <table style={tableStyle}>
                            <thead>
                                <tr style={tableHeader}>
                                    <th style={thStyle}>TYPE</th>
                                    <th style={thStyle}>ACTIVITY</th>
                                    <th style={thStyle}>SCORE</th>
                                    <th style={thStyle}>DATE</th>
                                    <th style={thStyle}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {unifiedFeed.map((item) => (
                                    <tr key={item.id} style={trStyle}>
                                        <td style={tdStyle}>
                                            <div style={{
                                                ...typeIndicator,
                                                background: item.type === 'quiz' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                color: item.type === 'quiz' ? '#22c55e' : '#818cf8'
                                            }}>
                                                {item.type === 'quiz' ? <BrainCircuit size={14} /> : <Mic size={14} />}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: '700', color: '#e8eaf6' }}>{item.title}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.meta}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{
                                                fontSize: '15px', fontWeight: '800',
                                                color: item.score >= 80 ? '#22c55e' : item.score >= 50 ? '#faff60' : '#f43f5e'
                                            }}>
                                                {item.score}%
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                <Clock size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                                {new Date(item.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <button style={viewBtn} onClick={() => navigate(item.link)}>
                                                Review <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    background: '#141828',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
};

const sectionTitle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
};

const badgeStyle = {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
};

const tableBox = {
    background: '#141828',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    overflow: 'hidden'
};

const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left' };
const thStyle = { padding: '16px 24px', fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' };
const trStyle = { borderBottom: '1px solid rgba(255, 255, 255, 0.03)', transition: 'background 0.2s' };
const tdStyle = { padding: '16px 24px' };

const typeIndicator = {
    width: '32px', height: '32px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const viewBtn = {
    background: 'transparent',
    border: 'none',
    color: '#6366f1',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
};

export default ProgressPage;

