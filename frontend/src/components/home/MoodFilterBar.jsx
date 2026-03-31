import React from 'react';
import './MoodFilterBar.css';

export default function MoodFilterBar({ currentFilter, onFilterChange }) {
    const filters = [
        { id: 'all', label: 'All Vibe' },
        { id: 'happy', label: '😊 Happy' },
        { id: 'chill', label: '🎧 Chill' },
        { id: 'active', label: '🔥 Energetic' },
        { id: 'deepwork', label: '🧠 Focus' },
        { id: 'night', label: '🌙 Night' },
        { id: 'hosting', label: '🔊 Hosting' }
    ];

    return (
        <div className="mood-filter-scroll-container">
            <div className="mood-filter-bar">
                {filters.map(f => (
                    <button
                        key={f.id}
                        className={`mood-filter-btn ${currentFilter === f.id ? 'active' : ''}`}
                        onClick={() => onFilterChange(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
