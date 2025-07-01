import type { Lesson } from '@/lib/data/courses';

export const lesson4_4: Lesson = {
  id: 'lesson-4-4',
  title: 'Security best practices',
  duration: '35 min',
  content: `
# Security best practices

Beveilig je automation workflows tegen moderne security threats. Implementeer defense-in-depth strategieën.

## Security fundamentals

### 1. Credential management

**NOOIT doen:**
- Hardcode passwords in workflows
- Delen van API keys in plain text
- Gebruiken van dezelfde credentials overal
- Opslaan van secrets in version control

**WEL doen:**
- Gebruik environment variables
- Implementeer secret management tools
- Roteer credentials regelmatig
- Gebruik least-privilege principe

### 2. API key beveiliging

\`\`\`javascript
// Veilige API key management
const secureApiCall = async () => {
  // Haal key op uit secure storage
  const apiKey = await getSecretValue('API_KEY');
  
  // Gebruik key met encryption in transit
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'X-Request-ID': crypto.randomUUID(),
      'Content-Type': 'application/json'
    },
    // Force HTTPS
    protocol: 'https:',
    // Set timeout
    timeout: 30000
  });
  
  // Clear sensitive data
  apiKey = null;
  
  return response;
};
\`\`\`

### 3. Data encryption

**Encrypt sensitive data at rest:**
\`\`\`javascript
const crypto = require('crypto');

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.saltLength = 64;
  }
  
  encrypt(text, password) {
    const salt = crypto.randomBytes(this.saltLength);
    const key = crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }
  
  decrypt(encryptedData, password) {
    const data = Buffer.from(encryptedData, 'base64');
    
    const salt = data.slice(0, this.saltLength);
    const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
    const tag = data.slice(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
    const encrypted = data.slice(this.saltLength + this.ivLength + this.tagLength);
    
    const key = crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
\`\`\`

## Security checklist

### Authentication & Authorization
- [ ] Implementeer Multi-Factor Authentication (MFA)
- [ ] Gebruik OAuth 2.0 waar mogelijk
- [ ] Implementeer role-based access control (RBAC)
- [ ] Audit authentication logs regelmatig

### Data Protection
- [ ] Encrypt alle sensitive data in transit (HTTPS)
- [ ] Encrypt sensitive data at rest
- [ ] Implementeer data masking voor logs
- [ ] Gebruik secure communication channels

### Access Control
- [ ] Beperk workflow permissions per user
- [ ] Implementeer IP whitelisting waar nodig
- [ ] Monitor abnormale access patterns
- [ ] Regular permission audits

### Monitoring & Compliance
- [ ] Log alle security events
- [ ] Implementeer intrusion detection
- [ ] Regular security assessments
- [ ] GDPR/Privacy compliance checks

## Incident response plan

### 1. Detectie
- Monitor voor abnormale activiteit
- Set up alerts voor security events
- Regular log analysis

### 2. Containment
- Isoleer affected workflows
- Revoke compromised credentials
- Block suspicious IP addresses

### 3. Eradication
- Remove malicious code
- Patch vulnerabilities
- Update security policies

### 4. Recovery
- Restore from secure backups
- Verify system integrity
- Resume normal operations

### 5. Lessons Learned
- Document incident details
- Update security procedures
- Train team on prevention

## Secure coding practices

### Input validation
\`\`\`javascript
const validateInput = (input) => {
  // Whitelist validation
  const allowedFields = ['name', 'email', 'message'];
  const sanitized = {};
  
  for (const field of allowedFields) {
    if (input[field]) {
      // Sanitize input
      sanitized[field] = sanitizeString(input[field]);
    }
  }
  
  // Validate email format
  if (sanitized.email && !isValidEmail(sanitized.email)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

const sanitizeString = (str) => {
  return str
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/[\\$]/g, '') // Remove potential injection chars
    .trim()
    .slice(0, 1000); // Limit length
};
\`\`\`
  `,
  codeExamples: [
    {
      id: 'example-4-4-1',
      title: 'Secure workflow template',
      language: 'javascript',
      code: `// Secure workflow implementation
class SecureWorkflow {
  constructor() {
    this.secrets = new SecretManager();
    this.audit = new AuditLogger();
    this.encryption = new DataEncryption();
  }
  
  async execute(input) {
    // Audit trail
    const executionId = crypto.randomUUID();
    this.audit.log('WORKFLOW_START', {
      id: executionId,
      user: input.userId,
      timestamp: new Date()
    });
    
    try {
      // Validate input
      const validated = await this.validateInput(input);
      
      // Get credentials securely
      const credentials = await this.secrets.get('API_CREDENTIALS');
      
      // Process with encryption
      const result = await this.processSecurely(validated, credentials);
      
      // Audit success
      this.audit.log('WORKFLOW_SUCCESS', {
        id: executionId,
        duration: Date.now() - startTime
      });
      
      return result;
      
    } catch (error) {
      // Audit failure
      this.audit.log('WORKFLOW_ERROR', {
        id: executionId,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      
      // Don't leak sensitive info
      throw new Error('Workflow execution failed');
    } finally {
      // Cleanup sensitive data
      credentials = null;
    }
  }
  
  async validateInput(input) {
    // Input validation schema
    const schema = {
      userId: { type: 'string', required: true, pattern: /^[a-zA-Z0-9-]+$/ },
      data: { type: 'object', required: true },
      action: { type: 'string', enum: ['create', 'update', 'delete'] }
    };
    
    // Validate against schema
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !input[field]) {
        throw new Error(\`Missing required field: \${field}\`);
      }
      
      if (rules.pattern && !rules.pattern.test(input[field])) {
        throw new Error(\`Invalid format for field: \${field}\`);
      }
      
      if (rules.enum && !rules.enum.includes(input[field])) {
        throw new Error(\`Invalid value for field: \${field}\`);
      }
    }
    
    return input;
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-4-1',
      title: 'Security audit',
      description: 'Voer een complete security audit uit op een bestaande workflow. Identificeer en fix minimaal 5 security issues.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Insecure workflow - find and fix security issues
class InsecureWorkflow {
  constructor() {
    // Issue 1: Hardcoded credentials
    this.apiKey = 'sk_live_XXXXXXXXXXXXXXXXXXXXXX';
    this.dbPassword = 'admin123';
  }
  
  async processUserData(userData) {
    // Issue 2: No input validation
    const query = \`SELECT * FROM users WHERE email = '\${userData.email}'\`;
    const user = await db.query(query);
    
    // Issue 3: Logging sensitive data
    console.log('Processing user:', userData);
    
    // Issue 4: Weak encryption
    const encrypted = btoa(userData.password);
    
    // Issue 5: No authentication check
    if (userData.isAdmin) {
      return this.adminOperations(userData);
    }
    
    // More issues hidden in the code...
    return this.saveUser(userData);
  }
  
  // TODO: Identify and fix all security vulnerabilities
  // Implement proper:
  // - Credential management
  // - Input validation
  // - SQL injection prevention
  // - Secure logging
  // - Proper encryption
  // - Authentication/authorization
}`,
      hints: [
        'Use environment variables for credentials',
        'Implement parameterized queries to prevent SQL injection',
        'Never log passwords or sensitive data',
        'Use proper encryption libraries, not btoa()',
        'Verify permissions before allowing operations'
      ]
    }
  ],
  resources: [
    {
      title: 'OWASP Security Guidelines',
      url: 'https://owasp.org/guidelines',
      type: 'documentation'
    },
    {
      title: 'Workflow Security Best Practices',
      url: 'https://security-workflows.io',
      type: 'guide'
    }
  ]
};