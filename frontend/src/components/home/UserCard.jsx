import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";
import ConfirmModal from "../ui/ConfirmModal";

export default function UserCard({ user, currentUser, sentRequests, isOnline, isInRoom }) {
    const [isPending, setIsPending] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Prefer explicit backend flags if provided, fallback to matching arrays
        if (user.isConnected !== undefined) {
            setIsConnected(user.isConnected);
        } else if (currentUser && currentUser.connections) {
            setIsConnected(currentUser.connections.includes(user._id));
        }

        if (user.isPendingRequest !== undefined) {
            setIsPending(user.isPendingRequest);
        } else if (sentRequests && sentRequests.includes(user._id)) {
            setIsPending(true);
        }
    }, [currentUser, sentRequests, user._id, user.isConnected, user.isPendingRequest]);

    const handleConnect = async (e, receiverId) => {
        e.stopPropagation(); // Prevent opening profile when clicking connect
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/connections/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId })
            });
            if (res.ok) {
                setIsPending(true);
            }
        } catch (err) {
            console.error("Failed to connect", err);
        }
    };

    const handleCardClick = () => {
        navigate(`/profile/${user._id}`);
    };

    const handleMessageClick = (e) => {
        e.stopPropagation();
        navigate(`/messages/${user._id}`);
    };

    const handleDisconnectClick = (e) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmDisconnectAction = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/connections/${user._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                setIsConnected(false);
                setIsPending(false); // Just in case
            }
        } catch (err) {
            console.error("Failed to disconnect", err);
        } finally {
            setShowConfirm(false);
        }
    };

    // Calculate Aura styling
    const hasAura = user.aura && user.aura.type;
    const auraColor = hasAura ? user.aura.color : "transparent";
    const auraClass = hasAura ? `aura-animated aura-${user.aura.type}` : '';

    return (
        <>
            {showConfirm && (
                <ConfirmModal 
                    title="Disconnect User"
                    message={`Are you sure you want to disconnect from ${user.name || user.username || 'this user'}?`}
                    confirmText="Disconnect"
                    cancelText="Cancel"
                    onConfirm={confirmDisconnectAction}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <div className="user-card clickable-card" onClick={handleCardClick}>
                {isInRoom && <div className="room-badge">🔊 In Room</div>}

            <div className={`mood-aura-container ${auraClass}`}
                style={{
                    '--aura-color': auraColor,
                    boxShadow: hasAura ? `0 0 15px ${auraColor}` : 'none'
                }}
                title={hasAura ? user.aura.label : undefined}
            >
                <div className="avatar-placeholder" style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: user.avatar ? `url(${user.avatar}) center/cover` : '#ccc',
                    border: hasAura ? `3px solid ${auraColor}` : '3px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}></div>
                {/* Presence dot */}
                <div className={`presence-dot ${isOnline ? 'online' : 'offline'}`} title={isOnline ? 'Online' : 'Offline'}></div>
            </div>

            <h4 className="user-name-text">
                {user.name || user.username}
            </h4>

            {/* Always visible base info */}
            <p className="user-bio-text">
                {user.about || user.bio || "Passionate about connecting with others."}
            </p>

            {/* Inline Mood Display */}
            {hasAura && (
                <div className="inline-vibe" style={{ marginBottom: '16px', color: auraColor, fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {user.aura.icon} {user.aura.label} Vibe
                </div>
            )}
            {!hasAura && <div style={{ marginBottom: '16px' }}></div>} {/* Spacer */}

            {/* Static Action Buttons */}
            <div className="card-actions-fixed">
                {!isConnected ? (
                    <button
                        onClick={(e) => handleConnect(e, user._id)}
                        disabled={isPending}
                        className="action-btn connect-btn"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            cursor: isPending ? 'default' : 'pointer',
                            opacity: isPending ? 0.7 : 1,
                            width: '100%',
                            flex: 1
                        }}>
                        {isPending ? "Request Sent" : "Connect"}
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button 
                            onClick={handleMessageClick} 
                            className="action-btn message-btn"
                            style={{ flex: 1 }}
                        >
                            Message
                        </button>
                        <button 
                            onClick={handleDisconnectClick} 
                            className="action-btn connect-btn"
                            style={{ 
                                flex: 1, 
                                background: 'rgba(255,50,50,0.1)', 
                                border: '1px solid rgba(255,50,50,0.3)',
                                color: '#ff6b6b'
                            }}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
