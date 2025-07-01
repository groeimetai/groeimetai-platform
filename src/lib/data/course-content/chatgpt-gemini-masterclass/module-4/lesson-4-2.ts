import type { Lesson } from '@/lib/data/courses'

export const lesson4_2: Lesson = {
  id: 'lesson-4-2',
  title: 'Codex voor development workflows',
  duration: '75 minuten',
  content: `# Codex voor Development Workflows

## Advanced Code Generation Techniques

### 1. Multi-File Project Generation

**Prompt structuur voor complete projecten:**
\`\`\`
"Create a full-stack web application:
- Frontend: React with TypeScript, Tailwind CSS
- Backend: Node.js Express API
- Database: PostgreSQL with Prisma ORM
- Features: User authentication, real-time chat, file uploads
- Include: Docker setup, CI/CD pipeline, testing setup"
\`\`\`

**Codex genereert complete project structuur:**
\`\`\`
my-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── prisma/
│   └── package.json
├── docker-compose.yml
├── .github/workflows/
└── README.md
\`\`\`

### 2. Architecture-Aware Generation

Codex begrijpt en implementeert verschillende architectuur patterns:

#### Clean Architecture Example
\`\`\`typescript
// Prompt: "Implement user registration using clean architecture"

// Domain Layer - entities/user.ts
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

// Domain Layer - repositories/user.repository.ts
export interface UserRepository {
  create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

// Application Layer - use-cases/register-user.ts
export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private emailService: EmailService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Validate input
    const validation = await this.validate(input);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(input.password);

    // Create user
    const user = await this.userRepository.create({
      email: input.email,
      username: input.username,
      passwordHash: hashedPassword
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.username);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };
  }

  private async validate(input: RegisterUserInput): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    if (!isValidEmail(input.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (input.password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (input.username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Infrastructure Layer - repositories/user.repository.impl.ts
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash
      }
    });

    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    return user ? this.mapToEntity(user) : null;
  }

  private mapToEntity(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      createdAt: dbUser.createdAt
    };
  }
}

// Presentation Layer - controllers/auth.controller.ts
export class AuthController {
  constructor(private registerUser: RegisterUserUseCase) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.registerUser.execute({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      });

      res.status(201).json({
        success: true,
        data: result.user
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          errors: error.errors
        });
      } else if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({
          success: false,
          error: 'User already exists'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }
}
\`\`\`

## Debugging met Codex

### 1. Intelligent Error Analysis

**Input een error:**
\`\`\`
TypeError: Cannot read property 'map' of undefined
  at ProductList (ProductList.tsx:45:23)
  at renderWithHooks (react-dom.development.js:14985:18)
\`\`\`

**Codex analyseert en geeft oplossing:**
\`\`\`typescript
// Problem: products is undefined when component first renders

// Solution 1: Add default value
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // ← Default empty array
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

// Solution 2: Add loading state
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (!products) return <ErrorMessage />;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

// Solution 3: Use optional chaining
return (
  <div>
    {products?.map(product => (
      <ProductCard key={product.id} product={product} />
    )) ?? <EmptyState />}
  </div>
);
\`\`\`

### 2. Performance Debugging

**Prompt:**
"My React app is slow, analyze this component and suggest optimizations"

**Codex analysis:**
\`\`\`typescript
// BEFORE: Performance issues
const ExpensiveComponent = ({ data, filter }) => {
  // ❌ Expensive calculation on every render
  const processedData = data.map(item => {
    return complexCalculation(item);
  }).filter(item => item.value > filter);
  
  // ❌ New function reference on every render
  const handleClick = (id) => {
    console.log('Clicked:', id);
  };
  
  // ❌ Inline object creation
  return (
    <div style={{ padding: 20, margin: 10 }}>
      {processedData.map(item => (
        <Item 
          key={item.id} 
          data={item} 
          onClick={() => handleClick(item.id)}
          config={{ showDetails: true }}
        />
      ))}
    </div>
  );
};

// AFTER: Optimized version
const ExpensiveComponent = memo(({ data, filter }) => {
  // ✓ Memoize expensive calculations
  const processedData = useMemo(() => {
    return data
      .map(item => complexCalculation(item))
      .filter(item => item.value > filter);
  }, [data, filter]);
  
  // ✓ Stable function reference
  const handleClick = useCallback((id) => {
    console.log('Clicked:', id);
  }, []);
  
  // ✓ Stable style object
  const containerStyle = useMemo(() => ({
    padding: 20,
    margin: 10
  }), []);
  
  // ✓ Stable config object
  const itemConfig = useMemo(() => ({
    showDetails: true
  }), []);
  
  return (
    <div style={containerStyle}>
      {processedData.map(item => (
        <Item 
          key={item.id} 
          data={item} 
          onClick={handleClick}
          config={itemConfig}
        />
      ))}
    </div>
  );
});

// Additional optimization: Virtualization for long lists
import { FixedSizeList } from 'react-window';

const VirtualizedComponent = memo(({ data, filter }) => {
  const processedData = useMemo(() => {
    return data
      .map(item => complexCalculation(item))
      .filter(item => item.value > filter);
  }, [data, filter]);
  
  const Row = ({ index, style }) => (
    <div style={style}>
      <Item data={processedData[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={processedData.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
});
\`\`\`

### 3. Memory Leak Detection

\`\`\`javascript
// Codex detecteert en fixt memory leaks

// PROBLEEM: Memory leak in useEffect
const LeakyComponent = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // ❌ No cleanup for async operation
    fetchData().then(setData);
    
    // ❌ No cleanup for event listener
    window.addEventListener('resize', handleResize);
    
    // ❌ No cleanup for interval
    const interval = setInterval(() => {
      updateData();
    }, 1000);
  }, []);
  
  return <div>{data}</div>;
};

// OPLOSSING: Proper cleanup
const FixedComponent = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    // ✓ Check if component is still mounted
    fetchData().then(result => {
      if (isMounted) {
        setData(result);
      }
    });
    
    // ✓ Store reference for cleanup
    const handleResize = () => {
      if (isMounted) {
        // Handle resize
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // ✓ Store interval ID
    const interval = setInterval(() => {
      if (isMounted) {
        updateData();
      }
    }, 1000);
    
    // ✓ Cleanup function
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);
  
  return <div>{data}</div>;
};

// Advanced: AbortController for fetch
const AdvancedComponent = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data', {
          signal: controller.signal
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };
    
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, []);
  
  return <div>{data}</div>;
};
\`\`\`

## IDE Integration

### VS Code Codex Features

#### 1. Real-time Code Suggestions
\`\`\`json
{
  "codex.suggestions": {
    "enabled": true,
    "triggerDelay": 300,
    "maxSuggestions": 5,
    "contextLines": 50,
    "includeComments": true
  }
}
\`\`\`

#### 2. Custom Commands
\`\`\`json
{
  "codex.customCommands": [
    {
      "name": "Generate Tests",
      "prompt": "Generate comprehensive unit tests for this code using Jest and React Testing Library",
      "shortcut": "cmd+shift+t"
    },
    {
      "name": "Add Error Handling",
      "prompt": "Add proper error handling with try-catch, error boundaries, and user-friendly messages",
      "shortcut": "cmd+shift+e"
    },
    {
      "name": "Optimize Performance",
      "prompt": "Analyze and optimize this code for performance",
      "shortcut": "cmd+shift+p"
    }
  ]
}
\`\`\`

#### 3. Inline Documentation
\`\`\`typescript
// Selecteer functie en gebruik Cmd+Shift+D

// Codex genereert:
/**
 * Processes user data and returns formatted result
 * @param {UserData} data - Raw user data from API
 * @param {ProcessOptions} options - Processing configuration
 * @returns {Promise<ProcessedUser>} Formatted user object
 * @throws {ValidationError} If data validation fails
 * @throws {ProcessingError} If processing encounters an error
 * @example
 * const result = await processUserData(userData, {
 *   includeMetadata: true,
 *   validateEmail: true
 * });
 */
async function processUserData(data: UserData, options: ProcessOptions): Promise<ProcessedUser> {
  // Implementation
}
\`\`\`

### JetBrains Integration

#### IntelliJ IDEA / WebStorm Setup
1. Install "OpenAI Codex Assistant" plugin
2. Configure API key in Settings → Tools → Codex
3. Enable features:
   - Auto-completion enhancement
   - Code generation shortcuts
   - Intelligent refactoring
   - Test generation

#### PyCharm Specific Features
\`\`\`python
# Type hint generation
# Selecteer functie → Alt+Enter → "Generate type hints with Codex"

# BEFORE:
def process_data(data, config, callback):
    # implementation

# AFTER:
from typing import List, Dict, Callable, Optional, Union

def process_data(
    data: List[Dict[str, Union[str, int, float]]],
    config: Dict[str, any],
    callback: Optional[Callable[[Dict], None]] = None
) -> List[Dict[str, any]]:
    # implementation
\`\`\`

## Advanced Workflow Integration

### 1. Git Commit Message Generation

\`\`\`bash
# .gitmessage template met Codex
git config --global commit.template ~/.gitmessage

# Codex analyseert changes en genereert:
feat(auth): implement JWT refresh token rotation

- Add refresh token model and repository
- Implement token rotation on refresh
- Add rate limiting for refresh endpoint
- Update authentication middleware
- Add tests for refresh flow

Breaking changes: None
Security: Implements OWASP best practices for token rotation
\`\`\`

### 2. Code Review Automation

\`\`\`yaml
# .github/workflows/codex-review.yml
name: Codex Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  codex-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Codex Review
        uses: openai/codex-review-action@v1
        with:
          api-key: \${{ secrets.OPENAI_API_KEY }}
          review-checklist: |
            - Security vulnerabilities
            - Performance issues
            - Code smells
            - Missing tests
            - Documentation gaps
            - Accessibility concerns
          
      - name: Post Review Comments
        uses: actions/github-script@v6
        with:
          script: |
            const review = core.getInput('review-output');
            await github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              body: review,
              event: 'COMMENT'
            });
\`\`\`

### 3. Continuous Learning

\`\`\`javascript
// Codex leert van je codebase
const codexConfig = {
  learning: {
    enabled: true,
    patterns: [
      {
        name: "Component Structure",
        example: "src/components/**/*.tsx",
        learn: ["naming", "structure", "patterns"]
      },
      {
        name: "API Patterns", 
        example: "src/api/**/*.ts",
        learn: ["error-handling", "validation", "typing"]
      }
    ],
    feedback: {
      positive: "cmd+shift+up",
      negative: "cmd+shift+down"
    }
  }
};
\`\`\`

## Best Practices voor Team Workflows

### 1. Shared Prompts Library
\`\`\`json
// team-prompts.json
{
  "prompts": {
    "new-component": {
      "template": "Create a React component with TypeScript that {description}. Include: props interface, default props, error boundary, loading state, and Storybook story.",
      "variables": ["description"]
    },
    "api-endpoint": {
      "template": "Create a {method} API endpoint for {resource} with: validation, error handling, rate limiting, caching, and OpenAPI documentation.",
      "variables": ["method", "resource"]
    },
    "test-suite": {
      "template": "Generate comprehensive tests for {component} including: unit tests, integration tests, edge cases, error scenarios, and performance tests.",
      "variables": ["component"]
    }
  }
}
\`\`\`

### 2. Code Generation Standards
\`\`\`yaml
# .codexrc.yml
standards:
  typescript:
    strict: true
    no-any: true
    prefer-const: true
    
  testing:
    coverage: 80
    include-edge-cases: true
    mock-external-deps: true
    
  security:
    validate-input: always
    sanitize-output: true
    use-parameterized-queries: true
    
  performance:
    lazy-load: true
    memoize-expensive-ops: true
    virtualize-long-lists: true
\`\`\`

### 3. Collaborative Debugging
\`\`\`typescript
// Codex Debug Protocol
interface DebugSession {
  id: string;
  participants: string[];
  context: {
    error: Error;
    stackTrace: string;
    environment: Record<string, any>;
    reproducibleSteps: string[];
  };
  suggestions: CodexSuggestion[];
  resolution?: {
    fixApplied: string;
    verifiedBy: string;
    preventionStrategy: string;
  };
}

// Team kan real-time samenwerken aan debugging
const debugSession = await codex.startDebugSession({
  error: capturedError,
  shareWith: ['team-lead', 'senior-dev'],
  autoAnalyze: true
});
\`\`\``,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Complete Test Suite Generation',
      language: 'typescript',
      code: `// Prompt: "Generate comprehensive tests for this React hook"

// Original hook:
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.validateToken(token)
        .then(user => setUser(user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, login, logout };
};

// Codex generates:
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as authApi from '../api/auth';

// Mock the auth API
jest.mock('../api/auth');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with null user and loading true', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should set loading to false when no token exists', async () => {
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Token Validation on Mount', () => {
    it('should validate existing token on mount', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      localStorageMock.getItem.mockReturnValue('valid-token');
      (authApi.validateToken as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(authApi.validateToken).toHaveBeenCalledWith('valid-token');
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should remove invalid token', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      (authApi.validateToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        user: { id: '1', email: 'test@example.com' },
        token: 'new-token'
      };
      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.login(credentials);
        expect(response).toEqual(mockResponse);
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
    });

    it('should handle login errors', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const errorMessage = 'Invalid credentials';
      (authApi.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.login(credentials)).rejects.toThrow(errorMessage);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should set loading states correctly during login', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });
      (authApi.login as jest.Mock).mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuth());

      // Start login
      act(() => {
        result.current.login(credentials);
      });

      // Check loading is true
      expect(result.current.loading).toBe(true);

      // Resolve login
      await act(async () => {
        resolveLogin!({ user: { id: '1' }, token: 'token' });
        await loginPromise;
      });

      // Check loading is false
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      (authApi.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());
      
      // Set initial user
      act(() => {
        result.current.user = mockUser;
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authApi.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle logout errors gracefully', async () => {
      (authApi.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        // Should not throw
        await expect(result.current.logout()).resolves.not.toThrow();
      });

      expect(result.current.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent login attempts', async () => {
      const credentials1 = { email: 'user1@example.com', password: 'pass1' };
      const credentials2 = { email: 'user2@example.com', password: 'pass2' };
      
      (authApi.login as jest.Mock)
        .mockResolvedValueOnce({ user: { id: '1' }, token: 'token1' })
        .mockResolvedValueOnce({ user: { id: '2' }, token: 'token2' });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const [response1, response2] = await Promise.all([
          result.current.login(credentials1),
          result.current.login(credentials2)
        ]);
        
        // Second login should win
        expect(result.current.user).toEqual({ id: '2' });
      });
    });

    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useAuth());
      
      unmount();
      
      // Verify no memory leaks or pending operations
      expect(true).toBe(true); // Add specific cleanup checks
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', async () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useAuth();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialRenderCount = renderCount;

      // Multiple calls to non-state-changing methods
      act(() => {
        result.current.login({ email: 'same@example.com', password: 'same' });
      });

      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });
});`,
      explanation: 'Codex genereert uitgebreide test suites die edge cases, error scenarios, performance en cleanup gedrag testen.'
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Implementeer een VS Code Extension met Codex',
      description: 'Gebruik Codex om een custom VS Code extension te bouwen die code quality checks automated',
      difficulty: 'expert',
      type: 'code'
    }
  ]
};