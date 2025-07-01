import { Lesson } from '@/lib/data/courses';

export const lesson2_4: Lesson = {
  id: 'integraties-channels',
  title: 'Integraties: WhatsApp, Facebook, en website widgets',
  duration: '60 minuten',
  content: `
# Multi-Channel Chatbot Integraties

Een succesvolle customer service bot moet beschikbaar zijn waar je klanten zijn. In deze les leren we hoe je je bot integreert met de belangrijkste communicatiekanalen.

## Waarom Omnichannel?

### Voordelen
- **Bereik**: Klanten op hun voorkeurskanaal
- **Consistentie**: Uniforme ervaring overal
- **Efficiency**: Centraal beheer, meerdere kanalen
- **Data**: Unified customer view
- **Conversie**: Hogere engagement rates

### Populaire Kanalen
1. WhatsApp (2B+ gebruikers wereldwijd)
2. Facebook Messenger (1.3B+ gebruikers)
3. Website chat (Direct customer touchpoint)
4. Instagram DM (Growing channel)
5. Telegram (700M+ gebruikers)

## WhatsApp Business API Setup

### 1. Prerequisites
\`\`\`yaml
requirements:
  business_verification:
    - Facebook Business Manager account
    - Verified business
    - Display name approval
    
  technical:
    - HTTPS webhook endpoint
    - Server with static IP
    - SSL certificate
    
  compliance:
    - Privacy policy
    - Terms of service
    - Opt-in mechanism
\`\`\`

### 2. API Configuration
\`\`\`javascript
// WhatsApp Business API Setup
const WhatsAppClient = require('@whiskeysockets/baileys');

class WhatsAppIntegration {
  constructor(config) {
    this.config = {
      phoneNumber: config.phoneNumber,
      webhookUrl: config.webhookUrl,
      apiKey: config.apiKey,
      businessId: config.businessId
    };
  }

  async initialize() {
    // Initialize connection
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    this.client = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      defaultQueryTimeoutMs: undefined
    });
    
    // Event handlers
    this.client.ev.on('connection.update', this.handleConnectionUpdate);
    this.client.ev.on('messages.upsert', this.handleIncomingMessage);
    this.client.ev.on('creds.update', saveCreds);
  }

  async handleIncomingMessage(message) {
    const msg = message.messages[0];
    
    if (!msg.key.fromMe && msg.message) {
      const phoneNumber = msg.key.remoteJid;
      const messageText = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text;
      
      // Process with bot
      const response = await this.processWithBot({
        channel: 'whatsapp',
        userId: phoneNumber,
        message: messageText,
        messageId: msg.key.id
      });
      
      // Send response
      await this.sendMessage(phoneNumber, response);
    }
  }

  async sendMessage(phoneNumber, content) {
    // Handle different content types
    if (content.type === 'text') {
      await this.client.sendMessage(phoneNumber, {
        text: content.text
      });
    } else if (content.type === 'buttons') {
      const buttons = content.buttons.map((btn, idx) => ({
        buttonId: \`btn_\${idx}\`,
        buttonText: { displayText: btn.title },
        type: 1
      }));
      
      await this.client.sendMessage(phoneNumber, {
        text: content.text,
        footer: content.footer,
        buttons: buttons,
        headerType: 1
      });
    } else if (content.type === 'media') {
      await this.client.sendMessage(phoneNumber, {
        image: { url: content.mediaUrl },
        caption: content.caption
      });
    }
  }
}
\`\`\`

### 3. Message Templates
\`\`\`yaml
# WhatsApp approved message templates
templates:
  order_confirmation:
    name: "order_confirmation_nl"
    language: "nl"
    category: "TRANSACTIONAL"
    structure:
      header:
        type: "text"
        text: "Bestelling Bevestigd ✅"
      body:
        text: "Hallo {{1}}, uw bestelling {{2}} is bevestigd en wordt verwerkt."
      footer:
        text: "Bedankt voor uw bestelling!"
      buttons:
        - type: "QUICK_REPLY"
          text: "Track bestelling"
        - type: "QUICK_REPLY"
          text: "Contact support"
          
  appointment_reminder:
    name: "appointment_reminder_nl"
    language: "nl"
    category: "UTILITY"
    structure:
      body:
        text: "Herinnering: U heeft een afspraak op {{1}} om {{2}}. Locatie: {{3}}"
      buttons:
        - type: "QUICK_REPLY"
          text: "Bevestigen"
        - type: "QUICK_REPLY"
          text: "Verzetten"
\`\`\`

### 4. Webhook Handler
\`\`\`javascript
// Express webhook handler
app.post('/webhook/whatsapp', async (req, res) => {
  const { entry } = req.body;
  
  if (entry && entry[0].changes) {
    const change = entry[0].changes[0];
    const value = change.value;
    
    if (value.messages) {
      for (const message of value.messages) {
        await handleWhatsAppMessage({
          from: message.from,
          id: message.id,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text?.body,
          context: message.context
        });
      }
    }
    
    if (value.statuses) {
      for (const status of value.statuses) {
        await updateMessageStatus({
          id: status.id,
          status: status.status,
          timestamp: status.timestamp
        });
      }
    }
  }
  
  res.sendStatus(200);
});

// Verification endpoint
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
\`\`\`

## Facebook Messenger Bot Setup

### 1. Facebook App Configuration
\`\`\`javascript
// Facebook Messenger Setup
const { MessengerClient } = require('messaging-api-messenger');

class FacebookMessengerBot {
  constructor(config) {
    this.client = new MessengerClient({
      accessToken: config.pageAccessToken,
      appId: config.appId,
      appSecret: config.appSecret
    });
    
    this.config = config;
  }

  // Webhook handler
  async handleWebhook(req, res) {
    const body = req.body;
    
    if (body.object === 'page') {
      body.entry.forEach(entry => {
        entry.messaging.forEach(async event => {
          if (event.message) {
            await this.handleMessage(event);
          } else if (event.postback) {
            await this.handlePostback(event);
          }
        });
      });
      
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  }

  async handleMessage(event) {
    const senderId = event.sender.id;
    const message = event.message;
    
    // Get user profile
    const profile = await this.client.getUserProfile(senderId);
    
    // Process with bot
    const response = await this.processWithBot({
      channel: 'facebook',
      userId: senderId,
      userName: \`\${profile.firstName} \${profile.lastName}\`,
      message: message.text,
      quickReply: message.quick_reply
    });
    
    // Send response
    await this.sendResponse(senderId, response);
  }

  async sendResponse(recipientId, content) {
    if (content.type === 'text') {
      await this.client.sendText(recipientId, content.text);
    } else if (content.type === 'quick_replies') {
      await this.client.sendQuickReplies(recipientId, {
        text: content.text,
        quickReplies: content.options.map(option => ({
          contentType: 'text',
          title: option.title,
          payload: option.value
        }))
      });
    } else if (content.type === 'carousel') {
      await this.client.sendGenericTemplate(recipientId, {
        elements: content.cards.map(card => ({
          title: card.title,
          subtitle: card.subtitle,
          imageUrl: card.imageUrl,
          buttons: card.buttons.map(btn => ({
            type: 'postback',
            title: btn.title,
            payload: btn.payload
          }))
        }))
      });
    }
  }
}
\`\`\`

### 2. Persistent Menu
\`\`\`javascript
// Configure persistent menu
async function setupPersistentMenu(client) {
  await client.setPersistentMenu([
    {
      locale: 'default',
      composerInputDisabled: false,
      callToActions: [
        {
          title: '🛍️ Shop',
          type: 'nested',
          callToActions: [
            {
              title: 'Nieuwe Producten',
              type: 'postback',
              payload: 'SHOW_NEW_PRODUCTS'
            },
            {
              title: 'Categorieën',
              type: 'postback',
              payload: 'SHOW_CATEGORIES'
            }
          ]
        },
        {
          title: '📦 Mijn Bestellingen',
          type: 'postback',
          payload: 'MY_ORDERS'
        },
        {
          title: '💬 Support',
          type: 'postback',
          payload: 'CONTACT_SUPPORT'
        },
        {
          title: '⚙️ Instellingen',
          type: 'nested',
          callToActions: [
            {
              title: 'Notificaties',
              type: 'postback',
              payload: 'NOTIFICATION_SETTINGS'
            },
            {
              title: 'Taal',
              type: 'postback',
              payload: 'LANGUAGE_SETTINGS'
            }
          ]
        }
      ]
    }
  ]);
}
\`\`\`

### 3. Rich Media Responses
\`\`\`javascript
// Rich media message examples
const richResponses = {
  // Product carousel
  productCarousel: {
    type: 'template',
    payload: {
      template_type: 'generic',
      elements: [
        {
          title: 'Product A',
          subtitle: '€29.99 - Bestseller!',
          image_url: 'https://example.com/product-a.jpg',
          buttons: [
            {
              type: 'web_url',
              url: 'https://shop.com/product-a',
              title: 'Bekijk Details'
            },
            {
              type: 'postback',
              title: 'In Winkelwagen',
              payload: 'ADD_TO_CART_PRODUCT_A'
            }
          ]
        }
      ]
    }
  },
  
  // Receipt template
  orderReceipt: {
    type: 'template',
    payload: {
      template_type: 'receipt',
      recipient_name: 'Jan Jansen',
      order_number: '12345678',
      currency: 'EUR',
      payment_method: 'iDEAL',
      order_url: 'https://shop.com/orders/12345678',
      timestamp: '1428444852',
      elements: [
        {
          title: 'Product A',
          subtitle: 'Kleur: Blauw, Maat: L',
          quantity: 2,
          price: 29.99,
          currency: 'EUR',
          image_url: 'https://example.com/product-a.jpg'
        }
      ],
      summary: {
        subtotal: 59.98,
        shipping_cost: 4.95,
        total_tax: 12.65,
        total_cost: 77.58
      }
    }
  }
};
\`\`\`

### 4. Handover Protocol
\`\`\`javascript
// Human handover implementation
class HandoverManager {
  async passThreadControl(userId, targetAppId, metadata) {
    await this.client.passThreadControl(userId, targetAppId, metadata);
    
    // Log handover
    await this.logHandover({
      userId,
      from: 'bot',
      to: 'human_agent',
      reason: metadata.reason,
      timestamp: new Date()
    });
  }
  
  async takeThreadControl(userId, metadata) {
    await this.client.takeThreadControl(userId, metadata);
    
    // Notify user
    await this.client.sendText(userId, 
      'Je bent weer verbonden met de automatische assistent.'
    );
  }
  
  async requestThreadControl(userId, metadata) {
    await this.client.requestThreadControl(userId, metadata);
  }
}
\`\`\`

## Website Chat Widget Implementation

### 1. Basic Widget Installation
\`\`\`html
<!-- Basic chat widget -->
<!DOCTYPE html>
<html>
<head>
  <title>Customer Service Chat</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Chat Widget Script -->
  <script>
    (function() {
      // Widget configuration
      window.ChatBotConfig = {
        botId: 'your-bot-id',
        title: 'Klantenservice',
        subtitle: 'Hoe kunnen we helpen?',
        primaryColor: '#007bff',
        position: 'bottom-right',
        language: 'nl',
        startOpen: false,
        persistSession: true,
        features: {
          fileUpload: true,
          voiceInput: false,
          emoji: true,
          feedback: true
        }
      };
      
      // Load widget
      const script = document.createElement('script');
      script.src = 'https://cdn.chatbot.com/widget.js';
      script.async = true;
      document.body.appendChild(script);
    })();
  </script>
</body>
</html>
\`\`\`

### 2. Custom Widget Development
\`\`\`javascript
// Custom React chat widget
import React, { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

const ChatWidget = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize chat session
    initializeChat();
    
    // Scroll to bottom on new messages
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    const sessionId = getOrCreateSessionId();
    const welcomeMessage = await fetchWelcomeMessage(sessionId);
    
    setMessages([{
      id: Date.now(),
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Send to bot API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId: getSessionId(),
          channel: 'web'
        })
      });
      
      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>{config.title}</h3>
            <span className="chat-status">Online</span>
          </div>
          
          <div className="chat-messages">
            {messages.map(message => (
              <div
                key={message.id}
                className={\`message \${message.type}\`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type een bericht..."
            />
            <button onClick={sendMessage}>
              Verstuur
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
\`\`\`

### 3. Advanced Widget Features
\`\`\`css
/* Advanced styling and animations */
.chat-widget {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
}

/* Smooth animations */
.chat-window {
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 5px 40px rgba(0,0,0,0.16);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  margin: 10px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Rich message types */
.message.carousel {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;
}

.carousel-item {
  min-width: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
}

.quick-replies {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.quick-reply-button {
  padding: 8px 16px;
  border: 1px solid var(--primary-color);
  border-radius: 20px;
  background: white;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-reply-button:hover {
  background: var(--primary-color);
  color: white;
}
\`\`\`

### 4. Widget Analytics
\`\`\`javascript
// Analytics integration
class ChatAnalytics {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
  }
  
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStart,
      properties: {
        ...properties,
        channel: 'web_widget',
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };
    
    this.events.push(event);
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Custom analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  }
  
  trackWidgetOpen() {
    this.trackEvent('widget_opened', {
      trigger: 'user_click'
    });
  }
  
  trackMessageSent(message) {
    this.trackEvent('message_sent', {
      messageLength: message.length,
      containsEmoji: /\p{Emoji}/u.test(message)
    });
  }
  
  trackBotResponse(response, responseTime) {
    this.trackEvent('bot_response', {
      responseTime,
      responseType: response.type,
      intentDetected: response.intent
    });
  }
  
  getSessionMetrics() {
    return {
      totalEvents: this.events.length,
      sessionDuration: Date.now() - this.sessionStart,
      messagesExchanged: this.events.filter(e => 
        e.name === 'message_sent' || e.name === 'bot_response'
      ).length,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }
}
\`\`\`

## Omnichannel Bot Strategie

### 1. Unified Bot Architecture
\`\`\`javascript
// Omnichannel bot orchestrator
class OmnichannelBot {
  constructor(config) {
    this.channels = new Map();
    this.config = config;
    this.initializeChannels();
  }
  
  initializeChannels() {
    // Register channel adapters
    this.registerChannel('whatsapp', new WhatsAppAdapter());
    this.registerChannel('facebook', new FacebookAdapter());
    this.registerChannel('web', new WebAdapter());
    this.registerChannel('telegram', new TelegramAdapter());
    this.registerChannel('instagram', new InstagramAdapter());
  }
  
  registerChannel(name, adapter) {
    this.channels.set(name, adapter);
  }
  
  async processMessage(channel, message) {
    // Get channel adapter
    const adapter = this.channels.get(channel);
    if (!adapter) {
      throw new Error(\`Unknown channel: \${channel}\`);
    }
    
    // Normalize message format
    const normalizedMessage = await adapter.normalizeMessage(message);
    
    // Get user context
    const userContext = await this.getUserContext(
      normalizedMessage.userId,
      channel
    );
    
    // Process with NLU
    const intent = await this.detectIntent(normalizedMessage, userContext);
    
    // Generate response
    const response = await this.generateResponse(intent, userContext);
    
    // Adapt response for channel
    const adaptedResponse = await adapter.adaptResponse(response);
    
    // Send via channel
    await adapter.sendMessage(normalizedMessage.userId, adaptedResponse);
    
    // Update context
    await this.updateUserContext(normalizedMessage.userId, {
      lastChannel: channel,
      lastInteraction: Date.now(),
      conversationHistory: [...userContext.conversationHistory, {
        message: normalizedMessage,
        response: response,
        timestamp: Date.now()
      }]
    });
  }
}
\`\`\`

### 2. Channel-Specific Optimizations
\`\`\`yaml
channel_optimizations:
  whatsapp:
    features:
      - Message templates for notifications
      - Quick reply buttons (max 3)
      - List messages for menus
      - Media messages (images, documents)
    limitations:
      - 24-hour messaging window
      - Template approval required
      - No custom UI elements
    best_practices:
      - Use approved templates
      - Implement opt-in flow
      - Handle media efficiently
      
  facebook:
    features:
      - Rich cards and carousels
      - Persistent menu
      - Quick replies
      - Webview integration
    limitations:
      - Message tags for 24h+ messaging
      - Platform policies
    best_practices:
      - Engaging visual content
      - Clear CTAs
      - Fast response times
      
  web:
    features:
      - Full custom UI
      - Rich interactions
      - File uploads
      - Co-browsing
    limitations:
      - Browser compatibility
      - Mobile responsiveness
    best_practices:
      - Progressive enhancement
      - Accessibility (WCAG)
      - Performance optimization
\`\`\`

### 3. Context Synchronization
\`\`\`javascript
// Cross-channel context management
class ContextManager {
  constructor(redis) {
    this.redis = redis;
    this.contextTTL = 86400; // 24 hours
  }
  
  async getUserContext(userId) {
    // Try to get existing context
    const key = \`context:\${userId}\`;
    let context = await this.redis.get(key);
    
    if (context) {
      return JSON.parse(context);
    }
    
    // Create new context
    context = {
      userId,
      created: Date.now(),
      channels: [],
      preferences: {
        language: 'nl',
        notifications: true
      },
      conversationState: {},
      attributes: {}
    };
    
    await this.saveContext(userId, context);
    return context;
  }
  
  async mergeChannelContext(userId, channel, channelData) {
    const context = await this.getUserContext(userId);
    
    // Add channel if new
    if (!context.channels.includes(channel)) {
      context.channels.push(channel);
    }
    
    // Merge channel-specific data
    context.channelData = context.channelData || {};
    context.channelData[channel] = {
      ...context.channelData[channel],
      ...channelData,
      lastSeen: Date.now()
    };
    
    // Update conversation state
    if (channelData.conversationState) {
      context.conversationState = {
        ...context.conversationState,
        ...channelData.conversationState
      };
    }
    
    await this.saveContext(userId, context);
    return context;
  }
  
  async saveContext(userId, context) {
    const key = \`context:\${userId}\`;
    await this.redis.setex(
      key,
      this.contextTTL,
      JSON.stringify(context)
    );
  }
}
\`\`\`

### 4. Analytics Dashboard
\`\`\`javascript
// Omnichannel analytics
class OmnichannelAnalytics {
  async getChannelMetrics(dateRange) {
    const metrics = {
      overview: {
        totalConversations: 0,
        totalMessages: 0,
        uniqueUsers: new Set(),
        avgResponseTime: 0
      },
      byChannel: {},
      trends: [],
      userJourney: []
    };
    
    // Aggregate data per channel
    for (const channel of ['whatsapp', 'facebook', 'web']) {
      const channelData = await this.getChannelData(channel, dateRange);
      
      metrics.byChannel[channel] = {
        conversations: channelData.conversations,
        messages: channelData.messages,
        avgSessionDuration: channelData.avgDuration,
        topIntents: channelData.topIntents,
        satisfactionScore: channelData.satisfaction,
        conversionRate: channelData.conversions / channelData.conversations
      };
      
      // Update totals
      metrics.overview.totalConversations += channelData.conversations;
      metrics.overview.totalMessages += channelData.messages;
      channelData.users.forEach(u => metrics.overview.uniqueUsers.add(u));
    }
    
    // Calculate cross-channel metrics
    metrics.crossChannel = {
      multiChannelUsers: await this.getMultiChannelUsers(dateRange),
      channelSwitching: await this.getChannelSwitchingPatterns(dateRange),
      preferredChannels: await this.getChannelPreferences(dateRange)
    };
    
    return metrics;
  }
  
  async generateDashboard(metrics) {
    return {
      summary: {
        period: metrics.dateRange,
        highlights: [
          \`Total conversations: \${metrics.overview.totalConversations}\`,
          \`Unique users: \${metrics.overview.uniqueUsers.size}\`,
          \`Most active channel: \${this.getMostActiveChannel(metrics)}\`,
          \`Cross-channel users: \${metrics.crossChannel.multiChannelUsers.length}\`
        ]
      },
      charts: {
        channelDistribution: this.generateChannelPieChart(metrics),
        conversationTrend: this.generateTrendChart(metrics),
        responseTimeByChannel: this.generateResponseTimeChart(metrics),
        userJourneyFlow: this.generateJourneyMap(metrics)
      },
      recommendations: this.generateRecommendations(metrics)
    };
  }
}
\`\`\`

### 5. Best Practices
\`\`\`yaml
omnichannel_best_practices:
  consistency:
    - Unified bot personality across channels
    - Consistent response quality
    - Synchronized user data
    - Cross-channel handover
    
  optimization:
    - Channel-specific response formats
    - Optimize for mobile on all channels
    - Fast response times (<2 seconds)
    - Proactive engagement where allowed
    
  compliance:
    - GDPR/privacy compliance
    - Channel-specific policies
    - Opt-in/opt-out management
    - Data retention policies
    
  monitoring:
    - Real-time channel health
    - Error rate tracking
    - User satisfaction per channel
    - Conversion funnel analysis
\`\`\`

## Samenvatting

Succesvolle omnichannel chatbot integratie vereist:

### Key Takeaways
- **Channel Understanding**: Elk kanaal heeft unieke features en beperkingen
- **Unified Architecture**: Centrale bot logic, channel-specific adapters
- **Context Sync**: Naadloze ervaring over kanalen heen
- **Analytics**: Meten en optimaliseren per kanaal
- **Compliance**: Respecteer platform policies en privacy wetgeving

### Implementation Checklist
1. ✅ Kies je primaire kanalen based op klant demographics
2. ✅ Implementeer channel adapters
3. ✅ Setup unified context management
4. ✅ Test channel-specific features
5. ✅ Monitor en optimaliseer per kanaal

### Next Steps
- Start met één kanaal en test thoroughly
- Voeg incrementeel kanalen toe
- Monitor user adoption en satisfaction
- Iterate based op data en feedback
- Plan voor toekomstige kanalen (voice, AR/VR)

Met deze kennis ben je klaar om een truly omnichannel customer service ervaring te bouwen!`,
  assignments: [
    {
      id: 'whatsapp-bot-implementation',
      title: 'WhatsApp Bot Implementation',
      description: 'Implementeer een complete WhatsApp customer service bot. Setup WhatsApp Business API account, configureer webhook endpoints, implementeer message handling, test met verschillende message types, en monitor conversation metrics.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'omnichannel-integration',
      title: 'Omnichannel Integration',
      description: 'Integreer je bot op meerdere kanalen. Deploy bot naar WhatsApp, Facebook en Web, implementeer unified context management, test cross-channel conversation flow, setup analytics dashboard, en optimize per-channel responses.',
      difficulty: 'expert',
      type: 'project'
    }
  ]
};