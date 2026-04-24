import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Link, Bell, Home, MessageCircle, Radio, User } from 'lucide-react';
import './AppLayout.css';

export default function MobileAppLayout({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path ||
        (path !== '/home' && path !== '/' && location.pathname.startsWith(`${path}/`));

    const hideHeaderPaths = ['/messages', '/rooms'];
    const shouldHideHeader = hideHeaderPaths.some(p => location.pathname.startsWith(p));

    return (
        <div className="app-layout">
            {!shouldHideHeader && (
                <header className="app-header">
                    <div className="logo-area" onClick={() => navigate('/home')}>
                        <div className="logo-glow"></div>
                        <Link className="logo-icon" size={26} strokeWidth={2.5} />
                        <span className="app-name">Connectify</span>
                    </div>
                    <div className="notification-btn" onClick={() => navigate('/notifications')}>
                        <Bell size={20} />
                        <div className="notification-dot"></div>
                    </div>
                </header>
            )}

            <main className="content">
                <Outlet />
            </main>

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <div className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => navigate('/home')}>
                    <Home size={22} className="nav-icon" />
                    <span>Home</span>
                </div>
                <div className={`nav-item ${isActive('/messages') ? 'active' : ''}`} onClick={() => navigate('/messages')}>
                    <MessageCircle size={22} className="nav-icon" />
                    <span>Messages</span>
                </div>
                <div className={`nav-item ${isActive('/rooms') ? 'active' : ''}`} onClick={() => navigate('/rooms')}>
                    <Radio size={22} className="nav-icon" />
                    <span>Live</span>
                </div>
                <div className={`nav-item ${isActive('/notifications') ? 'active' : ''}`} onClick={() => navigate('/notifications')}>
                    <Bell size={22} className="nav-icon" />
                    <span>Activity</span>
                </div>
                <div className={`nav-item ${isActive('/profile') ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                    <User size={22} className="nav-icon" />
                    <span>Profile</span>
                </div>
            </nav>
        </div>
    );
}
