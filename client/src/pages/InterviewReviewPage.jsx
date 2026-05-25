import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Play, Pause, ArrowLeft, Clock, Mic,
    Eye, MessageSquare, Star, Video
} from 'lucide-react';

const InterviewReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeQ, setActiveQ] = useState(-1);
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`https://prep-pro-platform.onrender.com/api/interviews/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setInterview(res.data);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
    }, [id]);

    // Update current time for active question highlighting
    useEffect(() => {
        if (!interview?.questions) return;
        const q = interview.questions.findIndex(
            (q) => currentTime >= q.timestampStart && currentTime < (q.timestampEnd || 99999)
        );
        setActiveQ(q);
    }, [currentTime, interview]);

    // Get a safe duration value (WebM from MediaRecorder often has Infinity duration)
    const safeDuration = (duration && isFinite(duration) && duration > 0) 
        ? duration 
        : (interview?.duration || 60);

    const jumpToTimestamp = (seconds) => {
        if (videoRef.current && isFinite(seconds) && seconds >= 0) {
            try {
                videoRef.current.currentTime = seconds;
                videoRef.current.play();
                setIsPlaying(true);
            } catch (e) {
                console.log('Seek error:', e);
            }
        }
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getAiFeedback = () => {
        if (!interview?.aiFeedback) return null;
        try {
            return JSON.parse(interview.aiFeedback);
        } catch {
            return null;
        }
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#64748b' }}>
                    Loading interview...
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div style={pageStyle}>
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748b' }}>
                    <h3>Interview not found</h3>
                    <button style={backBtn} onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const feedback = getAiFeedback();

    return (
        <div style={pageStyle}>
            {/* Header */}
            <div style={headerBar}>
                <button style={backBtn} onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} /> Back
                </button>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                    <Video size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Interview Review — {interview.role}
                </h2>
                <div style={headerMeta}>
                    <span style={metaTag}>{new Date(interview.createdAt).toLocaleDateString()}</span>
                    <span style={metaTag}>{interview.overallScore}% Score</span>
                </div>
            </div>

            <div style={mainGrid}>
                {/* LEFT: Video Player */}
                <div style={leftCol}>
                    {interview.recordingPath ? (
                        <div style={videoContainer}>
                            <video
                                ref={videoRef}
                                src={`https://prep-pro-platform.onrender.com${interview.recordingPath}`}
                                style={videoStyle}
                                preload="metadata"
                                onTimeUpdate={() => {
                                    const t = videoRef.current?.currentTime || 0;
                                    if (isFinite(t)) setCurrentTime(t);
                                }}
                                onLoadedMetadata={() => {
                                    const d = videoRef.current?.duration;
                                    if (d && isFinite(d) && d > 0) {
                                        setDuration(d);
                                    } else {
                                        // WebM files often have Infinity duration, use saved value
                                        setDuration(interview.duration || 60);
                                    }
                                }}
                                onDurationChange={() => {
                                    const d = videoRef.current?.duration;
                                    if (d && isFinite(d) && d > 0) setDuration(d);
                                }}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                            
                            {/* Custom Controls */}
                            <div style={videoControls}>
                                <button style={playBtn} onClick={togglePlay}>
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <span style={timeLabel}>{formatTime(currentTime)}</span>
                                
                                {/* Progress Bar */}
                                <div style={progressBar} onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = (e.clientX - rect.left) / rect.width;
                                    const seekTo = pct * safeDuration;
                                    if (videoRef.current && isFinite(seekTo)) {
                                        try { videoRef.current.currentTime = seekTo; } catch(err) {}
                                    }
                                }}>
                                    {/* Question markers */}
                                    {interview.questions?.map((q, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            left: `${(q.timestampStart / safeDuration) * 100}%`,
                                            top: '-4px', width: '3px', height: '14px',
                                            background: '#818cf8', borderRadius: '2px',
                                            zIndex: 2
                                        }} />
                                    ))}
                                    <div style={{
                                        ...progressFill,
                                        width: `${(currentTime / safeDuration) * 100}%`
                                    }} />
                                </div>
                                
                                <span style={timeLabel}>{formatTime(safeDuration)}</span>
                            </div>
                        </div>
                    ) : (
                        <div style={noVideo}>
                            <Video size={40} style={{ opacity: 0.2 }} />
                            <p>No recording available for this interview</p>
                        </div>
                    )}

                    {/* Stats Row */}
                    <div style={statsRow}>
                        <div style={statItem}>
                            <Clock size={14} color="#06b6d4" />
                            <span>{formatTime(interview.duration || 0)}</span>
                        </div>
                        <div style={statItem}>
                            <Mic size={14} color="#818cf8" />
                            <span>{interview.fillerCount} fillers</span>
                        </div>
                        <div style={statItem}>
                            <Eye size={14} color="#10b981" />
                            <span>{interview.gazeScore}% gaze</span>
                        </div>
                        <div style={statItem}>
                            <Star size={14} color="#f59e0b" />
                            <span>{interview.overallScore}% score</span>
                        </div>
                    </div>

                    {/* AI Summary */}
                    {feedback?.summary && (
                        <div style={summaryBox}>
                            <MessageSquare size={16} color="#818cf8" />
                            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' }}>
                                {feedback.summary}
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: Question Timeline */}
                <div style={rightCol}>
                    <h3 style={sideTitle}>
                        <Clock size={14} /> Question Timeline
                    </h3>

                    <div style={timelineContainer}>
                        {interview.questions?.map((q, i) => (
                            <div
                                key={i}
                                style={{
                                    ...timelineItem,
                                    borderLeftColor: activeQ === i ? '#818cf8' : 'rgba(255,255,255,0.06)',
                                    background: activeQ === i ? 'rgba(99,102,241,0.06)' : 'transparent',
                                }}
                                onClick={() => jumpToTimestamp(q.timestampStart)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{
                                        fontSize: '10px', fontWeight: '700',
                                        color: q.type === 'behavioral' ? '#f59e0b' : '#818cf8',
                                        background: q.type === 'behavioral' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                                        padding: '2px 8px', borderRadius: '6px'
                                    }}>
                                        {q.type === 'behavioral' ? '💬 HR' : '⚡ Tech'} Q{i + 1}
                                    </span>
                                    <span style={timestampBadge}>
                                        <Play size={10} /> {formatTime(q.timestampStart)}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', lineHeight: '1.5' }}>
                                    {q.questionText}
                                </p>
                                {q.answerTranscript && (
                                    <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#64748b', lineHeight: '1.5', fontStyle: 'italic' }}>
                                        "{q.answerTranscript.substring(0, 100)}{q.answerTranscript.length > 100 ? '...' : ''}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============ STYLES ============
const pageStyle = { minHeight: '100vh', background: '#0c0f1a', color: '#f8fafc', padding: '0 0 60px' };

const headerBar = { display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 30px', background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const headerMeta = { marginLeft: 'auto', display: 'flex', gap: '8px' };
const metaTag = { fontSize: '11px', fontWeight: '600', color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: '8px' };

const mainGrid = { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', padding: '24px 30px', maxWidth: '1400px', margin: '0 auto' };
const leftCol = { display: 'flex', flexDirection: 'column', gap: '16px' };
const rightCol = { display: 'flex', flexDirection: 'column', gap: '12px' };

// Video
const videoContainer = { borderRadius: '20px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' };
const videoStyle = { width: '100%', display: 'block', maxHeight: '450px', objectFit: 'cover' };
const videoControls = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(15,23,42,0.9)' };
const playBtn = { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex' };
const timeLabel = { fontSize: '12px', fontWeight: '700', color: '#94a3b8', minWidth: '40px' };
const progressBar = { flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer', position: 'relative', overflow: 'visible' };
const progressFill = { height: '100%', background: '#818cf8', borderRadius: '6px', transition: 'width 0.1s' };
const noVideo = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', background: 'rgba(15,23,42,0.5)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', color: '#475569' };

// Stats
const statsRow = { display: 'flex', gap: '12px' };
const statItem = { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(15,23,42,0.5)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', fontWeight: '600' };
const summaryBox = { display: 'flex', gap: '12px', padding: '16px', background: 'rgba(99,102,241,0.04)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.1)' };

// Timeline
const sideTitle = { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0' };
const timelineContainer = { display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' };
const timelineItem = { padding: '14px 16px', borderRadius: '14px', borderLeft: '3px solid', cursor: 'pointer', transition: 'all 0.25s ease' };
const timestampBadge = { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: '6px' };

export default InterviewReviewPage;
