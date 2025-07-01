# API Sandbox Documentation

Een veilige, rate-limited sandbox environment voor het testen van AI APIs binnen cursussen.

## Features

### 🔐 Security
- Request sanitization tegen prompt injection
- API key encryption in database
- Network isolation met timeout protection (max 30s)
- IP whitelisting support
- Automatic failover naar mock responses

### 📊 Usage Management
- Rate limiting per student (configureerbaar)
- Real-time usage tracking en budget management
- Cost calculator voor verschillende AI providers
- Automatic budget alerts

### 🛠️ Developer Experience
- Type-safe React hook met auto-complete
- Real-time debug logs
- Mock mode voor offline development
- Pre-configured templates voor populaire endpoints

## Implementatie

### 1. Basic Usage in een Cursus

```tsx
import { ApiPlayground } from '@/components/ApiPlayground';

export default function CoursePage() {
  return (
    <ApiPlayground 
      courseId="your-course-id"
      initialProvider="openai"
      initialEndpoint="/chat/completions"
    />
  );
}
```

### 2. Gebruik van de React Hook

```tsx
import { useApiSandbox } from '@/hooks/useApiSandbox';

function YourComponent() {
  const sandbox = useApiSandbox();

  // Initialize student met custom limits
  useEffect(() => {
    sandbox.initializeUser({
      requestsPerMinute: 5,
      requestsPerHour: 50,
      requestsPerDay: 200,
      maxBudget: 2.50
    });
  }, []);

  // OpenAI Chat
  const handleChat = async () => {
    const response = await sandbox.openai.chat([
      { role: 'user', content: 'Hello!' }
    ], {
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    });
    
    if (response.success) {
      console.log(response.data);
    }
  };

  // Check usage
  const { usage } = sandbox.state;
  console.log(`Total cost: €${usage?.totalCost}`);

  return (
    <div>
      <button onClick={handleChat}>Chat with AI</button>
      <p>Requests: {usage?.totalRequests || 0}</p>
    </div>
  );
}
```

### 3. Mock Mode voor Development

```tsx
const sandbox = useApiSandbox();

// Enable mock mode
sandbox.setMockMode(true);

// All requests will now return mock data
const response = await sandbox.openai.chat([
  { role: 'user', content: 'Test message' }
]);
// Returns realistic mock response without API calls
```

### 4. Custom API Requests

```tsx
const response = await sandbox.request({
  provider: 'anthropic',
  endpoint: '/messages',
  method: 'POST',
  body: {
    model: 'claude-3-haiku',
    messages: [{ role: 'user', content: 'Hello Claude!' }],
    max_tokens: 100
  }
});
```

## Environment Variables

Voeg deze toe aan je `.env.local`:

```env
# API Keys (optioneel - als niet aanwezig wordt mock mode gebruikt)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
COHERE_API_KEY=...
HUGGINGFACE_API_KEY=...

# Security
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key-min-32-chars
API_SANDBOX_IP_WHITELIST=ip1,ip2,ip3  # Optioneel
```

## Rate Limits

Default limits per student:
- 10 requests per minuut
- 100 requests per uur
- 1000 requests per dag
- €10 maximum budget

Deze kunnen per cursus/student aangepast worden.

## Supported Providers

### OpenAI
- Chat Completions
- Completions
- Embeddings
- Image Generation (DALL-E)
- Audio (Whisper)

### Anthropic
- Messages API
- Legacy Completions

### Google (Gemini)
- Generate Content
- Generate Content Stream
- Embeddings

### Cohere
- Generate
- Embed
- Classify

### HuggingFace
- Inference API

## Cost Calculation

De sandbox berekent automatisch kosten op basis van token usage:

```typescript
// Voorbeeld berekening
const estimatedCost = sandbox.estimateCost(
  'openai',      // provider
  'gpt-4',       // model
  1500           // tokens
);
// Returns: 0.045 (€0.045)
```

## Security Best Practices

1. **Nooit API keys in client-side code**
   - Gebruik altijd server-side proxy routes
   - Keys worden encrypted opgeslagen

2. **Rate limiting is verplicht**
   - Voorkomt abuse en onverwachte kosten
   - Per-student tracking

3. **Request sanitization**
   - Automatische filtering van prompt injection
   - XSS protection

4. **Budget limits**
   - Hard stop bij budget overschrijding
   - Real-time alerts bij 80% usage

## Troubleshooting

### "Rate limit exceeded"
- Wacht tot de reset time
- Check `X-RateLimit-Reset` header

### "Budget exceeded"
- Contact support voor budget verhoging
- Check usage dashboard

### Mock responses in productie
- Controleer of API keys correct zijn geconfigureerd
- Check console voor errors

## Demo

Bekijk een werkende demo op: `/api-sandbox-demo`

## Support

Voor vragen of problemen, open een issue of contact het development team.