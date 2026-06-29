// Path: client/src/pages/ResumeBuilderPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Download, Plus, Trash2, Save, ChevronDown, ChevronUp,
    User, Briefcase, GraduationCap, Award, Code2, FolderGit2,
    Link2, Mail, Phone, MapPin, GitBranch, Globe,
    CheckCircle2, Loader2
} from 'lucide-react';

const ResumeBuilderPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
    const [openSections, setOpenSections] = useState({ personal: true, summary: true, experience: true, projects: true, education: true, skills: true, certifications: true });

    // Initialize with location state if we are editing an existing resume
    const editingResume = location.state?.resume;

    const [data, setData] = useState(() => {
        if (editingResume) {
            if (editingResume.rawData) {
                const raw = { ...editingResume.rawData };
                // Migration: Ensure projects have bullets (for older resumes)
                if (raw.projects) {
                    raw.projects = raw.projects.map(p => ({
                        ...p,
                        bullets: p.bullets || (p.desc ? p.desc.split('\n') : [''])
                    }));
                }
                // Migration: Ensure experience has bullets
                if (raw.experience) {
                    raw.experience = raw.experience.map(e => ({
                        ...e,
                        bullets: e.bullets || (e.description ? e.description.split('\n') : [''])
                    }));
                }
                return raw;
            }
            // Fallback for older resumes without rawData
            return {
                name: '', role: editingResume.title || '', email: '', phone: '', location: '',
                linkedin: '', github: '', leetcode: '', portfolio: '',
                summary: '',
                skills: { frontend: (editingResume.skills || []).join(', '), backend: '', tools: '', soft: '' },
                experience: editingResume.experience && editingResume.experience.length > 0
                    ? editingResume.experience.map(e => ({
                        company: e.company || '', role: e.role || '', duration: e.duration || '',
                        bullets: e.description ? e.description.split('\n') : ['']
                    }))
                    : [{ company: '', role: '', duration: '', bullets: [''] }],
                projects: editingResume.projects && editingResume.projects.length > 0
                    ? editingResume.projects.map(p => ({
                        title: p.title || '', tech: (p.tech || []).join(', '), github: '', live: '', 
                        bullets: p.description ? p.description.split('\n') : ['']
                    }))
                    : [{ title: '', tech: '', github: '', live: '', bullets: [''] }],
                education: editingResume.education && editingResume.education.length > 0
                    ? editingResume.education.map(e => ({
                        degree: e.degree || '', institute: e.institute || '', year: e.year || '', gpa: ''
                    }))
                    : [{ degree: '', institute: '', year: '', gpa: '' }],
                certifications: [{ title: '', issuer: '', year: '' }],
                languages: ''
            };
        }
        return {
            name: '', role: '', email: '', phone: '', location: '',
            linkedin: '', github: '', leetcode: '', portfolio: '',
            summary: '',
            skills: { frontend: '', backend: '', tools: '', soft: '' },
            experience: [{ company: '', role: '', duration: '', bullets: [''] }],
            projects: [{ title: '', tech: '', github: '', live: '', bullets: [''] }],
            education: [{ degree: '', institute: '', year: '', gpa: '' }],
            certifications: [{ title: '', issuer: '', year: '' }],
            languages: ''
        };
    });

    // --- HANDLERS ---
    const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }));
    const handleChange = (field, value) => setData(p => ({ ...p, [field]: value }));
    const handleSkillChange = (cat, value) => setData(p => ({ ...p, skills: { ...p.skills, [cat]: value } }));

    const handleListChange = (section, index, field, value) => {
        const updated = [...data[section]];
        updated[index][field] = value;
        setData({ ...data, [section]: updated });
    };
    const addItem = (section, template) => setData({ ...data, [section]: [...data[section], template] });
    const removeItem = (section, index) => {
        if (data[section].length <= 1) return;
        setData({ ...data, [section]: data[section].filter((_, i) => i !== index) });
    };

    // Generic bullet handlers for Experience and Projects
    const handleBulletChange = (section, itemIdx, bulletIdx, value) => {
        const updated = [...data[section]];
        updated[itemIdx].bullets[bulletIdx] = value;
        setData({...data, [section]: updated});
    };
    const addBullet = (section, itemIdx) => {
        const updated = [...data[section]];
        updated[itemIdx].bullets.push('');
        setData({...data, [section]: updated});
    };
    const removeBullet = (section, itemIdx, bulletIdx) => {
        const updated = [...data[section]];
        if (updated[itemIdx].bullets.length <= 1) return;
        updated[itemIdx].bullets = updated[itemIdx].bullets.filter((_, i) => i !== bulletIdx);
        setData({...data, [section]: updated});
    };

    // Save to database
    const saveResume = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to save your resume.');
            return;
        }

        setSaveStatus('saving');
        try {
            const resumePayload = {
                title: data.role || 'Untitled Resume',
                education: data.education,
                experience: data.experience.map(e => ({
                    role: e.role, company: e.company, duration: e.duration,
                    description: e.bullets.join('\n')
                })),
                skills: getAllSkills(),
                projects: data.projects.map(p => ({
                    title: p.title, description: p.bullets.join('\n'), tech: p.tech.split(',').map(s => s.trim())
                })),
                rawData: data
            };

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const API_URL = 'https://prep-pro-platform.onrender.com/api/resumes';

            if (editingResume && editingResume._id) {
                await axios.put(`${API_URL}/${editingResume._id}`, resumePayload, config);
            } else {
                await axios.post(API_URL, resumePayload, config);
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error('Save error details:', err.response?.data || err);
            const errMsg = err.response?.data?.message || err.message;
            alert(`Error saving resume: ${errMsg}`);
            setSaveStatus('idle');
        }
    };

    const getAllSkills = () => {
        return Object.values(data.skills).join(', ').split(',').map(s => s.trim()).filter(Boolean);
    };

    const handlePrint = () => window.print();


    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#fff' }}>


            {/* ACTION BAR */}
            <div className="no-print" style={actionBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Resume <span style={{ color: '#818cf8' }}>Builder</span></h2>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {saveStatus === 'saved' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34d399', fontSize: '12px', fontWeight: '600' }}>
                            <CheckCircle2 size={14} /> Saved Successfully
                        </span>
                    )}
                    <button style={saveBtnStyle} onClick={saveResume} disabled={saveStatus === 'saving'}>
                        {saveStatus === 'saving' ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                        {saveStatus === 'saving' ? 'Saving...' : 'Save Resume'}
                    </button>
                    <button style={downloadBtnStyle} onClick={handlePrint}>
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            <div style={layout}>
                {/* === LEFT: EDITOR === */}
                <aside className="no-print" style={sidebar}>
                    {/* Personal Info */}
                    <SectionAccordion openSections={openSections} toggleSection={toggleSection} id="personal" icon={User} title="Personal Info" color="#818cf8">
                        <div style={gridTwo}>
                            <StyledInput placeholder="Full Name" value={data.name} onChange={v => handleChange('name', v)} />
                            <StyledInput placeholder="Target Role (e.g. Full Stack Dev)" value={data.role} onChange={v => handleChange('role', v)} />
                        </div>
                        <div style={gridTwo}>
                            <StyledInput placeholder="Email" value={data.email} onChange={v => handleChange('email', v)} icon={<Mail size={13} />} />
                            <StyledInput placeholder="Phone" value={data.phone} onChange={v => handleChange('phone', v)} icon={<Phone size={13} />} />
                        </div>
                        <StyledInput placeholder="Location (e.g. Bhopal, India)" value={data.location} onChange={v => handleChange('location', v)} icon={<MapPin size={13} />} />
                        <div style={gridTwo}>
                            <StyledInput placeholder="LinkedIn URL" value={data.linkedin} onChange={v => handleChange('linkedin', v)} icon={<Link2 size={13} />} />
                            <StyledInput placeholder="GitHub URL" value={data.github} onChange={v => handleChange('github', v)} icon={<GitBranch size={13} />} />
                        </div>
                        <div style={gridTwo}>
                            <StyledInput placeholder="LeetCode URL" value={data.leetcode} onChange={v => handleChange('leetcode', v)} icon={<Code2 size={13} />} />
                            <StyledInput placeholder="Portfolio URL (optional)" value={data.portfolio} onChange={v => handleChange('portfolio', v)} icon={<Globe size={13} />} />
                        </div>
                    </SectionAccordion>

                    {/* Summary */}
                    <SectionAccordion openSections={openSections} toggleSection={toggleSection} id="summary" icon={Code2} title="Professional Summary" color="#34d399">
                        <textarea
                            style={{ ...inputBase, height: '90px', resize: 'vertical' }}
                            placeholder="Write a compelling 2-3 line summary about yourself..."
                            value={data.summary}
                            onChange={e => handleChange('summary', e.target.value)}
                        />
                        <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                            {data.summary.length}/300 characters
                        </div>
                    </SectionAccordion>

                    {/* Education */}
                    <SectionAccordion openSections={openSections} toggleSection={toggleSection} id="education" icon={GraduationCap} title="Education" color="#06b6d4">
                        {data.education.map((edu, i) => (
                            <div key={i} style={itemCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>EDUCATION {i + 1}</span>
                                    <Trash2 size={13} color="#ef4444" cursor="pointer" onClick={() => removeItem('education', i)} />
                                </div>
                                <div style={gridTwo}>
                                    <StyledInput placeholder="Degree (B.Tech CS)" value={edu.degree} onChange={v => handleListChange('education', i, 'degree', v)} />
                                    <StyledInput placeholder="Institute" value={edu.institute} onChange={v => handleListChange('education', i, 'institute', v)} />
                                </div>
                                <div style={gridTwo}>
                                    <StyledInput placeholder="Year (2022-2026)" value={edu.year} onChange={v => handleListChange('education', i, 'year', v)} />
                                    <StyledInput placeholder="GPA (optional)" value={edu.gpa} onChange={v => handleListChange('education', i, 'gpa', v)} />
                                </div>
                            </div>
                        ))}
                        <button style={addItemBtn} onClick={() => addItem('education', { degree: '', institute: '', year: '', gpa: '' })}>
                            <Plus size={14} /> Add Education
                        </button>
                    </SectionAccordion>

                    {/* Skills */}
                    <SectionAccordion openSections={openSections} toggleSection={toggleSection} id="skills" icon={Code2} title="Technical Skills" color="#8b5cf6">
                        <StyledInput placeholder="Frontend (React, HTML, CSS, JS...)" value={data.skills.frontend} onChange={v => handleSkillChange('frontend', v)} />
                        <StyledInput placeholder="Backend (Node, Express, Python...)" value={data.skills.backend} onChange={v => handleSkillChange('backend', v)} />
                        <StyledInput placeholder="Tools (Git, Docker, VS Code...)" value={data.skills.tools} onChange={v => handleSkillChange('tools', v)} />
                        <StyledInput placeholder="Core Concepts (DSA, OS, DBMS...)" value={data.skills.soft} onChange={v => handleSkillChange('soft', v)} />
                    </SectionAccordion>

                    {/* Experience */}
                    <SectionAccordion openSections={openSections} toggleSection={toggleSection} id="experience" icon={Briefcase} title="Work Experience" color="#f59e0b">
                        {data.experience.map((exp, i) => (
                            <div key={i} style={itemCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>EXPERIENCE {i + 1}</span>
                                    <Trash2 size={13} color="#ef4444" cursor="pointer" onClick={() => removeItem('experience', i)} />
                                </div>
                                <div style={gridTwo}>
                                    <StyledInput placeholder="Company" value={exp.company} onChange={v => handleListChange('experience', i, 'company', v)} />
                                    <StyledInput placeholder="Role / Title" value={exp.role} onChange={v => handleListChange('experience', i, 'role', v)} />
                                </div>
                                <StyledInput placeholder="Duration (e.g. Jan 2025 - Present)" value={exp.duration} onChange={v => handleListChange('experience', i, 'duration', v)} />
                                <div style={{ marginTop: '8px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Bullet Points</span>
                                    {exp.bullets.map((bullet, bi) => (
                                        <div key={bi} style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                            <span style={{ color: '#6366f1', marginTop: '10px', fontSize: '10px' }}>•</span>
                                            <input
                                                style={{...inputBase,flex:1}}
                                                placeholder="Describe an achievement..."
                                                value={bullet}
                                                onChange={e => handleBulletChange('experience', i, bi, e.target.value)}
                                            />
                                            <Trash2 size={12} color="#ef4444" cursor="pointer" style={{marginTop:'10px'}} onClick={() => removeBullet('experience', i, bi)} />
                                        </div>
                                    ))}
                                    <button style={addSmallBtn} onClick={() => addBullet('experience', i)}>+ Add Bullet</button>
                                </div>
                            </div>
                        ))}
                        <button style={addItemBtn} onClick={() => addItem('experience', { company: '', role: '', duration: '', bullets: [''] })}>
                            <Plus size={14} /> Add Experience
                        </button>
                    </SectionAccordion>

                    {/* Projects */}
                    <SectionAccordion openSections={openSections} toggleSection={toggleSection} id="projects" icon={FolderGit2} title="Projects" color="#ec4899">
                        {data.projects.map((proj, i) => (
                            <div key={i} style={itemCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>PROJECT {i + 1}</span>
                                    <Trash2 size={13} color="#ef4444" cursor="pointer" onClick={() => removeItem('projects', i)} />
                                </div>
                                <div style={gridTwo}>
                                    <StyledInput placeholder="Project Title" value={proj.title} onChange={v => handleListChange('projects', i, 'title', v)} />
                                    <StyledInput placeholder="Tech Stack (React, Node...)" value={proj.tech} onChange={v => handleListChange('projects', i, 'tech', v)} />
                                </div>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'8px'}}>
                                    <StyledInput placeholder="GitHub Link" value={proj.github} onChange={v => handleListChange('projects', i, 'github', v)} />
                                    <StyledInput placeholder="Live Demo URL" value={proj.live} onChange={v => handleListChange('projects', i, 'live', v)} />
                                </div>
                                <div style={{marginTop:'8px'}}>
                                    <span style={{fontSize:'11px',color:'#64748b',fontWeight:'600'}}>Project Highlights</span>
                                    {proj.bullets.map((bullet, bi) => (
                                        <div key={bi} style={{display:'flex',gap:'6px',marginTop:'6px'}}>
                                            <span style={{color:'#ec4899',marginTop:'10px',fontSize:'10px'}}>•</span>
                                            <input
                                                style={{...inputBase,flex:1}}
                                                placeholder="What did you build/achieve?"
                                                value={bullet}
                                                onChange={e => handleBulletChange('projects', i, bi, e.target.value)}
                                            />
                                            <Trash2 size={12} color="#ef4444" cursor="pointer" style={{marginTop:'10px'}} onClick={() => removeBullet('projects', i, bi)} />
                                        </div>
                                    ))}
                                    <button style={addSmallBtn} onClick={() => addBullet('projects', i)}>+ Add Point</button>
                                </div>
                            </div>
                        ))}
                        <button style={addItemBtn} onClick={() => addItem('projects', {title:'',tech:'',github:'',live:'',bullets:['']})}>
                            <Plus size={14} /> Add Project
                        </button>
                    </SectionAccordion>

                    {/* Certifications */}
                    <SectionAccordion openSections={openSections} toggleSection={toggleSection} id="certifications" icon={Award} title="Certifications" color="#f97316">
                        {data.certifications.map((cert, i) => (
                            <div key={i} style={itemCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>CERT {i + 1}</span>
                                    <Trash2 size={13} color="#ef4444" cursor="pointer" onClick={() => removeItem('certifications', i)} />
                                </div>
                                <StyledInput placeholder="Certification Title" value={cert.title} onChange={v => handleListChange('certifications', i, 'title', v)} />
                                <div style={gridTwo}>
                                    <StyledInput placeholder="Issuer (Google, AWS...)" value={cert.issuer} onChange={v => handleListChange('certifications', i, 'issuer', v)} />
                                    <StyledInput placeholder="Year" value={cert.year} onChange={v => handleListChange('certifications', i, 'year', v)} />
                                </div>
                            </div>
                        ))}
                        <button style={addItemBtn} onClick={() => addItem('certifications', { title: '', issuer: '', year: '' })}>
                            <Plus size={14} /> Add Certification
                        </button>
                    </SectionAccordion>
                </aside>

                {/* === RIGHT: LIVE A4 PREVIEW === */}
                <main style={previewArea}>
                    <div id="resume-root" className="print-area" style={paper}>
                        {/* HEADER */}
                        <header style={pHeader}>
                            <h1 style={pName}>{data.name || 'Your Name'}</h1>
                            <p style={pRole}>{data.role || 'Your Target Role'}</p>
                            <div style={pContactRow}>
                                {data.email && <span style={pContactItem}><Mail size={10} style={{marginRight: '3px'}} />{data.email}</span>}
                                {data.phone && <span style={pContactItem}> • <Phone size={10} style={{marginRight: '3px', marginLeft: '3px'}} />{data.phone}</span>}
                                {data.location && <span style={pContactItem}> • <MapPin size={10} style={{marginRight: '3px', marginLeft: '3px'}} />{data.location}</span>}
                            </div>
                            <div style={{ ...pContactRow, marginTop: '2px', gap: '12px', justifyContent: 'flex-start' }}>
                                {(data.linkedin || data.github || data.leetcode || data.portfolio) && <Link2 size={10} style={{ color: '#475569' }} />}
                                {data.linkedin && <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noopener noreferrer" style={pLink}>LinkedIn</a>}
                                {data.github && <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`} target="_blank" rel="noopener noreferrer" style={pLink}>GitHub</a>}
                                {data.leetcode && <a href={data.leetcode.startsWith('http') ? data.leetcode : `https://${data.leetcode}`} target="_blank" rel="noopener noreferrer" style={pLink}>LeetCode</a>}
                                {data.portfolio && <a href={data.portfolio.startsWith('http') ? data.portfolio : `https://${data.portfolio}`} target="_blank" rel="noopener noreferrer" style={pLink}>Portfolio</a>}
                            </div>
                        </header>

                        {/* SUMMARY */}
                        {data.summary && (
                            <PreviewSection title="PROFESSIONAL SUMMARY">
                                <p style={pText}>{data.summary}</p>
                            </PreviewSection>
                        )}

                        {/* EDUCATION */}
                        {data.education.some(e => e.degree || e.institute) && (
                            <PreviewSection title="EDUCATION">
                                {data.education.filter(e => e.degree || e.institute).map((edu, i) => (
                                    <div key={i} style={{ ...pFlexBetween, marginBottom: '4px' }}>
                                        <div>
                                            <b style={{ fontSize: '13px', color: '#0f172a' }}>{edu.institute}</b>
                                            <div style={{ fontSize: '12px', color: '#475569' }}>{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>{edu.year}</span>
                                    </div>
                                ))}
                            </PreviewSection>
                        )}

                        {/* SKILLS */}
                        {Object.values(data.skills).some(s => s.trim()) && (
                            <PreviewSection title="TECHNICAL SKILLS">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {data.skills.frontend && <div style={skillRow}><b style={skillLabel}>Frontend:</b> {data.skills.frontend}</div>}
                                    {data.skills.backend && <div style={skillRow}><b style={skillLabel}>Backend:</b> {data.skills.backend}</div>}
                                    {data.skills.tools && <div style={skillRow}><b style={skillLabel}>Tools:</b> {data.skills.tools}</div>}
                                    {data.skills.soft && <div style={skillRow}><b style={skillLabel}>Core Concepts:</b> {data.skills.soft}</div>}
                                </div>
                            </PreviewSection>
                        )}

                        {/* EXPERIENCE */}
                        {data.experience.some(e => e.company || e.role) && (
                            <PreviewSection title="WORK EXPERIENCE">
                                {data.experience.filter(e => e.company || e.role).map((exp, i) => (
                                    <div key={i} style={{ marginBottom: '8px' }}>
                                        <div style={pFlexBetween}>
                                            <b style={{ fontSize: '13px', color: '#0f172a' }}>{exp.company}</b>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>{exp.duration}</span>
                                        </div>
                                        <div style={{ color: '#6366f1', fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>{exp.role}</div>
                                        <ul style={{ margin: 0, paddingLeft: '14px' }}>
                                            {exp.bullets.filter(b => b.trim()).map((b, bi) => (
                                                <li key={bi} style={pText}>{b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </PreviewSection>
                        )}

                        {/* PROJECTS */}
                        {data.projects.some(p => p.title) && (
                            <PreviewSection title="PROJECTS">
                                {data.projects.filter(p => p.title).map((proj, i) => (
                                    <div key={i} style={{ marginBottom: '8px' }}>
                                        <div style={pFlexBetween}>
                                            <b style={{ fontSize: '13px', color: '#0f172a' }}>{proj.title}</b>
                                            <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                                                {proj.github && (
                                                    <a href={proj.github.startsWith('http') ? proj.github : `https://${proj.github}`} target="_blank" rel="noopener noreferrer" style={pLink}>GitHub</a>
                                                )}
                                                {proj.github && proj.live && <span style={{ color: '#94a3b8' }}>|</span>}
                                                {proj.live && (
                                                    <a href={proj.live.startsWith('http') ? proj.live : `https://${proj.live}`} target="_blank" rel="noopener noreferrer" style={pLink}>Live Demo</a>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{fontSize:'11px',fontStyle:'italic',color:'#6366f1',marginBottom:'1px'}}>Tech: {proj.tech}</div>
                                        <ul style={{margin:0,paddingLeft:'14px'}}>
                                            {proj.bullets.filter(line => line.trim()).map((line, li) => (
                                                <li key={li} style={pText}>{line.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </PreviewSection>
                        )}

                        {/* CERTIFICATIONS */}
                        {data.certifications.some(c => c.title) && (
                            <PreviewSection title="CERTIFICATIONS">
                                {data.certifications.filter(c => c.title).map((cert, i) => (
                                    <div key={i} style={{ ...pFlexBetween, marginBottom: '2px' }}>
                                        <span style={{ fontSize: '12px' }}><b>{cert.title}</b> — {cert.issuer}</span>
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>{cert.year}</span>
                                    </div>
                                ))}
                            </PreviewSection>
                        )}
                    </div>
                </main>
            </div>

            {/* PRINT CSS */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body { 
                        height: 297mm; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        overflow: hidden;
                    }
                    .no-print { display: none !important; }
                    .print-area {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important; 
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 35px 45px !important;
                        box-shadow: none !important;
                        background: white !important;
                        color: #1e293b !important;
                        z-index: 9999;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                    }
                }
            `}</style>
        </div>
    );
};

// --- SECTION ACCORDION ---
const SectionAccordion = ({ id, icon: Icon, title, children, color = '#6366f1', openSections, toggleSection }) => (
    <div style={accordionBox}>
        <div style={accordionHeader} onClick={() => toggleSection(id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...accordionIconBox, background: `${color}15`, color }}><Icon size={16} /></div>
                <span style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
            </div>
            {openSections[id] ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {openSections[id] && <div style={accordionBody}>{children}</div>}
    </div>
);

// --- Reusable Input Component ---
const StyledInput = ({ placeholder, value, onChange, icon }) => (
    <div style={{ position: 'relative', marginBottom: '8px' }}>
        {icon && <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>{icon}</div>}
        <input
            style={{ ...inputBase, paddingLeft: icon ? '32px' : '12px' }}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

// --- Preview Section Component ---
const PreviewSection = ({ title, children }) => (
    <div style={{ marginTop: '10px' }}>
        <h5 style={pSectionTitle}>{title}</h5>
        {children}
    </div>
);

// ===========================================
//                 STYLES
// ===========================================

const layout = { display: 'grid', gridTemplateColumns: '420px 1fr', height: 'calc(100vh - 130px)' };

const sidebar = { background: '#0f172a', padding: '20px', overflowY: 'auto', borderRight: '1px solid #1e293b' };
const previewArea = { background: '#1e293b', padding: '30px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' };

const actionBar = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 30px',
    background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #1e293b'
};

const saveBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(52,211,153,0.1)', color: '#34d399',
    border: '1px solid rgba(52,211,153,0.3)',
    padding: '8px 16px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '12px', fontWeight: '700'
};
const downloadBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: '#6366f1', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '12px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
};

const inputBase = {
    width: '100%', background: '#1e293b', border: '1px solid #334155',
    padding: '9px 12px', borderRadius: '8px', color: '#fff',
    fontSize: '13px', outline: 'none'
};

const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };

const accordionBox = {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '16px', border: '1px solid #1e293b',
    marginBottom: '12px', overflow: 'hidden'
};
const accordionHeader = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', cursor: 'pointer',
    background: 'rgba(255,255,255,0.02)'
};
const accordionIconBox = {
    width: '30px', height: '30px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const accordionBody = { padding: '12px 16px 16px' };

const itemCard = {
    background: 'rgba(255,255,255,0.02)', padding: '14px',
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)',
    marginBottom: '10px'
};

const addItemBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    width: '100%', padding: '10px', marginTop: '8px',
    background: 'rgba(99,102,241,0.05)', color: '#818cf8',
    border: '1px dashed rgba(99,102,241,0.3)',
    borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
};

const addSmallBtn = {
    background: 'transparent', border: 'none', color: '#818cf8',
    cursor: 'pointer', fontSize: '11px', fontWeight: '600', marginTop: '6px', padding: '2px 0'
};

// Paper (A4 Preview) Styles
const paper = {
    width: '210mm', minHeight: '297mm',
    background: '#fff', padding: '35px 45px',
    color: '#334155', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif",
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    borderRadius: '4px'
};

const pHeader = { textAlign: 'left', borderBottom: '2px solid #1e293b', paddingBottom: '8px', marginBottom: '10px' };
const pName = { margin: 0, color: '#0f172a', fontSize: '24px', letterSpacing: '-0.5px', fontWeight: '800', lineHeight: '1.1' };
const pRole = { color: '#2563eb', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '2px', marginBottom: '2px' };
const pContactRow = { fontSize: '10px', color: '#475569', marginTop: '2px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '4px', flexWrap: 'wrap' };
const pContactItem = { display: 'flex', alignItems: 'center' };
const pLink = { color: '#2563eb', textDecoration: 'underline', fontWeight: '600', fontSize: '10px' };

const pSectionTitle = {
    fontSize: '11px', color: '#0f172a', fontWeight: '800',
    borderBottom: '1.5px solid #cbd5e1', paddingBottom: '3px',
    marginBottom: '6px', letterSpacing: '0.8px', textTransform: 'uppercase'
};
const pText = { fontSize: '11px', lineHeight: '1.45', margin: '0 0 2.5px 0', color: '#334155' };
const pFlexBetween = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const skillRow = { fontSize: '11px', lineHeight: '1.5', color: '#334155' };
const skillLabel = { color: '#0f172a', fontSize: '11px' };

export default ResumeBuilderPage;
