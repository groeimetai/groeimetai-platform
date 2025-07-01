# Test Suite Templates - GroeimetAI Platform MVP

## 1. Unit Testing Templates

### 1.1 Authentication Service Tests
```javascript
// auth.service.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '../src/services/auth.service';
import { FirebaseAuthError } from '../src/errors/auth.errors';

describe('AuthService', () => {
  let authService;
  
  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        displayName: 'Test User'
      };
      
      const result = await authService.registerUser(userData);
      
      expect(result).toEqual({
        success: true,
        uid: expect.any(String),
        emailVerified: false
      });
    });

    it('should throw error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        displayName: 'Test User'
      };
      
      await expect(authService.registerUser(userData))
        .rejects.toThrow(FirebaseAuthError);
    });

    it('should throw error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        displayName: 'Test User'
      };
      
      await expect(authService.registerUser(userData))
        .rejects.toThrow('Password does not meet requirements');
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        displayName: 'Test User'
      };
      
      await expect(authService.registerUser(userData))
        .rejects.toThrow('Email already in use');
    });
  });

  describe('loginUser', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };
      
      const result = await authService.loginUser(credentials);
      
      expect(result).toEqual({
        user: expect.objectContaining({
          uid: expect.any(String),
          email: credentials.email
        }),
        token: expect.any(String)
      });
    });

    it('should throw error for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      await expect(authService.loginUser(credentials))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for unverified email', async () => {
      const credentials = {
        email: 'unverified@example.com',
        password: 'SecurePass123!'
      };
      
      await expect(authService.loginUser(credentials))
        .rejects.toThrow('Email not verified');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email for valid email', async () => {
      const email = 'test@example.com';
      
      const result = await authService.resetPassword(email);
      
      expect(result).toEqual({ success: true });
    });

    it('should not reveal if email does not exist', async () => {
      const email = 'nonexistent@example.com';
      
      const result = await authService.resetPassword(email);
      
      expect(result).toEqual({ success: true });
    });
  });
});
```

### 1.2 Course Service Tests
```javascript
// course.service.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CourseService } from '../src/services/course.service';
import { CourseError } from '../src/errors/course.errors';

describe('CourseService', () => {
  let courseService;
  
  beforeEach(() => {
    courseService = new CourseService();
    vi.clearAllMocks();
  });

  describe('createCourse', () => {
    it('should create a new course with valid data', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'A test course',
        price: 99.99,
        instructorId: 'instructor123',
        category: 'Technology'
      };
      
      const result = await courseService.createCourse(courseData);
      
      expect(result).toEqual({
        id: expect.any(String),
        ...courseData,
        createdAt: expect.any(Date),
        status: 'draft'
      });
    });

    it('should throw error for missing required fields', async () => {
      const courseData = {
        title: 'Test Course'
        // Missing required fields
      };
      
      await expect(courseService.createCourse(courseData))
        .rejects.toThrow(CourseError);
    });

    it('should throw error for invalid price', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'A test course',
        price: -10,
        instructorId: 'instructor123',
        category: 'Technology'
      };
      
      await expect(courseService.createCourse(courseData))
        .rejects.toThrow('Price must be a positive number');
    });
  });

  describe('getCourse', () => {
    it('should return course data for valid course ID', async () => {
      const courseId = 'course123';
      
      const result = await courseService.getCourse(courseId);
      
      expect(result).toEqual({
        id: courseId,
        title: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        instructorId: expect.any(String)
      });
    });

    it('should throw error for non-existent course', async () => {
      const courseId = 'nonexistent';
      
      await expect(courseService.getCourse(courseId))
        .rejects.toThrow('Course not found');
    });
  });

  describe('enrollUser', () => {
    it('should enroll user in course successfully', async () => {
      const enrollmentData = {
        userId: 'user123',
        courseId: 'course123',
        paymentId: 'payment123'
      };
      
      const result = await courseService.enrollUser(enrollmentData);
      
      expect(result).toEqual({
        enrollmentId: expect.any(String),
        status: 'active',
        enrolledAt: expect.any(Date)
      });
    });

    it('should throw error for duplicate enrollment', async () => {
      const enrollmentData = {
        userId: 'user123',
        courseId: 'course123',
        paymentId: 'payment123'
      };
      
      await expect(courseService.enrollUser(enrollmentData))
        .rejects.toThrow('User already enrolled');
    });
  });
});
```

### 1.3 Payment Service Tests
```javascript
// payment.service.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PaymentService } from '../src/services/payment.service';
import { PaymentError } from '../src/errors/payment.errors';

describe('PaymentService', () => {
  let paymentService;
  
  beforeEach(() => {
    paymentService = new PaymentService();
    vi.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        amount: 99.99,
        currency: 'EUR',
        userId: 'user123',
        courseId: 'course123',
        paymentMethodId: 'pm_123'
      };
      
      const result = await paymentService.processPayment(paymentData);
      
      expect(result).toEqual({
        paymentId: expect.any(String),
        status: 'succeeded',
        amount: paymentData.amount,
        currency: paymentData.currency
      });
    });

    it('should throw error for invalid payment method', async () => {
      const paymentData = {
        amount: 99.99,
        currency: 'EUR',
        userId: 'user123',
        courseId: 'course123',
        paymentMethodId: 'invalid_pm'
      };
      
      await expect(paymentService.processPayment(paymentData))
        .rejects.toThrow(PaymentError);
    });

    it('should throw error for insufficient funds', async () => {
      const paymentData = {
        amount: 99.99,
        currency: 'EUR',
        userId: 'user123',
        courseId: 'course123',
        paymentMethodId: 'pm_declined'
      };
      
      await expect(paymentService.processPayment(paymentData))
        .rejects.toThrow('Payment declined');
    });
  });

  describe('refundPayment', () => {
    it('should process refund successfully', async () => {
      const refundData = {
        paymentId: 'payment123',
        amount: 99.99,
        reason: 'Customer request'
      };
      
      const result = await paymentService.refundPayment(refundData);
      
      expect(result).toEqual({
        refundId: expect.any(String),
        status: 'succeeded',
        amount: refundData.amount
      });
    });

    it('should throw error for already refunded payment', async () => {
      const refundData = {
        paymentId: 'refunded_payment',
        amount: 99.99,
        reason: 'Customer request'
      };
      
      await expect(paymentService.refundPayment(refundData))
        .rejects.toThrow('Payment already refunded');
    });
  });
});
```

## 2. Integration Testing Templates

### 2.1 User Journey Tests
```javascript
// user-journey.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestApp, clearTestData } from '../test-utils/firebase-test-utils';

describe('User Journey Integration Tests', () => {
  let testApp;
  
  beforeAll(async () => {
    testApp = await initializeTestApp();
  });
  
  afterAll(async () => {
    await clearTestData();
    await testApp.delete();
  });

  describe('Complete User Registration to Course Completion', () => {
    it('should complete full user journey successfully', async () => {
      // Step 1: User Registration
      const registrationData = {
        email: 'testuser@example.com',
        password: 'SecurePass123!',
        displayName: 'Test User'
      };
      
      const registrationResult = await testApp.auth().createUser(registrationData);
      expect(registrationResult.uid).toBeDefined();
      
      // Step 2: Email Verification
      await testApp.auth().verifyEmail(registrationResult.uid);
      
      // Step 3: User Login
      const loginResult = await testApp.auth().signInWithEmailAndPassword(
        registrationData.email,
        registrationData.password
      );
      expect(loginResult.user.emailVerified).toBe(true);
      
      // Step 4: Browse Courses
      const courses = await testApp.firestore().collection('courses').get();
      expect(courses.size).toBeGreaterThan(0);
      
      // Step 5: Course Purchase
      const courseId = courses.docs[0].id;
      const paymentResult = await testApp.functions().httpsCallable('processCoursePayment')({
        courseId,
        paymentMethodId: 'pm_card_visa'
      });
      expect(paymentResult.data.status).toBe('succeeded');
      
      // Step 6: Course Enrollment
      const enrollmentResult = await testApp.functions().httpsCallable('enrollInCourse')({
        courseId,
        paymentId: paymentResult.data.paymentId
      });
      expect(enrollmentResult.data.status).toBe('enrolled');
      
      // Step 7: Start Course
      const courseProgress = await testApp.firestore()
        .doc(`users/${loginResult.user.uid}/progress/${courseId}`)
        .get();
      expect(courseProgress.exists).toBe(true);
      
      // Step 8: Complete Assessment
      const assessmentResult = await testApp.functions().httpsCallable('submitAssessment')({
        courseId,
        answers: ['A', 'B', 'C', 'D', 'A']
      });
      expect(assessmentResult.data.score).toBeGreaterThan(0);
      
      // Step 9: Generate Certificate
      if (assessmentResult.data.passed) {
        const certificateResult = await testApp.functions().httpsCallable('generateCertificate')({
          courseId
        });
        expect(certificateResult.data.certificateUrl).toBeDefined();
      }
    });
  });
});
```

### 2.2 API Integration Tests
```javascript
// api-integration.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('API Integration Tests', () => {
  let authToken;
  let userId;
  
  beforeAll(async () => {
    // Setup test user and get auth token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testapi@example.com',
        password: 'SecurePass123!',
        displayName: 'API Test User'
      });
    
    authToken = response.body.token;
    userId = response.body.uid;
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register should create new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          displayName: 'New User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uid');
      expect(response.body).toHaveProperty('token');
    });

    it('POST /api/auth/login should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testapi@example.com',
          password: 'SecurePass123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('POST /api/auth/logout should invalidate token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('Course Endpoints', () => {
    it('GET /api/courses should return list of courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /api/courses/:id should return course details', async () => {
      const response = await request(app)
        .get('/api/courses/course123')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
    });

    it('POST /api/courses should create new course (admin only)', async () => {
      const courseData = {
        title: 'New Course',
        description: 'A new test course',
        price: 149.99,
        category: 'Technology'
      };
      
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(courseData.title);
    });
  });

  describe('Payment Endpoints', () => {
    it('POST /api/payments/process should process payment', async () => {
      const paymentData = {
        courseId: 'course123',
        paymentMethodId: 'pm_card_visa',
        amount: 99.99
      };
      
      const response = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('paymentId');
      expect(response.body.status).toBe('succeeded');
    });

    it('POST /api/payments/refund should process refund', async () => {
      const refundData = {
        paymentId: 'payment123',
        reason: 'Customer request'
      };
      
      const response = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${authToken}`)
        .send(refundData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('refundId');
      expect(response.body.status).toBe('succeeded');
    });
  });
});
```

## 3. End-to-End Testing Templates

### 3.1 Playwright E2E Tests
```javascript
// e2e/user-flows.spec.js
import { test, expect } from '@playwright/test';

test.describe('User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User Registration and Login Flow', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/register');
    
    // Fill registration form
    await page.fill('[data-testid=email-input]', 'e2etest@example.com');
    await page.fill('[data-testid=password-input]', 'SecurePass123!');
    await page.fill('[data-testid=display-name-input]', 'E2E Test User');
    await page.check('[data-testid=terms-checkbox]');
    
    // Submit registration
    await page.click('[data-testid=register-button]');
    await expect(page).toHaveURL('/verify-email');
    
    // Simulate email verification (in test environment)
    await page.goto('/login');
    
    // Login with new account
    await page.fill('[data-testid=email-input]', 'e2etest@example.com');
    await page.fill('[data-testid=password-input]', 'SecurePass123!');
    await page.click('[data-testid=login-button]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid=user-name]')).toContainText('E2E Test User');
  });

  test('Course Purchase and Enrollment Flow', async ({ page }) => {
    // Login first
    await loginTestUser(page);
    
    // Browse courses
    await page.click('text=Courses');
    await expect(page).toHaveURL('/courses');
    
    // Select a course
    await page.click('[data-testid=course-card]:first-child');
    await expect(page.locator('[data-testid=course-title]')).toBeVisible();
    
    // Start purchase
    await page.click('[data-testid=enroll-button]');
    await expect(page).toHaveURL(/\/courses\/.*\/purchase/);
    
    // Fill payment information
    await page.fill('[data-testid=card-number]', '4242424242424242');
    await page.fill('[data-testid=card-expiry]', '12/25');
    await page.fill('[data-testid=card-cvc]', '123');
    await page.fill('[data-testid=card-name]', 'Test User');
    
    // Complete purchase
    await page.click('[data-testid=complete-purchase-button]');
    await expect(page.locator('[data-testid=purchase-success]')).toBeVisible();
    
    // Verify enrollment
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid=enrolled-courses]')).toContainText('1 Course');
  });

  test('Assessment Taking and Certificate Generation', async ({ page }) => {
    // Login and navigate to enrolled course
    await loginTestUser(page);
    await page.goto('/dashboard');
    await page.click('[data-testid=enrolled-course]:first-child');
    
    // Start assessment
    await page.click('[data-testid=start-assessment-button]');
    await expect(page).toHaveURL(/\/assessments\/.*/);
    
    // Answer questions
    for (let i = 1; i <= 5; i++) {
      await page.check(`[data-testid=question-${i}-option-a]`);
      if (i < 5) {
        await page.click('[data-testid=next-question-button]');
      }
    }
    
    // Submit assessment
    await page.click('[data-testid=submit-assessment-button]');
    await expect(page.locator('[data-testid=assessment-results]')).toBeVisible();
    
    // Check if certificate is generated (if passed)
    const score = await page.locator('[data-testid=assessment-score]').textContent();
    if (parseInt(score) >= 70) {
      await expect(page.locator('[data-testid=certificate-download]')).toBeVisible();
    }
  });

  test('Mobile Responsive Design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile navigation
    await page.click('[data-testid=mobile-menu-button]');
    await expect(page.locator('[data-testid=mobile-menu]')).toBeVisible();
    
    // Test course cards on mobile
    await page.goto('/courses');
    const courseCards = page.locator('[data-testid=course-card]');
    await expect(courseCards.first()).toBeVisible();
    
    // Test form inputs on mobile
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'password');
    
    // Verify inputs are properly sized
    const emailInput = page.locator('[data-testid=email-input]');
    const inputBox = await emailInput.boundingBox();
    expect(inputBox.width).toBeGreaterThan(200);
  });
});

async function loginTestUser(page) {
  await page.goto('/login');
  await page.fill('[data-testid=email-input]', 'testuser@example.com');
  await page.fill('[data-testid=password-input]', 'SecurePass123!');
  await page.click('[data-testid=login-button]');
  await expect(page).toHaveURL('/dashboard');
}
```

## 4. Performance Testing Templates

### 4.1 Load Testing with Artillery
```yaml
# artillery-load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  variables:
    testUsers:
      - email: "loadtest1@example.com"
        password: "SecurePass123!"
      - email: "loadtest2@example.com"
        password: "SecurePass123!"

scenarios:
  - name: "User Registration and Course Browse"
    weight: 30
    flow:
      - post:
          url: "/api/auth/register"
          json:
            email: "loadtest{{ $randomInt(1000, 9999) }}@example.com"
            password: "SecurePass123!"
            displayName: "Load Test User"
      - get:
          url: "/api/courses"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "User Login and Dashboard"
    weight: 50
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $pick(testUsers).email }}"
            password: "{{ $pick(testUsers).password }}"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/dashboard"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Course Purchase Flow"
    weight: 20
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $pick(testUsers).email }}"
            password: "{{ $pick(testUsers).password }}"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/courses"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/api/payments/process"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            courseId: "course123"
            paymentMethodId: "pm_card_visa_debit"
            amount: 99.99
```

### 4.2 Performance Monitoring Tests
```javascript
// performance.test.js
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Page Load Performance', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/');
    
    // Measure page load time
    const performanceData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
    });
    
    // Assert performance benchmarks
    expect(performanceData.loadTime).toBeLessThan(2000); // 2 seconds
    expect(performanceData.domContentLoaded).toBeLessThan(1000); // 1 second
    expect(performanceData.firstContentfulPaint).toBeLessThan(1500); // 1.5 seconds
  });

  test('Course Loading Performance', async ({ page }) => {
    await page.goto('/courses');
    
    // Measure course loading time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid=course-card]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(1500); // 1.5 seconds
  });

  test('Assessment Performance', async ({ page }) => {
    await loginTestUser(page);
    await page.goto('/assessments/assessment123');
    
    // Measure assessment loading and interaction time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid=question-1]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(1000); // 1 second
    
    // Test question navigation performance
    const navigationStart = Date.now();
    await page.click('[data-testid=next-question-button]');
    await page.waitForSelector('[data-testid=question-2]');
    const navigationTime = Date.now() - navigationStart;
    
    expect(navigationTime).toBeLessThan(500); // 0.5 seconds
  });
});
```

## 5. Test Utilities and Helpers

### 5.1 Firebase Test Utilities
```javascript
// test-utils/firebase-test-utils.js
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

let testEnv;

export async function initializeTestApp() {
  testEnv = await initializeTestEnvironment({
    projectId: 'groeimetai-test',
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
    },
  });
  
  return testEnv;
}

export async function createTestUser(uid, userData) {
  const userRef = doc(testEnv.firestore(), 'users', uid);
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
    role: 'student'
  });
}

export async function createTestCourse(courseId, courseData) {
  const courseRef = doc(testEnv.firestore(), 'courses', courseId);
  await setDoc(courseRef, {
    ...courseData,
    createdAt: new Date(),
    status: 'published'
  });
}

export async function clearTestData() {
  const collections = ['users', 'courses', 'enrollments', 'payments'];
  
  for (const collectionName of collections) {
    const snapshot = await getDocs(collection(testEnv.firestore(), collectionName));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
}

export async function cleanupTestEnvironment() {
  if (testEnv) {
    await testEnv.cleanup();
  }
}
```

### 5.2 Test Data Factory
```javascript
// test-utils/test-data-factory.js
import { faker } from '@faker-js/faker';

export class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      email: faker.internet.email(),
      password: 'SecurePass123!',
      displayName: faker.person.fullName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'student',
      ...overrides
    };
  }

  static createCourse(overrides = {}) {
    return {
      title: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      price: faker.number.float({ min: 29.99, max: 299.99, fractionDigits: 2 }),
      category: faker.helpers.arrayElement(['Technology', 'Business', 'Design', 'Marketing']),
      instructorId: faker.string.uuid(),
      duration: faker.number.int({ min: 30, max: 300 }),
      level: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']),
      ...overrides
    };
  }

  static createPayment(overrides = {}) {
    return {
      amount: faker.number.float({ min: 29.99, max: 299.99, fractionDigits: 2 }),
      currency: 'EUR',
      status: 'succeeded',
      paymentMethodId: `pm_${faker.string.alphanumeric(20)}`,
      userId: faker.string.uuid(),
      courseId: faker.string.uuid(),
      ...overrides
    };
  }

  static createAssessment(overrides = {}) {
    return {
      courseId: faker.string.uuid(),
      title: faker.lorem.words(4),
      questions: Array.from({ length: 5 }, () => ({
        question: faker.lorem.sentence(),
        options: Array.from({ length: 4 }, () => faker.lorem.words(2)),
        correctAnswer: faker.number.int({ min: 0, max: 3 })
      })),
      passingScore: 70,
      timeLimit: 30,
      ...overrides
    };
  }
}
```

---

*These test templates provide comprehensive coverage for the GroeimetAI platform. Customize them based on your specific implementation details and requirements.*