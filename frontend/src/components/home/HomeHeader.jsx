import NotificationsDropdown from "./NotificationsDropdown";

export default function HomeHeader({ onLogout, token }) {
    return (
        <div className="home-header">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div className="logo">Swarix</div>
                <span style={{ fontSize: '0.7rem', color: '#a0a0a0', marginTop: '-4px' }}>Connect with people who match your vibe.</span>
            </div>

            <input
                type="text"
                placeholder="Search users..."
                className="home-search"
            />

            <div className="header-actions">
                <span>🟢 Rooms</span>
                <NotificationsDropdown token={token} />
                <span>👤</span>
                <span onClick={onLogout} style={{ cursor: "pointer" }}>⚙</span>
            </div>
        </div>
    );
}
