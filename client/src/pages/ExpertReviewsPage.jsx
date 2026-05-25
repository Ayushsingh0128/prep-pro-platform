import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, MessageSquare, AlertCircle, CheckCircle, BarChart3, Quote } from 'lucide-react';

const ExpertReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`https://prep-pro-platform.onrender.com/api/interviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInterview(res.data);
            } catch (err) {
                console.error("Fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div style={loadingStyle}>Analyzing your performance...</div>;
    if (!interview) return <div style={loadingStyle}>Session not found.</div>;

    return (
        <div style={pageBg}>
            
            <main style={container}>
                {/* Header with Back Button */}
                <div style={headerRow}>
                    <button onClick={() => navigate('/dashboard')} style={backBtn}>
                        <ChevronLeft size={20} /> Back to Dashboard
                    </button>
                    <div style={badge}>Session ID: #{id.slice(-6)}</div>
                </div>

                <div style={mainGrid}>
                    {/* LEFT: Score Card & Summary */}
                    <div style={leftCol}>
                        <div style={scoreCard}>
                            <div style={radialProgress}>
                                <h1 style={{fontSize: '48px', margin: 0}}>{interview.overallScore}%</h1>
                                <p style={{fontSize: '12px', color: 'var(--text-muted)'}}>OVERALL READINESS</p>
                            </div>
                            <div style={metricsList}>
                                <div style={metricItem}>
                                    <span>Filler Words</span>
                                    <b style={{color: interview.fillerCount > 3 ? '#ef4444' : '#34d399'}}>{interview.fillerCount}</b>
                                </div>
                                <div style={metricItem}>
                                    <span>Gaze Stability</span>
                                    <b style={{color: interview.gazeScore === 'Stable' ? '#34d399' : '#ef4444'}}>{interview.gazeScore}</b>
                                </div>
                            </div>
                        </div>

                        <div style={aiAdviceBox}>
                            <h3 style={sectionTitle}><MessageSquare size={18} /> AI Expert Advice</h3>
                            <div style={adviceContent}>
                                <div style={advicePoint}>
                                    <AlertCircle size={16} color="#fbbf24" />
                                    <p>Your filler word count is high. Try to take 2-second pauses instead of saying "umm".</p>
                                </div>
                                <div style={advicePoint}>
                                    <CheckCircle size={16} color="#34d399" />
                                    <p>Excellent eye contact! You looked confident throughout the session.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Transcript & Improved Answers */}
                    <div style={rightCol}>
                        <div style={transcriptCard}>
                            <h3 style={sectionTitle}><Quote size={18} /> Your Response Transcript</h3>
                            <div style={transcriptContent}>
                                {interview.transcript.split(' ').map((word, i) => (
                                    <span key={i} style={{
                                        color: ['umm', 'uhh', 'like'].includes(word.toLowerCase()) ? '#ef4444' : 'inherit',
                                        fontWeight: ['umm', 'uhh', 'like'].includes(word.toLowerCase()) ? '800' : '400',
                                        marginRight: '4px'
                                    }}>
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={improvementCard}>
                            <h3 style={{...sectionTitle, color: '#818cf8'}}><BarChart3 size={18} /> How to improve this answer?</h3>
                            <div style={modelAnswer}>
                                <p>"To answer this question better, start by using the <b>STAR method</b>. Mention a specific Situation, the Task you had, the Action you took, and the Result you achieved. This makes your answer 40% more impactful."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Professional Review Styles ---
const pageBg = { minHeight: '100vh', background: 'var(--bg-main)', color: '#fff' };
const container = { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' };
const loadingStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: '700' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const backBtn = { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '600' };
const badge = { background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-dark)' };

const mainGrid = { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' };
const leftCol = { display: 'flex', flexDirection: 'column', gap: '25px' };
const scoreCard = { background: 'var(--bg-card)', padding: '40px 30px', borderRadius: '32px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' };
const radialProgress = { width: '160px', height: '160px', borderRadius: '50%', border: '8px solid var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto', boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)' };
const metricsList = { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' };
const metricItem = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', fontSize: '14px' };

const aiAdviceBox = { background: 'var(--bg-card)', padding: '25px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' };
const sectionTitle = { fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' };
const advicePoint = { display: 'flex', gap: '12px', marginBottom: '15px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' };
const adviceContent = { display: 'flex', flexDirection: 'column', gap: '10px' };

const rightCol = { display: 'flex', flexDirection: 'column', gap: '25px' };
const transcriptCard = { background: 'var(--bg-card)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', flex: 1 };
const transcriptContent = { background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '20px', lineHeight: '1.8', color: 'var(--text-muted)', fontSize: '15px', border: '1px solid rgba(255,255,255,0.02)' };

const improvementCard = { background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(15,23,42,1) 100%)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(129, 140, 248, 0.2)' };
const modelAnswer = { background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', borderLeft: '4px solid var(--primary)', color: '#f8fafc', fontStyle: 'italic' };

export default ExpertReviewPage;