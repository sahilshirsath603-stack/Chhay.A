export default function PresenceStrip({ users, loading }) {
    if (loading) return null;

    return (
        <div className="presence-strip">
            {users.slice(0, 10).map(user => (
                <div
                    key={user._id}
                    className="presence-user"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '70px'
                    }}
                >
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: user.avatar ? `url(${user.avatar}) center/cover` : '#444',
                        border: '2px solid var(--accent-color, #25d366)', // simulate active ring
                        padding: '2px', // gap inside ring
                        backgroundClip: 'content-box'
                    }}></div>
                    <span style={{ fontSize: '0.8rem', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {(user.name || user.username || "User").split(' ')[0]}
                    </span>
                </div>
            ))}
        </div>
    );
}
