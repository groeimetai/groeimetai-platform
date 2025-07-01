'use client';

import React, { useState, useEffect } from 'react';
import CourseChat from './CourseChat';
import FloatingChatButton from './FloatingChatButton';
import './CourseChat.css';

interface ChatContainerProps {
  unreadCount?: number;
  defaultOpen?: boolean;
  fullScreen?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  unreadCount = 0, 
  defaultOpen = false,
  fullScreen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Prevent body scroll when chat is open on mobile
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="chat-overlay visible"
          onClick={toggleChat}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`${fullScreen ? '' : 'course-chat floating'} ${isOpen ? 'animate-slideInUp' : ''}`}>
          <CourseChat />
        </div>
      )}

      {/* Floating Button */}
      {!fullScreen && (
        <FloatingChatButton
          onClick={toggleChat}
          isOpen={isOpen}
          unreadCount={unreadCount}
        />
      )}
    </>
  );
};

export default ChatContainer;