import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, children }) {
    // Prevent clicks inside modal from closing it if we add an overlay click handler
    const stopPropagation = (e) => e.stopPropagation();

    return (
        <div className="confirm-modal-overlay" onClick={onCancel} style={{ zIndex: 9999 }}>
            <div className="confirm-modal-card" onClick={stopPropagation}>
                <h3 className="confirm-modal-title">{title}</h3>
                {message && <p className="confirm-modal-message">{message}</p>}
                {children && <div className="confirm-modal-body">{children}</div>}
                <div className="confirm-modal-buttons">
                    <button className="confirm-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="confirm-btn-danger" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
