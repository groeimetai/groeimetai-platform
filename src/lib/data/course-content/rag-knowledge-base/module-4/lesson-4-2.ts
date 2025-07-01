import { Lesson } from '@/lib/data/courses'

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Security en access control in RAG systemen',
  duration: '50 min',
  content: `
# Security en Access Control in RAG Systemen

Enterprise RAG systemen bevatten vaak gevoelige bedrijfsinformatie. Robuuste security en granulaire access control zijn essentieel voor veilige deployment. In deze les behandelen we alle security aspecten van RAG applicaties.

## Security Uitdagingen in RAG

### 1. Data Leakage Risico's
- **Cross-user contamination**: Informatie lekt tussen gebruikers
- **Prompt injection**: Kwaadaardige prompts extraheren data
- **Embedding attacks**: Reverse engineering van embeddings
- **Model memorization**: LLM onthoudt training data

### 2. Access Control Complexiteit
- **Document-level permissions**: Wie mag wat zien?
- **Field-level security**: Gevoelige velden binnen documenten
- **Dynamic permissions**: Tijdelijke of contextual access
- **Hierarchical access**: Organizational structure

### 3. Compliance Requirements
- **GDPR**: Right to be forgotten, data portability
- **HIPAA**: Medical data protection
- **SOC2**: Security controls en auditing
- **Industry-specific**: Financial, government regulations

## Implementatie van Role-Based Access Control (RBAC)

### Database Schema voor RBAC
\`\`\`sql
-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource, action)
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- User roles mapping
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Document access control
CREATE TABLE document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    user_id UUID REFERENCES users(id),
    access_level VARCHAR(50) NOT NULL, -- 'read', 'write', 'delete'
    conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK ((role_id IS NOT NULL) OR (user_id IS NOT NULL))
);

-- Audit log
CREATE TABLE security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_document_permissions_document ON document_permissions(document_id);
CREATE INDEX idx_audit_log_user_timestamp ON security_audit_log(user_id, timestamp);
\`\`\`

### Secure Document Ingestion
\`\`\`python
from typing import List, Dict, Optional
import hashlib
from datetime import datetime
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from cryptography.fernet import Fernet
import re

class SecureDocumentProcessor:
    """Secure document processing with access control"""
    
    def __init__(self, encryption_key: bytes = None):
        self.encryption_key = encryption_key or Fernet.generate_key()
        self.cipher = Fernet(self.encryption_key)
        self.pii_patterns = {
            'ssn': r'\\b\\d{3}-\\d{2}-\\d{4}\\b',
            'email': r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
            'phone': r'\\b\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b',
            'credit_card': r'\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b'
        }
    
    def sanitize_content(self, content: str) -> tuple[str, Dict[str, List[str]]]:
        """Remove or mask PII from content"""
        found_pii = {}
        sanitized = content
        
        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, content)
            if matches:
                found_pii[pii_type] = matches
                # Mask PII
                for match in matches:
                    mask = f"[{pii_type.upper()}_REDACTED]"
                    sanitized = sanitized.replace(match, mask)
        
        return sanitized, found_pii
    
    def process_document(self, file_path: str, owner_id: str, 
                        access_roles: List[str], classification: str = "internal") -> Dict:
        """Process document with security metadata"""
        # Load document
        loader = TextLoader(file_path)
        document = loader.load()[0]
        
        # Sanitize content
        sanitized_content, found_pii = self.sanitize_content(document.page_content)
        
        # Generate document ID
        doc_id = hashlib.sha256(
            f"{file_path}:{owner_id}:{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()
        
        # Encrypt sensitive metadata
        encrypted_metadata = self.cipher.encrypt(
            str({
                'original_path': file_path,
                'found_pii': found_pii,
                'processing_time': datetime.utcnow().isoformat()
            }).encode()
        )
        
        # Create secure document
        return {
            'id': doc_id,
            'content': sanitized_content,
            'metadata': {
                'owner_id': owner_id,
                'access_roles': access_roles,
                'classification': classification,
                'encrypted_data': encrypted_metadata.decode(),
                'created_at': datetime.utcnow().isoformat(),
                'has_pii': bool(found_pii)
            }
        }
    
    def split_with_permissions(self, document: Dict, chunk_size: int = 1000) -> List[Dict]:
        """Split document while preserving permissions"""
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=100
        )
        
        chunks = splitter.split_text(document['content'])
        
        # Preserve metadata for each chunk
        return [
            {
                'content': chunk,
                'metadata': {
                    **document['metadata'],
                    'parent_doc_id': document['id'],
                    'chunk_index': i
                }
            }
            for i, chunk in enumerate(chunks)
        ]
\`\`\`

## Secure Vector Store Implementation

### Access-Controlled Vector Search
\`\`\`python
from typing import List, Dict, Optional, Set
import numpy as np
from langchain.vectorstores import VectorStore
from langchain.schema import Document

class SecureVectorStore:
    """Vector store with built-in access control"""
    
    def __init__(self, base_vectorstore: VectorStore, 
                 permission_checker: 'PermissionChecker'):
        self.vectorstore = base_vectorstore
        self.permission_checker = permission_checker
    
    def add_documents(self, documents: List[Document], user_id: str) -> List[str]:
        """Add documents with permission check"""
        # Verify user can add documents
        if not self.permission_checker.can_write(user_id):
            raise PermissionError("User not authorized to add documents")
        
        # Add audit trail
        for doc in documents:
            doc.metadata['added_by'] = user_id
            doc.metadata['added_at'] = datetime.utcnow().isoformat()
        
        return self.vectorstore.add_documents(documents)
    
    def similarity_search(self, query: str, user_id: str, k: int = 4) -> List[Document]:
        """Search with access control filtering"""
        # Get user's accessible roles
        user_roles = self.permission_checker.get_user_roles(user_id)
        
        # Search with higher k to account for filtering
        raw_results = self.vectorstore.similarity_search(query, k=k*3)
        
        # Filter based on permissions
        filtered_results = []
        for doc in raw_results:
            if self._can_access_document(user_id, user_roles, doc):
                filtered_results.append(doc)
                if len(filtered_results) >= k:
                    break
        
        # Log access
        self._log_access(user_id, query, len(filtered_results))
        
        return filtered_results
    
    def _can_access_document(self, user_id: str, user_roles: Set[str], 
                            document: Document) -> bool:
        """Check if user can access document"""
        doc_metadata = document.metadata
        
        # Check owner
        if doc_metadata.get('owner_id') == user_id:
            return True
        
        # Check role-based access
        doc_roles = set(doc_metadata.get('access_roles', []))
        if user_roles.intersection(doc_roles):
            return True
        
        # Check explicit permissions
        if user_id in doc_metadata.get('allowed_users', []):
            return True
        
        return False
    
    def _log_access(self, user_id: str, query: str, results_count: int):
        """Log search access for auditing"""
        # Implementation depends on your logging system
        pass

class PermissionChecker:
    """Check user permissions against security policies"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def get_user_roles(self, user_id: str) -> Set[str]:
        """Get all roles for user including inherited"""
        with self.db.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT r.name
                FROM roles r
                JOIN user_roles ur ON r.id = ur.role_id
                WHERE ur.user_id = %s 
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            """, (user_id,))
            
            return {row[0] for row in cur.fetchall()}
    
    def can_read(self, user_id: str, resource: str = None) -> bool:
        """Check read permission"""
        return self._check_permission(user_id, 'read', resource)
    
    def can_write(self, user_id: str, resource: str = None) -> bool:
        """Check write permission"""
        return self._check_permission(user_id, 'write', resource)
    
    def _check_permission(self, user_id: str, action: str, resource: str = None) -> bool:
        """Check specific permission"""
        with self.db.cursor() as cur:
            query = """
                SELECT 1
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = %s 
                AND p.action = %s
                AND (p.resource = %s OR p.resource = '*')
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
                LIMIT 1
            """
            
            cur.execute(query, (user_id, action, resource or '*'))
            return cur.fetchone() is not None
\`\`\`

## Advanced Security Patterns

### 1. Zero Trust Architecture
\`\`\`python
from functools import wraps
import jwt
from typing import Callable
import time

class ZeroTrustAuth:
    """Implement zero trust principles for RAG"""
    
    def __init__(self, secret_key: str, token_ttl: int = 300):
        self.secret_key = secret_key
        self.token_ttl = token_ttl
    
    def generate_token(self, user_id: str, permissions: List[str]) -> str:
        """Generate short-lived JWT token"""
        payload = {
            'user_id': user_id,
            'permissions': permissions,
            'exp': int(time.time()) + self.token_ttl,
            'iat': int(time.time())
        }
        
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token: str) -> Dict:
        """Verify and decode token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")
    
    def require_permission(self, permission: str) -> Callable:
        """Decorator for permission-based access control"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Extract token from request context
                token = kwargs.get('auth_token')
                if not token:
                    raise PermissionError("No authentication token provided")
                
                # Verify token and check permission
                payload = self.verify_token(token)
                if permission not in payload.get('permissions', []):
                    raise PermissionError(f"Missing required permission: {permission}")
                
                # Add user context
                kwargs['user_context'] = payload
                
                return func(*args, **kwargs)
            
            return wrapper
        return decorator
\`\`\`

### 2. Content Filtering and DLP
\`\`\`python
class DataLossPreventionFilter:
    """Prevent sensitive data exposure in RAG responses"""
    
    def __init__(self):
        self.sensitive_patterns = {
            'api_key': r'(api[_-]?key|apikey)[\\s:=]+[\\w-]{20,}',
            'password': r'(password|passwd|pwd)[\\s:=]+[^\\s]+',
            'secret': r'(secret|token)[\\s:=]+[\\w-]+',
            'private_key': r'-----BEGIN (RSA |EC )?PRIVATE KEY-----'
        }
        
        self.classification_rules = {
            'highly_confidential': ['board', 'acquisition', 'merger', 'layoff'],
            'confidential': ['salary', 'performance', 'budget', 'forecast'],
            'internal': ['project', 'roadmap', 'planning', 'strategy']
        }
    
    def filter_response(self, response: str, user_clearance: str) -> str:
        """Filter response based on user clearance level"""
        # Remove sensitive patterns
        filtered = self._remove_sensitive_patterns(response)
        
        # Apply classification-based filtering
        filtered = self._apply_classification_filter(filtered, user_clearance)
        
        return filtered
    
    def _remove_sensitive_patterns(self, text: str) -> str:
        """Remove sensitive data patterns"""
        import re
        
        for pattern_name, pattern in self.sensitive_patterns.items():
            text = re.sub(pattern, f'[{pattern_name.upper()}_REDACTED]', text, flags=re.IGNORECASE)
        
        return text
    
    def _apply_classification_filter(self, text: str, user_clearance: str) -> str:
        """Filter based on document classification"""
        clearance_levels = {
            'public': 0,
            'internal': 1,
            'confidential': 2,
            'highly_confidential': 3
        }
        
        user_level = clearance_levels.get(user_clearance, 0)
        
        # Check for classified content
        for classification, keywords in self.classification_rules.items():
            required_level = clearance_levels.get(classification, 3)
            
            if user_level < required_level:
                # Check if content contains classified keywords
                for keyword in keywords:
                    if keyword.lower() in text.lower():
                        return "[CONTENT REQUIRES HIGHER CLEARANCE LEVEL]"
        
        return text
\`\`\`

### 3. Secure API Gateway
\`\`\`python
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncio
from typing import Optional
import redis
from datetime import datetime

app = FastAPI()
security = HTTPBearer()

class RateLimiter:
    """Rate limiting for API protection"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    async def check_rate_limit(self, user_id: str, limit: int = 100, 
                              window: int = 3600) -> bool:
        """Check if user exceeded rate limit"""
        key = f"rate_limit:{user_id}"
        
        try:
            current = await self.redis.incr(key)
            if current == 1:
                await self.redis.expire(key, window)
            
            return current <= limit
        except Exception:
            return True  # Fail open if Redis is down

class SecureRAGAPI:
    """Secure API gateway for RAG system"""
    
    def __init__(self, rag_chain, auth_service: ZeroTrustAuth, 
                 rate_limiter: RateLimiter):
        self.rag_chain = rag_chain
        self.auth_service = auth_service
        self.rate_limiter = rate_limiter
        self.dlp_filter = DataLossPreventionFilter()
    
    async def verify_token(self, credentials: HTTPAuthorizationCredentials = Security(security)):
        """Verify bearer token"""
        token = credentials.credentials
        
        try:
            payload = self.auth_service.verify_token(token)
            return payload
        except ValueError as e:
            raise HTTPException(status_code=401, detail=str(e))
    
    @app.post("/api/v1/query")
    async def query(self, request: Dict, user_context = Depends(verify_token)):
        """Secure query endpoint"""
        user_id = user_context['user_id']
        
        # Rate limiting
        if not await self.rate_limiter.check_rate_limit(user_id):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Input validation
        query_text = request.get('query', '').strip()
        if not query_text or len(query_text) > 1000:
            raise HTTPException(status_code=400, detail="Invalid query")
        
        # Audit logging
        await self._log_query(user_id, query_text)
        
        try:
            # Process query with security context
            response = await self.rag_chain.arun(
                query=query_text,
                user_id=user_id,
                user_roles=user_context.get('permissions', [])
            )
            
            # Apply DLP filtering
            filtered_response = self.dlp_filter.filter_response(
                response, 
                user_context.get('clearance', 'internal')
            )
            
            return {
                'response': filtered_response,
                'query_id': self._generate_query_id(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            # Log error securely (no sensitive data in logs)
            await self._log_error(user_id, str(e))
            raise HTTPException(status_code=500, detail="Internal server error")
    
    async def _log_query(self, user_id: str, query: str):
        """Securely log queries for auditing"""
        # Implementation depends on your logging system
        pass
    
    async def _log_error(self, user_id: str, error: str):
        """Log errors without exposing sensitive information"""
        # Implementation depends on your logging system
        pass
    
    def _generate_query_id(self) -> str:
        """Generate unique query ID for tracking"""
        import uuid
        return str(uuid.uuid4())
\`\`\`

## Security Best Practices Checklist

### 1. Authentication & Authorization
✅ Implement multi-factor authentication
✅ Use short-lived JWT tokens
✅ Implement role-based access control (RBAC)
✅ Regular permission audits
✅ Principle of least privilege

### 2. Data Protection
✅ Encrypt data at rest and in transit
✅ Implement field-level encryption for PII
✅ Regular security scanning for sensitive data
✅ Data loss prevention (DLP) policies
✅ Secure key management (HSM/KMS)

### 3. API Security
✅ Rate limiting and throttling
✅ Input validation and sanitization
✅ API versioning and deprecation
✅ Request signing for critical operations
✅ CORS and CSP headers

### 4. Monitoring & Auditing
✅ Comprehensive audit logging
✅ Real-time security alerts
✅ Regular security assessments
✅ Incident response procedures
✅ Compliance reporting

### 5. Infrastructure Security
✅ Network segmentation
✅ Regular security patches
✅ Vulnerability scanning
✅ Penetration testing
✅ Disaster recovery planning`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete Secure RAG Implementation',
      language: 'python',
      code: `import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import hashlib
import jwt
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationSummaryBufferMemory
import pinecone
import psycopg2
from psycopg2.pool import SimpleConnectionPool
import redis
from cryptography.fernet import Fernet
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Secure RAG API")
security = HTTPBearer()

# Database connection pool
db_pool = SimpleConnectionPool(
    1, 20,
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

# Redis for caching and rate limiting
redis_client = redis.from_url(os.getenv("REDIS_URL"))

# Encryption
encryption_key = os.getenv("ENCRYPTION_KEY").encode()
cipher = Fernet(encryption_key)

class SecureRAGSystem:
    """Complete secure RAG implementation"""
    
    def __init__(self):
        # Initialize components
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-3.5-turbo"
        )
        
        self.embeddings = OpenAIEmbeddings()
        
        # Initialize Pinecone
        pinecone.init(
            api_key=os.getenv("PINECONE_API_KEY"),
            environment=os.getenv("PINECONE_ENV")
        )
        
        self.vectorstore = Pinecone.from_existing_index(
            index_name="secure-knowledge-base",
            embedding=self.embeddings
        )
        
        # Security components
        self.auth_service = AuthenticationService()
        self.permission_checker = PermissionChecker(db_pool)
        self.dlp_filter = DataLossPreventionFilter()
        self.rate_limiter = RateLimiter(redis_client)
    
    async def process_query(self, query: str, auth_token: str) -> Dict:
        """Process query with full security checks"""
        
        # 1. Authenticate user
        user_context = self.auth_service.verify_token(auth_token)
        user_id = user_context['user_id']
        
        # 2. Rate limiting
        if not await self.rate_limiter.check(user_id):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # 3. Input validation
        if not self._validate_input(query):
            raise HTTPException(status_code=400, detail="Invalid input")
        
        # 4. Get user permissions
        user_roles = self.permission_checker.get_user_roles(user_id)
        
        # 5. Create secure retriever
        secure_retriever = SecureRetriever(
            self.vectorstore.as_retriever(),
            user_id,
            user_roles
        )
        
        # 6. Setup memory with encryption
        memory = SecureConversationMemory(
            self.llm,
            user_id,
            encryption_key=encryption_key
        )
        
        # 7. Create chain with security context
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=secure_retriever,
            memory=memory,
            return_source_documents=True
        )
        
        # 8. Execute query
        try:
            result = await qa_chain.arun({
                "question": query,
                "user_context": user_context
            })
            
            # 9. Apply DLP filtering
            filtered_answer = self.dlp_filter.filter(
                result['answer'],
                user_context.get('clearance_level', 'internal')
            )
            
            # 10. Audit logging
            await self._audit_log(user_id, query, filtered_answer)
            
            return {
                'answer': filtered_answer,
                'sources': self._sanitize_sources(result.get('source_documents', [])),
                'query_id': self._generate_query_id(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Query processing error: {str(e)}")
            await self._log_security_event(user_id, "query_error", str(e))
            raise HTTPException(status_code=500, detail="Processing error")
    
    def _validate_input(self, query: str) -> bool:
        """Validate and sanitize input"""
        # Check length
        if not query or len(query) > 1000:
            return False
        
        # Check for injection patterns
        injection_patterns = [
            'ignore previous instructions',
            'disregard all prior commands',
            'system prompt',
            '</system>',
            '\\x00',  # Null byte
            'javascript:',  # XSS attempt
        ]
        
        query_lower = query.lower()
        for pattern in injection_patterns:
            if pattern in query_lower:
                return False
        
        return True
    
    def _sanitize_sources(self, sources: List) -> List[Dict]:
        """Remove sensitive metadata from sources"""
        sanitized = []
        
        for source in sources:
            sanitized.append({
                'content': source.page_content[:200] + '...',
                'metadata': {
                    'source': source.metadata.get('source', 'Unknown'),
                    'page': source.metadata.get('page', 'N/A')
                }
            })
        
        return sanitized
    
    async def _audit_log(self, user_id: str, query: str, response: str):
        """Comprehensive audit logging"""
        conn = db_pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO security_audit_log 
                    (user_id, action, resource, details, ip_address, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    user_id,
                    'rag_query',
                    'knowledge_base',
                    {
                        'query_hash': hashlib.sha256(query.encode()).hexdigest(),
                        'response_length': len(response),
                        'filtered': self.dlp_filter.was_filtered
                    },
                    self._get_client_ip(),
                    datetime.utcnow()
                ))
                conn.commit()
        finally:
            db_pool.putconn(conn)

# API Endpoints
@app.post("/api/v1/auth/login")
async def login(credentials: Dict):
    """Secure login endpoint"""
    auth_service = AuthenticationService()
    
    try:
        # Verify credentials
        user = await auth_service.authenticate(
            credentials['username'],
            credentials['password']
        )
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate token
        token = auth_service.generate_token(user)
        
        return {
            'token': token,
            'expires_in': 3600,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'roles': user['roles']
            }
        }
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@app.post("/api/v1/query")
async def query_endpoint(
    request: Dict,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Secure query endpoint"""
    rag_system = SecureRAGSystem()
    
    return await rag_system.process_query(
        query=request['query'],
        auth_token=credentials.credentials
    )

@app.get("/api/v1/audit/logs")
async def get_audit_logs(
    start_date: datetime,
    end_date: datetime,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """Get audit logs (admin only)"""
    auth_service = AuthenticationService()
    user_context = auth_service.verify_token(credentials.credentials)
    
    # Check admin permission
    if 'admin' not in user_context.get('roles', []):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM security_audit_log
                WHERE timestamp BETWEEN %s AND %s
                ORDER BY timestamp DESC
                LIMIT 1000
            """, (start_date, end_date))
            
            logs = cur.fetchall()
            return {'logs': logs}
    finally:
        db_pool.putconn(conn)

# Health check endpoint
@app.get("/health")
async def health_check():
    """System health check"""
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'components': {
            'database': db_pool.closed == 0,
            'redis': redis_client.ping(),
            'vectorstore': True  # Add actual check
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
      explanation: 'Complete productie-klare secure RAG implementatie met authentication, authorization, rate limiting, DLP, en comprehensive auditing.'
    },
    {
      id: 'example-2',
      title: 'Advanced Threat Detection System',
      language: 'python',
      code: `import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Optional
import asyncio
from datetime import datetime, timedelta
import json

class ThreatDetectionSystem:
    """ML-based threat detection for RAG systems"""
    
    def __init__(self):
        self.anomaly_detector = IsolationForest(
            contamination=0.01,
            random_state=42
        )
        self.threat_patterns = {
            'prompt_injection': [
                'ignore all previous instructions',
                'system: you are now',
                'disregard the above',
                '</system>',
                'print your instructions'
            ],
            'data_exfiltration': [
                'list all documents',
                'show me everything about',
                'dump the database',
                'export all data'
            ],
            'privilege_escalation': [
                'grant me admin access',
                'change my role to',
                'override permissions',
                'bypass security'
            ]
        }
        self.user_behavior_baseline = {}
        
    def analyze_query(self, user_id: str, query: str, 
                     context: Dict) -> Dict[str, any]:
        """Analyze query for potential threats"""
        threat_score = 0
        detected_threats = []
        
        # 1. Pattern matching
        pattern_threats = self._check_threat_patterns(query)
        if pattern_threats:
            threat_score += len(pattern_threats) * 0.3
            detected_threats.extend(pattern_threats)
        
        # 2. Behavioral analysis
        behavior_anomaly = self._check_behavior_anomaly(user_id, query, context)
        if behavior_anomaly > 0.7:
            threat_score += behavior_anomaly * 0.4
            detected_threats.append('behavioral_anomaly')
        
        # 3. Query complexity analysis
        complexity_score = self._analyze_query_complexity(query)
        if complexity_score > 0.8:
            threat_score += complexity_score * 0.3
            detected_threats.append('suspicious_complexity')
        
        # 4. Context analysis
        context_threats = self._analyze_context(user_id, context)
        if context_threats:
            threat_score += len(context_threats) * 0.2
            detected_threats.extend(context_threats)
        
        return {
            'threat_score': min(threat_score, 1.0),
            'detected_threats': detected_threats,
            'action': self._determine_action(threat_score),
            'details': {
                'pattern_match': pattern_threats,
                'behavior_score': behavior_anomaly,
                'complexity': complexity_score
            }
        }
    
    def _check_threat_patterns(self, query: str) -> List[str]:
        """Check for known threat patterns"""
        detected = []
        query_lower = query.lower()
        
        for threat_type, patterns in self.threat_patterns.items():
            for pattern in patterns:
                if pattern in query_lower:
                    detected.append(f"{threat_type}:{pattern}")
        
        return detected
    
    def _check_behavior_anomaly(self, user_id: str, query: str, 
                               context: Dict) -> float:
        """Detect anomalous user behavior"""
        # Get user baseline
        baseline = self.user_behavior_baseline.get(user_id, {})
        
        if not baseline:
            # First time user, establish baseline
            self._update_baseline(user_id, query, context)
            return 0.0
        
        # Extract features
        features = self._extract_behavior_features(query, context)
        
        # Compare with baseline
        anomaly_score = 0.0
        
        # Query length anomaly
        avg_length = baseline.get('avg_query_length', 50)
        if len(query) > avg_length * 3:
            anomaly_score += 0.3
        
        # Time pattern anomaly
        current_hour = datetime.now().hour
        usual_hours = baseline.get('active_hours', [])
        if usual_hours and current_hour not in usual_hours:
            anomaly_score += 0.2
        
        # Query frequency anomaly
        recent_queries = baseline.get('recent_query_count', 0)
        if recent_queries > baseline.get('avg_queries_per_hour', 10) * 3:
            anomaly_score += 0.5
        
        return min(anomaly_score, 1.0)
    
    def _analyze_query_complexity(self, query: str) -> float:
        """Analyze query complexity for suspicious patterns"""
        complexity_score = 0.0
        
        # Length score
        if len(query) > 500:
            complexity_score += 0.3
        
        # Special character ratio
        special_chars = sum(1 for c in query if not c.isalnum() and not c.isspace())
        special_ratio = special_chars / len(query) if query else 0
        if special_ratio > 0.3:
            complexity_score += 0.3
        
        # Nested structure detection
        brackets = query.count('(') + query.count('[') + query.count('{')
        if brackets > 5:
            complexity_score += 0.2
        
        # Encoding attempts
        if any(pattern in query for pattern in ['base64', 'hex', '\\\\x', '%']):
            complexity_score += 0.2
        
        return min(complexity_score, 1.0)
    
    def _analyze_context(self, user_id: str, context: Dict) -> List[str]:
        """Analyze request context for threats"""
        threats = []
        
        # Rapid role changes
        if 'role_changes' in context and context['role_changes'] > 3:
            threats.append('rapid_role_changes')
        
        # Multiple failed attempts
        if 'failed_attempts' in context and context['failed_attempts'] > 5:
            threats.append('multiple_failures')
        
        # Geographic anomaly
        if 'ip_location' in context:
            usual_location = self.user_behavior_baseline.get(
                user_id, {}
            ).get('usual_location')
            
            if usual_location and context['ip_location'] != usual_location:
                threats.append('location_anomaly')
        
        return threats
    
    def _determine_action(self, threat_score: float) -> str:
        """Determine action based on threat score"""
        if threat_score >= 0.8:
            return 'block'
        elif threat_score >= 0.5:
            return 'challenge'  # Additional verification
        elif threat_score >= 0.3:
            return 'monitor'    # Enhanced logging
        else:
            return 'allow'
    
    def _update_baseline(self, user_id: str, query: str, context: Dict):
        """Update user behavior baseline"""
        if user_id not in self.user_behavior_baseline:
            self.user_behavior_baseline[user_id] = {
                'first_seen': datetime.now(),
                'query_count': 0,
                'total_length': 0,
                'active_hours': set(),
                'usual_location': context.get('ip_location')
            }
        
        baseline = self.user_behavior_baseline[user_id]
        baseline['query_count'] += 1
        baseline['total_length'] += len(query)
        baseline['avg_query_length'] = baseline['total_length'] / baseline['query_count']
        baseline['active_hours'].add(datetime.now().hour)
        baseline['last_seen'] = datetime.now()

class SecurityOrchestrator:
    """Orchestrate all security components"""
    
    def __init__(self):
        self.threat_detector = ThreatDetectionSystem()
        self.incident_response = IncidentResponseSystem()
        self.security_logger = SecurityLogger()
    
    async def process_request(self, user_id: str, query: str, 
                            context: Dict) -> Dict:
        """Process request through security pipeline"""
        
        # 1. Threat detection
        threat_analysis = self.threat_detector.analyze_query(
            user_id, query, context
        )
        
        # 2. Log security event
        await self.security_logger.log_event({
            'user_id': user_id,
            'event_type': 'query_analysis',
            'threat_score': threat_analysis['threat_score'],
            'detected_threats': threat_analysis['detected_threats']
        })
        
        # 3. Take action based on threat level
        action = threat_analysis['action']
        
        if action == 'block':
            # Block and initiate incident response
            await self.incident_response.handle_threat(
                user_id, threat_analysis
            )
            raise SecurityException("Request blocked due to security threat")
        
        elif action == 'challenge':
            # Additional verification required
            challenge_result = await self._challenge_user(user_id)
            if not challenge_result:
                raise SecurityException("Additional verification failed")
        
        elif action == 'monitor':
            # Enhanced monitoring
            context['enhanced_monitoring'] = True
        
        return {
            'allowed': True,
            'security_context': {
                'threat_level': threat_analysis['threat_score'],
                'monitoring': action == 'monitor'
            }
        }
    
    async def _challenge_user(self, user_id: str) -> bool:
        """Challenge user with additional verification"""
        # Implementation depends on your auth system
        # Could be MFA, CAPTCHA, security questions, etc.
        return True

class IncidentResponseSystem:
    """Automated incident response"""
    
    async def handle_threat(self, user_id: str, threat_analysis: Dict):
        """Respond to detected threats"""
        severity = self._calculate_severity(threat_analysis)
        
        # 1. Immediate actions
        if severity >= 0.8:
            await self._lock_user_account(user_id)
            await self._notify_security_team(user_id, threat_analysis)
        
        # 2. Containment
        await self._revoke_active_sessions(user_id)
        await self._increase_monitoring(user_id)
        
        # 3. Investigation
        investigation_id = await self._start_investigation(
            user_id, threat_analysis
        )
        
        # 4. Recovery planning
        await self._plan_recovery(investigation_id)
    
    def _calculate_severity(self, threat_analysis: Dict) -> float:
        """Calculate incident severity"""
        base_score = threat_analysis['threat_score']
        
        # Adjust based on threat types
        if 'data_exfiltration' in str(threat_analysis['detected_threats']):
            base_score *= 1.5
        
        if 'privilege_escalation' in str(threat_analysis['detected_threats']):
            base_score *= 1.3
        
        return min(base_score, 1.0)`,
      explanation: 'Advanced ML-based threat detection system met behavioral analysis, pattern matching, en automated incident response.'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-2',
      title: 'Implementeer End-to-End Security voor RAG',
      description: 'Bouw een complete security layer voor een RAG systeem met authentication, authorization, encryption, en threat detection.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `"""
Complete Security Implementation for RAG

Implementeer een production-ready security system met:
1. OAuth2/JWT authentication
2. Fine-grained RBAC
3. End-to-end encryption
4. Real-time threat detection
5. Compliance reporting (GDPR/SOC2)

Requirements:
- Multi-tenant support
- Audit trail voor alle acties
- Automated security responses
- Performance < 100ms overhead
"""

from typing import Dict, List, Optional, Set
import asyncio
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import jwt

class EnterpriseSecuritySystem:
    """Complete enterprise security implementation"""
    
    def __init__(self, config: Dict):
        # TODO: Initialize all security components
        pass
    
    async def authenticate(self, credentials: Dict) -> Optional[Dict]:
        """Multi-factor authentication"""
        # TODO: Implement OAuth2/SAML/MFA
        pass
    
    async def authorize(self, user: Dict, resource: str, action: str) -> bool:
        """Fine-grained authorization"""
        # TODO: Implement ABAC/RBAC with dynamic policies
        pass
    
    async def encrypt_data(self, data: bytes, classification: str) -> bytes:
        """Encrypt data based on classification"""
        # TODO: Implement field-level encryption
        pass
    
    async def detect_threats(self, request: Dict) -> Dict:
        """Real-time threat detection"""
        # TODO: Implement ML-based threat detection
        pass
    
    async def generate_compliance_report(self, standard: str) -> Dict:
        """Generate compliance reports"""
        # TODO: Implement GDPR, SOC2, HIPAA reporting
        pass

# Implement the complete system following security best practices`,
      solution: `# Complete solution available in course repository`,
      hints: [
        'Start met een threat model voor je systeem',
        'Gebruik established security frameworks (OWASP)',
        'Test security met penetration testing tools',
        'Implementeer defense in depth strategy',
        'Automate security monitoring en response'
      ]
    }
  ],
  resources: [
    {
      title: 'OWASP Security Guidelines',
      url: 'https://owasp.org/www-project-top-ten/',
      type: 'guide'
    },
    {
      title: 'Zero Trust Architecture',
      url: 'https://www.nist.gov/publications/zero-trust-architecture',
      type: 'documentation'
    },
    {
      title: 'FastAPI Security',
      url: 'https://fastapi.tiangolo.com/tutorial/security/',
      type: 'tutorial'
    }
  ]
}