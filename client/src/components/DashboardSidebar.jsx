import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  Search, 
  Mic, 
  BrainCircuit, 
  Map, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const DashboardSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    const menuGroups = [
        {
            label: 'OVERVIEW',
            items: [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { name: 'Progress', icon: TrendingUp, path: '/progress' },
            ]
        },
        {
            label: 'RESUME TOOLS',
            items: [
                { name: 'Resume Builder', icon: FileText, path: '/resume-builder' },
                { name: 'Resume Analyzer', icon: Search, path: '/resume-analysis' },
            ]
        },
        {
            label: 'CAREER PREP',
            items: [
                { name: 'Mock Interview', icon: Mic, path: '/interviews' },
                { name: 'Skill Quizzes', icon: BrainCircuit, path: '/quizzes' },
                { name: 'Career Roadmap', icon: Map, path: '/roadmap' },
            ]
        }
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="no-print" style={{
            ...sidebarContainer,
            width: isCollapsed ? '80px' : '260px',
        }}>
            {/* Header / Logo */}
            <div style={sidebarHeader}>
                {!isCollapsed && (
                    <div style={logoBox} onClick={() => navigate('/')}>
                        <div style={logoIcon}>P</div>
                        <span style={logoText}>PrepPro</span>
                    </div>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)} style={toggleBtn}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Menu Groups */}
            <div style={menuSection}>
                {menuGroups.map((group, gIdx) => (
                    <div key={gIdx} style={groupContainer}>
                        {!isCollapsed && <div style={groupLabel}>{group.label}</div>}
                        <div style={groupItems}>
                            {group.items.map((item, iIdx) => (
                                <button 
                                    key={iIdx}
                                    style={{
                                        ...menuItem,
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        background: isActive(item.path) ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                                        color: isActive(item.path) ? '#818cf8' : '#94a3b8',
                                        boxShadow: isActive(item.path) ? 'inset 0 0 10px rgba(99, 102, 241, 0.05)' : 'none',
                                        borderLeft: isActive(item.path) ? '3px solid #6366f1' : '3px solid transparent',
                                    }}
                                    onClick={() => navigate(item.path)}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <item.icon size={20} style={{ minWidth: '20px' }} />
                                    {!isCollapsed && <span>{item.name}</span>}
                                    {!isCollapsed && isActive(item.path) && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / AI Powered Tag */}
            <div style={sidebarFooter}>
                <div style={{
                    ...aiCard,
                    display: isCollapsed ? 'none' : 'block'
                }}>
                    <div style={aiTitle}><Sparkles size={12} /> AI Powered</div>
                    <div style={aiDesc}>Your personalized career coach, powered by advanced AI.</div>
                </div>

                <button style={logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

// Styles
const sidebarContainer = {
    height: '100vh',
    background: '#0c0f1a',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    overflow: 'hidden',
};

const sidebarHeader = {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
};

const logoBox = { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' };
const logoIcon = {
    width: '32px', height: '32px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '900', color: '#fff',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
};
const logoText = { fontSize: '19px', fontWeight: '800', color: '#e8eaf6', letterSpacing: '-0.02em' };

const toggleBtn = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    width: '32px', height: '32px',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer'
};

const menuSection = { flex: 1, padding: '0 12px', overflowY: 'auto' };
const groupContainer = { marginBottom: '24px' };
const groupLabel = {
    fontSize: '10px', fontWeight: '700', color: '#475569',
    letterSpacing: '1.5px', padding: '0 12px', marginBottom: '12px'
};
const groupItems = { display: 'flex', flexDirection: 'column', gap: '4px' };

const menuItem = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 12px', borderRadius: '10px',
    border: 'none', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500',
    transition: 'all 0.2s ease',
    width: '100%',
    textAlign: 'left'
};

const sidebarFooter = { padding: '20px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' };
const aiCard = {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
    padding: '14px', borderRadius: '12px',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    marginBottom: '16px'
};
const aiTitle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#818cf8', marginBottom: '6px' };
const aiDesc = { fontSize: '11px', color: '#64748b', lineHeight: '1.4' };

const logoutBtn = {
    display: 'flex', alignItems: 'center', gap: '12px',
    width: '100%', padding: '10px 12px',
    background: 'transparent', border: 'none',
    color: '#f43f5e', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
};

export default DashboardSidebar;
