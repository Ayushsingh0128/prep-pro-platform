import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { Search, Bell, User, FileText, Mic, BrainCircuit, Map, TrendingUp, History, LayoutDashboard } from 'lucide-react';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    const routes = [
        { name: 'Resume Builder', path: '/resume-builder', icon: FileText },
        { name: 'Resume Analysis', path: '/resume-analysis', icon: Search },
        { name: 'Mock Interview', path: '/interview', icon: Mic },
        { name: 'Skill Quizzes', path: '/quizzes', icon: BrainCircuit },
        { name: 'Career Roadmap', path: '/roadmap', icon: Map },
        { name: 'Skill Progress', path: '/progress', icon: TrendingUp },
        { name: 'My Resumes', path: '/resumes', icon: FileText },
        { name: 'Interview History', path: '/interviews', icon: History },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ];

    const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setShowResults(e.target.value.length > 0);
    };

    const handleSelect = (path) => {
        navigate(path);
        setSearchQuery('');
        setShowResults(false);
    };

    return (
        <div style={layoutContainer}>
            {/* Sidebar Component */}
            <DashboardSidebar />

            <div style={mainContentArea}>
                {/* Top Header */}
                <header className="no-print" style={topHeader}>
                    <div style={{ position: 'relative' }} ref={searchRef}>
                        <div style={searchBar}>
                            <Search size={18} color="#475569" />
                            <input 
                                type="text" 
                                placeholder="Search features, resumes, or interviews..." 
                                style={searchInput} 
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => { if (searchQuery) setShowResults(true); }}
                            />
                        </div>
                        
                        {showResults && (
                            <div style={searchResultsContainer}>
                                {filteredRoutes.length > 0 ? (
                                    filteredRoutes.map((route, idx) => (
                                        <div 
                                            key={idx} 
                                            className="search-item"
                                            onClick={() => handleSelect(route.path)}
                                        >
                                            <route.icon size={14} color="#818cf8" />
                                            {route.name}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '16px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div style={headerActions}>
                        <button style={iconBtn} title="Notifications">
                            <Bell size={20} />
                            <div style={notificationDot}></div>
                        </button>
                        
                        <div style={profileSection} onClick={() => navigate('/dashboard')}>
                            <div style={userInfo}>
                                <div style={userName}>{user?.name || 'User'}</div>
                                <div style={userRole}>STUDENT</div>
                            </div>
                            <div style={avatar}>
                                {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div style={pagePadding}>
                    <Outlet />
                </div>
            </div>
            
            <style>{`
                .search-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    cursor: pointer;
                    color: #e8eaf6;
                    font-size: 13px;
                    font-weight: 500;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    transition: background 0.2s ease;
                }
                .search-item:hover {
                    background: rgba(99, 102, 241, 0.1);
                }
                .search-item:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
};

// Styles
const layoutContainer = {
    display: 'flex',
    minHeight: '100vh',
    background: '#020617', // Deep dark theme
    color: '#e8eaf6'
};

const mainContentArea = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
};

const topHeader = {
    height: '70px',
    padding: '0 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(2, 6, 23, 0.7)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    position: 'sticky',
    top: 0,
    zIndex: 90
};

const searchBar = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '8px 16px',
    borderRadius: '12px',
    width: '400px'
};

const searchInput = {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
    outline: 'none'
};

const searchResultsContainer = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    width: '100%',
    background: '#1a1f35',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    zIndex: 100
};

const headerActions = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
};

const iconBtn = {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const notificationDot = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '8px',
    height: '8px',
    background: '#6366f1',
    borderRadius: '50%',
    border: '2px solid #020617'
};

const profileSection = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
};

const userInfo = {
    textAlign: 'right'
};

const userName = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#e8eaf6',
    textTransform: 'capitalize'
};

const userRole = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    letterSpacing: '0.5px'
};

const avatar = {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '800',
    color: '#818cf8'
};

const pagePadding = {
    padding: '40px',
    flex: 1
};

export default DashboardLayout;
