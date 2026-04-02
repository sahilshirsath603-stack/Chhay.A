import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { deleteAccount, getMe } from "../services/api";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function Settings({ theme, toggleTheme }) {
    const THEME_CHHAYA = "chhaya";
    const navigate = useNavigate();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
    
    // Username States
    const [username, setUsername] = useState("");
    const [tempUsername, setTempUsername] = useState("");
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const user = await getMe();
                if (user) {
                  if (user.showOnlineStatus !== undefined) setShowOnlineStatus(user.showOnlineStatus);
                  const userUsername = user.username || "";
                  setUsername(userUsername);
                  setTempUsername(userUsername);
                }
            } catch (err) {
                console.error("Failed to fetch user settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdateUsername = async () => {
        if (!tempUsername.trim()) return;
        if (tempUsername === username) return;

        setIsUpdatingUsername(true);
        setUsernameStatus({ type: '', message: '' });
        
        try {
            const res = await api.put('/auth/users/profile', { username: tempUsername });
            setUsername(res.data.username);
            setTempUsername(res.data.username);
            setUsernameStatus({ type: 'success', message: 'Username updated successfully!' });
            
            // Clear success message after 3 seconds
            setTimeout(() => setUsernameStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error("Failed to update username", error);
            setUsernameStatus({ 
              type: 'error', 
              message: error.response?.data?.message || 'Failed to update username' 
            });
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const handleTogglePrivacy = async () => {
        setIsUpdatingPrivacy(true);
        const newValue = !showOnlineStatus;
        try {
            const res = await api.patch('/settings/online-status', { showOnlineStatus: newValue });
            setShowOnlineStatus(res.data.showOnlineStatus);
        } catch (error) {
            console.error("Failed to update privacy settings", error);
        } finally {
            setIsUpdatingPrivacy(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setPasswordError("Password is required.");
            return;
        }
        setIsDeleting(true);
        setPasswordError("");
        try {
            await deleteAccount(deletePassword);
            localStorage.removeItem("token");
            window.location.href = "/login";
        } catch (error) {
            console.error("Error deleting account", error);
            setPasswordError(error.response?.data?.message || "Failed to delete account. Incorrect password?");
            setIsDeleting(false);
            setDeletePassword("");
        }
    };

    return (
        <div className="settings-container" style={{ padding: '20px', color: 'var(--color-text-primary)' }}>
            <div className="settings-top-bar" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    className="back-btn"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                    }}
                    title="Go Back"
                >
                    ←
                </button>
                <h2 style={{ margin: 0 }}>Settings</h2>
            </div>

            <div style={{ padding: '1rem' }}>
                {/* PROFILE SECTION */}
                <div className="settings-section">
                    <h3>Profile Info</h3>
                    <div className="setting-item" style={{
                        padding: '1.5rem',
                        backgroundColor: 'var(--bg-panel, #222)',
                        borderRadius: '12px',
                        marginTop: '1rem',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.1))'
                    }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Username</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>@</span>
                                <input 
                                  type="text"
                                  value={tempUsername}
                                  onChange={(e) => setTempUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                  placeholder="new_username"
                                  style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 28px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--color-text-primary)',
                                    outline: 'none'
                                  }}
                                />
                              </div>
                              <button
                                onClick={handleUpdateUsername}
                                disabled={isUpdatingUsername || tempUsername === username || !tempUsername}
                                style={{
                                  padding: '0 1.2rem',
                                  backgroundColor: tempUsername === username ? '#333' : 'var(--accent-color, #25d366)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: (isUpdatingUsername || tempUsername === username) ? 'default' : 'pointer',
                                  fontWeight: 600,
                                  opacity: (tempUsername === username || !tempUsername) ? 0.6 : 1
                                }}
                              >
                                {isUpdatingUsername ? 'Updating...' : 'Update'}
                              </button>
                            </div>
                            {usernameStatus.message && (
                              <div style={{ 
                                marginTop: '10px', 
                                fontSize: '0.85rem', 
                                color: usernameStatus.type === 'error' ? '#ff6b6b' : '#25d366' 
                              }}>
                                {usernameStatus.message}
                              </div>
                            )}
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
                              Username can only contain lowercase letters, numbers, and underscores (3-20 chars).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="settings-section" style={{ marginTop: '2rem' }}>
                    <h3>Appearance</h3>
                    <div className="setting-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-panel, #222)',
                        borderRadius: '12px',
                        marginTop: '1rem',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.1))'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Theme Mode</div>
                            <div style={{ fontSize: '0.9rem', color: '#888' }}>
                                {theme === THEME_CHHAYA ? 'Chhaya (Dark)' : 'Prakash (Light)'}
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="action-btn"
                            style={{
                                width: 'auto',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--accent-color, #25d366)',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#fff'
                            }}
                        >
                            Switch to {theme === THEME_CHHAYA ? 'Prakash' : 'Chhaya'}
                        </button>
                    </div>
                </div>

                <div className="settings-section" style={{ marginTop: '2rem' }}>
                    <h3>Privacy</h3>
                    <div className="setting-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-panel, #222)',
                        borderRadius: '12px',
                        marginTop: '1rem',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.1))'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Show Online Status</div>
                            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>
                                Allow others to see when you are online
                            </div>
                        </div>
                        <label className="toggle-switch" style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '44px',
                            height: '24px'
                        }}>
                            <input
                                type="checkbox"
                                checked={showOnlineStatus}
                                onChange={handleTogglePrivacy}
                                disabled={isUpdatingPrivacy}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span className="slider" style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: showOnlineStatus ? 'var(--accent-color, #25d366)' : '#ccc',
                                transition: '.4s',
                                borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '18px',
                                    width: '18px',
                                    left: showOnlineStatus ? '22px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>

                <div className="settings-section" style={{ marginTop: '2rem' }}>
                    <h3>About</h3>
                    <p style={{ color: '#888' }}>Swarix App Layout Version</p>
                    <p style={{ color: '#888' }}>Swarix v1.0.0 framework</p>
                </div>

                <div className="settings-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))', paddingTop: '2rem' }}>
                    <h3 style={{ color: 'var(--color-status-danger, #ef4444)' }}>Danger Zone</h3>
                    <div className="setting-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        marginTop: '1rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-status-danger, #ef4444)' }}>Delete Account</div>
                            <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>
                                Permanently remove your account and all data.
                            </div>
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="action-btn"
                            style={{
                                width: 'auto',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--color-status-danger, #ef4444)',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#fff',
                                fontWeight: 600
                            }}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <ConfirmModal
                    title="Delete your account?"
                    confirmText={isDeleting ? "Deleting..." : "Permanently Delete"}
                    cancelText="Cancel"
                    onConfirm={handleDeleteAccount}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDeletePassword("");
                        setPasswordError("");
                    }}
                >
                    <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                        <p style={{ color: 'var(--color-text-secondary, #cbd5e1)', fontSize: '14px', lineHeight: '1.5', marginTop: 0 }}>
                            This action will permanently remove:
                        </p>
                        <ul style={{ color: 'var(--color-text-secondary, #cbd5e1)', paddingLeft: '20px', margin: '8px 0', fontSize: '14px' }}>
                            <li>Your profile</li>
                            <li>All messages you sent</li>
                            <li>Your connections</li>
                            <li>Your micro rooms</li>
                            <li>Your media</li>
                        </ul>
                        <p style={{ color: 'var(--color-text-secondary, #cbd5e1)', fontSize: '14px', marginBottom: 0 }}>
                            <strong>This action cannot be undone.</strong>
                        </p>
                    </div>

                    <div style={{ textAlign: 'left', marginTop: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                            Enter your <strong>PASSWORD</strong> to confirm:
                        </label>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => { setDeletePassword(e.target.value); setPasswordError(""); }}
                            placeholder="Your password"
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-primary)'
                            }}
                        />
                        {passwordError && (
                            <div style={{ color: 'var(--color-status-danger, #ef4444)', fontSize: '13px', marginTop: '8px' }}>
                                {passwordError}
                            </div>
                        )}
                    </div>
                </ConfirmModal>
            )}
        </div>
    );
}
