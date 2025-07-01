import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Rate limiting store (in production gebruik Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Mock responses voor development
const MOCK_RESPONSES = {
  completion: {
    id: 'mock-completion-id',
    object: 'text_completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [{
      text: 'Dit is een mock response voor development. In productie zal dit een echte API response zijn.',
      index: 0,
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 15,
      total_tokens: 25
    }
  },
  chat: {
    id: 'mock-chat-id',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'Dit is een mock chat response. Perfect voor testen zonder API kosten!'
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 20,
      completion_tokens: 25,
      total_tokens: 45
    }
  },
  function_call: {
    id: 'mock-function-id',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: null,
        function_call: {
          name: 'get_weather',
          arguments: JSON.stringify({ location: 'Amsterdam', unit: 'celsius' })
        }
      },
      finish_reason: 'function_call'
    }]
  }
}

// Request validation schema
const requestSchema = z.object({
  model: z.string().default('gpt-3.5-turbo'),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'function']),
    content: z.string().nullable(),
    function_call: z.object({
      name: z.string(),
      arguments: z.string()
    }).optional()
  })).optional(),
  prompt: z.string().optional(),
  max_tokens: z.number().max(1000).default(150),
  temperature: z.number().min(0).max(1).default(0.7),
  stream: z.boolean().default(false),
  functions: z.array(z.any()).optional(),
  function_call: z.union([z.string(), z.object({ name: z.string() })]).optional()
})

// Rate limiter functie
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const limit = 10 // 10 requests per minuut
  const window = 60000 // 1 minuut in milliseconden

  let clientData = rateLimitStore.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    clientData = { count: 0, resetTime: now + window }
    rateLimitStore.set(clientId, clientData)
  }

  if (clientData.count >= limit) {
    const resetIn = Math.ceil((clientData.resetTime - now) / 1000)
    return { allowed: false, remaining: 0, resetIn }
  }

  clientData.count++
  const remaining = limit - clientData.count
  const resetIn = Math.ceil((clientData.resetTime - now) / 1000)
  
  return { allowed: true, remaining, resetIn }
}

// Stream helper voor Server-Sent Events
function createSSEStream(messages: any[]): ReadableStream {
  const encoder = new TextEncoder()
  let index = 0

  return new ReadableStream({
    async start(controller) {
      // Stuur berichten met delay voor realistische streaming
      for (const message of messages) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    // Get client ID voor rate limiting (IP of session ID)
    const clientId = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'anonymous'

    // Check rate limit
    const rateLimit = checkRateLimit(clientId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `Maximum 10 requests per minuut. Reset in ${rateLimit.resetIn} seconden.` 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetIn)
          }
        }
      )
    }

    // Parse request body
    const body = await req.json()
    const validatedData = requestSchema.parse(body)

    // Check of we in mock mode zijn (geen API key)
    const apiKey = process.env.OPENAI_API_KEY
    const useMockMode = !apiKey || apiKey === 'mock' || process.env.NODE_ENV === 'development'

    // Mock mode response
    if (useMockMode) {
      // Simuleer processing delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Return mock response based on request type
      if (validatedData.stream) {
        const messages = [
          { 
            choices: [{ 
              delta: { content: 'Dit ' }, 
              index: 0 
            }] 
          },
          { 
            choices: [{ 
              delta: { content: 'is ' }, 
              index: 0 
            }] 
          },
          { 
            choices: [{ 
              delta: { content: 'een ' }, 
              index: 0 
            }] 
          },
          { 
            choices: [{ 
              delta: { content: 'streaming ' }, 
              index: 0 
            }] 
          },
          { 
            choices: [{ 
              delta: { content: 'mock response!' }, 
              index: 0 
            }] 
          }
        ]

        return new NextResponse(createSSEStream(messages), {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining)
          }
        })
      }

      // Check for function calling
      if (validatedData.functions && validatedData.functions.length > 0) {
        return NextResponse.json(MOCK_RESPONSES.function_call, {
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(rateLimit.remaining)
          }
        })
      }

      // Regular chat/completion response
      const response = validatedData.messages ? MOCK_RESPONSES.chat : MOCK_RESPONSES.completion
      return NextResponse.json(response, {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimit.remaining)
        }
      })
    }

    // Production mode - proxy to OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: validatedData.model,
        messages: validatedData.messages,
        max_tokens: validatedData.max_tokens,
        temperature: validatedData.temperature,
        stream: validatedData.stream,
        functions: validatedData.functions,
        function_call: validatedData.function_call
      }),
      signal: AbortSignal.timeout(30000) // 30 seconden timeout
    })

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json()
      return NextResponse.json(
        { error: 'OpenAI API error', details: error },
        { status: openAIResponse.status }
      )
    }

    // Handle streaming response
    if (validatedData.stream) {
      return new NextResponse(openAIResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimit.remaining)
        }
      })
    }

    // Regular response
    const data = await openAIResponse.json()
    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      }
    })

  } catch (error) {
    console.error('Sandbox API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout', message: 'De request duurde langer dan 30 seconden' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Usage tracking endpoint
export async function GET(req: NextRequest) {
  const clientId = req.headers.get('x-forwarded-for') || 
                  req.headers.get('x-real-ip') || 
                  'anonymous'

  const clientData = rateLimitStore.get(clientId)
  const now = Date.now()
  
  if (!clientData || now > clientData.resetTime) {
    return NextResponse.json({
      used: 0,
      limit: 10,
      remaining: 10,
      resetIn: 60
    })
  }

  const resetIn = Math.ceil((clientData.resetTime - now) / 1000)
  
  return NextResponse.json({
    used: clientData.count,
    limit: 10,
    remaining: 10 - clientData.count,
    resetIn
  })
}