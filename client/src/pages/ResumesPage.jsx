import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Plus, Trash2, Calendar, Code2 } from 'lucide-react';

const ResumesPage = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://prep-pro-platform.onrender.com/api/resumes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch resumes", err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resume?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://prep-pro-platform.onrender.com/api/resumes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(resumes.filter(r => r._id !== id));
        } catch (err) {
            console.error("Failed to delete resume", err);
        }
    };

    if (loading) {
        return <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: '40px' }}>Loading resumes...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: '40px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>My <span style={{ color: '#818cf8' }}>Resumes</span></h1>
                        <p style={{ color: '#94a3b8', margin: 0 }}>Manage the resumes you've built and saved.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/resume-builder')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        <Plus size={18} /> Create New
                    </button>
                </div>

                {resumes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <FileText size={48} color="#64748b" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Resumes Found</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>You haven't saved any resumes yet.</p>
                        <button 
                            onClick={() => navigate('/resume-builder')}
                            style={{ background: 'transparent', color: '#818cf8', border: '1px solid #818cf8', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Start Building
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {resumes.map(resume => (
                            <div key={resume._id} style={{ background: '#0f172a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                <button 
                                    onClick={() => handleDelete(resume._id)}
                                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                    title="Delete Resume"
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                >
                                    <Trash2 size={16} />
                                </button>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', paddingRight: '30px' }}>{resume.title || 'Untitled Resume'}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                                            <Calendar size={12} /> {new Date(resume.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Code2 size={14} /> Skills Preview
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {resume.skills && resume.skills.slice(0, 4).map((skill, idx) => (
                                            <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#cbd5e1' }}>
                                                {skill}
                                            </span>
                                        ))}
                                        {resume.skills && resume.skills.length > 4 && (
                                            <span style={{ fontSize: '11px', color: '#64748b', padding: '4px' }}>+{resume.skills.length - 4} more</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                                    <button 
                                        onClick={() => navigate('/resume-builder', { state: { resume } })}
                                        style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                                    >
                                        Open Resume
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumesPage;