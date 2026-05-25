import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, CheckCircle2, ChevronRight, Sparkles, BookOpen, Target, Award, ArrowUpRight } from 'lucide-react';

const RoadmapPage = () => {
    const navigate = useNavigate();

    const roadmapSteps = [
        {
            title: 'Phase 1: Foundation & Skills',
            desc: 'Master the core technical concepts and system design fundamentals.',
            status: 'completed',
            icon: BookOpen,
            path: '/quizzes',
            tasks: ['Skill Quizzes', 'System Design Basics'],
            accent: '#22c55e'
        },
        {
            title: 'Phase 2: Personal Branding',
            desc: 'Optimize your professional profile and resume for ATS systems.',
            status: 'current',
            icon: Target,
            path: '/resume-analysis',
            tasks: ['AI Resume Analysis', 'Resume Builder'],
            accent: '#6366f1'
        },
        {
            title: 'Phase 3: Interview Mastery',
            desc: 'Polish your communication and technical problem-solving skills.',
            status: 'upcoming',
            icon: Sparkles,
            path: '/interview',
            tasks: ['Mock Interviews', 'Behavioral Prep'],
            accent: '#a855f7'
        },
        {
            title: 'Phase 4: Land Your Dream Job',
            desc: 'Navigate the final rounds and secure your professional future.',
            status: 'upcoming',
            icon: Award,
            path: '/dashboard',
            tasks: ['Negotiation', 'Success Hub'],
            accent: '#f43f5e'
        }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '50px', textAlign: 'center' }}>
                <div style={badgeStyle}>DYNAMIC CAREER PATH</div>
                <h1 style={{ fontSize: '36px', fontWeight: '800', marginTop: '12px' }}>Your AI Career Roadmap</h1>
                <p style={{ color: '#94a3b8', marginTop: '10px' }}>Interactive phases to guide your professional elevation.</p>
            </header>

            <div style={timelineContainer}>
                <div style={timelineLine}></div>
                
                {roadmapSteps.map((step, index) => (
                    <div 
                        key={index} 
                        style={{
                            ...stepWrapper,
                            opacity: step.status === 'upcoming' ? 0.7 : 1,
                        }}
                        onClick={() => navigate(step.path)}
                    >
                        <div style={stepPoint}>
                            <div style={{
                                ...iconWrapper,
                                background: step.status === 'completed' ? '#22c55e' : step.status === 'current' ? '#6366f1' : '#1e293b',
                                color: step.status === 'upcoming' ? '#64748b' : '#fff',
                                boxShadow: step.status === 'current' ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none'
                            }}>
                                <step.icon size={20} />
                            </div>
                        </div>

                        <div style={{
                            ...stepContent,
                            border: step.status === 'current' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                            background: step.status === 'current' ? 'rgba(99, 102, 241, 0.04)' : '#141828',
                            transform: step.status === 'current' ? 'scale(1.02)' : 'scale(1)'
                        }} className="roadmap-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    {step.status === 'completed' && <div style={statusLabelSuccess}><CheckCircle2 size={12} /> COMPLETED</div>}
                                    {step.status === 'current' && <div style={statusLabelActive}><Sparkles size={12} /> ACTIVE PHASE</div>}
                                    {step.status === 'upcoming' && <div style={statusLabelUpcoming}>UPCOMING</div>}
                                    
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#e8eaf6' }}>{step.title}</h3>
                                </div>
                                <ArrowUpRight size={18} color="#475569" />
                            </div>
                            
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>{step.desc}</p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {step.tasks.map((task, tIdx) => (
                                    <div key={tIdx} style={{
                                        ...taskChip,
                                        borderColor: step.status === 'current' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.08)'
                                    }}>{task}</div>
                                ))}
                            </div>

                            {step.status === 'current' && (
                                <button style={launchBtn}>
                                    Launch Feature <ChevronRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .roadmap-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .roadmap-card:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateX(10px);
                }
            `}</style>
        </div>
    );
};

// Styles
const badgeStyle = {
    display: 'inline-block',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#818cf8',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px'
};

const timelineContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    position: 'relative',
    paddingLeft: '60px'
};

const timelineLine = {
    position: 'absolute',
    left: '21px',
    top: '20px',
    bottom: '20px',
    width: '2px',
    background: 'linear-gradient(to bottom, #22c55e, #6366f1, #1e293b)'
};

const stepWrapper = {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
    position: 'relative'
};

const stepPoint = {
    position: 'absolute',
    left: '-60px',
    width: '44px',
    display: 'flex',
    justifyContent: 'center'
};

const iconWrapper = {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    border: '1px solid rgba(255, 255, 255, 0.1)'
};

const stepContent = {
    flex: 1,
    padding: '24px',
    borderRadius: '20px',
};

const statusLabelSuccess = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: '#22c55e', marginBottom: '8px' };
const statusLabelActive = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: '#818cf8', marginBottom: '8px' };
const statusLabelUpcoming = { fontSize: '10px', fontWeight: '700', color: '#475569', marginBottom: '8px' };

const taskChip = {
    padding: '4px 10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#94a3b8'
};

const launchBtn = {
    marginTop: '20px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
};

export default RoadmapPage;
