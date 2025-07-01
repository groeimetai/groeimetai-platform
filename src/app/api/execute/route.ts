import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/lib/firebase/admin';

// Request validation schema
const executeRequestSchema = z.object({
  language: z.enum(['python', 'javascript', 'typescript']),
  code: z.string().min(1).max(50000), // Max 50KB of code
  timeLimit: z.number().min(1000).max(300000).optional(), // 1s to 5min
  memoryLimit: z.number().min(16).max(512).optional(), // 16MB to 512MB
  packages: z.array(z.string()).max(20).optional(),
  files: z.record(z.string()).optional(),
  allowNetwork: z.boolean().optional()
});

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + 60000 // 1 minute window
    });
    return true;
  }

  if (limit.count >= 10) { // 10 executions per minute
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    let userId: string;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = executeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { language, code, timeLimit, memoryLimit, packages, files, allowNetwork } = validationResult.data;

    // Security checks
    if (language === 'python') {
      // Check for dangerous Python patterns
      const dangerousPatterns = [
        /import\s+os/,
        /import\s+subprocess/,
        /import\s+sys/,
        /__import__/,
        /eval\s*\(/,
        /exec\s*\(/,
        /compile\s*\(/,
        /open\s*\(/,
        /file\s*\(/
      ];

      if (!allowNetwork) {
        dangerousPatterns.push(
          /import\s+urllib/,
          /import\s+requests/,
          /import\s+socket/,
          /import\s+http/
        );
      }

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          return NextResponse.json(
            { error: 'Code contains potentially dangerous operations' },
            { status: 400 }
          );
        }
      }
    } else if (language === 'javascript' || language === 'typescript') {
      // Check for dangerous JavaScript patterns
      const dangerousPatterns = [
        /require\s*\(/,
        /import\s*\(/,
        /eval\s*\(/,
        /Function\s*\(/,
        /setTimeout\s*\(/,
        /setInterval\s*\(/,
        /process\./,
        /child_process/,
        /fs\./
      ];

      if (!allowNetwork) {
        dangerousPatterns.push(
          /fetch\s*\(/,
          /XMLHttpRequest/,
          /axios/,
          /http\./,
          /https\./
        );
      }

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          return NextResponse.json(
            { error: 'Code contains potentially dangerous operations' },
            { status: 400 }
          );
        }
      }
    }

    // In a production environment, you would execute the code in a secure sandbox
    // For now, we'll return a mock response
    // In reality, this would communicate with a separate execution service
    
    // Mock execution response
    const mockResponse = {
      output: `// Code execution is currently in demo mode\n// Your ${language} code would be executed here\n\n`,
      error: null,
      executionTime: Math.random() * 1000,
      memoryUsed: Math.random() * 100,
      variables: {}
    };

    // Add some language-specific mock output
    if (language === 'python') {
      mockResponse.output += 'Python 3.11.0\n>>> Code executed successfully\n';
    } else if (language === 'javascript') {
      mockResponse.output += 'Node.js v18.0.0\n> Code executed successfully\n';
    } else if (language === 'typescript') {
      mockResponse.output += 'TypeScript 5.0.0 compiled successfully\n> Code executed successfully\n';
    }

    // Log execution for analytics (in production, use proper logging)
    console.log(`Code execution request: user=${userId}, language=${language}, codeLength=${code.length}`);

    return NextResponse.json({
      success: true,
      result: mockResponse
    });

  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}