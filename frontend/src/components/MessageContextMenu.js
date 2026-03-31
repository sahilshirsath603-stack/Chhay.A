import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './ui/Icon';
import { APP_ICONS } from '../constants/icons';
import { ICON_SIZES } from '../constants/iconSizes';

const MessageContextMenu = ({ position, message, isMine, onClose, onOptionSelect, onReaction }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleOptionClick = (option) => {
    if (onOptionSelect) {
      onOptionSelect(option);
    }
    onClose();
  };

  const menuOptions = isMine
    ? [
      { label: 'Reply', icon: APP_ICONS.reply, action: 'reply' },
      { label: 'Forward', icon: APP_ICONS.forward, action: 'forward' },
      { label: 'Copy', icon: APP_ICONS.copy, action: 'copy' },
      { label: 'Delete', icon: APP_ICONS.delete, action: 'delete' }
    ]
    : [
      { label: 'Reply', icon: APP_ICONS.reply, action: 'reply' },
      { label: 'Forward', icon: APP_ICONS.forward, action: 'forward' },
      { label: 'Copy', icon: APP_ICONS.copy, action: 'copy' }
    ];

  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const handleReactionClick = (emoji) => {
    if (onReaction) {
      onReaction(emoji);
    }
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: '#333',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 9999,
        minWidth: '160px',
        overflow: 'hidden'
      }}
    >
      {/* Reactions Row */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #444',
        display: 'flex',
        gap: '8px',
        justifyContent: 'center'
      }}>
        {reactionEmojis.map(emoji => {
          const isReacted = message.reactions?.some(r => r.emoji === emoji && r.userId?.toString() === message.senderId?.toString());
          return (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s',
                opacity: isReacted ? 0.5 : 1
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      {menuOptions.map((option, index) => (
        <div
          key={option.action}
          onClick={() => handleOptionClick(option.action)}
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
            fontSize: '14px',
            borderBottom: index < menuOptions.length - 1 ? '1px solid #444' : 'none',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={option.icon} size={ICON_SIZES.small} className={option.action === 'delete' ? 'danger' : ''} />
          </span>
          <span style={{ color: option.action === 'delete' ? '#ff6b6b' : '#fff' }}>{option.label}</span>
        </div>
      ))}
    </div>,
    document.getElementById('portal-root')
  );
};

export default MessageContextMenu;
