import type { Lesson } from '@/lib/data/courses';

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Claude Code workflows',
  duration: '40 min',
  content: `
# Claude Code Workflows

Claude Code transformeert je ontwikkelproces door intelligente workflows die je productiviteit vertienvoudigen. In deze les verkennen we de belangrijkste workflow patronen.

## Development Workflows

### 1. Feature Development Workflow

De meest gebruikte workflow voor het ontwikkelen van nieuwe features:

**Stap 1: Feature analyse**
- Vraag Claude om de bestaande codebase te analyseren
- Identificeer impactgebieden en dependencies
- Genereer een implementatieplan

**Stap 2: Scaffold generatie**
- Laat Claude de basisstructuur genereren
- Inclusief interfaces, types en skelet implementaties
- Automatische import statements

**Stap 3: Implementatie**
- Iteratieve ontwikkeling met Claude
- Real-time code suggesties
- Automatische error handling

**Stap 4: Testing & Review**
- Genereer unit tests
- Integratie tests
- Code review met AI feedback

### 2. Bug Fix Workflow

Systematische aanpak voor het oplossen van bugs:

**Stap 1: Bug reproductie**
- Analyseer error logs
- Identificeer root cause
- Creëer minimal reproduction

**Stap 2: Impact analyse**
- Check affected components
- Dependency scanning
- Side-effect detectie

**Stap 3: Fix implementatie**
- Targeted oplossing
- Regression preventie
- Performance impact check

## Code Generation Patterns

### 1. Component Generation Pattern

Voor het genereren van complete React/Vue/Angular componenten:

\`\`\`
Claude, genereer een UserProfile component met:
- Props: userId, editable, onSave
- State management voor edit mode
- Validation voor email en naam
- Optimistic UI updates
- Error boundary
- Loading states
- Responsive design
\`\`\`

Claude genereert dan:
- Component file met TypeScript
- Styled components/CSS modules
- Unit test file
- Storybook story
- Type definitions
- Hook implementations

### 2. API Endpoint Pattern

Voor backend development:

\`\`\`
Claude, creëer een REST API endpoint voor user management:
- CRUD operaties
- JWT authenticatie
- Input validatie met Zod
- Rate limiting
- Error responses volgens RFC 7807
- OpenAPI documentatie
- Database queries met Prisma
\`\`\`

Output bevat:
- Route handlers
- Middleware setup
- Validation schemas
- Test suites
- API documentatie
- Database migraties

### 3. Full-Stack Feature Pattern

Complete feature van database tot UI:

\`\`\`
Claude, implementeer een comment systeem:
- Database schema (posts, comments, likes)
- GraphQL resolvers met DataLoader
- React components met optimistic updates
- Real-time updates via WebSocket
- Moderation features
- Performance optimalisaties
\`\`\`

## Refactoring Workflows

### 1. Legacy Code Modernization

Stapsgewijze modernisering van oude code:

**Pattern Recognition**
- Identificeer outdated patterns
- Dependency analyse
- Risk assessment

**Incremental Refactoring**
- Module voor module aanpak
- Maintain backwards compatibility
- Automated testing tussen stappen

**Modern Pattern Application**
- Convert class components naar hooks
- JavaScript naar TypeScript migratie
- Callback hell naar async/await
- Legacy state management naar modern solutions

### 2. Performance Optimization Workflow

\`\`\`
Claude, analyseer en optimaliseer deze component voor performance:
- Identificeer re-render issues
- Implementeer memoization waar nodig
- Optimaliseer bundle size
- Lazy loading strategieën
- Virtual scrolling voor grote lijsten
\`\`\`

### 3. Code Splitting Workflow

Voor grote applicaties:
- Analyseer bundle met webpack-bundle-analyzer
- Identificeer split points
- Implementeer dynamic imports
- Route-based splitting
- Component-level splitting
- Preloading strategieën

## Documentation Workflows

### 1. API Documentation Generation

\`\`\`
Claude, genereer complete API documentatie:
- OpenAPI 3.0 specificatie
- Request/response examples
- Authentication flows
- Error code reference
- Postman collection
- Interactive API playground setup
\`\`\`

### 2. Component Documentation

Voor UI libraries:
- Props documentatie met TypeScript
- Usage examples
- Storybook stories
- Accessibility notes
- Browser compatibility
- Performance karakteristieken

### 3. Architecture Documentation

\`\`\`
Claude, creëer architecture documentatie:
- System overview diagram (Mermaid)
- Component interaction flows
- Data flow diagrams
- Deployment architecture
- Security considerations
- Scaling strategieën
\`\`\`

## Testing Workflows

### 1. Test-Driven Development (TDD)

\`\`\`
Claude, help me met TDD voor een shopping cart:
1. Schrijf failing tests voor:
   - Add item to cart
   - Remove item
   - Update quantity
   - Calculate totals
   - Apply discounts
2. Implementeer minimale code om tests te laten slagen
3. Refactor met behoud van groene tests
\`\`\`

### 2. Integration Test Generation

\`\`\`
Claude, genereer integration tests voor:
- User authentication flow
- Payment processing
- Email notifications
- Database transactions
- External API calls
Mock waar nodig, test echte integraties waar mogelijk
\`\`\`

### 3. E2E Test Automation

\`\`\`
Claude, creëer Playwright E2E tests voor:
- Complete user journey
- Cross-browser testing
- Mobile responsiveness
- Performance benchmarks
- Accessibility compliance
- Visual regression tests
\`\`\`

## Advanced Workflow Patterns

### 1. Multi-Repository Workflow

Voor microservices architecturen:
- Cross-repo refactoring
- Synchronized updates
- Dependency management
- Version compatibility checks
- Automated changelog generation

### 2. AI-Assisted Code Review

\`\`\`
Claude, review deze PR met focus op:
- Security vulnerabilities
- Performance implications
- Code style consistency
- Test coverage
- Documentation completeness
- Breaking changes
\`\`\`

### 3. Continuous Learning Workflow

- Analyseer team code patterns
- Identificeer common mistakes
- Genereer team-specifieke guidelines
- Create custom linting rules
- Build knowledge base

## Best Practices

### 1. Workflow Automation
- Creëer templates voor terugkerende taken
- Build custom Claude commands
- Integreer met CI/CD pipelines
- Automate code quality checks

### 2. Context Management
- Maintain project context files
- Use .claude-context voor project specifics
- Version control AI prompts
- Document beslissingen

### 3. Collaboration Patterns
- AI pair programming sessies
- Shared prompt libraries
- Team workflow templates
- Knowledge sharing protocols

## Praktische Tips

1. **Start Klein**: Begin met simpele workflows en bouw uit
2. **Itereer Snel**: Gebruik Claude voor snelle prototypes
3. **Valideer Altijd**: AI-gegenereerde code moet altijd gereviewed worden
4. **Context is Key**: Geef Claude zoveel mogelijk context
5. **Learn Patterns**: Herken wanneer bepaalde workflows effectief zijn

Deze workflows zijn de basis voor effectief werken met Claude Code. In de volgende lessen gaan we dieper in op specifieke technieken en geavanceerde patterns.
  `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete Feature Development Workflow',
      language: 'typescript',
      code: `// Voorbeeld: User Authentication Feature met Claude Code

// Stap 1: Vraag Claude om de structuur te genereren
/* 
Claude prompt: "Genereer een complete user authentication feature met:
- JWT tokens
- Refresh token rotation
- Email verificatie
- Password reset
- Rate limiting
- TypeScript types
"
*/

// Claude genereert:

// types/auth.types.ts
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { sendEmail } from '@/lib/email';
import { AuthTokens, LoginCredentials, User } from '@/types/auth.types';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly REFRESH_SECRET = process.env.REFRESH_SECRET!;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  async register(email: string, password: string): Promise<User> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerified: false,
      },
    });

    // Send verification email
    const verificationToken = this.generateVerificationToken(user.id);
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      template: 'email-verification',
      data: { verificationToken },
    });

    return user;
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new Error('Please verify your email first');
    }

    return this.generateTokens(user.id);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.REFRESH_SECRET) as { userId: string };
      
      // Check if token is in Redis (not revoked)
      const isValid = await redis.get(\`refresh_token:\${payload.userId}\`);
      if (!isValid || isValid !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Revoke old token
      await redis.del(\`refresh_token:\${payload.userId}\`);

      // Generate new tokens
      return this.generateTokens(payload.userId);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    const accessToken = jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign({ userId }, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Store refresh token in Redis
    await redis.set(
      \`refresh_token:\${userId}\`,
      refreshToken,
      'EX',
      7 * 24 * 60 * 60 // 7 days
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private generateVerificationToken(userId: string): string {
    return jwt.sign({ userId, type: 'email-verification' }, this.JWT_SECRET, {
      expiresIn: '24h',
    });
  }
}

// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 900, // per 15 minutes
});

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export async function rateLimitAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
}`,
      explanation: 'Dit is een complete authentication service gegenereerd door Claude Code. Het bevat alle essentiële onderdelen: user registratie, login, JWT tokens, refresh token rotation, email verificatie, en rate limiting. Claude genereert niet alleen de code maar ook de juiste types, error handling, en security best practices.'
    },
    {
      id: 'example-2',
      title: 'Refactoring Workflow Example',
      language: 'typescript',
      code: `// Voorbeeld: Legacy Code Refactoring met Claude

// VOOR: Legacy callback-based code
/* Claude prompt: "Refactor deze legacy code naar modern TypeScript met:
- Async/await pattern
- Proper error handling  
- Type safety
- Betere separation of concerns"
*/

// Legacy code:
function getUserData(userId, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [userId], function(err, userResult) {
    if (err) return callback(err);
    
    db.query('SELECT * FROM posts WHERE user_id = ?', [userId], function(err, postsResult) {
      if (err) return callback(err);
      
      db.query('SELECT * FROM comments WHERE user_id = ?', [userId], function(err, commentsResult) {
        if (err) return callback(err);
        
        var userData = {
          user: userResult[0],
          posts: postsResult,
          comments: commentsResult
        };
        
        callback(null, userData);
      });
    });
  });
}

// NA: Claude's gerefactorde versie

// types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  publishedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: Date;
}

export interface UserProfile {
  user: User;
  posts: Post[];
  comments: Comment[];
  stats: {
    postCount: number;
    commentCount: number;
    joinedDaysAgo: number;
  };
}

// repositories/user.repository.ts
import { prisma } from '@/lib/prisma';
import { User, Post, Comment } from '@/types/user.types';

export class UserRepository {
  async findById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findPostsByUserId(userId: string): Promise<Post[]> {
    return prisma.post.findMany({
      where: { userId },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findCommentsByUserId(userId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// services/user.service.ts
import { UserRepository } from '@/repositories/user.repository';
import { UserProfile } from '@/types/user.types';
import { CacheService } from '@/services/cache.service';
import { logger } from '@/lib/logger';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService
  ) {}

  async getUserProfile(userId: string): Promise<UserProfile> {
    // Check cache first
    const cacheKey = \`user_profile:\${userId}\`;
    const cached = await this.cacheService.get<UserProfile>(cacheKey);
    if (cached) {
      logger.info('User profile served from cache', { userId });
      return cached;
    }

    try {
      // Parallel data fetching for performance
      const [user, posts, comments] = await Promise.all([
        this.userRepository.findById(userId),
        this.userRepository.findPostsByUserId(userId),
        this.userRepository.findCommentsByUserId(userId),
      ]);

      if (!user) {
        throw new UserNotFoundError(\`User with ID \${userId} not found\`);
      }

      // Calculate stats
      const joinedDaysAgo = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const userProfile: UserProfile = {
        user,
        posts,
        comments,
        stats: {
          postCount: posts.length,
          commentCount: comments.length,
          joinedDaysAgo,
        },
      };

      // Cache for 5 minutes
      await this.cacheService.set(cacheKey, userProfile, 300);

      return userProfile;
    } catch (error) {
      logger.error('Failed to fetch user profile', { userId, error });
      throw error;
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const cacheKey = \`user_profile:\${userId}\`;
    await this.cacheService.delete(cacheKey);
  }
}

// Custom error class
export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';
import { validateUUID } from '@/utils/validators';

export class UserController {
  constructor(private userService: UserService) {}

  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!validateUUID(userId)) {
        return res.status(400).json({
          error: 'Invalid user ID format',
        });
      }

      const userProfile = await this.userService.getUserProfile(userId);
      
      res.json({
        data: userProfile,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return res.status(404).json({
          error: error.message,
        });
      }

      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}`,
      explanation: 'Deze refactoring transformeert callback hell naar een moderne, type-safe architectuur. Claude Code identificeert niet alleen de problemen maar implementeert ook best practices zoals: repository pattern, dependency injection, caching, parallel data fetching, proper error handling, en structured logging.'
    },
    {
      id: 'example-3',
      title: 'Test Generation Workflow',
      language: 'typescript',
      code: `// Voorbeeld: Complete Test Suite Generation met Claude

/* Claude prompt: "Genereer een complete test suite voor de AuthService met:
- Unit tests voor alle methods
- Edge cases en error scenarios
- Mocking van dependencies
- Integration tests
- Performance benchmarks"
*/

// Claude genereert:

// __tests__/services/auth.service.test.ts
import { AuthService } from '@/services/auth.service';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'SecurePass123!';

    it('should successfully register a new user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: mockEmail,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (sendEmail as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.register(mockEmail, mockPassword);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockEmail,
          password: expect.any(String),
          emailVerified: false,
        },
      });
      expect(sendEmail).toHaveBeenCalledWith({
        to: mockEmail,
        subject: 'Verify your email',
        template: 'email-verification',
        data: { verificationToken: expect.any(String) },
      });
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

      // Act & Assert
      await expect(authService.register(mockEmail, mockPassword))
        .rejects.toThrow('User already exists');
      
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should properly hash the password', async () => {
      // Arrange
      const bcryptSpy = jest.spyOn(bcrypt, 'hash');
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-123' });

      // Act
      await authService.register(mockEmail, mockPassword);

      // Assert
      expect(bcryptSpy).toHaveBeenCalledWith(mockPassword, 12);
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: mockCredentials.email,
        password: await bcrypt.hash(mockCredentials.password, 12),
        emailVerified: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      // Act
      const result = await authService.login(mockCredentials);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(redis.set).toHaveBeenCalled();
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(mockCredentials))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: mockCredentials.email,
        password: await bcrypt.hash('WrongPassword', 12),
        emailVerified: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(mockCredentials))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error if email not verified', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: mockCredentials.email,
        password: await bcrypt.hash(mockCredentials.password, 12),
        emailVerified: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login(mockCredentials))
        .rejects.toThrow('Please verify your email first');
    });
  });

  describe('refreshTokens', () => {
    const mockUserId = 'user-123';
    const mockRefreshToken = jwt.sign(
      { userId: mockUserId },
      process.env.REFRESH_SECRET || 'test-secret'
    );

    it('should successfully refresh tokens', async () => {
      // Arrange
      (redis.get as jest.Mock).mockResolvedValue(mockRefreshToken);
      (redis.del as jest.Mock).mockResolvedValue(1);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      // Act
      const result = await authService.refreshTokens(mockRefreshToken);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(redis.get).toHaveBeenCalledWith(\`refresh_token:\${mockUserId}\`);
      expect(redis.del).toHaveBeenCalledWith(\`refresh_token:\${mockUserId}\`);
    });

    it('should throw error for invalid token', async () => {
      // Act & Assert
      await expect(authService.refreshTokens('invalid-token'))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if token not in Redis', async () => {
      // Arrange
      (redis.get as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshTokens(mockRefreshToken))
        .rejects.toThrow('Invalid refresh token');
    });
  });
});

// __tests__/integration/auth.integration.test.ts
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$executeRaw\`TRUNCATE TABLE users CASCADE\`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });

  describe('POST /api/auth/register', () => {
    it('should register user and send verification email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@test.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful. Please check your email.');
      
      // Verify user in database
      const user = await prisma.user.findUnique({
        where: { email: 'integration@test.com' },
      });
      expect(user).toBeDefined();
      expect(user?.emailVerified).toBe(false);
    });

    it('should enforce rate limiting', async () => {
      // Make 5 requests quickly
      const requests = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/register')
          .send({
            email: \`test\${Date.now()}@example.com\`,
            password: 'SecurePass123!',
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create verified user for login tests
      await prisma.user.create({
        data: {
          email: 'verified@test.com',
          password: await bcrypt.hash('SecurePass123!', 12),
          emailVerified: true,
        },
      });
    });

    it('should login and return tokens', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'verified@test.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');
      
      // Verify refresh token in Redis
      const user = await prisma.user.findUnique({
        where: { email: 'verified@test.com' },
      });
      const storedToken = await redis.get(\`refresh_token:\${user?.id}\`);
      expect(storedToken).toBe(response.body.refreshToken);
    });
  });
});

// __tests__/performance/auth.performance.test.ts
import { performance } from 'perf_hooks';
import { AuthService } from '@/services/auth.service';

describe('Auth Service Performance', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should hash password within acceptable time', async () => {
    const password = 'TestPassword123!';
    const iterations = 100;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await bcrypt.hash(password, 12);
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;
    const maxTime = Math.max(...times);

    console.log(\`Average hash time: \${avgTime.toFixed(2)}ms\`);
    console.log(\`Max hash time: \${maxTime.toFixed(2)}ms\`);

    expect(avgTime).toBeLessThan(200); // Average should be under 200ms
    expect(maxTime).toBeLessThan(500); // Max should be under 500ms
  });

  it('should generate tokens quickly', async () => {
    const iterations = 1000;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const token = jwt.sign({ userId: 'test-123' }, 'secret', { expiresIn: '15m' });
      const end = performance.now();
      times.push(end - start);
    }

    const avgTime = times.reduce((a, b) => a + b) / times.length;

    console.log(\`Average token generation time: \${avgTime.toFixed(2)}ms\`);

    expect(avgTime).toBeLessThan(1); // Should be under 1ms
  });
});`,
      explanation: 'Claude Code genereert niet alleen unit tests maar een complete test suite inclusief: mock setup, edge cases, error scenarios, integration tests die de echte API testen, rate limiting tests, en performance benchmarks. De tests zijn gestructureerd volgens best practices met proper setup/teardown en meaningful assertions.'
    },
    {
      id: 'example-4',
      title: 'Documentation Generation Workflow',
      language: 'markdown',
      code: `# Voorbeeld: Automatische Documentation Generation

/* Claude prompt: "Genereer complete API documentatie voor onze auth endpoints met:
- OpenAPI specificatie
- Code examples in meerdere talen
- Authentication flow diagrams
- Error response catalogus
- Postman collection"
*/

# Authentication API Documentation

## Overview

This API provides secure authentication and authorization services using JWT tokens with refresh token rotation.

### Base URL
\`\`\`
https://api.example.com/v1
\`\`\`

### Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Endpoints

### 1. Register New User

\`POST /auth/register\`

Creates a new user account and sends a verification email.

#### Request

\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

#### Response

**Success (201 Created)**
\`\`\`json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "usr_2n4kF8pLmQr9"
}
\`\`\`

**Error (400 Bad Request)**
\`\`\`json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters with uppercase, lowercase, and number"
    }
  ]
}
\`\`\`

**Error (409 Conflict)**
\`\`\`json
{
  "error": "USER_EXISTS",
  "message": "A user with this email already exists"
}
\`\`\`

#### Code Examples

**JavaScript/TypeScript**
\`\`\`typescript
const response = await fetch('https://api.example.com/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe'
  })
});

if (response.ok) {
  const data = await response.json();
  console.log('Registration successful:', data.message);
} else {
  const error = await response.json();
  console.error('Registration failed:', error.message);
}
\`\`\`

**Python**
\`\`\`python
import requests

url = "https://api.example.com/v1/auth/register"
payload = {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
}

response = requests.post(url, json=payload)

if response.status_code == 201:
    data = response.json()
    print(f"Registration successful: {data['message']}")
else:
    error = response.json()
    print(f"Registration failed: {error['message']}")
\`\`\`

**cURL**
\`\`\`bash
curl -X POST https://api.example.com/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
\`\`\`

### 2. Login

\`POST /auth/login\`

Authenticates a user and returns access and refresh tokens.

#### Request

\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
\`\`\`

#### Response

**Success (200 OK)**
\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "usr_2n4kF8pLmQr9",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true
  }
}
\`\`\`

### 3. Refresh Token

\`POST /auth/refresh\`

Exchanges a valid refresh token for new access and refresh tokens.

#### Request

\`\`\`json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
\`\`\`

#### Response

Same as login response.

### 4. Logout

\`POST /auth/logout\`

Revokes the current refresh token.

#### Headers
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

#### Request

\`\`\`json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
\`\`\`

## Authentication Flow

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    participant Email Service

    Client->>API: POST /auth/register
    API->>Database: Check if user exists
    Database-->>API: User not found
    API->>Database: Create new user
    API->>Email Service: Send verification email
    API-->>Client: 201 Created

    Note over Client: User clicks verification link

    Client->>API: GET /auth/verify?token=xxx
    API->>Database: Update emailVerified
    API-->>Client: 200 OK

    Client->>API: POST /auth/login
    API->>Database: Validate credentials
    Database-->>API: User found & valid
    API->>Database: Store refresh token
    API-->>Client: 200 OK (tokens)

    Note over Client: Access token expires

    Client->>API: POST /auth/refresh
    API->>Database: Validate refresh token
    API->>Database: Rotate refresh token
    API-->>Client: 200 OK (new tokens)
\`\`\`

## Error Responses

All errors follow RFC 7807 (Problem Details for HTTP APIs) format:

\`\`\`json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Your request parameters didn't validate",
  "status": 400,
  "detail": "The email field must be a valid email address",
  "instance": "/auth/register",
  "timestamp": "2024-01-15T09:30:00Z",
  "traceId": "00-abcdef123456-01"
}
\`\`\`

### Common Error Codes

| Status | Error Type | Description |
|--------|-----------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Valid auth but insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

## Rate Limiting

API implements rate limiting per IP address:

- **Registration/Login**: 5 requests per 15 minutes
- **Regular endpoints**: 100 requests per minute
- **Refresh token**: 10 requests per minute

Rate limit headers:
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
\`\`\`

## Security Considerations

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - Optional: special characters

2. **Token Security**
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Refresh tokens are single-use (rotation)
   - Tokens are revoked on logout

3. **HTTPS Required**
   - All API calls must use HTTPS
   - HTTP requests are rejected

## Postman Collection

Download our [Postman Collection](https://api.example.com/postman/auth-api.json) for easy API testing.

### Environment Variables
\`\`\`json
{
  "baseUrl": "https://api.example.com/v1",
  "accessToken": "{{accessToken}}",
  "refreshToken": "{{refreshToken}}"
}
\`\`\`

## OpenAPI Specification

\`\`\`yaml
openapi: 3.0.0
info:
  title: Authentication API
  version: 1.0.0
  description: JWT-based authentication with refresh token rotation

servers:
  - url: https://api.example.com/v1

paths:
  /auth/register:
    post:
      summary: Register new user
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              \$ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: Registration successful
          content:
            application/json:
              schema:
                \$ref: '#/components/schemas/RegisterResponse'
        '400':
          \$ref: '#/components/responses/ValidationError'
        '409':
          \$ref: '#/components/responses/ConflictError'

components:
  schemas:
    RegisterRequest:
      type: object
      required:
        - email
        - password
        - firstName
        - lastName
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        firstName:
          type: string
        lastName:
          type: string
          
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
\`\`\``,
      explanation: 'Claude Code genereert uitgebreide API documentatie die alle aspecten dekt: endpoint beschrijvingen, request/response voorbeelden, error handling, code examples in meerdere programmeertalen, authentication flow diagrams, security overwegingen, en zelfs een complete OpenAPI specificatie. Dit bespaart uren handmatig documentatie schrijven.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1-3-1',
      title: 'Implementeer een Complete Feature Workflow',
      description: 'Gebruik Claude Code om een complete user profile feature te implementeren met alle aspecten: backend API, frontend componenten, tests, en documentatie.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Opdracht: Implementeer een User Profile Feature

/*
 * Gebruik Claude Code workflows om het volgende te implementeren:
 * 
 * 1. Backend API endpoints:
 *    - GET /api/users/:id/profile
 *    - PUT /api/users/:id/profile
 *    - POST /api/users/:id/avatar
 * 
 * 2. Frontend componenten:
 *    - UserProfile component
 *    - EditProfile modal
 *    - AvatarUpload component
 * 
 * 3. Testing:
 *    - Unit tests voor services
 *    - Integration tests voor API
 *    - Component tests voor UI
 * 
 * 4. Documentatie:
 *    - API documentatie
 *    - Component documentatie
 * 
 * Start met het vragen aan Claude om een implementatieplan te maken!
 */

// Jouw implementatie hier...`,
      hints: [
        'Begin met een Claude prompt voor het complete implementatieplan',
        'Vraag Claude om de database schema en types eerst te genereren',
        'Laat Claude de API endpoints implementeren met proper validatie',
        'Gebruik Claude voor het genereren van React componenten met TypeScript',
        'Vraag om complete test suites voor elke laag van de applicatie'
      ]
    },
    {
      id: 'assignment-1-3-2',
      title: 'Refactor Legacy Code met Claude',
      description: 'Gebruik Claude Code refactoring workflows om een legacy Express.js applicatie te moderniseren naar een type-safe, testbare architectuur.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `// Legacy Express.js Code - Refactor dit met Claude Code

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var db = require('./db');

app.use(bodyParser.json());

// Legacy route handlers
app.get('/products', function(req, res) {
  db.query('SELECT * FROM products', function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
      return;
    }
    res.json(results);
  });
});

app.post('/products', function(req, res) {
  var name = req.body.name;
  var price = req.body.price;
  
  if (!name || !price) {
    res.status(400).send('Missing fields');
    return;
  }
  
  db.query('INSERT INTO products (name, price) VALUES (?, ?)', 
    [name, price], 
    function(err, result) {
      if (err) {
        console.log(err);
        res.status(500).send('Database error');
        return;
      }
      res.status(201).json({ id: result.insertId });
    }
  );
});

app.put('/products/:id', function(req, res) {
  var id = req.params.id;
  var name = req.body.name;
  var price = req.body.price;
  
  db.query('UPDATE products SET name = ?, price = ? WHERE id = ?',
    [name, price, id],
    function(err, result) {
      if (err) {
        console.log(err);
        res.status(500).send('Database error');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('Product not found');
        return;
      }
      res.json({ success: true });
    }
  );
});

module.exports = app;

/* 
 * Gebruik Claude Code om deze code te refactoren naar:
 * - TypeScript met proper types
 * - Repository pattern
 * - Service layer
 * - Proper error handling
 * - Input validation met Zod
 * - Unit testable architectuur
 * - Async/await syntax
 */`,
      solution: `// Gerefactorde versie met moderne patterns

// types/product.types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  price: number;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
}

// schemas/product.schemas.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive().multipleOf(0.01),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().multipleOf(0.01).optional(),
});

// repositories/product.repository.ts
import { PrismaClient } from '@prisma/client';
import { Product, CreateProductDto, UpdateProductDto } from '../types/product.types';

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}

// services/product.service.ts
import { ProductRepository } from '../repositories/product.repository';
import { Product, CreateProductDto, UpdateProductDto } from '../types/product.types';
import { AppError } from '../errors/app.error';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    return this.productRepository.create(data);
  }

  async updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
    await this.getProductById(id); // Ensures product exists
    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.getProductById(id); // Ensures product exists
    await this.productRepository.delete(id);
  }
}

// controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../schemas/product.schemas';
import { validateRequest } from '../middleware/validate.middleware';

export class ProductController {
  constructor(private productService: ProductService) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await this.productService.getProductById(id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await this.productService.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = updateProductSchema.parse(req.body);
      const product = await this.productService.updateProduct(id, data);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await this.productService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

// routes/product.routes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schemas';

export function createProductRoutes(productController: ProductController): Router {
  const router = Router();

  router.get('/products', productController.getAll.bind(productController));
  router.get('/products/:id', productController.getById.bind(productController));
  router.post(
    '/products',
    validateRequest(createProductSchema),
    productController.create.bind(productController)
  );
  router.put(
    '/products/:id',
    validateRequest(updateProductSchema),
    productController.update.bind(productController)
  );
  router.delete('/products/:id', productController.delete.bind(productController));

  return router;
}

// app.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { createProductRoutes } from './routes/product.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Dependency injection
const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Routes
app.use('/api', createProductRoutes(productController));

// Error handling
app.use(errorHandler);

export { app };`,
      hints: [
        'Begin met het vragen aan Claude om een refactoring plan',
        'Identificeer alle code smells in de legacy code',
        'Vraag Claude om moderne patterns toe te passen',
        'Zorg voor backwards compatibility waar nodig',
        'Genereer tests voor de nieuwe implementatie'
      ]
    },
    {
      id: 'assignment-1-3-3',
      title: 'Test Suite Generation Challenge',
      description: 'Gebruik Claude Code om een complete test suite te genereren voor een complexe service met mocking, edge cases, en performance tests.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `// Service om te testen - Genereer complete test suite met Claude

export class PaymentService {
  constructor(
    private stripeClient: Stripe,
    private database: Database,
    private emailService: EmailService,
    private logger: Logger
  ) {}

  async processPayment(paymentData: {
    amount: number;
    currency: string;
    customerId: string;
    paymentMethodId: string;
    description?: string;
  }): Promise<PaymentResult> {
    // Validate input
    if (paymentData.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Check customer exists
    const customer = await this.database.customers.findById(paymentData.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    try {
      // Create payment intent
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency,
        customer: paymentData.customerId,
        payment_method: paymentData.paymentMethodId,
        description: paymentData.description,
        confirm: true,
      });

      // Store transaction
      const transaction = await this.database.transactions.create({
        customerId: paymentData.customerId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        stripePaymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });

      // Send confirmation email
      if (paymentIntent.status === 'succeeded') {
        await this.emailService.sendPaymentConfirmation({
          to: customer.email,
          amount: paymentData.amount,
          currency: paymentData.currency,
          transactionId: transaction.id,
        });
      }

      this.logger.info('Payment processed', { 
        transactionId: transaction.id,
        amount: paymentData.amount,
      });

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: transaction.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      this.logger.error('Payment failed', { error, paymentData });
      
      // Store failed transaction
      await this.database.transactions.create({
        customerId: paymentData.customerId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'failed',
        error: error.message,
      });

      throw error;
    }
  }

  async refundPayment(transactionId: string, reason?: string): Promise<RefundResult> {
    // Implementation for refunds...
  }
}

/*
 * Gebruik Claude Code om een complete test suite te genereren die:
 * 1. Alle dependencies mockt
 * 2. Success scenarios test
 * 3. Alle error scenarios test
 * 4. Edge cases zoals network failures
 * 5. Performance en load tests
 * 6. Integration tests met test database
 */`,
      hints: [
        'Mock alle externe dependencies (Stripe, Database, EmailService)',
        'Test zowel success als failure scenarios',
        'Vergeet edge cases niet zoals network timeouts',
        'Test de logging functionaliteit',
        'Voeg performance benchmarks toe'
      ]
    }
  ],
  resources: [
    {
      title: 'Claude Code Workflow Examples',
      url: 'https://claude.ai/workflows',
      type: 'guide'
    },
    {
      title: 'Advanced Claude Code Patterns',
      url: 'https://github.com/anthropics/claude-code-patterns',
      type: 'github'
    },
    {
      title: 'Test-Driven Development with Claude',
      url: 'https://docs.anthropic.com/claude-code/tdd',
      type: 'article'
    }
  ]
};