# GroeimetAI Course Chatbot Implementation

## Overview

Een complete RAG-powered chatbot implementatie voor het GroeimetAI cursusplatform. De chatbot kan vragen beantwoorden over cursussen, aanbevelingen doen, en gebruikers helpen bij het kiezen van de juiste cursus.

## Architectuur

### Components

1. **RAG System** (`/src/lib/rag/`)
   - `course-chatbot-system.ts` - Core chatbot functionaliteit
   - `embeddings-manager.ts` - Embedding generatie en chunking
   - `query-engine.ts` - Query processing en intent detection
   - `course-recommender.ts` - Intelligente cursusaanbevelingen
   - `course-indexer.ts` - Automatische content indexering
   - `file-watcher.ts` - File monitoring voor auto-updates
   - `indexing-queue.ts` - Redis-based queue voor achtergrond indexering

2. **API Endpoints** (`/src/app/api/`)
   - `/api/chat` - Chat interacties met streaming support
   - `/api/courses/search` - Cursus zoeken
   - `/api/courses/recommend` - Gepersonaliseerde aanbevelingen
   - `/api/indexing` - Indexering service management

3. **UI Components** (`/src/components/CourseChat/`)
   - `CourseChat.tsx` - Complete chat interface
   - `ChatMessage.tsx` - Message rendering met markdown support
   - `CourseChat.css` - Modern chat styling

4. **Services** (`/src/lib/api/`)
   - `chat-service.ts` - Unified service layer met caching

## Setup Instructies

### 1. Environment Variables

Kopieer `.env.example` naar `.env.production` en vul in:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX=groeimetai-courses

# Redis
REDIS_URL=redis://localhost:6379

# Chat Settings
CHAT_CACHE_ENABLED=true
CHAT_CACHE_EXPIRY=3600
```

### 2. Dependencies Installeren

```bash
npm install
```

### 3. Redis Starten (voor development)

```bash
docker run -d -p 6379:6379 redis:alpine
```

### 4. Cursussen Indexeren

```bash
# Eerste keer - indexeer alle cursussen
npm run index-courses

# Check status
npm run index-courses stats

# Zoek in index
npm run index-courses search "langchain memory"
```

### 5. Development Server

```bash
npm run dev
```

## Docker Deployment

### Production Deployment

```bash
# Build en start alle services
./scripts/deploy.sh production

# Of gebruik docker-compose direct
docker-compose up -d
```

### Development met Docker

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Gebruik

### Chat Component Toevoegen

```tsx
import { CourseChat } from '@/components/CourseChat';

function MyPage() {
  return (
    <div style={{ height: '600px', maxWidth: '500px' }}>
      <CourseChat />
    </div>
  );
}
```

### API Direct Gebruiken

```typescript
// Chat endpoint
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Welke cursus is het beste voor beginners?',
    context: {
      skills: ['javascript'],
      skillLevel: 'beginner',
      language: 'nl'
    }
  })
});

// Search endpoint
const results = await fetch('/api/courses/search?q=langchain&language=nl');

// Recommendations endpoint
const recommendations = await fetch('/api/courses/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    skills: ['python', 'api'],
    interests: ['ai', 'automation'],
    skillLevel: 'intermediate'
  })
});
```

## Features

### 🤖 Intelligente Query Processing
- Intent detection (course selection, learning path, content questions)
- Bilingual support (Nederlands/Engels)
- Context-aware responses

### 📚 Course Recommendations
- Skill-based matching
- Learning path generation
- Skill gap analysis
- Difficulty level matching

### 🔍 Semantic Search
- Hybrid search (semantic + keyword)
- Metadata filtering
- Code example search
- Multi-language support

### ⚡ Performance
- Response caching
- Streaming responses
- Batch indexing
- Optimized embeddings

### 🔄 Auto-Updates
- File watching voor nieuwe cursussen
- Incremental indexing
- Background processing
- Queue management

## Architectuur Beslissingen

1. **Pinecone voor Vector Storage**
   - Schaalbaar en production-ready
   - Goede performance voor semantic search
   - Metadata filtering support

2. **OpenAI Embeddings**
   - `text-embedding-3-small` voor kosten-efficiëntie
   - Goede multilingual support
   - Consistent quality

3. **Redis voor Queue & Cache**
   - Snelle in-memory operations
   - Betrouwbare job queue met Bull
   - Response caching

4. **Streaming Responses**
   - Betere UX met real-time feedback
   - Lagere perceived latency
   - Progressive rendering

## Monitoring

- Health check: `GET /api/health`
- Indexing status: `GET /api/indexing`
- Chat metrics in responses (intent, cached status)
- Docker health checks voor alle services

## Troubleshooting

### Indexering Faalt
```bash
# Check logs
docker-compose logs indexing-service

# Reset index
npm run index-courses clear
npm run index-courses
```

### Chat Errors
- Check OpenAI API key
- Verify Pinecone credentials
- Ensure Redis is running
- Check rate limits

### Performance Issues
- Enable caching: `CHAT_CACHE_ENABLED=true`
- Increase cache expiry
- Check Redis memory usage
- Monitor API rate limits

## Toekomstige Verbeteringen

- [ ] Conversation history persistence
- [ ] User preference learning
- [ ] Multi-modal support (images in lessons)
- [ ] Advanced analytics dashboard
- [ ] A/B testing voor responses
- [ ] Fine-tuned embeddings model