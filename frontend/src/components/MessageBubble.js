import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isSent, onMediaClick, isGroup, users, myUserId, isFirstFromSender, isLastFromSender, nextIsSameSender, onContextMenu, onReaction }) => {
  const formatTime = (createdAt) => {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const senderId =
    typeof message.sender === 'object'
      ? message.sender._id
      : message.sender || message.senderId;

  const isMine = senderId?.toString() === myUserId?.toString();
  const senderUser = users?.find(u => u._id === senderId);

  const messageRowClasses = [
    'message-row',
    isMine ? 'outgoing' : 'incoming',
    isFirstFromSender ? 'first-from-sender' : '',
    isLastFromSender ? 'last-from-sender' : '',
    nextIsSameSender ? 'next-same-sender' : ''
  ].filter(Boolean).join(' ');

  const bubbleClasses = [
    'message-bubble',
    // isGroup && isLastFromSender ? 'has-tail' : '' // Removed tail for modern appeal
  ].filter(Boolean).join(' ');

  const reactionGroups = Object.entries(
    (message.reactions || []).reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {})
  );

  const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥'];
  return (
    <div className={messageRowClasses}>
      {isGroup && !isMine && senderUser && isFirstFromSender && (
        <div className="sender-info">
          <img src={senderUser.avatar} alt={senderUser.name} />
          <span>{senderUser.name}</span>
        </div>
      )}

      <div
        className={bubbleClasses}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onContextMenu) {
            onContextMenu(e, message, isMine);
          }
        }}
      >
        <div className="inline-reaction-picker">
          {QUICK_EMOJIS.map(emoji => (
            <button 
              key={emoji} 
              className="quick-reaction-btn"
              onClick={(e) => { 
                e.stopPropagation(); 
                if (onReaction) onReaction(emoji, message); 
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        {message.replyTo && (
          <div className="replied-message-preview">
            <div className="reply-sender">
              {message.replyTo.senderId === myUserId ? 'You' : (users?.find(u => u._id === message.replyTo.senderId)?.name || 'User')}
            </div>
            <div className="reply-text-preview">
              {message.replyTo.type === 'text' ? message.replyTo.text : `[${message.replyTo.type}]`}
            </div>
          </div>
        )}

        <div className="bubble-content">
          {message.type === 'text' && <span className="message-text">{message.text}</span>}

          {message.type === 'image' && (
            <img
              src={message.fileUrl}
              alt="img"
              className="bubble-media"
              onClick={() => onMediaClick && onMediaClick(message)}
            />
          )}

          {message.type === 'video' && (
            <video
              src={message.fileUrl}
              controls
              className="bubble-media"
              onClick={() => onMediaClick && onMediaClick(message)}
            />
          )}

          {message.type === 'file' && (
            <a href={message.fileUrl} target="_blank" rel="noreferrer" className="file-attachment">
              📎 {message.fileName}
            </a>
          )}

          {message.type === 'audio' && (
            <audio controls src={message.fileUrl} className="bubble-audio" />
          )}
        </div>

        {/* Meta layer: timestamp and read ticks */}
        <div className="bubble-meta">
          <span className="timestamp">
            {formatTime(message.createdAt)}
          </span>

          {/* Read ticks for sent messages */}
          {isMine && (
            <span className="read-ticks">
              ✓✓
            </span>
          )}
        </div>

        {/* Reaction badges */}
        {reactionGroups.length > 0 && (
          <div className="reactions-container">
            {reactionGroups.map(([emoji, count]) => {
              const hasReacted = message.reactions.some(r => r.userId === myUserId && r.emoji === emoji);
              return (
                <div 
                  key={emoji} 
                  className={`reaction-badge ${hasReacted ? 'user-reacted' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onReaction) onReaction(emoji, message);
                  }}
                >
                  <span className="reaction-emoji">{emoji}</span>
                  {count > 1 && <span className="reaction-count">{count}</span>}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

// styles object removed


export default MessageBubble;
