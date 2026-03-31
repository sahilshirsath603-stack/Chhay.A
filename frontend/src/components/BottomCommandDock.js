import React from 'react';
import './BottomCommandDock.css';

import Icon from './ui/Icon';
import { APP_ICONS } from '../constants/icons';
import { ICON_SIZES } from '../constants/iconSizes';

// Navigation Items Configuration
const NAV_ITEMS = [
    { id: 'groups', label: 'Groups', icon: APP_ICONS.groups },
    { id: 'rooms', label: 'Rooms', icon: APP_ICONS.rooms },
    { id: 'chats', label: 'Chats', icon: APP_ICONS.chats }
];

const BottomCommandDock = ({ activeTab, onTabChange, activeRoomsCount = 0 }) => {
    return (
        <div className="bottom-command-dock">
            <div className="dock-container">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            className={`dock-item ${isActive ? 'active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                        >
                            <span className="dock-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <Icon name={item.icon} size={ICON_SIZES.nav} />
                                {item.id === 'rooms' && activeRoomsCount > 0 && (
                                    <span className="dock-badge"></span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomCommandDock;
