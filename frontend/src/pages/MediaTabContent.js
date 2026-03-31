import React, { useMemo } from 'react';
import './Chat_Media.css';

const MediaTabContent = React.memo(({
    mediaMessages,
    selectedUser,
    selectedGroup,
    mediaTab,
    setMediaTab,
    getDateLabel,
    formatTime,
    isLoadingMedia
}) => {
    // Filter media messages for current chat
    const chatMediaMessages = useMemo(() => {
        if (selectedUser) {
            return mediaMessages.filter((m) =>
                (m.senderId === selectedUser._id || m.receiverId === selectedUser._id) && m.receiverType === 'user'
            );
        } else if (selectedGroup) {
            return mediaMessages.filter((m) =>
                m.receiverId === selectedGroup._id && m.receiverType === 'group'
            );
        }
        return [];
    }, [mediaMessages, selectedUser, selectedGroup]);

    // Filter messages based on active tab (Media vs Docs)
    const filteredMessages = useMemo(() => {
        switch (mediaTab) {
            case 'media':
                return chatMediaMessages.filter((m) => m.type === 'image' || m.type === 'video');
            case 'docs':
                return chatMediaMessages.filter((m) => m.type === 'file');
            case 'links':
                return [];
            default:
                return chatMediaMessages.filter((m) => m.type === 'image' || m.type === 'video');
        }
    }, [mediaTab, chatMediaMessages]);

    // Group messages by date
    const dateGroups = useMemo(() => {
        const groups = {};
        filteredMessages.forEach((msg) => {
            if (!msg.createdAt) return;
            const date = new Date(msg.createdAt).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    }, [filteredMessages]);

    const sortedDateKeys = useMemo(() => {
        return Object.keys(dateGroups).sort((a, b) => new Date(b) - new Date(a));
    }, [dateGroups]);

    // Render Helpers
    const renderMediaItem = (m) => {
        if (!m.fileUrl) return null;

        return (
            <div key={m._id} className="media-item">
                {m.type === 'image' && (
                    <img
                        src={m.fileUrl}
                        alt={m.fileName || "Media"}
                        className="media-image"
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                )}
                {m.type === 'video' && (
                    <video
                        src={m.fileUrl}
                        controls
                        className="media-video"
                        preload="metadata"
                    />
                )}
                <div className="media-timestamp">
                    {formatTime(m.createdAt)}
                </div>
            </div>
        );
    };

    const renderDocumentItem = (m) => (
        <div key={m._id} className="document-item">
            <div className="document-info">
                <span className="document-name">{m.fileName || 'Unknown File'}</span>
                <span className="document-size">
                    {m.fileSize ? (m.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown Size'}
                </span>
            </div>
            {m.fileUrl && (
                <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="download-link"
                >
                    Download
                </a>
            )}
            <div className="document-timestamp">
                {formatTime(m.createdAt)}
            </div>
        </div>
    );

    return (
        <div className="media-container">
            {/* Header */}
            <div className="media-header">
                <button
                    className={`media-tab ${mediaTab === 'media' ? 'active' : ''}`}
                    onClick={() => setMediaTab('media')}
                >
                    Media
                </button>
                <button
                    className={`media-tab ${mediaTab === 'docs' ? 'active' : ''}`}
                    onClick={() => setMediaTab('docs')}
                >
                    Docs
                </button>
                <button
                    className={`media-tab ${mediaTab === 'links' ? 'active' : ''}`}
                    onClick={() => setMediaTab('links')}
                >
                    Links
                </button>
            </div>

            {/* Content */}
            <div className="media-content">
                {isLoadingMedia ? (
                    <div className="media-loading">
                        <div className="spinner"></div>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="no-media">
                        <p>No media shared yet</p>
                    </div>
                ) : (
                    sortedDateKeys.map((dateKey) => (
                        <div key={dateKey} className="date-group">
                            <div className="media-date-label">
                                {getDateLabel(dateKey)}
                            </div>

                            {mediaTab === 'media' && (
                                <div className="media-grid">
                                    {dateGroups[dateKey].map(renderMediaItem)}
                                </div>
                            )}

                            {mediaTab === 'docs' && (
                                <div className="documents-list">
                                    {dateGroups[dateKey].map(renderDocumentItem)}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

export default MediaTabContent;
