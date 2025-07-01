'use client';

import React from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  onClick, 
  isOpen, 
  unreadCount = 0 
}) => {
  return (
    <button
      onClick={onClick}
      className={`floating-chat-button ${isOpen ? 'open' : ''}`}
      aria-label={isOpen ? 'Sluit chat' : 'Open chat'}
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        left: 'auto',
        top: 'auto'
      }}
    >
      <span className="floating-chat-button-icon">
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M18 6L6 18M6 6l12 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path 
              d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {!isOpen && unreadCount > 0 && (
        <span className="floating-chat-badge">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default FloatingChatButton;