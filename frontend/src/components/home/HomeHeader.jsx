import NotificationsDropdown from "./NotificationsDropdown";

export default function HomeHeader({ onLogout, token }) {
    return (
        <div className="home-header">
            <div className="logo">ChhayA</div>

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
