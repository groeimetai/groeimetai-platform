import React from 'react';
import { ChatContainer } from './index';

/**
 * Example of how to integrate the chat components
 */
const ChatExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Groei met AI Cursus Platform
        </h1>
        
        {/* Example: Inline chat (fullscreen mode) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Inline Chat Example
          </h2>
          <div className="max-w-4xl mx-auto">
            <ChatContainer fullScreen={true} defaultOpen={true} />
          </div>
        </div>

        {/* Example content */}
        <div className="prose dark:prose-invert max-w-none">
          <p>
            This page demonstrates how to integrate the chat components. 
            The floating chat button appears in the bottom right corner.
          </p>
        </div>
      </div>

      {/* Floating chat - always visible */}
      <ChatContainer unreadCount={2} />
    </div>
  );
};

export default ChatExample;