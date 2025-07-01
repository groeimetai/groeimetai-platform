import type { Lesson } from '@/lib/data/courses';

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Je eerste Claude applicatie',
  duration: '45 min',
  content: `
# Je eerste Claude applicatie bouwen

In deze les gaan we praktisch aan de slag met het bouwen van je eerste Claude applicatie. We maken zowel een CLI chatbot als een web applicatie, compleet met error handling en response streaming.

## Building a CLI chatbot

Laten we beginnen met een eenvoudige command-line chatbot die interactief met Claude kan communiceren.

### Basis CLI chatbot

\`\`\`javascript
// cli-chatbot.js
import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import chalk from 'chalk';

// Initialiseer Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Readline interface voor gebruikersinput
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.blue('You: ')
});

// Conversatie geschiedenis
const conversationHistory = [];

// Chat functie
async function chat(userMessage) {
  try {
    // Voeg gebruikersbericht toe aan geschiedenis
    conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // Toon "thinking" indicator
    process.stdout.write(chalk.gray('Claude is thinking...'));

    // Stuur request naar Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: conversationHistory,
      temperature: 0.7,
    });

    // Clear thinking indicator
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    // Extract en toon Claude's antwoord
    const assistantMessage = response.content[0].text;
    console.log(chalk.green('Claude: ') + assistantMessage);

    // Voeg Claude's antwoord toe aan geschiedenis
    conversationHistory.push({
      role: 'assistant',
      content: assistantMessage
    });

    return assistantMessage;
  } catch (error) {
    console.error(chalk.red('Error:', error.message));
  }
}

// Start de chatbot
console.log(chalk.yellow('=== Claude CLI Chatbot ==='));
console.log(chalk.gray('Type "exit" to quit\n'));

rl.prompt();

rl.on('line', async (input) => {
  const trimmedInput = input.trim();
  
  if (trimmedInput.toLowerCase() === 'exit') {
    console.log(chalk.yellow('Goodbye!'));
    rl.close();
    process.exit(0);
  }

  if (trimmedInput) {
    await chat(trimmedInput);
  }
  
  rl.prompt();
});
\`\`\`

### Geavanceerde CLI chatbot met streaming

Voor een betere gebruikerservaring kunnen we response streaming toevoegen:

\`\`\`javascript
// advanced-cli-chatbot.js
import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class AdvancedChatbot {
  constructor() {
    this.conversationHistory = [];
    this.systemPrompt = \`You are Claude, a helpful AI assistant.
Be conversational, friendly, and helpful.
Keep responses concise unless asked for more detail.\`;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.blue('You: ')
    });
  }

  async streamChat(userMessage) {
    // Voeg systeemprompt toe als eerste bericht
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const spinner = ora('Claude is thinking...').start();
    let fullResponse = '';

    try {
      const stream = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: messages,
        temperature: 0.7,
        stream: true,
      });

      spinner.stop();
      process.stdout.write(chalk.green('Claude: '));

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const text = chunk.delta.text;
          process.stdout.write(text);
          fullResponse += text;
        }
      }

      console.log('\\n');

      // Update geschiedenis
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: fullResponse }
      );

      // Beperk geschiedenis tot laatste 10 berichten
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

    } catch (error) {
      spinner.stop();
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.status === 429) {
      console.error(chalk.red('Rate limit exceeded. Please wait a moment.'));
    } else if (error.status === 401) {
      console.error(chalk.red('Invalid API key. Please check your configuration.'));
    } else {
      console.error(chalk.red('Error:', error.message));
    }
  }

  async start() {
    console.log(chalk.yellow('=== Advanced Claude CLI Chatbot ==='));
    console.log(chalk.gray('Commands: /exit, /clear, /history, /save'));
    console.log(chalk.gray('Type /help for more information\\n'));

    this.rl.prompt();

    this.rl.on('line', async (input) => {
      const trimmedInput = input.trim();

      // Handle commands
      if (trimmedInput.startsWith('/')) {
        await this.handleCommand(trimmedInput);
      } else if (trimmedInput) {
        await this.streamChat(trimmedInput);
      }

      this.rl.prompt();
    });
  }

  async handleCommand(command) {
    switch (command.toLowerCase()) {
      case '/exit':
        console.log(chalk.yellow('Goodbye!'));
        this.rl.close();
        process.exit(0);
        break;
      
      case '/clear':
        this.conversationHistory = [];
        console.log(chalk.green('Conversation history cleared.'));
        break;
      
      case '/history':
        console.log(chalk.cyan('\\n=== Conversation History ==='));
        this.conversationHistory.forEach((msg, index) => {
          const role = msg.role === 'user' ? chalk.blue('You:') : chalk.green('Claude:');
          console.log(\`\${role} \${msg.content.substring(0, 50)}...\`);
        });
        console.log();
        break;
      
      case '/save':
        const filename = \`chat-\${Date.now()}.json\`;
        require('fs').writeFileSync(filename, JSON.stringify(this.conversationHistory, null, 2));
        console.log(chalk.green(\`Conversation saved to \${filename}\`));
        break;
      
      case '/help':
        console.log(chalk.cyan('\\nAvailable commands:'));
        console.log('  /exit    - Exit the chatbot');
        console.log('  /clear   - Clear conversation history');
        console.log('  /history - Show conversation history');
        console.log('  /save    - Save conversation to file');
        console.log('  /help    - Show this help message\\n');
        break;
      
      default:
        console.log(chalk.red('Unknown command. Type /help for available commands.'));
    }
  }
}

// Start de chatbot
const chatbot = new AdvancedChatbot();
chatbot.start();
\`\`\`

## Web application basics

Nu bouwen we een web applicatie met Claude integratie. We gebruiken Express.js voor de server en vanilla JavaScript voor de frontend.

### Server-side implementatie

\`\`\`javascript
// server.js
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationId: z.string().optional(),
  model: z.enum(['claude-3-opus-20240229', 'claude-3-sonnet-20240229']).optional(),
});

// In-memory conversation storage (gebruik een database in productie!)
const conversations = new Map();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Valideer request
    const { message, conversationId, model } = chatRequestSchema.parse(req.body);
    
    // Haal of maak conversatie
    const convId = conversationId || \`conv-\${Date.now()}\`;
    const conversation = conversations.get(convId) || [];
    
    // Voeg gebruikersbericht toe
    conversation.push({ role: 'user', content: message });
    
    // Claude API call
    const response = await anthropic.messages.create({
      model: model || 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: conversation,
      temperature: 0.7,
    });
    
    const assistantMessage = response.content[0].text;
    
    // Update conversatie
    conversation.push({ role: 'assistant', content: assistantMessage });
    conversations.set(convId, conversation);
    
    // Stuur response
    res.json({
      response: assistantMessage,
      conversationId: convId,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      }
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Streaming chat endpoint
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, conversationId } = chatRequestSchema.parse(req.body);
    
    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const convId = conversationId || \`conv-\${Date.now()}\`;
    const conversation = conversations.get(convId) || [];
    conversation.push({ role: 'user', content: message });
    
    // Stream response
    const stream = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: conversation,
      temperature: 0.7,
      stream: true,
    });
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const text = chunk.delta.text;
        fullResponse += text;
        res.write(\`data: \${JSON.stringify({ text })}\\n\\n\`);
      }
    }
    
    // Save complete response
    conversation.push({ role: 'assistant', content: fullResponse });
    conversations.set(convId, conversation);
    
    // Send final message
    res.write(\`data: \${JSON.stringify({ done: true, conversationId: convId })}\\n\\n\`);
    res.end();
    
  } catch (error) {
    console.error('Stream error:', error);
    res.write(\`data: \${JSON.stringify({ error: error.message })}\\n\\n\`);
    res.end();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
\`\`\`

### Frontend implementatie

\`\`\`html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Chat App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .chat-container {
      width: 100%;
      max-width: 800px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .message {
      display: flex;
      gap: 12px;
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .message.user {
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .message.assistant .message-avatar {
      background: #764ba2;
    }
    
    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 16px;
      background: #f1f3f5;
      line-height: 1.5;
    }
    
    .message.user .message-content {
      background: #667eea;
      color: white;
    }
    
    .message.assistant .message-content {
      background: #f1f3f5;
      color: #333;
    }
    
    .typing-indicator {
      display: none;
      padding: 12px 16px;
      background: #f1f3f5;
      border-radius: 16px;
      width: fit-content;
    }
    
    .typing-indicator.active {
      display: block;
    }
    
    .typing-indicator span {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #999;
      margin: 0 2px;
      animation: bounce 1.4s infinite;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-10px); }
    }
    
    .chat-input {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
    }
    
    .input-field {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 24px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.3s;
    }
    
    .input-field:focus {
      border-color: #667eea;
    }
    
    .send-button {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .send-button:hover {
      background: #5a67d8;
    }
    
    .send-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="chat-header">
      <h1>Claude Chat</h1>
      <p>Powered by Anthropic</p>
    </div>
    
    <div class="chat-messages" id="chatMessages">
      <div class="message assistant">
        <div class="message-avatar">C</div>
        <div class="message-content">
          Hallo! Ik ben Claude, je AI assistent. Hoe kan ik je vandaag helpen?
        </div>
      </div>
    </div>
    
    <div class="typing-indicator" id="typingIndicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
    
    <div class="chat-input">
      <input 
        type="text" 
        class="input-field" 
        id="messageInput" 
        placeholder="Type je bericht..."
        autofocus
      >
      <button class="send-button" id="sendButton">Verstuur</button>
    </div>
  </div>

  <script>
    // Chat application logic
    class ChatApp {
      constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.conversationId = null;
        this.isProcessing = false;
        
        this.init();
      }
      
      init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
      }
      
      async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isProcessing) return;
        
        this.isProcessing = true;
        this.messageInput.value = '';
        this.sendButton.disabled = true;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
          // Use streaming endpoint
          await this.streamChat(message);
        } catch (error) {
          console.error('Error:', error);
          this.addMessage('Sorry, er ging iets mis. Probeer het opnieuw.', 'assistant');
        } finally {
          this.hideTypingIndicator();
          this.isProcessing = false;
          this.sendButton.disabled = false;
          this.messageInput.focus();
        }
      }
      
      async streamChat(message) {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationId: this.conversationId
          })
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let messageElement = null;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.text) {
                  assistantMessage += data.text;
                  
                  if (!messageElement) {
                    messageElement = this.addMessage('', 'assistant');
                  }
                  
                  messageElement.textContent = assistantMessage;
                  this.scrollToBottom();
                }
                
                if (data.done) {
                  this.conversationId = data.conversationId;
                }
                
                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
      
      addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = \`message \${role}\`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? 'U' : 'C';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        return contentDiv;
      }
      
      showTypingIndicator() {
        this.typingIndicator.classList.add('active');
        this.messagesContainer.appendChild(this.typingIndicator);
        this.scrollToBottom();
      }
      
      hideTypingIndicator() {
        this.typingIndicator.classList.remove('active');
      }
      
      scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    }
    
    // Initialize the app
    new ChatApp();
  </script>
</body>
</html>
\`\`\`

## Error handling best practices

### Comprehensive error handling

\`\`\`javascript
// errorHandler.js
export class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

export const errorHandler = {
  handleClaudeError(error) {
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'];
      return new APIError(
        \`Rate limit exceeded. Retry after \${retryAfter} seconds.\`,
        429,
        'RATE_LIMIT'
      );
    }
    
    if (error.status === 401) {
      return new APIError(
        'Invalid API key. Please check your configuration.',
        401,
        'AUTH_ERROR'
      );
    }
    
    if (error.status === 400) {
      return new APIError(
        'Invalid request format. Please check your input.',
        400,
        'VALIDATION_ERROR'
      );
    }
    
    if (error.status >= 500) {
      return new APIError(
        'Claude service is temporarily unavailable.',
        error.status,
        'SERVER_ERROR'
      );
    }
    
    return new APIError(
      error.message || 'An unexpected error occurred.',
      error.status || 500,
      'UNKNOWN_ERROR'
    );
  },
  
  async withRetry(fn, maxRetries = 3, backoff = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Wait before retrying
        const delay = backoff * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
};

// Usage example
async function safeClaudeCall(message) {
  try {
    return await errorHandler.withRetry(async () => {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: message }]
      });
      return response.content[0].text;
    });
  } catch (error) {
    const apiError = errorHandler.handleClaudeError(error);
    console.error(\`Error: \${apiError.message} (Code: \${apiError.code})\`);
    throw apiError;
  }
}
\`\`\`

## Response streaming implementatie

### Advanced streaming met progress tracking

\`\`\`typescript
interface StreamOptions {
  onToken?: (token: string) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

class StreamingClaudeClient {
  private anthropic: Anthropic;
  
  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }
  
  async streamChat(
    message: string, 
    options: StreamOptions = {}
  ): Promise<string> {
    let fullResponse = '';
    let tokenCount = 0;
    const estimatedTokens = this.estimateTokens(message) * 2; // Rough estimate
    
    try {
      const stream = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: message }],
        stream: true,
      });
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          const text = chunk.delta.text;
          fullResponse += text;
          tokenCount++;
          
          // Call callbacks
          if (options.onToken) {
            options.onToken(text);
          }
          
          if (options.onProgress) {
            const progress = Math.min(tokenCount / estimatedTokens, 0.95);
            options.onProgress(progress);
          }
        }
      }
      
      if (options.onProgress) {
        options.onProgress(1);
      }
      
      if (options.onComplete) {
        options.onComplete(fullResponse);
      }
      
      return fullResponse;
      
    } catch (error) {
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }
  
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// Usage example
const client = new StreamingClaudeClient(process.env.ANTHROPIC_API_KEY);

await client.streamChat('Tell me a story', {
  onToken: (token) => {
    process.stdout.write(token);
  },
  onProgress: (progress) => {
    // Update progress bar
    console.log(\`\\nProgress: \${(progress * 100).toFixed(0)}%\`);
  },
  onComplete: (response) => {
    console.log('\\n\\nStreaming complete!');
    console.log(\`Total response length: \${response.length}\`);
  },
  onError: (error) => {
    console.error('Streaming error:', error);
  }
});
\`\`\`

## Best practices samenvatting

### 1. **Code Organization**
   - Scheid business logic van API calls
   - Gebruik dependency injection
   - Implementeer proper error boundaries

### 2. **Performance**
   - Implementeer response caching waar mogelijk
   - Gebruik streaming voor lange responses
   - Batch requests wanneer mogelijk

### 3. **Security**
   - Valideer alle user input
   - Gebruik environment variables voor API keys
   - Implementeer proper authentication

### 4. **User Experience**
   - Toon loading states tijdens processing
   - Geef real-time feedback met streaming
   - Maak de interface accessible (ARIA labels, keyboard navigation)
   - Test op verschillende devices en browsers

Met deze voorbeelden en patterns kun je robuuste Claude applicaties bouwen die klaar zijn voor productie!
  `
};