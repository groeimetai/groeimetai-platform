import { Lesson } from '@/lib/data/courses';

export const lesson4_2: Lesson = {
  id: 'custom-connectors-building',
  title: 'Custom connectors bouwen',
  duration: '40 min',
  content: `# Custom connectors bouwen

## Waarom custom connectors bouwen?

In de praktijk kom je vaak platforms tegen die geen kant-en-klare integratie hebben met je automation tools. Een custom connector is dan de oplossing:

• **Herbruikbaarheid**: Één keer bouwen, overal gebruiken
• **Abstractie**: Complexe API logica verborgen achter simpele interface
• **Consistentie**: Uniforme error handling en logging
• **Schaalbaarheid**: Built-in rate limiting en retry logic
• **Onderhoudbaarheid**: Centrale plek voor API updates

Een goed gebouwde connector bespaart niet alleen tijd, maar voorkomt ook veelvoorkomende fouten en maakt je integraties betrouwbaarder.

## Connector architecture patterns

Er zijn verschillende architectuur patronen voor het bouwen van connectors. We bespreken de belangrijkste:

**1. Adapter Pattern**
Het meest gebruikte patroon voor API connectors. Vertaalt externe API calls naar interne interfaces.

\`\`\`typescript
interface PaymentGateway {
  createPayment(amount: number, currency: string): Promise<Payment>
  getPayment(id: string): Promise<Payment>
  refundPayment(id: string, amount?: number): Promise<Refund>
}

class StripeAdapter implements PaymentGateway {
  constructor(private apiKey: string) {}
  
  async createPayment(amount: number, currency: string): Promise<Payment> {
    // Stripe-specifieke implementatie
    const stripePayment = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe verwacht centen
      currency
    })
    
    // Vertaal naar generiek Payment object
    return this.translatePayment(stripePayment)
  }
}
\`\`\`

**2. Repository Pattern**
Voor data-centric APIs waar je CRUD operaties uitvoert.

\`\`\`typescript
class CustomerRepository {
  constructor(private apiClient: ApiClient) {}
  
  async findById(id: string): Promise<Customer> {
    return this.apiClient.get(\`/customers/\${id}\`)
  }
  
  async create(data: CreateCustomerDto): Promise<Customer> {
    return this.apiClient.post('/customers', data)
  }
  
  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    return this.apiClient.patch(\`/customers/\${id}\`, data)
  }
}
\`\`\`

**3. Command Pattern**
Voor complexe operaties die meerdere API calls vereisen.

\`\`\`typescript
abstract class ApiCommand<T> {
  abstract execute(): Promise<T>
  abstract rollback(): Promise<void>
}

class CreateOrderCommand extends ApiCommand<Order> {
  constructor(
    private orderData: OrderData,
    private inventoryApi: InventoryApi,
    private paymentApi: PaymentApi
  ) {}
  
  async execute(): Promise<Order> {
    // Reserve inventory
    const reservation = await this.inventoryApi.reserve(this.orderData.items)
    
    try {
      // Process payment
      const payment = await this.paymentApi.charge(this.orderData.total)
      
      // Create order
      return await this.orderApi.create({
        ...this.orderData,
        reservationId: reservation.id,
        paymentId: payment.id
      })
    } catch (error) {
      // Rollback on failure
      await this.rollback()
      throw error
    }
  }
}
\`\`\`

**4. Facade Pattern**
Vereenvoudigt complexe API's door een simpelere interface te bieden.

\`\`\`typescript
class EcommerceApiFacade {
  constructor(
    private products: ProductApi,
    private inventory: InventoryApi,
    private pricing: PricingApi
  ) {}
  
  async getProductWithAvailability(productId: string): Promise<ProductDetails> {
    // Combineer data van meerdere endpoints
    const [product, stock, price] = await Promise.all([
      this.products.get(productId),
      this.inventory.getStock(productId),
      this.pricing.getPrice(productId)
    ])
    
    return {
      ...product,
      inStock: stock.available > 0,
      currentPrice: price.amount,
      currency: price.currency
    }
  }
}
\`\`\`

## Authentication wrapper implementation

Goede authenticatie handling is cruciaal voor betrouwbare connectors. Hier zijn best practices:

**1. Authentication Strategy Pattern**
Ondersteun verschillende auth methodes met een uniform interface.

\`\`\`typescript
interface AuthStrategy {
  authenticate(request: Request): Promise<Request>
  refresh?(): Promise<void>
}

class BearerTokenStrategy implements AuthStrategy {
  constructor(private token: string) {}
  
  async authenticate(request: Request): Promise<Request> {
    request.headers['Authorization'] = \`Bearer \${this.token}\`
    return request
  }
}

class OAuth2Strategy implements AuthStrategy {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private tokenEndpoint: string
  ) {}
  
  private accessToken?: string
  private expiresAt?: Date
  
  async authenticate(request: Request): Promise<Request> {
    if (!this.accessToken || this.isExpired()) {
      await this.refresh()
    }
    
    request.headers['Authorization'] = \`Bearer \${this.accessToken}\`
    return request
  }
  
  async refresh(): Promise<void> {
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    })
    
    const data = await response.json()
    this.accessToken = data.access_token
    this.expiresAt = new Date(Date.now() + data.expires_in * 1000)
  }
  
  private isExpired(): boolean {
    return !this.expiresAt || this.expiresAt <= new Date()
  }
}

class ApiKeyStrategy implements AuthStrategy {
  constructor(
    private apiKey: string,
    private headerName: string = 'X-API-Key'
  ) {}
  
  async authenticate(request: Request): Promise<Request> {
    request.headers[this.headerName] = this.apiKey
    return request
  }
}
\`\`\`

**2. Auto-refresh Implementation**
Automatisch tokens vernieuwen zonder API calls te onderbreken.

\`\`\`typescript
class TokenManager {
  private refreshPromise?: Promise<void>
  
  constructor(
    private refreshToken: string,
    private tokenEndpoint: string
  ) {}
  
  async getAccessToken(): Promise<string> {
    if (this.shouldRefresh()) {
      // Prevent multiple simultaneous refreshes
      if (!this.refreshPromise) {
        this.refreshPromise = this.performRefresh()
          .finally(() => this.refreshPromise = undefined)
      }
      
      await this.refreshPromise
    }
    
    return this.accessToken!
  }
  
  private shouldRefresh(): boolean {
    if (!this.accessToken) return true
    
    // Refresh 5 minutes before expiry
    const bufferTime = 5 * 60 * 1000
    return this.expiresAt.getTime() - Date.now() < bufferTime
  }
}
\`\`\`

**3. Credential Storage**
Veilig opslaan en beheren van credentials.

\`\`\`typescript
interface CredentialStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}

class EncryptedCredentialStore implements CredentialStore {
  constructor(
    private encryption: EncryptionService,
    private storage: StorageBackend
  ) {}
  
  async get(key: string): Promise<string | null> {
    const encrypted = await this.storage.get(key)
    if (!encrypted) return null
    
    return this.encryption.decrypt(encrypted)
  }
  
  async set(key: string, value: string): Promise<void> {
    const encrypted = await this.encryption.encrypt(value)
    await this.storage.set(key, encrypted)
  }
}
\`\`\`

## Error handling and retry logic

Robuuste error handling maakt het verschil tussen een hobby project en een production-ready connector.

**1. Error Classification**
Categoriseer errors voor appropriate handling.

\`\`\`typescript
enum ErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  AUTH_FAILED = 'AUTH_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

class ApiError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public statusCode?: number,
    public retryable: boolean = false,
    public retryAfter?: number
  ) {
    super(message)
  }
}

function classifyError(error: any): ApiError {
  if (error.response) {
    const status = error.response.status
    
    switch (status) {
      case 401:
        return new ApiError('Authentication failed', ErrorType.AUTH_FAILED, status)
      case 404:
        return new ApiError('Resource not found', ErrorType.NOT_FOUND, status)
      case 429:
        const retryAfter = error.response.headers['retry-after']
        return new ApiError(
          'Rate limit exceeded',
          ErrorType.RATE_LIMIT,
          status,
          true,
          retryAfter ? parseInt(retryAfter) : 60
        )
      case 500:
      case 502:
      case 503:
      case 504:
        return new ApiError('Server error', ErrorType.SERVER_ERROR, status, true)
      default:
        return new ApiError('Request failed', ErrorType.UNKNOWN, status)
    }
  }
  
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return new ApiError('Network error', ErrorType.NETWORK, undefined, true)
  }
  
  return new ApiError(error.message, ErrorType.UNKNOWN)
}
\`\`\`

**2. Exponential Backoff Retry**
Intelligente retry strategie met exponential backoff.

\`\`\`typescript
interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  factor: number
  jitter: boolean
}

class RetryHandler {
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    factor: 2,
    jitter: true
  }
  
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config }
    let lastError: Error
    
    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        const apiError = classifyError(error)
        
        if (!apiError.retryable || attempt === finalConfig.maxRetries) {
          throw apiError
        }
        
        const delay = this.calculateDelay(attempt, finalConfig, apiError.retryAfter)
        await this.sleep(delay)
      }
    }
    
    throw lastError!
  }
  
  private calculateDelay(
    attempt: number,
    config: RetryConfig,
    retryAfter?: number
  ): number {
    if (retryAfter) {
      return retryAfter * 1000
    }
    
    let delay = config.initialDelay * Math.pow(config.factor, attempt)
    delay = Math.min(delay, config.maxDelay)
    
    if (config.jitter) {
      // Add random jitter (±25%)
      const jitter = delay * 0.25 * (Math.random() * 2 - 1)
      delay += jitter
    }
    
    return Math.floor(delay)
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
\`\`\`

**3. Circuit Breaker Pattern**
Voorkom cascade failures door failing services tijdelijk te bypassen.

\`\`\`typescript
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

class CircuitBreaker {
  private state = CircuitState.CLOSED
  private failures = 0
  private lastFailureTime?: Date
  private successCount = 0
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private successThreshold: number = 2
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime!.getTime() > this.timeout) {
        this.state = CircuitState.HALF_OPEN
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failures = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED
      }
    }
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = new Date()
    
    if (this.failures >= this.threshold) {
      this.state = CircuitState.OPEN
    }
  }
}
\`\`\`

## Rate limiting implementation

Rate limiting is essentieel om binnen API quotas te blijven en service bans te voorkomen.

**1. Token Bucket Algorithm**
De meest flexibele rate limiting strategie.

\`\`\`typescript
class TokenBucket {
  private tokens: number
  private lastRefill: Date
  
  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
    private initialTokens?: number
  ) {
    this.tokens = initialTokens ?? capacity
    this.lastRefill = new Date()
  }
  
  async acquire(tokens: number = 1): Promise<void> {
    // Refill bucket based on time passed
    this.refill()
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return
    }
    
    // Calculate wait time
    const tokensNeeded = tokens - this.tokens
    const waitTime = (tokensNeeded / this.refillRate) * 1000
    
    await this.sleep(waitTime)
    
    // Try again after waiting
    return this.acquire(tokens)
  }
  
  private refill(): void {
    const now = new Date()
    const timePassed = (now.getTime() - this.lastRefill.getTime()) / 1000
    const tokensToAdd = timePassed * this.refillRate
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
\`\`\`

**2. Sliding Window Rate Limiter**
Voor APIs met strict window-based limits.

\`\`\`typescript
class SlidingWindowRateLimiter {
  private requests: Date[] = []
  
  constructor(
    private windowSize: number, // in milliseconds
    private maxRequests: number
  ) {}
  
  async acquire(): Promise<void> {
    const now = new Date()
    
    // Remove expired requests
    this.requests = this.requests.filter(
      date => now.getTime() - date.getTime() < this.windowSize
    )
    
    if (this.requests.length >= this.maxRequests) {
      // Calculate wait time until oldest request expires
      const oldestRequest = this.requests[0]
      const waitTime = this.windowSize - (now.getTime() - oldestRequest.getTime())
      
      await this.sleep(waitTime)
      return this.acquire()
    }
    
    this.requests.push(now)
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
\`\`\`

**3. Distributed Rate Limiting**
Voor multi-instance deployments met Redis.

\`\`\`typescript
class DistributedRateLimiter {
  constructor(
    private redis: RedisClient,
    private key: string,
    private limit: number,
    private window: number // seconds
  ) {}
  
  async acquire(): Promise<boolean> {
    const multi = this.redis.multi()
    const now = Date.now()
    const windowStart = now - this.window * 1000
    
    // Remove old entries
    multi.zremrangebyscore(this.key, '-inf', windowStart)
    
    // Count current entries
    multi.zcard(this.key)
    
    // Add current request
    multi.zadd(this.key, now, \`\${now}-\${Math.random()}\`)
    
    // Set expiry
    multi.expire(this.key, this.window + 1)
    
    const results = await multi.exec()
    const count = results[1][1] as number
    
    if (count >= this.limit) {
      // Remove the request we just added
      await this.redis.zrem(this.key, \`\${now}-\${Math.random()}\`)
      return false
    }
    
    return true
  }
  
  async reset(): Promise<void> {
    await this.redis.del(this.key)
  }
}
\`\`\`

**4. Adaptive Rate Limiting**
Pas rate limits dynamisch aan based op API responses.

\`\`\`typescript
class AdaptiveRateLimiter {
  private currentLimit: number
  private bucket: TokenBucket
  
  constructor(
    private initialLimit: number = 100,
    private windowSize: number = 3600000 // 1 hour
  ) {
    this.currentLimit = initialLimit
    this.bucket = new TokenBucket(initialLimit, initialLimit / 3600)
  }
  
  async acquire(): Promise<void> {
    await this.bucket.acquire()
  }
  
  updateFromHeaders(headers: Headers): void {
    const rateLimit = headers['x-ratelimit-limit']
    const remaining = headers['x-ratelimit-remaining']
    const reset = headers['x-ratelimit-reset']
    
    if (rateLimit && remaining) {
      const limit = parseInt(rateLimit)
      const left = parseInt(remaining)
      
      // Adjust our limit based on actual API limits
      if (limit !== this.currentLimit) {
        this.currentLimit = limit
        this.bucket = new TokenBucket(limit, limit / 3600)
      }
      
      // Sync our token count with API's count
      this.bucket.tokens = Math.min(left, this.bucket.tokens)
    }
  }
}
\`\`\`

## Testing strategies voor connectors

Grondige testing is cruciaal voor betrouwbare connectors. Hier zijn effectieve test strategieën:

**1. Unit Tests met Mocking**
Test individuele componenten in isolatie.

\`\`\`typescript
// Mock HTTP client
class MockHttpClient implements HttpClient {
  private responses = new Map<string, any>()
  private calls: Array<{ url: string; options: any }> = []
  
  mockResponse(url: string, response: any): void {
    this.responses.set(url, response)
  }
  
  async request(url: string, options: any): Promise<any> {
    this.calls.push({ url, options })
    
    const response = this.responses.get(url)
    if (!response) {
      throw new Error(\`No mock response for \${url}\`)
    }
    
    if (response instanceof Error) {
      throw response
    }
    
    return response
  }
  
  getCalls(): Array<{ url: string; options: any }> {
    return this.calls
  }
}

// Unit test example
describe('CustomerConnector', () => {
  let connector: CustomerConnector
  let mockClient: MockHttpClient
  
  beforeEach(() => {
    mockClient = new MockHttpClient()
    connector = new CustomerConnector(mockClient, 'test-api-key')
  })
  
  it('should create customer with correct payload', async () => {
    const mockCustomer = { id: '123', name: 'Test User' }
    mockClient.mockResponse('/customers', mockCustomer)
    
    const result = await connector.createCustomer({
      name: 'Test User',
      email: 'test@example.com'
    })
    
    expect(result).toEqual(mockCustomer)
    
    const calls = mockClient.getCalls()
    expect(calls).toHaveLength(1)
    expect(calls[0].options.headers['X-API-Key']).toBe('test-api-key')
    expect(calls[0].options.body).toEqual({
      name: 'Test User',
      email: 'test@example.com'
    })
  })
  
  it('should retry on server error', async () => {
    mockClient.mockResponse('/customers', new Error('Server Error'))
    mockClient.mockResponse('/customers', { id: '123' }) // Success on retry
    
    const result = await connector.createCustomer({ name: 'Test' })
    
    expect(result).toEqual({ id: '123' })
    expect(mockClient.getCalls()).toHaveLength(2)
  })
})
\`\`\`

**2. Integration Tests met Test Containers**
Test tegen echte API's in gecontroleerde omgeving.

\`\`\`typescript
import { GenericContainer } from 'testcontainers'

describe('CustomerConnector Integration', () => {
  let container: StartedTestContainer
  let connector: CustomerConnector
  
  beforeAll(async () => {
    // Start mock API server in container
    container = await new GenericContainer('mockserver/mockserver')
      .withExposedPorts(1080)
      .start()
    
    const mockServerUrl = \`http://localhost:\${container.getMappedPort(1080)}\`
    connector = new CustomerConnector(mockServerUrl, 'test-key')
    
    // Setup mock expectations
    await setupMockExpectations(mockServerUrl)
  })
  
  afterAll(async () => {
    await container.stop()
  })
  
  it('should handle pagination correctly', async () => {
    const allCustomers = await connector.listAllCustomers()
    
    expect(allCustomers).toHaveLength(150) // Test with 3 pages
    expect(allCustomers[0].id).toBe('customer-1')
    expect(allCustomers[149].id).toBe('customer-150')
  })
})
\`\`\`

**3. Contract Testing**
Verzeker dat je connector compatibel blijft met de API.

\`\`\`typescript
// Pact consumer test
describe('Customer API Contract', () => {
  const provider = new Pact({
    consumer: 'CustomerConnector',
    provider: 'CustomerAPI'
  })
  
  beforeAll(() => provider.setup())
  afterAll(() => provider.finalize())
  
  it('should create customer', async () => {
    await provider.addInteraction({
      state: 'provider allows customer creation',
      uponReceiving: 'a request to create a customer',
      withRequest: {
        method: 'POST',
        path: '/customers',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': like('api-key-123')
        },
        body: {
          name: like('John Doe'),
          email: like('john@example.com')
        }
      },
      willRespondWith: {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          id: like('cust_123'),
          name: like('John Doe'),
          email: like('john@example.com'),
          created_at: like('2023-01-01T00:00:00Z')
        }
      }
    })
    
    const connector = new CustomerConnector(provider.mockService.baseUrl)
    const result = await connector.createCustomer({
      name: 'John Doe',
      email: 'john@example.com'
    })
    
    expect(result.id).toBeTruthy()
  })
})
\`\`\`

**4. Performance Testing**
Test rate limiting en performance onder load.

\`\`\`typescript
describe('Performance Tests', () => {
  it('should respect rate limits under load', async () => {
    const connector = new CustomerConnector('https://api.example.com')
    const startTime = Date.now()
    
    // Fire 100 requests concurrently
    const promises = Array(100).fill(null).map((_, i) => 
      connector.getCustomer(\`customer-\${i}\`)
    )
    
    await Promise.all(promises)
    
    const duration = Date.now() - startTime
    
    // With 10 req/s rate limit, should take ~10 seconds
    expect(duration).toBeGreaterThan(9000)
    expect(duration).toBeLessThan(11000)
  })
  
  it('should handle circuit breaker correctly', async () => {
    const connector = new CustomerConnector('https://failing-api.example.com')
    const errors: Error[] = []
    
    // Trigger circuit breaker
    for (let i = 0; i < 10; i++) {
      try {
        await connector.getCustomer('test')
      } catch (error) {
        errors.push(error)
      }
    }
    
    // After threshold, circuit should be open
    expect(errors[errors.length - 1].message).toContain('Circuit breaker is open')
  })
})
\`\`\`

**5. Chaos Testing**
Test resilience tegen onverwachte scenarios.

\`\`\`typescript
class ChaosHttpClient implements HttpClient {
  constructor(
    private client: HttpClient,
    private chaosConfig: {
      errorRate: number
      latencyMs: number
      timeoutRate: number
    }
  ) {}
  
  async request(url: string, options: any): Promise<any> {
    // Random errors
    if (Math.random() < this.chaosConfig.errorRate) {
      throw new Error('Chaos: Random failure')
    }
    
    // Random timeouts
    if (Math.random() < this.chaosConfig.timeoutRate) {
      await this.sleep(30000)
      throw new Error('Chaos: Timeout')
    }
    
    // Random latency
    await this.sleep(Math.random() * this.chaosConfig.latencyMs)
    
    return this.client.request(url, options)
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Usage in tests
it('should handle chaos scenarios', async () => {
  const chaosClient = new ChaosHttpClient(httpClient, {
    errorRate: 0.1,    // 10% errors
    latencyMs: 1000,   // Up to 1s latency
    timeoutRate: 0.05  // 5% timeouts
  })
  
  const connector = new CustomerConnector(chaosClient)
  
  // Run many operations and verify success rate
  const results = await Promise.allSettled(
    Array(100).fill(null).map(() => connector.getCustomer('test'))
  )
  
  const successful = results.filter(r => r.status === 'fulfilled')
  expect(successful.length).toBeGreaterThan(70) // At least 70% success
})
\`\`\``,
  codeExamples: [
    {
      id: 'production-ready-connector',
      title: 'Complete production-ready connector',
      language: 'typescript',
      code: `// Complete TypeScript connector voor een fictieve CRM API

import axios, { AxiosInstance, AxiosError } from 'axios'
import pRetry from 'p-retry'
import { z } from 'zod'

// Types and schemas
const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

type Customer = z.infer<typeof CustomerSchema>

const CreateCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional()
})

type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>

// Error types
class CrmApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'CrmApiError'
  }
}

// Rate limiter
class TokenBucket {
  private tokens: number
  private lastRefill: number
  
  constructor(
    private capacity: number,
    private refillRate: number
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }
  
  async waitForToken(): Promise<void> {
    this.refill()
    
    if (this.tokens > 0) {
      this.tokens--
      return
    }
    
    const waitTime = (1 / this.refillRate) * 1000
    await new Promise(resolve => setTimeout(resolve, waitTime))
    return this.waitForToken()
  }
  
  private refill(): void {
    const now = Date.now()
    const timePassed = (now - this.lastRefill) / 1000
    const tokensToAdd = timePassed * this.refillRate
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}

// Authentication
interface AuthProvider {
  authenticate(request: any): Promise<any>
  refresh?(): Promise<void>
}

class ApiKeyAuthProvider implements AuthProvider {
  constructor(private apiKey: string) {}
  
  async authenticate(request: any): Promise<any> {
    request.headers['X-API-Key'] = this.apiKey
    return request
  }
}

class OAuth2Provider implements AuthProvider {
  private accessToken?: string
  private expiresAt?: Date
  
  constructor(
    private clientId: string,
    private clientSecret: string,
    private tokenUrl: string
  ) {}
  
  async authenticate(request: any): Promise<any> {
    if (!this.accessToken || this.isExpired()) {
      await this.refresh()
    }
    
    request.headers['Authorization'] = \`Bearer \${this.accessToken}\`
    return request
  }
  
  async refresh(): Promise<void> {
    const response = await axios.post(this.tokenUrl, {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret
    })
    
    this.accessToken = response.data.access_token
    this.expiresAt = new Date(Date.now() + response.data.expires_in * 1000)
  }
  
  private isExpired(): boolean {
    return !this.expiresAt || this.expiresAt <= new Date()
  }
}

// Main connector class
export class CrmConnector {
  private client: AxiosInstance
  private rateLimiter: TokenBucket
  
  constructor(
    private baseUrl: string,
    private authProvider: AuthProvider,
    private options: {
      rateLimit?: { requests: number; perSecond: number }
      timeout?: number
      retryAttempts?: number
    } = {}
  ) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CRM-Connector/1.0'
      }
    })
    
    // Setup rate limiter
    const rateLimit = options.rateLimit || { requests: 10, perSecond: 1 }
    this.rateLimiter = new TokenBucket(
      rateLimit.requests,
      rateLimit.perSecond
    )
    
    // Request interceptor for auth
    this.client.interceptors.request.use(async (config) => {
      await this.rateLimiter.waitForToken()
      return this.authProvider.authenticate(config)
    })
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      this.handleError.bind(this)
    )
  }
  
  // Customer operations
  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const validated = CreateCustomerSchema.parse(data)
    
    const response = await this.executeWithRetry(
      () => this.client.post<Customer>('/customers', validated)
    )
    
    return CustomerSchema.parse(response.data)
  }
  
  async getCustomer(id: string): Promise<Customer> {
    const response = await this.executeWithRetry(
      () => this.client.get<Customer>(\`/customers/\${id}\`)
    )
    
    return CustomerSchema.parse(response.data)
  }
  
  async updateCustomer(id: string, data: Partial<CreateCustomerDto>): Promise<Customer> {
    const response = await this.executeWithRetry(
      () => this.client.patch<Customer>(\`/customers/\${id}\`, data)
    )
    
    return CustomerSchema.parse(response.data)
  }
  
  async deleteCustomer(id: string): Promise<void> {
    await this.executeWithRetry(
      () => this.client.delete(\`/customers/\${id}\`)
    )
  }
  
  async listCustomers(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<{
    data: Customer[]
    total: number
    page: number
    totalPages: number
  }> {
    const response = await this.executeWithRetry(
      () => this.client.get('/customers', { params })
    )
    
    return {
      data: z.array(CustomerSchema).parse(response.data.data),
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.total_pages
    }
  }
  
  // Batch operations
  async batchCreateCustomers(customers: CreateCustomerDto[]): Promise<Customer[]> {
    const chunks = this.chunkArray(customers, 50) // API limit
    const results: Customer[] = []
    
    for (const chunk of chunks) {
      const response = await this.executeWithRetry(
        () => this.client.post<{ created: Customer[] }>('/customers/batch', {
          customers: chunk
        })
      )
      
      results.push(...response.data.created)
    }
    
    return results
  }
  
  // Webhook management
  async createWebhook(config: {
    url: string
    events: string[]
    secret?: string
  }): Promise<{ id: string; secret: string }> {
    const response = await this.executeWithRetry(
      () => this.client.post('/webhooks', config)
    )
    
    return response.data
  }
  
  // Helper methods
  private async executeWithRetry<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    return pRetry(operation, {
      retries: this.options.retryAttempts || 3,
      onFailedAttempt: error => {
        console.log(\`Attempt \${error.attemptNumber} failed. Retrying...\`)
      }
    })
  }
  
  private handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const { status, data } = error.response
      
      let message = 'API request failed'
      let errorCode: string | undefined
      
      if (data && typeof data === 'object') {
        message = (data as any).message || message
        errorCode = (data as any).error_code
      }
      
      throw new CrmApiError(message, status, errorCode, data)
    }
    
    if (error.request) {
      throw new CrmApiError('No response from server', undefined, 'NETWORK_ERROR')
    }
    
    throw new CrmApiError(error.message || 'Unknown error')
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// Factory function for easy instantiation
export function createCrmConnector(config: {
  baseUrl: string
  apiKey?: string
  oauth?: {
    clientId: string
    clientSecret: string
    tokenUrl: string
  }
  rateLimit?: {
    requests: number
    perSecond: number
  }
}): CrmConnector {
  let authProvider: AuthProvider
  
  if (config.apiKey) {
    authProvider = new ApiKeyAuthProvider(config.apiKey)
  } else if (config.oauth) {
    authProvider = new OAuth2Provider(
      config.oauth.clientId,
      config.oauth.clientSecret,
      config.oauth.tokenUrl
    )
  } else {
    throw new Error('Either apiKey or oauth config must be provided')
  }
  
  return new CrmConnector(config.baseUrl, authProvider, {
    rateLimit: config.rateLimit
  })
}

// Usage example
const connector = createCrmConnector({
  baseUrl: 'https://api.example-crm.com/v1',
  apiKey: process.env.CRM_API_KEY,
  rateLimit: {
    requests: 10,
    perSecond: 1
  }
})

// Use in automation platforms
export async function handleNewLead(leadData: any) {
  try {
    const customer = await connector.createCustomer({
      name: leadData.name,
      email: leadData.email,
      company: leadData.company
    })
    
    console.log('Customer created:', customer.id)
    
    // Setup webhook for updates
    const webhook = await connector.createWebhook({
      url: 'https://my-automation.com/webhooks/crm-updates',
      events: ['customer.updated', 'customer.deleted'],
      secret: process.env.WEBHOOK_SECRET
    })
    
    return {
      success: true,
      customerId: customer.id,
      webhookId: webhook.id
    }
  } catch (error) {
    if (error instanceof CrmApiError) {
      console.error('CRM API Error:', error.message, error.errorCode)
      
      // Handle specific errors
      if (error.statusCode === 409) {
        // Customer already exists
        return { success: false, reason: 'duplicate' }
      }
    }
    
    throw error
  }
}`,
      explanation: 'Deze production-ready connector implementeert alle besproken patterns: clean architecture met dependency injection, robuuste error handling met retry logic, rate limiting met token bucket, flexible authentication, en comprehensive typing met Zod schemas.'
    }
  ],
  resources: [
    {
      title: 'Design Patterns for API Integration',
      url: 'https://martinfowler.com/articles/enterpriseIntegrationPatterns.html',
      type: 'article'
    },
    {
      title: 'Circuit Breaker Pattern',
      url: 'https://martinfowler.com/bliki/CircuitBreaker.html',
      type: 'article'
    },
    {
      title: 'Token Bucket Algorithm Explained',
      url: 'https://en.wikipedia.org/wiki/Token_bucket',
      type: 'documentation'
    },
    {
      title: 'OAuth 2.0 Simplified',
      url: 'https://aaronparecki.com/oauth-2-simplified/',
      type: 'tutorial'
    }
  ]
};