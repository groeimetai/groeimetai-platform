import { Lesson } from '@/lib/data/courses'

export const lesson4_1: Lesson = {
  id: 'lesson-4-1',
  title: 'Conversational memory en chat history',
  duration: '45 min',
  content: `
# Conversational Memory en Chat History in RAG Systemen

Een professionele chatbot moet conversaties kunnen onthouden en context behouden over meerdere interacties. In deze les leren we hoe we robuuste memory systemen implementeren voor enterprise RAG applicaties.

## Waarom Conversational Memory Essentieel is

### Het Probleem zonder Memory
- **Context verlies**: Elke vraag wordt geïsoleerd behandeld
- **Herhaling**: Gebruikers moeten steeds opnieuw uitleggen
- **Inefficiëntie**: Geen leereffect van eerdere interacties
- **Frustratie**: Onnatuurlijke conversatie flow

### De Oplossing met Memory
- **Context behoud**: Bot onthoudt eerdere vragen en antwoorden
- **Personalisatie**: Aanpassing aan gebruikersvoorkeuren
- **Efficiëntie**: Bouw voort op eerdere kennis
- **Natuurlijke flow**: Menselijke conversatie ervaring

## Types van Memory in LangChain

### 1. ConversationBufferMemory
**Gebruik**: Korte conversaties, volledig detail behoud
\`\`\`python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)
\`\`\`

### 2. ConversationSummaryMemory
**Gebruik**: Lange conversaties, geheugen efficiëntie
\`\`\`python
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(
    llm=llm,
    memory_key="chat_history",
    return_messages=True
)
\`\`\`

### 3. ConversationSummaryBufferMemory
**Gebruik**: Beste van beide werelden
\`\`\`python
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=2000,
    memory_key="chat_history",
    return_messages=True
)
\`\`\`

### 4. VectorStoreRetrieverMemory
**Gebruik**: Semantische memory search
\`\`\`python
from langchain.memory import VectorStoreRetrieverMemory

memory = VectorStoreRetrieverMemory(
    retriever=vectorstore.as_retriever(search_kwargs=dict(k=3)),
    memory_key="chat_history"
)
\`\`\`

## Persistent Chat History Implementation

### Database Schema voor Chat History
\`\`\`sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
\`\`\`

### PostgreSQL Chat History Store
\`\`\`python
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Optional
from datetime import datetime
import uuid

class PostgresChatHistory:
    """Production-ready chat history storage"""
    
    def __init__(self, connection_string: str):
        self.conn_string = connection_string
        
    def get_connection(self):
        return psycopg2.connect(self.conn_string)
        
    def create_conversation(self, user_id: str, title: str = None) -> str:
        """Create new conversation and return ID"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                conversation_id = str(uuid.uuid4())
                cur.execute(
                    """
                    INSERT INTO conversations (id, user_id, title)
                    VALUES (%s, %s, %s)
                    """,
                    (conversation_id, user_id, title or "New Conversation")
                )
                conn.commit()
                return conversation_id
    
    def add_message(self, conversation_id: str, role: str, content: str, metadata: Dict = None):
        """Add message to conversation"""
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO messages (conversation_id, role, content, metadata)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (conversation_id, role, content, metadata or {})
                )
                # Update conversation timestamp
                cur.execute(
                    """
                    UPDATE conversations 
                    SET updated_at = CURRENT_TIMESTAMP 
                    WHERE id = %s
                    """,
                    (conversation_id,)
                )
                conn.commit()
    
    def get_conversation_history(self, conversation_id: str, limit: int = 50) -> List[Dict]:
        """Get messages for conversation"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT role, content, metadata, created_at
                    FROM messages
                    WHERE conversation_id = %s
                    ORDER BY created_at DESC
                    LIMIT %s
                    """,
                    (conversation_id, limit)
                )
                messages = cur.fetchall()
                # Return in chronological order
                return list(reversed(messages))
    
    def get_user_conversations(self, user_id: str) -> List[Dict]:
        """Get all conversations for user"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT c.id, c.title, c.created_at, c.updated_at,
                           COUNT(m.id) as message_count
                    FROM conversations c
                    LEFT JOIN messages m ON c.id = m.conversation_id
                    WHERE c.user_id = %s
                    GROUP BY c.id
                    ORDER BY c.updated_at DESC
                    """,
                    (user_id,)
                )
                return cur.fetchall()
\`\`\`

## Integration met RAG Chain

### Custom Memory met RAG Retrieval
\`\`\`python
from langchain.schema import BaseMemory
from langchain.memory import ConversationSummaryBufferMemory
from typing import Dict, Any, List

class RAGConversationMemory(BaseMemory):
    """Custom memory that combines chat history with RAG context"""
    
    def __init__(self, llm, vectorstore, db_history: PostgresChatHistory, 
                 conversation_id: str, max_token_limit: int = 2000):
        self.llm = llm
        self.vectorstore = vectorstore
        self.db_history = db_history
        self.conversation_id = conversation_id
        self.buffer_memory = ConversationSummaryBufferMemory(
            llm=llm,
            max_token_limit=max_token_limit,
            memory_key="chat_history",
            return_messages=True
        )
        # Load existing history
        self._load_history()
    
    def _load_history(self):
        """Load conversation history from database"""
        messages = self.db_history.get_conversation_history(self.conversation_id)
        for msg in messages:
            if msg['role'] == 'user':
                self.buffer_memory.chat_memory.add_user_message(msg['content'])
            else:
                self.buffer_memory.chat_memory.add_ai_message(msg['content'])
    
    @property
    def memory_variables(self) -> List[str]:
        return ["chat_history", "relevant_docs"]
    
    def load_memory_variables(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Load both chat history and relevant documents"""
        # Get buffered chat history
        history = self.buffer_memory.load_memory_variables(inputs)
        
        # Get relevant documents based on current input
        query = inputs.get("input", "")
        relevant_docs = self.vectorstore.similarity_search(query, k=3)
        
        return {
            "chat_history": history.get("chat_history", []),
            "relevant_docs": "\\n\\n".join([doc.page_content for doc in relevant_docs])
        }
    
    def save_context(self, inputs: Dict[str, Any], outputs: Dict[str, Any]) -> None:
        """Save to both buffer and database"""
        # Save to buffer memory
        self.buffer_memory.save_context(inputs, outputs)
        
        # Save to database
        self.db_history.add_message(
            self.conversation_id, 
            "user", 
            inputs.get("input", "")
        )
        self.db_history.add_message(
            self.conversation_id, 
            "assistant", 
            outputs.get("output", "")
        )
    
    def clear(self) -> None:
        """Clear memory buffer (not database)"""
        self.buffer_memory.clear()
\`\`\`

## Advanced Memory Patterns

### 1. Multi-User Memory Management
\`\`\`python
class MultiUserMemoryManager:
    """Manage memory for multiple users concurrently"""
    
    def __init__(self, llm, vectorstore, db_history: PostgresChatHistory):
        self.llm = llm
        self.vectorstore = vectorstore
        self.db_history = db_history
        self.user_memories: Dict[str, RAGConversationMemory] = {}
    
    def get_or_create_memory(self, user_id: str, conversation_id: str = None) -> RAGConversationMemory:
        """Get existing or create new memory for user"""
        if not conversation_id:
            # Create new conversation
            conversation_id = self.db_history.create_conversation(user_id)
        
        memory_key = f"{user_id}:{conversation_id}"
        
        if memory_key not in self.user_memories:
            self.user_memories[memory_key] = RAGConversationMemory(
                llm=self.llm,
                vectorstore=self.vectorstore,
                db_history=self.db_history,
                conversation_id=conversation_id
            )
        
        return self.user_memories[memory_key]
    
    def cleanup_inactive_memories(self, inactive_minutes: int = 30):
        """Remove memories that haven't been used recently"""
        # Implementation for memory cleanup
        pass
\`\`\`

### 2. Context Window Management
\`\`\`python
class ContextWindowManager:
    """Intelligent context window management for long conversations"""
    
    def __init__(self, max_tokens: int = 4000):
        self.max_tokens = max_tokens
    
    def optimize_context(self, messages: List[Dict], current_query: str) -> List[Dict]:
        """Optimize message history to fit in context window"""
        from transformers import GPT2TokenizerFast
        tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")
        
        # Calculate tokens for each message
        message_tokens = []
        for msg in messages:
            tokens = len(tokenizer.encode(msg['content']))
            message_tokens.append((msg, tokens))
        
        # Always include system message and current query
        total_tokens = len(tokenizer.encode(current_query))
        optimized_messages = []
        
        # Add messages from most recent, respecting token limit
        for msg, tokens in reversed(message_tokens):
            if total_tokens + tokens < self.max_tokens:
                optimized_messages.insert(0, msg)
                total_tokens += tokens
            else:
                # Add summary of excluded messages
                break
        
        return optimized_messages
\`\`\`

### 3. Memory Analytics
\`\`\`python
class MemoryAnalytics:
    """Analytics for conversation patterns and user behavior"""
    
    def __init__(self, db_history: PostgresChatHistory):
        self.db_history = db_history
    
    def get_conversation_stats(self, user_id: str) -> Dict:
        """Get statistics about user conversations"""
        with self.db_history.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Average conversation length
                cur.execute("""
                    SELECT 
                        AVG(message_count) as avg_messages,
                        MAX(message_count) as max_messages,
                        COUNT(DISTINCT conversation_id) as total_conversations
                    FROM (
                        SELECT conversation_id, COUNT(*) as message_count
                        FROM messages m
                        JOIN conversations c ON m.conversation_id = c.id
                        WHERE c.user_id = %s
                        GROUP BY conversation_id
                    ) as conv_stats
                """, (user_id,))
                
                stats = cur.fetchone()
                
                # Most discussed topics (if using metadata)
                cur.execute("""
                    SELECT 
                        metadata->>'topic' as topic,
                        COUNT(*) as count
                    FROM messages m
                    JOIN conversations c ON m.conversation_id = c.id
                    WHERE c.user_id = %s AND metadata->>'topic' IS NOT NULL
                    GROUP BY metadata->>'topic'
                    ORDER BY count DESC
                    LIMIT 10
                """, (user_id,))
                
                topics = cur.fetchall()
                
                return {
                    'avg_messages_per_conversation': stats['avg_messages'],
                    'max_messages_in_conversation': stats['max_messages'],
                    'total_conversations': stats['total_conversations'],
                    'top_topics': topics
                }
\`\`\`

## Production Best Practices

### 1. Memory Optimization
- **Token limits**: Altijd context window limits respecteren
- **Summarization**: Oude messages samenvatten
- **Selective loading**: Alleen relevante history laden
- **Caching**: Frequent gebruikte memories cachen

### 2. Privacy en Compliance
- **Data retention**: Automatisch oude conversaties verwijderen
- **Encryption**: Gevoelige data encrypteren
- **Access logging**: Alle memory access loggen
- **User consent**: Expliciet toestemming voor opslag

### 3. Performance
- **Database indexing**: Proper indexes voor queries
- **Connection pooling**: Efficiënt database connections beheren
- **Async operations**: Non-blocking memory operations
- **Batch operations**: Bulk inserts voor efficiency

### 4. Monitoring
\`\`\`python
import logging
from datetime import datetime

class MemoryMonitor:
    """Monitor memory usage and performance"""
    
    def __init__(self):
        self.logger = logging.getLogger('memory_monitor')
    
    def log_memory_operation(self, operation: str, user_id: str, 
                            duration_ms: float, success: bool):
        """Log memory operations for monitoring"""
        self.logger.info(
            "Memory operation",
            extra={
                'operation': operation,
                'user_id': user_id,
                'duration_ms': duration_ms,
                'success': success,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete RAG Chatbot met Persistent Memory',
      language: 'python',
      code: `import os
from typing import Dict, List, Optional
from datetime import datetime
import streamlit as st
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationSummaryBufferMemory
import pinecone

# Initialize services
@st.cache_resource
def init_services():
    """Initialize all services with caching"""
    # Pinecone
    pinecone.init(
        api_key=os.getenv("PINECONE_API_KEY"),
        environment=os.getenv("PINECONE_ENV")
    )
    
    # OpenAI
    llm = ChatOpenAI(
        temperature=0.7,
        model_name="gpt-3.5-turbo"
    )
    
    embeddings = OpenAIEmbeddings()
    
    # Vector store
    vectorstore = Pinecone.from_existing_index(
        index_name="company-knowledge",
        embedding=embeddings
    )
    
    # Database connection
    db_history = PostgresChatHistory(os.getenv("DATABASE_URL"))
    
    return llm, vectorstore, db_history

# Streamlit App
def main():
    st.set_page_config(
        page_title="Company Assistant",
        page_icon="🤖",
        layout="wide"
    )
    
    # Initialize services
    llm, vectorstore, db_history = init_services()
    
    # Sidebar for conversation management
    with st.sidebar:
        st.title("💬 Conversations")
        
        # User authentication (simplified)
        if 'user_id' not in st.session_state:
            st.session_state.user_id = st.text_input("User ID", "demo_user")
        
        # List user conversations
        if st.session_state.user_id:
            conversations = db_history.get_user_conversations(
                st.session_state.user_id
            )
            
            # New conversation button
            if st.button("➕ New Conversation"):
                new_conv_id = db_history.create_conversation(
                    st.session_state.user_id,
                    f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                )
                st.session_state.conversation_id = new_conv_id
                st.rerun()
            
            # Conversation list
            for conv in conversations:
                if st.button(
                    f"📝 {conv['title']} ({conv['message_count']} msgs)",
                    key=conv['id']
                ):
                    st.session_state.conversation_id = conv['id']
                    st.rerun()
    
    # Main chat interface
    st.title("🤖 Company Knowledge Assistant")
    
    # Initialize conversation
    if 'conversation_id' not in st.session_state:
        if st.session_state.user_id:
            # Create new conversation
            st.session_state.conversation_id = db_history.create_conversation(
                st.session_state.user_id
            )
    
    # Load conversation history
    if st.session_state.conversation_id:
        # Create memory for this conversation
        memory = RAGConversationMemory(
            llm=llm,
            vectorstore=vectorstore,
            db_history=db_history,
            conversation_id=st.session_state.conversation_id
        )
        
        # Create conversational chain
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(
                search_kwargs={"k": 4}
            ),
            memory=memory,
            return_source_documents=True,
            verbose=True
        )
        
        # Display chat history
        messages = db_history.get_conversation_history(
            st.session_state.conversation_id
        )
        
        # Chat history container
        chat_container = st.container()
        with chat_container:
            for msg in messages:
                if msg['role'] == 'user':
                    st.chat_message("user").write(msg['content'])
                else:
                    st.chat_message("assistant").write(msg['content'])
        
        # Chat input
        if prompt := st.chat_input("Ask anything about our company..."):
            # Display user message
            st.chat_message("user").write(prompt)
            
            # Process query
            with st.spinner("Thinking..."):
                try:
                    # Get response
                    response = qa_chain({"question": prompt})
                    
                    # Display assistant response
                    st.chat_message("assistant").write(response['answer'])
                    
                    # Show sources in expander
                    with st.expander("📚 Sources"):
                        for i, doc in enumerate(response['source_documents']):
                            st.write(f"**Source {i+1}:**")
                            st.write(doc.page_content[:200] + "...")
                            if doc.metadata:
                                st.write(f"*From: {doc.metadata.get('source', 'Unknown')}*")
                    
                except Exception as e:
                    st.error(f"Error: {str(e)}")
        
        # Show conversation stats
        with st.expander("📊 Conversation Stats"):
            stats = db_history.get_conversation_stats(st.session_state.conversation_id)
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Messages", len(messages))
            with col2:
                st.metric("Tokens Used", stats.get('total_tokens', 0))
            with col3:
                st.metric("Duration", stats.get('duration', '0m'))

if __name__ == "__main__":
    main()`,
      explanation: 'Complete implementatie van een RAG chatbot met persistent memory, conversation management, en professionele UI.'
    },
    {
      id: 'example-2',
      title: 'Redis-based High Performance Memory',
      language: 'python',
      code: `import redis
import json
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import hashlib

class RedisMemoryStore:
    """High-performance memory store using Redis"""
    
    def __init__(self, redis_url: str, ttl_hours: int = 24):
        self.redis_client = redis.from_url(redis_url)
        self.ttl = timedelta(hours=ttl_hours)
    
    def _get_key(self, user_id: str, conversation_id: str) -> str:
        """Generate Redis key for conversation"""
        return f"chat:memory:{user_id}:{conversation_id}"
    
    def _get_history_key(self, user_id: str, conversation_id: str) -> str:
        """Generate Redis key for message history"""
        return f"chat:history:{user_id}:{conversation_id}"
    
    def save_message(self, user_id: str, conversation_id: str, 
                    role: str, content: str, metadata: Dict = None):
        """Save message to Redis with TTL"""
        history_key = self._get_history_key(user_id, conversation_id)
        
        message = {
            'role': role,
            'content': content,
            'metadata': metadata or {},
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add to list (Redis list maintains order)
        self.redis_client.rpush(history_key, json.dumps(message))
        
        # Set TTL on the key
        self.redis_client.expire(history_key, self.ttl)
        
        # Update conversation metadata
        conv_key = self._get_key(user_id, conversation_id)
        self.redis_client.hset(conv_key, mapping={
            'last_updated': datetime.utcnow().isoformat(),
            'message_count': self.redis_client.llen(history_key)
        })
        self.redis_client.expire(conv_key, self.ttl)
    
    def get_messages(self, user_id: str, conversation_id: str, 
                    limit: int = 50) -> List[Dict]:
        """Get recent messages from Redis"""
        history_key = self._get_history_key(user_id, conversation_id)
        
        # Get last N messages
        messages = self.redis_client.lrange(history_key, -limit, -1)
        
        return [json.loads(msg) for msg in messages]
    
    def get_summary(self, user_id: str, conversation_id: str) -> Optional[str]:
        """Get conversation summary if exists"""
        key = self._get_key(user_id, conversation_id)
        summary = self.redis_client.hget(key, 'summary')
        return summary.decode('utf-8') if summary else None
    
    def save_summary(self, user_id: str, conversation_id: str, summary: str):
        """Save conversation summary"""
        key = self._get_key(user_id, conversation_id)
        self.redis_client.hset(key, 'summary', summary)
        self.redis_client.expire(key, self.ttl)
    
    def search_conversations(self, user_id: str, query: str) -> List[str]:
        """Search through user's conversations"""
        # Get all conversation keys for user
        pattern = f"chat:history:{user_id}:*"
        conversation_keys = self.redis_client.keys(pattern)
        
        matching_conversations = []
        
        for key in conversation_keys:
            # Search in messages
            messages = self.redis_client.lrange(key, 0, -1)
            for msg in messages:
                msg_data = json.loads(msg)
                if query.lower() in msg_data['content'].lower():
                    conv_id = key.decode('utf-8').split(':')[-1]
                    matching_conversations.append(conv_id)
                    break
        
        return list(set(matching_conversations))

# Integration with LangChain Memory
from langchain.memory import BaseMemory
from langchain.schema import BaseMessage, HumanMessage, AIMessage

class RedisLangChainMemory(BaseMemory):
    """LangChain compatible Redis memory"""
    
    def __init__(self, redis_store: RedisMemoryStore, 
                 user_id: str, conversation_id: str):
        self.store = redis_store
        self.user_id = user_id
        self.conversation_id = conversation_id
    
    @property
    def memory_variables(self) -> List[str]:
        return ["chat_history"]
    
    def load_memory_variables(self, inputs: Dict) -> Dict:
        """Load chat history from Redis"""
        messages = self.store.get_messages(
            self.user_id, 
            self.conversation_id
        )
        
        # Convert to LangChain messages
        chat_history = []
        for msg in messages:
            if msg['role'] == 'user':
                chat_history.append(
                    HumanMessage(content=msg['content'])
                )
            else:
                chat_history.append(
                    AIMessage(content=msg['content'])
                )
        
        return {"chat_history": chat_history}
    
    def save_context(self, inputs: Dict, outputs: Dict):
        """Save conversation to Redis"""
        # Save user message
        self.store.save_message(
            self.user_id,
            self.conversation_id,
            'user',
            inputs.get('input', '')
        )
        
        # Save AI response
        self.store.save_message(
            self.user_id,
            self.conversation_id,
            'assistant',
            outputs.get('output', '')
        )
    
    def clear(self):
        """Clear conversation from Redis"""
        history_key = self.store._get_history_key(
            self.user_id, 
            self.conversation_id
        )
        self.store.redis_client.delete(history_key)

# Usage example
redis_store = RedisMemoryStore("redis://localhost:6379")
memory = RedisLangChainMemory(
    redis_store, 
    user_id="user123", 
    conversation_id="conv456"
)

# Use with ConversationalRetrievalChain
from langchain.chains import ConversationalRetrievalChain

chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(),
    memory=memory,
    return_source_documents=True
)`,
      explanation: 'Redis-based memory implementation voor high-performance, scalable chat history met search capabilities.'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-1',
      title: 'Implementeer Multi-Level Memory System',
      description: 'Bouw een memory systeem met short-term (Redis), medium-term (PostgreSQL), en long-term (S3) storage.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `"""
Multi-Level Memory System

Implementeer een memory systeem met drie levels:
1. Short-term: Redis (laatste 24 uur)
2. Medium-term: PostgreSQL (laatste 30 dagen)
3. Long-term: S3 (archief)

Requirements:
- Automatische data migration tussen levels
- Unified search across all levels
- Performance optimization
- Cost optimization
"""

import redis
import psycopg2
import boto3
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

class MultiLevelMemory:
    """Three-tier memory system for optimal performance and cost"""
    
    def __init__(self, redis_url: str, postgres_url: str, s3_bucket: str):
        # TODO: Initialize all three storage backends
        pass
    
    def save_message(self, user_id: str, conversation_id: str, 
                    role: str, content: str):
        """Save message to appropriate tier"""
        # TODO: Implement smart routing based on recency
        pass
    
    def get_conversation(self, user_id: str, conversation_id: str,
                        start_date: datetime = None) -> List[Dict]:
        """Get conversation from all tiers"""
        # TODO: Implement unified retrieval
        pass
    
    def migrate_old_data(self):
        """Migrate data between tiers based on age"""
        # TODO: Implement migration logic
        pass
    
    def search_all_tiers(self, user_id: str, query: str) -> List[Dict]:
        """Search across all storage tiers"""
        # TODO: Implement federated search
        pass

# Implement the complete system`,
      solution: `# Solution available in course repository`,
      hints: [
        'Gebruik async operations voor parallel search',
        'Implementeer caching voor frequent accessed data',
        'Gebruik compression voor S3 storage',
        'Monitor access patterns voor optimization'
      ]
    }
  ],
  resources: [
    {
      title: 'LangChain Memory Documentation',
      url: 'https://python.langchain.com/docs/modules/memory/',
      type: 'documentation'
    },
    {
      title: 'PostgreSQL Performance Tuning',
      url: 'https://www.postgresql.org/docs/current/performance-tips.html',
      type: 'guide'
    },
    {
      title: 'Redis Best Practices',
      url: 'https://redis.io/docs/manual/patterns/',
      type: 'guide'
    }
  ]
}