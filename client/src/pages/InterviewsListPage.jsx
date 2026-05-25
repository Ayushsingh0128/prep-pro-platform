import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Mic, Play, Eye, Target, Plus, 
    Video, ArrowRight, Calendar
} from 'lucide-react';

const InterviewsListPage = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://prep-pro-platform.onrender.com/api/interviews', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInterviews(res.data || []);
            } catch (e) { console.error(e); } 
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const getScoreColor = (s) => {
        if (s >= 75) return '#22c55e';
        if (s >= 50) return '#eab308';
        return '#f43f5e';
    };

    const formatDuration = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base, #0c0f1a)' }}>
            

            <main style={mainStyle}>
                {/* Header */}
                <div style={headerRow}>
                    <div>
                        <h1 style={pageTitle}>My Interviews</h1>
                        <p style={pageSubtitle}>
                            {interviews.length} recorded session{interviews.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button style={newBtn} onClick={() => navigate('/interview')}>
                        <Plus size={16} /> New Interview
                    </button>
                </div>

                {loading ? (
                    <div style={emptyState}>Loading your interviews...</div>
                ) : interviews.length === 0 ? (
                    <div style={emptyState}>
                        <div style={emptyIcon}><Mic size={36} style={{ opacity: 0.3 }} /></div>
                        <h3 style={{ marginTop: '16px', fontWeight: '700' }}>No interviews yet</h3>
                        <p style={{ color: '#5c6589', fontSize: '14px', margin: '8px 0 20px' }}>
                            Start your first AI mock interview to see recordings here.
                        </p>
                        <button style={newBtn} onClick={() => navigate('/interview')}>
                            <Play size={16} /> Start First Interview
                        </button>
                    </div>
                ) : (
                    <div style={gridStyle}>
                        {interviews.map((iv) => {
                            let feedback = null;
                            try { feedback = JSON.parse(iv.aiFeedback); } catch {}
                            
                            return (
                                <div
                                    key={iv._id}
                                    style={cardStyle}
                                    onClick={() => navigate(`/interview/review/${iv._id}`)}
                                >
                                    {/* Video Thumbnail */}
                                    <div style={thumbBox}>
                                        {iv.recordingPath ? (
                                            <video 
                                                src={`https://prep-pro-platform.onrender.com${iv.recordingPath}`} 
                                                style={thumbVideo}
                                                muted
                                                preload="metadata"
                                            />
                                        ) : (
                                            <div style={noThumb}>
                                                <Video size={24} style={{ opacity: 0.2 }} />
                                            </div>
                                        )}
                                        <div style={playOverlay}>
                                            <Play size={20} fill="#fff" />
                                        </div>
                                        {/* Duration badge */}
                                        {iv.duration > 0 && (
                                            <span style={durationBadge}>
                                                {formatDuration(iv.duration)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div style={cardBody}>
                                        <div style={cardTop}>
                                            <span style={roleBadge}>{iv.role || 'Interview'}</span>
                                            <span style={diffBadge(iv.difficulty)}>
                                                {iv.difficulty || 'medium'}
                                            </span>
                                        </div>

                                        <h4 style={cardTitle}>
                                            {iv.role || 'Mock Interview'}
                                        </h4>
                                        
                                        {feedback?.summary && (
                                            <p style={summaryText}>
                                                {feedback.summary.substring(0, 80)}{feedback.summary.length > 80 ? '...' : ''}
                                            </p>
                                        )}

                                        {/* Metrics Row */}
                                        <div style={metricsRow}>
                                            <div style={metricItem}>
                                                <Target size={12} color={getScoreColor(iv.overallScore)} />
                                                <span style={{ color: getScoreColor(iv.overallScore), fontWeight: '700' }}>
                                                    {iv.overallScore}%
                                                </span>
                                            </div>
                                            <div style={metricItem}>
                                                <Mic size={12} color="#818cf8" />
                                                <span>{iv.fillerCount || 0}</span>
                                            </div>
                                            <div style={metricItem}>
                                                <Eye size={12} color="#22c55e" />
                                                <span>{iv.gazeScore || 0}%</span>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div style={cardFooter}>
                                            <span style={dateText}>
                                                <Calendar size={11} /> {formatDate(iv.createdAt)}
                                            </span>
                                            <span style={reviewLink}>
                                                Review <ArrowRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

// ============ STYLES ============
const mainStyle = { maxWidth: '1100px', margin: '0 auto', padding: '36px 24px 80px' };

const headerRow = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '32px',
};

const pageTitle = { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.03em' };
const pageSubtitle = { fontSize: '14px', color: '#5c6589', marginTop: '4px' };

const newBtn = {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#6366f1', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '10px',
    fontWeight: '600', fontSize: '13px',
    boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
};

const emptyState = {
    textAlign: 'center', padding: '80px 20px',
    color: '#5c6589',
};

const emptyIcon = {
    width: '72px', height: '72px', borderRadius: '20px',
    background: 'rgba(255,255,255,0.03)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto',
};

const gridStyle = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
};

const cardStyle = {
    background: '#141828',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
};

const thumbBox = {
    position: 'relative', height: '170px', background: '#0c0f1a', overflow: 'hidden',
};

const thumbVideo = {
    width: '100%', height: '100%', objectFit: 'cover',
    filter: 'brightness(0.6)',
};

const noThumb = {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.02)',
};

const playOverlay = {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.2)',
    opacity: 0,
    transition: 'opacity 0.2s ease',
};

const durationBadge = {
    position: 'absolute', bottom: '8px', right: '8px',
    background: 'rgba(0,0,0,0.7)', color: '#fff',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '11px', fontWeight: '600',
};

const cardBody = { padding: '16px' };

const cardTop = {
    display: 'flex', gap: '8px', marginBottom: '10px',
};

const roleBadge = {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px',
    color: '#818cf8', background: 'rgba(99,102,241,0.1)',
    padding: '3px 8px', borderRadius: '6px',
    textTransform: 'uppercase',
};

const diffBadge = (d) => ({
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px',
    padding: '3px 8px', borderRadius: '6px',
    textTransform: 'capitalize',
    color: d === 'hard' ? '#f43f5e' : d === 'easy' ? '#22c55e' : '#eab308',
    background: d === 'hard' ? 'rgba(244,63,94,0.1)' : d === 'easy' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
});

const cardTitle = {
    fontSize: '15px', fontWeight: '700', marginBottom: '6px',
    letterSpacing: '-0.01em',
};

const summaryText = {
    fontSize: '12px', color: '#5c6589', lineHeight: '1.5',
    marginBottom: '12px',
};

const metricsRow = {
    display: 'flex', gap: '16px', marginBottom: '12px',
    paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)',
};

const metricItem = {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: '#9ba4c2',
};

const cardFooter = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};

const dateText = {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#5c6589',
};

const reviewLink = {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', fontWeight: '600', color: '#818cf8',
};

export default InterviewsListPage;
