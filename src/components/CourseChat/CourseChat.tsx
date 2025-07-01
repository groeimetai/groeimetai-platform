'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import './CourseChat.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

interface QuickAction {
  label: string;
  action: string;
  icon?: string;
}

const CourseChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hallo! Ik ben je AI studieassistent. Ik kan je helpen met cursussen vinden, studieplanning, en vragen beantwoorden over je leertraject. Hoe kan ik je vandaag helpen?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickActions: QuickAction[] = [
    { label: 'Cursussen', action: 'Welke cursussen passen bij mijn niveau?', icon: '🎓' },
    { label: 'Planning', action: 'Help me een studieplan maken', icon: '📅' },
    { label: 'Voortgang', action: 'Wat is mijn studievoortgang?', icon: '📊' },
    { label: 'Tips', action: 'Geef me studietips voor effectief leren', icon: '💡' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const simulateStreamingResponse = async (response: string) => {
    const words = response.split(' ');
    let currentContent = '';
    const messageId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      await new Promise((resolve) => setTimeout(resolve, 50));

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: currentContent }
            : msg
        )
      );
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setIsStreaming(true);

    try {
      // Make real API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          sessionId: localStorage.getItem('chatSessionId') || undefined,
          context: {
            language: 'nl',
          },
        }),
      });

      setIsTyping(false);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        const messageId = Date.now().toString();

        // Add empty message for streaming
        setMessages((prev) => [
          ...prev,
          {
            id: messageId,
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            isStreaming: true,
          },
        ]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.word) {
                    accumulatedContent += parsed.word;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === messageId
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        }

        // Mark as no longer streaming
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      } else {
        // Handle regular JSON response
        const data = await response.json();
        
        // Store session ID if provided
        if (data.sessionId) {
          localStorage.setItem('chatSessionId', data.sessionId);
        }

        await simulateStreamingResponse(data.answer || 'Sorry, ik kon geen antwoord genereren.');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      setIsTyping(false);
      
      // Fallback to static responses if API fails
      let response = 'Sorry, er ging iets mis. ';
      
      // Check if it's an API key issue
      if (error.message.includes('401') || error.message.includes('403')) {
        response += 'Het lijkt erop dat de API sleutels niet correct zijn geconfigureerd. Neem contact op met de beheerder.';
      } else if (error.message.includes('404')) {
        response += 'De chat API is niet beschikbaar. Controleer of de server draait.';
      } else {
        // Provide static fallback based on input
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('cursus') || lowerInput.includes('aanbevel')) {
          response = 'Gebaseerd op jouw interesses en niveau, raad ik deze cursussen aan:\n\n1. **ChatGPT & Gemini Masterclass** - Perfect voor beginners\n2. **LangChain Basics** - Bouw AI applicaties\n3. **N8N/Make Basics** - Automatiseer je workflows\n\nWil je meer details over een specifieke cursus?';
        } else if (lowerInput.includes('studieplan') || lowerInput.includes('planning')) {
          response = 'Ik help je graag een effectief studieplan maken! Hier is een suggestie:\n\n📅 **Week 1-2**: ChatGPT basics (2 uur/dag)\n📅 **Week 3-4**: Prompt Engineering (1.5 uur/dag)\n📅 **Week 5-6**: API Integraties (2 uur/dag)\n\nBelangrijke tips:\n- Plan korte pauzes tussen studiesessies\n- Herhaal geleerde stof regelmatig\n- Maak praktijkopdrachten';
        } else {
          response += 'Probeer het later opnieuw of gebruik de snelkoppelingen hieronder.';
        }
      }
      
      await simulateStreamingResponse(response);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    textareaRef.current?.focus();
  };

  return (
    <div className="course-chat glass-morphism">
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">AI Studieassistent</h3>
            <span className="chat-status flex items-center">
              <span className="text-xs">Online</span>
            </span>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={message.isStreaming}
          />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="quick-action-btn group"
            onClick={() => handleQuickAction(action.action)}
            disabled={isStreaming}
          >
            <span className="quick-action-icon group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyPress={handleKeyPress}
          placeholder="Stel je vraag..."
          rows={1}
          disabled={isStreaming}
        />
        <button
          className="chat-send-btn group"
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-0.5">
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CourseChat;