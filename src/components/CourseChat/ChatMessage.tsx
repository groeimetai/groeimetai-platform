'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isStreaming?: boolean;
  };
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const code = String(children).replace(/\n$/, '');

      if (!inline && match) {
        return (
          <div className="code-block">
            <div className="code-header">
              <span className="code-language">{match[1]}</span>
              <button
                className="copy-button"
                onClick={() => handleCopy(code)}
                title="Kopieer code"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    },
    a({ href, children, ...props }: any) {
      // Check if it's a course link
      if (href && href.startsWith('/course/')) {
        return (
          <a
            href={href}
            className="course-link"
            onClick={(e) => {
              e.preventDefault();
              // Handle course navigation here
              console.log('Navigate to:', href);
            }}
            {...props}
          >
            {children}
            <svg
              className="link-icon"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className={`chat-message ${message.role} group`}>
      <div className="message-avatar">
        {message.role === 'user' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" fill="currentColor"/>
            <path d="M12 6a1 1 0 0 0-1 1v6a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 12.586V7a1 1 0 0 0-1-1z" fill="currentColor"/>
            <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
          </svg>
        )}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">
            {message.role === 'user' ? 'Jij' : 'AI Assistent'}
          </span>
          <span className="message-time opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className={`message-text ${isStreaming ? 'streaming' : ''}`}>
          <ReactMarkdown components={components}>
            {message.content}
          </ReactMarkdown>
          {isStreaming && <span className="cursor">|</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;