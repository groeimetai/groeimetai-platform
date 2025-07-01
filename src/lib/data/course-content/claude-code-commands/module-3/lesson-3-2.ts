import type { Lesson } from '@/lib/data/courses';

export const lesson3_2: Lesson = {
  id: 'lesson-3-2',
  title: 'Test generatie en coverage',
  duration: '40 min',
  content: `
# Test Generatie en Coverage met Claude Code

Claude Code kan automatisch tests genereren voor je code, van unit tests tot end-to-end scenarios. Leer hoe je AI-powered testing optimaal inzet voor betere code kwaliteit.

## Unit Test Generation

Claude kan unit tests genereren voor individuele functies en classes:

### Jest/TypeScript Example
\`\`\`bash
# Generate unit tests for a specific function
claude test generate --function calculateDiscount --framework jest

# Generate tests for an entire class
claude test generate --class UserService --coverage 80
\`\`\`

### Vitest Example
\`\`\`bash
# Generate Vitest tests with TypeScript
claude test generate --file src/utils/validator.ts --framework vitest --typescript

# Generate tests with specific assertions
claude test generate --function validateEmail --assert "returns false for invalid emails"
\`\`\`

## Integration Test Creation

Voor complexere scenarios kan Claude integration tests genereren die meerdere componenten testen:

### Node.js/Express Example
\`\`\`bash
# Generate API integration tests
claude test integration --api routes/users --framework supertest

# Generate database integration tests
claude test integration --db models/User --include-transactions
\`\`\`

### React Testing Library Example
\`\`\`bash
# Generate component integration tests
claude test integration --component UserDashboard --framework rtl

# Test user interactions
claude test integration --flow "user login and navigation" --framework cypress
\`\`\`

## E2E Test Scenarios

Claude kan complete end-to-end test scenarios genereren:

### Playwright Example
\`\`\`bash
# Generate E2E test for user journey
claude test e2e --scenario "user registration flow" --framework playwright

# Generate cross-browser tests
claude test e2e --browsers "chrome,firefox,safari" --parallel
\`\`\`

### Cypress Example
\`\`\`bash
# Generate Cypress E2E tests
claude test e2e --user-story "As a user, I want to purchase a product" --framework cypress

# Generate tests with fixtures
claude test e2e --fixtures data/test-users.json --framework cypress
\`\`\`

## Coverage Analysis

Claude kan je helpen coverage te analyseren en te verbeteren:

### Coverage Commands
\`\`\`bash
# Analyze current test coverage
claude test coverage --analyze

# Generate tests to improve coverage
claude test coverage --target 90 --focus "uncovered branches"

# Generate coverage report
claude test coverage --report html --open
\`\`\`

### Framework-Specific Coverage
\`\`\`bash
# Jest coverage with specific thresholds
claude test coverage --framework jest --threshold-functions 80 --threshold-branches 75

# NYC/Istanbul configuration
claude test coverage --framework nyc --exclude "**/*.spec.js" --include "src/**/*.js"
\`\`\`

## Test Optimization

Claude kan bestaande tests analyseren en optimaliseren:

### Performance Optimization
\`\`\`bash
# Identify slow tests
claude test analyze --performance --threshold 1000ms

# Optimize test execution
claude test optimize --parallel --max-workers 4

# Generate test fixtures for faster tests
claude test optimize --generate-fixtures --reuse
\`\`\`

### Test Quality
\`\`\`bash
# Analyze test quality
claude test analyze --quality --check-assertions

# Refactor tests for better maintainability
claude test refactor --dry --extract-helpers

# Generate missing edge case tests
claude test analyze --edge-cases --auto-generate
\`\`\`

## Best Practices

### Test Structure
- Gebruik beschrijvende test namen
- Groepeer gerelateerde tests
- Isoleer test data
- Mock externe dependencies

### Coverage Goals
- Streef naar 80%+ coverage voor kritieke code
- Focus op branch coverage, niet alleen line coverage
- Test edge cases en error scenarios
- Prioriteer business-critical paths

### Continuous Testing
\`\`\`bash
# Set up pre-commit testing
claude test hook --pre-commit --fast-fail

# Configure CI/CD testing
claude test ci --generate-config --platform github-actions

# Monitor test trends
claude test monitor --dashboard --metrics "coverage,performance,flakiness"
\`\`\`
        `,
  codeExamples: [
    {
      id: 'example-3-2-1',
      title: 'Jest Unit Test Generation',
      language: 'typescript',
      code: `// Original function
export function calculateDiscount(
  price: number, 
  discountPercentage: number, 
  isMember: boolean
): number {
  if (price <= 0 || discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Invalid input parameters');
  }
  
  let discount = price * (discountPercentage / 100);
  if (isMember) {
    discount += price * 0.05; // Extra 5% for members
  }
  
  return Math.round((price - discount) * 100) / 100;
}

// Claude-generated test
describe('calculateDiscount', () => {
  describe('valid inputs', () => {
    it('should calculate discount correctly for non-members', () => {
      expect(calculateDiscount(100, 10, false)).toBe(90);
      expect(calculateDiscount(50, 20, false)).toBe(40);
    });

    it('should add member discount correctly', () => {
      expect(calculateDiscount(100, 10, true)).toBe(85);
      expect(calculateDiscount(200, 15, true)).toBe(160);
    });

    it('should handle edge cases', () => {
      expect(calculateDiscount(0.01, 0, false)).toBe(0.01);
      expect(calculateDiscount(999.99, 100, true)).toBe(0);
    });
  });

  describe('invalid inputs', () => {
    it('should throw error for negative price', () => {
      expect(() => calculateDiscount(-10, 10, false)).toThrow('Invalid input parameters');
    });

    it('should throw error for invalid discount percentage', () => {
      expect(() => calculateDiscount(100, -5, false)).toThrow('Invalid input parameters');
      expect(() => calculateDiscount(100, 101, false)).toThrow('Invalid input parameters');
    });
  });

  describe('precision handling', () => {
    it('should round to 2 decimal places', () => {
      expect(calculateDiscount(10.005, 33.33, false)).toBe(6.67);
    });
  });
});`,
      explanation: 'Claude genereert comprehensive unit tests die alle code paths coveren, inclusief edge cases en error scenarios. De tests zijn georganiseerd in logische groepen voor betere leesbaarheid.'
    },
    {
      id: 'example-3-2-2',
      title: 'React Testing Library Integration Test',
      language: 'typescript',
      code: `// Component to test
interface UserDashboardProps {
  userId: string;
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchUser(userId),
      fetchUserOrders(userId)
    ]).then(([userData, ordersData]) => {
      setUser(userData);
      setOrders(ordersData);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <Spinner />;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <OrderList orders={orders} />
    </div>
  );
}

// Claude-generated integration test
import { render, screen, waitFor } from '@testing-library/react';
import { UserDashboard } from './UserDashboard';
import { fetchUser, fetchUserOrders } from './api';

jest.mock('./api');

describe('UserDashboard Integration', () => {
  const mockUser = { id: '123', name: 'John Doe', email: 'john@example.com' };
  const mockOrders = [
    { id: 'order1', total: 99.99, status: 'delivered' },
    { id: 'order2', total: 149.99, status: 'pending' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and display user data and orders', async () => {
    (fetchUser as jest.Mock).mockResolvedValue(mockUser);
    (fetchUserOrders as jest.Mock).mockResolvedValue(mockOrders);

    render(<UserDashboard userId="123" />);

    // Initially shows loading
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
    });

    // Verify orders are displayed
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$149.99')).toBeInTheDocument();

    // Verify API calls
    expect(fetchUser).toHaveBeenCalledWith('123');
    expect(fetchUserOrders).toHaveBeenCalledWith('123');
  });

  it('should handle user not found', async () => {
    (fetchUser as jest.Mock).mockResolvedValue(null);
    (fetchUserOrders as jest.Mock).mockResolvedValue([]);

    render(<UserDashboard userId="999" />);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    (fetchUser as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<UserDashboard userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });
});`,
      explanation: 'Deze integration test verifieert dat meerdere componenten correct samenwerken, inclusief API calls, state management, en conditional rendering.'
    },
    {
      id: 'example-3-2-3',
      title: 'Playwright E2E Test',
      language: 'typescript',
      code: `// Claude-generated E2E test for complete user journey
import { test, expect } from '@playwright/test';

test.describe('User Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://shop.example.com');
  });

  test('complete purchase journey from browse to checkout', async ({ page }) => {
    // Step 1: Browse products
    await page.click('text=Products');
    await expect(page).toHaveURL(/.*\/products/);
    
    // Step 2: Search and filter
    await page.fill('[data-testid="search-input"]', 'laptop');
    await page.click('[data-testid="search-button"]');
    await page.click('text=Price: Low to High');
    
    // Verify search results
    const results = await page.locator('[data-testid="product-card"]').count();
    expect(results).toBeGreaterThan(0);
    
    // Step 3: Select product
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page.locator('h1')).toContainText('Laptop');
    
    // Step 4: Add to cart
    await page.selectOption('[data-testid="quantity-select"]', '2');
    await page.click('[data-testid="add-to-cart"]');
    
    // Verify cart notification
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('2');
    
    // Step 5: Proceed to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Proceed to Checkout');
    
    // Step 6: Fill shipping info
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="address"]', '123 Test Street');
    await page.fill('[name="city"]', 'Test City');
    await page.fill('[name="zipCode"]', '12345');
    
    // Step 7: Payment
    await page.click('text=Continue to Payment');
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    
    // Step 8: Place order
    await page.click('[data-testid="place-order"]');
    
    // Verify order confirmation
    await expect(page.locator('h1')).toHaveText('Order Confirmed!');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'order-confirmation.png' });
  });

  test('should handle out of stock scenario', async ({ page }) => {
    // Navigate to out of stock product
    await page.goto('https://shop.example.com/products/out-of-stock-item');
    
    // Verify out of stock message
    await expect(page.locator('[data-testid="stock-status"]')).toHaveText('Out of Stock');
    
    // Verify add to cart is disabled
    await expect(page.locator('[data-testid="add-to-cart"]')).toBeDisabled();
    
    // Test notify feature
    await page.fill('[data-testid="notify-email"]', 'test@example.com');
    await page.click('[data-testid="notify-button"]');
    
    await expect(page.locator('[data-testid="notify-success"]')).toBeVisible();
  });

  test('should apply discount code correctly', async ({ page }) => {
    // Add item to cart
    await page.goto('https://shop.example.com/products/test-product');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="cart-icon"]');
    
    // Apply discount code
    await page.fill('[data-testid="discount-code"]', 'SAVE20');
    await page.click('[data-testid="apply-discount"]');
    
    // Verify discount applied
    await expect(page.locator('[data-testid="discount-amount"]')).toContainText('-20%');
    
    const originalPrice = await page.locator('[data-testid="original-price"]').textContent();
    const discountedPrice = await page.locator('[data-testid="final-price"]').textContent();
    
    expect(parseFloat(discountedPrice!)).toBeLessThan(parseFloat(originalPrice!));
  });
});`,
      explanation: 'Complete E2E test die een volledige user journey test, van product browse tot checkout, inclusief edge cases en error scenarios.'
    },
    {
      id: 'example-3-2-4',
      title: 'Coverage Analysis en Improvement',
      language: 'bash',
      code: `# Analyze current coverage
$ claude test coverage --analyze

📊 Coverage Analysis Report
═══════════════════════════════════════════════════════════
Overall Coverage: 72.3%
  Statements: 78.5% (1847/2352)
  Branches: 64.2% (412/642)
  Functions: 71.8% (287/400)
  Lines: 73.1% (1823/2495)

❌ Low Coverage Files:
  src/utils/payment.ts: 45.2%
  src/services/inventory.ts: 52.8%
  src/components/Checkout.tsx: 58.3%

⚠️  Uncovered Critical Paths:
  - Error handling in payment processing
  - Edge cases in inventory management
  - Checkout validation scenarios

# Generate tests for low coverage areas
$ claude test coverage --target 85 --focus "payment.ts,inventory.ts"

🤖 Generating tests for improved coverage...

✅ Generated 12 new test cases:
  - payment.test.ts: 5 tests (error scenarios, edge cases)
  - inventory.test.ts: 7 tests (concurrent updates, validation)

📈 Projected Coverage: 84.7% (+12.4%)

# Run generated tests
$ npm test -- --coverage

# Generate detailed HTML report
$ claude test coverage --report html --include-untested

📄 Coverage report generated: coverage/index.html
🌐 Opening in browser...

# Set up coverage gates
$ claude test coverage --set-threshold statements=80 branches=75 functions=80

✅ Coverage thresholds configured in jest.config.js`,
      explanation: 'Claude analyseert je huidige test coverage, identificeert gebieden met lage coverage, en genereert gerichte tests om de coverage te verbeteren.'
    }
  ],
  assignments: [
    {
      id: 'assignment-3-2-1',
      title: 'Genereer Unit Tests voor Calculator Module',
      description: 'Gebruik Claude Code om complete unit tests te genereren voor een calculator module met verschillende operaties.',
      difficulty: 'medium',
      type: 'code',
      initialCode: `// Calculator module die getest moet worden
export class Calculator {
  private history: Array<{ operation: string; result: number }> = [];

  add(a: number, b: number): number {
    const result = a + b;
    this.history.push({ operation: \`\${a} + \${b}\`, result });
    return result;
  }

  subtract(a: number, b: number): number {
    const result = a - b;
    this.history.push({ operation: \`\${a} - \${b}\`, result });
    return result;
  }

  multiply(a: number, b: number): number {
    const result = a * b;
    this.history.push({ operation: \`\${a} * \${b}\`, result });
    return result;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    const result = a / b;
    this.history.push({ operation: \`\${a} / \${b}\`, result });
    return result;
  }

  power(base: number, exponent: number): number {
    const result = Math.pow(base, exponent);
    this.history.push({ operation: \`\${base} ^ \${exponent}\`, result });
    return result;
  }

  getHistory(): Array<{ operation: string; result: number }> {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

// OPDRACHT: Gebruik Claude Code om complete unit tests te genereren
// 1. Test alle methods inclusief edge cases
// 2. Test error scenarios (zoals division by zero)
// 3. Test de history functionaliteit
// 4. Zorg voor 100% code coverage`,
      solution: `import { Calculator } from './calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers correctly', () => {
      expect(calculator.add(2, 3)).toBe(5);
      expect(calculator.add(10, 20)).toBe(30);
    });

    it('should handle negative numbers', () => {
      expect(calculator.add(-5, 3)).toBe(-2);
      expect(calculator.add(-10, -5)).toBe(-15);
    });

    it('should handle decimal numbers', () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
      expect(calculator.add(1.5, 2.5)).toBe(4);
    });

    it('should handle zero', () => {
      expect(calculator.add(0, 5)).toBe(5);
      expect(calculator.add(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers correctly', () => {
      expect(calculator.subtract(10, 5)).toBe(5);
      expect(calculator.subtract(0, 5)).toBe(-5);
    });

    it('should handle negative results', () => {
      expect(calculator.subtract(5, 10)).toBe(-5);
      expect(calculator.subtract(-5, 5)).toBe(-10);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(calculator.multiply(3, 4)).toBe(12);
      expect(calculator.multiply(-3, 4)).toBe(-12);
    });

    it('should handle multiplication by zero', () => {
      expect(calculator.multiply(5, 0)).toBe(0);
      expect(calculator.multiply(0, 10)).toBe(0);
    });

    it('should handle decimal multiplication', () => {
      expect(calculator.multiply(0.5, 0.5)).toBe(0.25);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(calculator.divide(10, 2)).toBe(5);
      expect(calculator.divide(15, 3)).toBe(5);
    });

    it('should handle decimal division', () => {
      expect(calculator.divide(1, 3)).toBeCloseTo(0.333, 3);
      expect(calculator.divide(10, 4)).toBe(2.5);
    });

    it('should throw error for division by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero');
      expect(() => calculator.divide(-5, 0)).toThrow('Division by zero');
    });

    it('should handle negative division', () => {
      expect(calculator.divide(-10, 2)).toBe(-5);
      expect(calculator.divide(10, -2)).toBe(-5);
      expect(calculator.divide(-10, -2)).toBe(5);
    });
  });

  describe('power', () => {
    it('should calculate power correctly', () => {
      expect(calculator.power(2, 3)).toBe(8);
      expect(calculator.power(5, 2)).toBe(25);
    });

    it('should handle power of zero', () => {
      expect(calculator.power(5, 0)).toBe(1);
      expect(calculator.power(0, 5)).toBe(0);
    });

    it('should handle negative exponents', () => {
      expect(calculator.power(2, -1)).toBe(0.5);
      expect(calculator.power(10, -2)).toBe(0.01);
    });

    it('should handle fractional exponents', () => {
      expect(calculator.power(4, 0.5)).toBe(2);
      expect(calculator.power(27, 1/3)).toBeCloseTo(3);
    });
  });

  describe('history', () => {
    it('should track operation history', () => {
      calculator.add(5, 3);
      calculator.multiply(2, 4);
      calculator.divide(10, 2);

      const history = calculator.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0]).toEqual({ operation: '5 + 3', result: 8 });
      expect(history[1]).toEqual({ operation: '2 * 4', result: 8 });
      expect(history[2]).toEqual({ operation: '10 / 2', result: 5 });
    });

    it('should return a copy of history', () => {
      calculator.add(1, 1);
      const history1 = calculator.getHistory();
      history1.push({ operation: 'fake', result: 999 });
      
      const history2 = calculator.getHistory();
      expect(history2).toHaveLength(1);
      expect(history2[0]).toEqual({ operation: '1 + 1', result: 2 });
    });

    it('should clear history', () => {
      calculator.add(1, 1);
      calculator.multiply(2, 2);
      expect(calculator.getHistory()).toHaveLength(2);

      calculator.clearHistory();
      expect(calculator.getHistory()).toHaveLength(0);
    });

    it('should not track failed operations', () => {
      calculator.add(1, 1);
      
      try {
        calculator.divide(10, 0);
      } catch (e) {
        // Expected error
      }

      const history = calculator.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual({ operation: '1 + 1', result: 2 });
    });
  });
});`,
      hints: [
        'Begin met het testen van de happy path voor elke method',
        'Vergeet niet edge cases zoals zero, negative numbers, en decimals',
        'Test error scenarios expliciet met expect().toThrow()',
        'Gebruik beforeEach om een fresh calculator instance te maken',
        'Test dat history correct bijgehouden wordt voor alle operaties',
        'Verifieer dat getHistory() een copy returnt, niet de originele array'
      ]
    },
    {
      id: 'assignment-3-2-2',
      title: 'Schrijf E2E Tests voor Login Flow',
      description: 'Creëer comprehensive E2E tests voor een complete login flow inclusief error scenarios.',
      difficulty: 'hard',
      type: 'code',
      initialCode: `// Login flow die E2E getest moet worden
// Gebruik Playwright of Cypress syntax

/*
De applicatie heeft de volgende flow:
1. Login pagina met email/password velden
2. "Remember me" checkbox
3. "Forgot password" link
4. Social login opties (Google, GitHub)
5. Na succesvolle login -> redirect naar dashboard
6. Na 3 failed attempts -> account locked voor 15 minuten

Test scenarios die gedekt moeten worden:
- Succesvolle login
- Ongeldige credentials
- Account locked scenario
- Remember me functionaliteit
- Social login flow
- Password reset flow
- Session timeout handling
- Concurrent login detectie
*/

// OPDRACHT: Schrijf complete E2E tests die alle scenarios coveren`,
      solution: `import { test, expect } from '@playwright/test';

test.describe('Login Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Clear any existing sessions
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('successful login with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation
    await page.waitForURL('/dashboard');
    
    // Verify successful login
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome back');
    await expect(page.locator('[data-testid="user-email"]')).toContainText('user@example.com');
    
    // Verify session cookie is set
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
  });

  test('login fails with invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-button"]');
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
    
    // Show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email or password');
    
    // Input fields should retain values
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue('user@example.com');
    
    // Password field should be cleared
    await expect(page.locator('[data-testid="password-input"]')).toHaveValue('');
  });

  test('account locked after 3 failed attempts', async ({ page }) => {
    const email = 'user@example.com';
    const wrongPassword = 'WrongPassword';
    
    // First failed attempt
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', wrongPassword);
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email or password');
    
    // Second failed attempt
    await page.fill('[data-testid="password-input"]', wrongPassword);
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email or password');
    await expect(page.locator('[data-testid="attempts-warning"]')).toContainText('1 attempt remaining');
    
    // Third failed attempt - should lock account
    await page.fill('[data-testid="password-input"]', wrongPassword);
    await page.click('[data-testid="login-button"]');
    
    // Verify account locked
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Account locked');
    await expect(page.locator('[data-testid="lock-timer"]')).toContainText('Try again in 15:00');
    
    // Login button should be disabled
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    
    // Verify correct password also fails during lockout
    await page.reload();
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Account locked');
  });

  test('remember me functionality', async ({ page, context }) => {
    // Login with remember me checked
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.check('[data-testid="remember-me-checkbox"]');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    
    // Get cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    const rememberCookie = cookies.find(c => c.name === 'remember_token');
    
    // Verify remember token is set with longer expiry
    expect(rememberCookie).toBeTruthy();
    expect(rememberCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 7 * 24 * 60 * 60); // 7 days
    
    // Close and reopen browser
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Should be automatically logged in
    await expect(newPage).toHaveURL('/dashboard');
    await expect(newPage.locator('[data-testid="user-email"]')).toContainText('user@example.com');
  });

  test('social login - Google OAuth flow', async ({ page, context }) => {
    // Click Google login
    await page.click('[data-testid="google-login-button"]');
    
    // Wait for popup
    const popupPromise = page.waitForEvent('popup');
    const popup = await popupPromise;
    
    // Verify OAuth URL
    await expect(popup).toHaveURL(/accounts\.google\.com/);
    
    // Mock Google OAuth response
    await popup.goto('/mock-oauth-callback?provider=google&email=user@gmail.com&token=mock-token');
    
    // Should redirect back to main window
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="user-email"]')).toContainText('user@gmail.com');
    await expect(page.locator('[data-testid="auth-provider"]')).toContainText('Google');
  });

  test('password reset flow', async ({ page }) => {
    // Click forgot password
    await page.click('[data-testid="forgot-password-link"]');
    
    // Should navigate to reset page
    await expect(page).toHaveURL('/forgot-password');
    
    // Enter email
    await page.fill('[data-testid="reset-email-input"]', 'user@example.com');
    await page.click('[data-testid="send-reset-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="reset-success"]')).toContainText('Reset link sent to user@example.com');
    
    // Mock clicking reset link in email
    const resetToken = 'mock-reset-token-123';
    await page.goto(\`/reset-password?token=\${resetToken}\`);
    
    // Enter new password
    await page.fill('[data-testid="new-password-input"]', 'NewSecurePass456!');
    await page.fill('[data-testid="confirm-password-input"]', 'NewSecurePass456!');
    await page.click('[data-testid="reset-password-button"]');
    
    // Should redirect to login with success message
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset successful');
    
    // Verify can login with new password
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'NewSecurePass456!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('session timeout handling', async ({ page }) => {
    // Login successfully
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
    
    // Mock session expiry
    await page.evaluate(() => {
      // Simulate session timeout
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    });
    
    // Try to navigate to protected route
    await page.goto('/profile');
    
    // Should redirect to login with timeout message
    await expect(page).toHaveURL('/login?reason=session_timeout');
    await expect(page.locator('[data-testid="info-message"]')).toContainText('Session expired. Please login again.');
    
    // Verify return URL is preserved
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');
    
    // Should redirect back to originally requested page
    await expect(page).toHaveURL('/profile');
  });

  test('concurrent login detection', async ({ browser }) => {
    // Login in first browser context
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/login');
    await page1.fill('[data-testid="email-input"]', 'user@example.com');
    await page1.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page1.click('[data-testid="login-button"]');
    await page1.waitForURL('/dashboard');
    
    // Login in second browser context (different device)
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/login');
    await page2.fill('[data-testid="email-input"]', 'user@example.com');
    await page2.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page2.click('[data-testid="login-button"]');
    await page2.waitForURL('/dashboard');
    
    // First session should show warning
    await page1.reload();
    await expect(page1.locator('[data-testid="session-warning"]')).toContainText('New login detected from another device');
    
    // Optionally: first session could be terminated
    await page1.click('[data-testid="secure-account-button"]');
    await expect(page1).toHaveURL('/login?reason=security');
    
    // Clean up
    await context1.close();
    await context2.close();
  });

  test('accessibility during login', async ({ page }) => {
    // Tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="remember-me-checkbox"]')).toBeFocused();
    
    // Screen reader labels
    const emailLabel = await page.getAttribute('[data-testid="email-input"]', 'aria-label');
    expect(emailLabel).toBe('Email address');
    
    const passwordLabel = await page.getAttribute('[data-testid="password-input"]', 'aria-label');
    expect(passwordLabel).toBe('Password');
    
    // Error announcements
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="login-button"]');
    
    const liveRegion = await page.locator('[role="alert"]');
    await expect(liveRegion).toContainText('Please enter a valid email');
  });
});`,
      hints: [
        'Test zowel de happy path als alle error scenarios',
        'Gebruik data-testid attributes voor betrouwbare element selection',
        'Mock externe services zoals OAuth providers',
        'Test browser gedrag zoals cookies en session storage',
        'Vergeet niet om accessibility te testen',
        'Gebruik meerdere browser contexts voor concurrent login tests',
        'Test time-based features zoals account lockout',
        'Verifieer security features zoals HTTPS-only cookies'
      ]
    }
  ],
  resources: [
    {
      title: 'Jest Testing Framework',
      url: 'https://jestjs.io/docs/getting-started',
      type: 'documentation'
    },
    {
      title: 'Testing Library Best Practices',
      url: 'https://testing-library.com/docs/guiding-principles',
      type: 'guide'
    },
    {
      title: 'Playwright E2E Testing',
      url: 'https://playwright.dev/docs/intro',
      type: 'documentation'
    },
    {
      title: 'Test Coverage Guide',
      url: 'https://jestjs.io/docs/configuration#collectcoverage-boolean',
      type: 'guide'
    }
  ]
};