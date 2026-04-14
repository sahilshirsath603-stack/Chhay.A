import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./AppLayout.css";

export default function AppLayout({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="header-left">
                    {/* Connectify placeholder logo icon */}
                    <img 
                        src="/logo.jpg" 
                        alt="Connectify Logo" 
                        className="layout-logo-img"
                        onClick={() => navigate("/home")} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }}
                    />
                    <div className="logo" onClick={() => navigate("/home")}>
                        Connectify
                    </div>
                </div>

                <div className="nav-actions">
                    <span
                        className={isActive("/home") ? "active" : ""}
                        onClick={() => navigate("/home")}
                    >Home</span>
                    <span
                        className={isActive("/messages") || location.pathname.startsWith("/messages/") ? "active" : ""}
                        onClick={() => navigate("/messages")}
                    >Messages</span>
                    <span
                        className={isActive("/rooms") ? "active" : ""}
                        onClick={() => navigate("/rooms")}
                    >Live Rooms</span>
                    <span
                        className={isActive("/notifications") ? "active" : ""}
                        onClick={() => navigate("/notifications")}
                    >Notifications</span>
                    <span
                        className={isActive("/profile") ? "active" : ""}
                        onClick={() => navigate("/profile")}
                    >Profile</span>
                </div>

                {/* Search removed from header right */}
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
