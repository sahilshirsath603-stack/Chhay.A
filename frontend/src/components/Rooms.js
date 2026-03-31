import React, { useState, useEffect } from 'react';
import { getRoomArchives } from '../services/api';
import Icon from './ui/Icon';
import { APP_ICONS } from '../constants/icons';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import './Rooms.css';

function Rooms({ onJoinRoom, onCreateRoom }) {
    const socket = useSocket();
    const navigate = useNavigate();
    const [activeMicroRooms, setActiveMicroRooms] = useState([]);
    const [archivedRooms, setArchivedRooms] = useState([]);

    // Modal state
    const [showMicroRoomModal, setShowMicroRoomModal] = useState(false);
    const [microRoomForm, setMicroRoomForm] = useState({ title: '', durationHours: 1 });

    useEffect(() => {
        const fetchArchives = async () => {
            try {
                const data = await getRoomArchives();
                setArchivedRooms(data);
            } catch (error) {
                console.error('Failed to fetch room archives:', error);
            }
        };
        fetchArchives();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleActiveMicroRoomsData = (roomsData) => {
            setActiveMicroRooms(roomsData);
        };

        const handleMicroRoomCreated = (room) => {
            setActiveMicroRooms(prev => [...prev, room]);
        };

        const handleMicroRoomExpired = (roomId) => {
            setActiveMicroRooms(prev => prev.filter(r => r._id !== roomId));
        };

        socket.on('active-micro-rooms-data', handleActiveMicroRoomsData);
        socket.on('micro-room-created', handleMicroRoomCreated);
        socket.on('micro-room-expired', handleMicroRoomExpired);

        // Initial fetch
        socket.emit('get-active-micro-rooms');

        return () => {
            socket.off('active-micro-rooms-data', handleActiveMicroRoomsData);
            socket.off('micro-room-created', handleMicroRoomCreated);
            socket.off('micro-room-expired', handleMicroRoomExpired);
        };
    }, [socket]);

    return (
        <div className="rooms-page">
            <div className="rooms-header">
                <h2>Micro Rooms</h2>
                <button className="create-room-btn" onClick={() => {
                    if (onCreateRoom) {
                        onCreateRoom();
                    } else {
                        setShowMicroRoomModal(true);
                    }
                }}>
                    <Icon name={APP_ICONS.attach} size={14} /> Create
                </button>
            </div>

            <div className="rooms-list-scroll">
                {activeMicroRooms.length > 0 ? (
                    <div className="rooms-section">
                        <h4 className="rooms-section-title">Live & Trending</h4>
                        <div className="rooms-list">
                            {activeMicroRooms.map(r => {
                                const score = (r.stats?.messageCount * 2 || 0) + ((r.participants?.length || 1) * 3) + (r.stats?.reactionCount || 0);
                                const isTrending = score >= 15;
                                const diffStr = r.expiresAt ? (
                                    (() => {
                                        const diff = new Date(r.expiresAt) - new Date();
                                        if (diff <= 0) return '0m';
                                        const mins = Math.floor(diff / 60000);
                                        return mins > 60 ? `${Math.floor(mins / 60)}h` : `${mins}m`;
                                    })()
                                ) : '';

                                return (
                                    <div key={r._id} className={`room-card ${isTrending ? 'trending' : ''}`} onClick={() => {
                                        if (onJoinRoom) {
                                            onJoinRoom(r._id);
                                        } else {
                                            socket?.emit('join-micro-room', { roomId: r._id });
                                        }
                                    }}>
                                        <div className="room-title">
                                            {isTrending ? '🔥' : <Icon name={APP_ICONS.rooms} size={16} />}
                                            {r.title}
                                        </div>
                                        <div className="room-meta">
                                            {r.participants?.length || 0} participants • {diffStr} left
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="no-rooms-state">
                        <Icon name={APP_ICONS.rooms} size={48} color="var(--border-color)" />
                        <p>No active rooms right now.</p>
                    </div>
                )}

                {archivedRooms.length > 0 && (
                    <div className="rooms-archive">
                        <h4 className="rooms-section-title">Your Archives</h4>
                        <div className="rooms-list">
                            {archivedRooms.map((r, idx) => (
                                <div key={`archive-${idx}`} className="room-card archive-card">
                                    <div className="room-title">
                                        <Icon name={APP_ICONS.rooms} size={16} color="var(--color-text-secondary)" />
                                        {r.title}
                                    </div>
                                    <div className="room-meta">
                                        {r.durationHours || 1}h • Peak: {r.peakParticipants || 0} users
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MICRO ROOM CREATE MODAL */}
            {
                showMicroRoomModal && (
                    <div className="tg-float-overlay" onClick={(e) => e.target === e.currentTarget && setShowMicroRoomModal(false)}>
                        <div className="tg-float-modal" style={{ height: 'auto', padding: '24px' }}>
                            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>Create Micro Room</h3>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Room Title</label>
                                <input
                                    type="text"
                                    placeholder="E.g. Weekend Plans"
                                    value={microRoomForm.title}
                                    onChange={(e) => setMicroRoomForm({ ...microRoomForm, title: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Duration</label>
                                <select
                                    value={microRoomForm.durationHours}
                                    onChange={(e) => setMicroRoomForm({ ...microRoomForm, durationHours: Number(e.target.value) })}
                                    style={{ width: '100%', cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
                                >
                                    <option value={1}>1 Hour</option>
                                    <option value={3}>3 Hours</option>
                                    <option value={6}>6 Hours</option>
                                    <option value={24}>24 Hours</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowMicroRoomModal(false)}
                                    style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: 'none', cursor: 'pointer', padding: '10px 20px', fontWeight: 500 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!microRoomForm.title.trim()) return;
                                        socket?.emit('create-micro-room', {
                                            parentChatId: 'global',
                                            title: microRoomForm.title,
                                            durationHours: microRoomForm.durationHours
                                        });
                                        setShowMicroRoomModal(false);
                                        setMicroRoomForm({ title: '', durationHours: 1 });
                                    }}
                                    className="action-btn"
                                    style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--color-brand-primary)', color: '#fff', fontWeight: 500 }}
                                >
                                    Create Room
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default Rooms;
