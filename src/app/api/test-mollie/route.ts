import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Mollie configuration...');
    
    // Check if API key is set
    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'MOLLIE_API_KEY environment variable not set',
        help: 'Make sure MOLLIE_API_KEY is set in your .env.local file'
      }, { status: 500 });
    }
    
    console.log('✅ API key found:', apiKey.substring(0, 10) + '...');
    
    // Try to initialize Mollie client
    const mollieClient = createMollieClient({
      apiKey: apiKey,
    });
    
    // Test the connection by getting payment methods
    const methods = await mollieClient.methods.list();
    
    return NextResponse.json({
      success: true,
      message: 'Mollie client initialized successfully',
      apiKeyPrefix: apiKey.substring(0, 10),
      paymentMethods: (methods as any)._embedded?.methods?.map((m: any) => m.id) || [],
      environment: apiKey.startsWith('test_') ? 'test' : 'live'
    });
    
  } catch (error) {
    console.error('❌ Mollie test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      help: 'Check if your Mollie API key is valid and active'
    }, { status: 500 });
  }
}