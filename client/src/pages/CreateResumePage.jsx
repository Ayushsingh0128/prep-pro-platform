// Path: client/src/pages/CreateResumePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateResumePage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [skills, setSkills] = useState('');
    const [education, setEducation] = useState([{ degree: '', institute: '', year: '' }]);
    const [experience, setExperience] = useState([{ role: '', company: '', duration: '', description: '' }]);

    // Handlers for dynamic arrays
    const addEducation = () => setEducation([...education, { degree: '', institute: '', year: '' }]);
    const addExperience = () => setExperience([...experience, { role: '', company: '', duration: '', description: '' }]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const resumeData = {
                title,
                skills: skills.split(',').map(s => s.trim()),
                education,
                experience
            };

            await axios.post('https://prep-pro-platform.onrender.com/api/resumes', resumeData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Log activity for the streak system
            await axios.post('https://prep-pro-platform.onrender.com/api/activities', 
                { type: 'resume_edit', points: 15 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate('/resumes');
        } catch (err) {
            alert('Error saving resume. Please check your connection.');
        }
    };

    return (
        <div style={containerStyle}>
            <div style={formWrapper}>
                <header style={{ marginBottom: '30px' }}>
                    <button onClick={() => navigate('/resumes')} style={backBtn}>← Back to List</button>
                    <h1 style={{ marginTop: '20px' }}>Build Your <span style={{ color: '#818cf8' }}>Resume</span></h1>
                </header>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info Section */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitle}>Basic Information</h3>
                        <input 
                            placeholder="Resume Title (e.g. Full Stack Developer)" 
                            style={inputStyle} 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                        <input 
                            placeholder="Skills (Comma separated: React, Node, Python)" 
                            style={inputStyle} 
                            value={skills} 
                            onChange={(e) => setSkills(e.target.value)} 
                            required 
                        />
                    </div>

                    {/* Education Section */}
                    <div style={sectionStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={sectionTitle}>Education</h3>
                            <button type="button" onClick={addEducation} style={addBtn}>+ Add</button>
                        </div>
                        {education.map((edu, index) => (
                            <div key={index} style={nestedGrid}>
                                <input placeholder="Degree" style={inputStyle} value={edu.degree} onChange={(e) => {
                                    const newEdu = [...education];
                                    newEdu[index].degree = e.target.value;
                                    setEducation(newEdu);
                                }} />
                                <input placeholder="Institute" style={inputStyle} value={edu.institute} onChange={(e) => {
                                    const newEdu = [...education];
                                    newEdu[index].institute = e.target.value;
                                    setEducation(newEdu);
                                }} />
                                <input placeholder="Year" style={inputStyle} value={edu.year} onChange={(e) => {
                                    const newEdu = [...education];
                                    newEdu[index].year = e.target.value;
                                    setEducation(newEdu);
                                }} />
                            </div>
                        ))}
                    </div>

                    {/* Experience Section */}
                    <div style={sectionStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={sectionTitle}>Work Experience</h3>
                            <button type="button" onClick={addExperience} style={addBtn}>+ Add</button>
                        </div>
                        {experience.map((exp, index) => (
                            <div key={index} style={{ marginBottom: '15px' }}>
                                <div style={nestedGrid}>
                                    <input placeholder="Role" style={inputStyle} value={exp.role} onChange={(e) => {
                                        const newExp = [...experience];
                                        newExp[index].role = e.target.value;
                                        setExperience(newExp);
                                    }} />
                                    <input placeholder="Company" style={inputStyle} value={exp.company} onChange={(e) => {
                                        const newExp = [...experience];
                                        newExp[index].company = e.target.value;
                                        setExperience(newExp);
                                    }} />
                                </div>
                                <textarea 
                                    placeholder="Description of your responsibilities..." 
                                    style={{ ...inputStyle, height: '80px', marginTop: '10px' }} 
                                    value={exp.description} 
                                    onChange={(e) => {
                                        const newExp = [...experience];
                                        newExp[index].description = e.target.value;
                                        setExperience(newExp);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={submitBtn}>Save Professional Profile</button>
                </form>
            </div>
        </div>
    );
};

// --- Professional Styles ---
const containerStyle = { minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '40px 20px', fontFamily: "'Inter', sans-serif" };
const formWrapper = { maxWidth: '800px', margin: '0 auto', background: '#1e293b', padding: '40px', borderRadius: '24px', border: '1px solid #334155' };
const sectionStyle = { marginBottom: '40px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid #334155' };
const sectionTitle = { fontSize: '18px', marginBottom: '20px', color: '#818cf8' };
const inputStyle = { width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', marginBottom: '10px', outline: 'none' };
const nestedGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '10px' };
const backBtn = { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' };
const addBtn = { background: '#334155', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' };
const submitBtn = { width: '100%', padding: '16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' };

export default CreateResumePage;