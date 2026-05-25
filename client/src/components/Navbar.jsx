import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, BrainCircuit, FileText, Search, ChevronDown, Mic, Home } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const [showResumeMenu, setShowResumeMenu] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (paths) => {
        if (Array.isArray(paths)) return paths.some(p => location.pathname.startsWith(p));
        return location.pathname === paths;
    };

    if (!user) {
        return (
            <nav style={navStyle}>
                <div style={logoBox} onClick={() => navigate('/')}>
                    <div style={logoIcon}>P</div>
                    <span style={logoText}>PrepPro</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button style={isActive('/') ? { ...linkBtn, ...linkActive } : linkBtn} onClick={() => navigate('/')}>
                        <Home size={15} /> Home
                    </button>
                    <button style={ghostBtn} onClick={() => navigate('/login')}>Log In</button>
                    <button style={ctaBtn} onClick={() => navigate('/signup')}>Get Started</button>
                </div>
            </nav>
        );
    }

    return (
        <nav style={navStyle}>
            {/* Logo */}
            <div style={logoBox} onClick={() => navigate('/')}>
                <div style={logoIcon}>P</div>
                <span style={logoText}>PrepPro</span>
            </div>

            {/* Center Nav Links */}
            <div style={navCenter}>
                <button 
                    style={isActive('/') ? { ...linkBtn, ...linkActive } : linkBtn}
                    onClick={() => navigate('/')}
                    title="Home"
                >
                    <Home size={15} /> Home
                </button>

                <button 
                    style={isActive('/dashboard') ? { ...linkBtn, ...linkActive } : linkBtn}
                    onClick={() => navigate('/dashboard')}
                >
                    <LayoutDashboard size={15} /> Dashboard
                </button>

                <button 
                    style={isActive(['/interview']) ? { ...linkBtn, ...linkActive } : linkBtn}
                    onClick={() => navigate('/interviews')}
                >
                    <Mic size={15} /> Interviews
                </button>

                <button 
                    style={isActive(['/quizzes', '/quiz']) ? { ...linkBtn, ...linkActive } : linkBtn}
                    onClick={() => navigate('/quizzes')}
                >
                    <BrainCircuit size={15} /> Quizzes
                </button>

                {/* Resume Dropdown */}
                <div 
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setShowResumeMenu(true)}
                    onMouseLeave={() => setShowResumeMenu(false)}
                >
                    <button 
                        style={isActive(['/resume']) ? { ...linkBtn, ...linkActive } : linkBtn}
                        onClick={() => setShowResumeMenu(prev => !prev)}
                    >
                        <FileText size={15} /> Resume <ChevronDown size={12} style={{ opacity: 0.5, transform: showResumeMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
                    </button>

                    {showResumeMenu && (
                        <div style={dropdownWrapper}>
                            <div style={dropdown}>
                                <button style={dropItem} onClick={() => { navigate('/resume-builder'); setShowResumeMenu(false); }}>
                                    <FileText size={14} color="#818cf8" />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '13px' }}>Resume Builder</div>
                                        <div style={{ fontSize: '11px', color: '#5c6589' }}>Build & download your resume</div>
                                    </div>
                                </button>
                                <button style={dropItem} onClick={() => { navigate('/resume-analysis'); setShowResumeMenu(false); }}>
                                    <Search size={14} color="#22c55e" />
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '13px' }}>Resume Analysis</div>
                                        <div style={{ fontSize: '11px', color: '#5c6589' }}>Get ATS score & feedback</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={profileChip}>
                    <div style={avatar}>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{user.name}</span>
                </div>
                <button style={logoutBtn} onClick={handleLogout} title="Sign Out">
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
};

// ============ STYLES ============
const navStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 32px', height: '56px',
    background: 'rgba(12, 15, 26, 0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky', top: 0, zIndex: 1000,
};

const logoBox = {
    display: 'flex', alignItems: 'center', gap: '10px',
    cursor: 'pointer',
};

const logoIcon = {
    width: '30px', height: '30px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '15px', fontWeight: '900', color: '#fff',
};

const logoText = {
    fontSize: '18px', fontWeight: '800', color: '#e8eaf6',
    letterSpacing: '-0.03em',
};

const navCenter = {
    display: 'flex', alignItems: 'center', gap: '2px',
};

const linkBtn = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'transparent', border: 'none',
    color: '#9ba4c2', padding: '7px 14px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '500',
    transition: 'all 0.15s ease',
};

const linkActive = {
    color: '#e8eaf6', background: 'rgba(99,102,241,0.1)',
    fontWeight: '600',
};

const dropdownWrapper = {
    position: 'absolute', top: '100%', left: '50%',
    transform: 'translateX(-50%)',
    paddingTop: '6px', // This invisible bridge prevents mouseLeave
};

const dropdown = {
    width: '240px', padding: '6px',
    background: '#1a1f35',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
};

const dropItem = {
    display: 'flex', alignItems: 'center', gap: '12px',
    width: '100%', padding: '10px 12px',
    background: 'transparent', border: 'none',
    color: '#e8eaf6', borderRadius: '10px', textAlign: 'left',
};

const profileChip = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '4px 12px 4px 4px', borderRadius: '20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
};

const avatar = {
    width: '26px', height: '26px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', color: '#fff',
};

const logoutBtn = {
    background: 'transparent', border: 'none', 
    color: '#5c6589', padding: '6px',
    borderRadius: '8px',
};

const ghostBtn = {
    background: 'transparent', border: 'none',
    color: '#9ba4c2', fontWeight: '600', fontSize: '14px',
    padding: '8px 16px',
};

const ctaBtn = {
    background: '#6366f1', color: '#fff', border: 'none',
    padding: '8px 20px', borderRadius: '10px',
    fontWeight: '600', fontSize: '14px',
};

export default Navbar;