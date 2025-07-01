'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApiSandbox } from '@/hooks/useApiSandbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle, 
  Play, 
  Loader2, 
  Code2, 
  BarChart3,
  Zap,
  DollarSign,
  Clock,
  Shield,
  Terminal,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiPlaygroundProps {
  courseId?: string;
  initialProvider?: string;
  initialEndpoint?: string;
}

export function ApiPlayground({ courseId, initialProvider = 'openai', initialEndpoint }: ApiPlaygroundProps) {
  const apiSandbox = useApiSandbox();
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);
  const [selectedEndpoint, setSelectedEndpoint] = useState(initialEndpoint || '');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const responseRef = useRef<HTMLPreElement>(null);

  // Provider-specific endpoints
  const providerEndpoints: Record<string, { endpoint: string; label: string; template: any }[]> = {
    openai: [
      {
        endpoint: '/chat/completions',
        label: 'Chat Completions',
        template: {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello! How are you?' }
          ],
          temperature: 0.7,
          max_tokens: 150
        }
      },
      {
        endpoint: '/embeddings',
        label: 'Embeddings',
        template: {
          model: 'text-embedding-ada-002',
          input: 'The quick brown fox jumps over the lazy dog'
        }
      },
      {
        endpoint: '/images/generations',
        label: 'Image Generation',
        template: {
          model: 'dall-e-3',
          prompt: 'A cute baby sea otter',
          n: 1,
          size: '1024x1024'
        }
      }
    ],
    anthropic: [
      {
        endpoint: '/messages',
        label: 'Messages',
        template: {
          model: 'claude-3-haiku-20240307',
          messages: [
            { role: 'user', content: 'Hello, Claude!' }
          ],
          max_tokens: 100
        }
      }
    ],
    google: [
      {
        endpoint: '/models/gemini-pro:generateContent',
        label: 'Generate Content',
        template: {
          contents: [{
            parts: [{
              text: 'Explain quantum computing in simple terms'
            }]
          }]
        }
      }
    ]
  };

  // Initialize with template when endpoint changes
  useEffect(() => {
    const endpoints = providerEndpoints[selectedProvider] || [];
    const endpoint = endpoints.find(e => e.endpoint === selectedEndpoint);
    if (endpoint) {
      setRequestBody(JSON.stringify(endpoint.template, null, 2));
    }
  }, [selectedEndpoint, selectedProvider]);

  // Initialize user on mount
  useEffect(() => {
    if (courseId) {
      apiSandbox.initializeUser({
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 500,
        maxBudget: 5.0
      });
    }
  }, [courseId, apiSandbox]);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const endpoints = providerEndpoints[provider] || [];
    if (endpoints.length > 0) {
      setSelectedEndpoint(endpoints[0].endpoint);
    }
  };

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleExecuteRequest = async () => {
    if (!requestBody) {
      apiSandbox.state.error = 'Please enter a request body';
      return;
    }

    setIsLoading(true);
    setResponse(null);
    addDebugLog(`Starting ${selectedProvider} request to ${selectedEndpoint}`);

    try {
      const parsedBody = JSON.parse(requestBody);
      addDebugLog('Request body parsed successfully');

      const startTime = Date.now();
      const result = await apiSandbox.request({
        provider: selectedProvider as any,
        endpoint: selectedEndpoint,
        method: 'POST',
        body: parsedBody
      });

      const duration = Date.now() - startTime;
      addDebugLog(`Request completed in ${duration}ms`);

      setResponse(result);
      
      if (result.success) {
        addDebugLog(`Success! Tokens used: ${result.usage?.totalTokens || 'N/A'}`);
      } else {
        addDebugLog(`Error: ${result.error}`);
      }
    } catch (error: any) {
      addDebugLog(`Parse error: ${error.message}`);
      setResponse({
        success: false,
        error: 'Invalid JSON format',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const usage = apiSandbox.state.usage;
  const budgetUsed = usage ? (usage.totalCost / 10) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Sandbox</h2>
          <p className="text-muted-foreground">
            Test AI APIs in a safe, rate-limited environment
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="mock-mode">Mock Mode</Label>
            <Switch
              id="mock-mode"
              checked={apiSandbox.state.mockMode}
              onCheckedChange={apiSandbox.setMockMode}
            />
          </div>
          {apiSandbox.state.mockMode && (
            <Badge variant="secondary">
              <AlertCircle className="mr-1 h-3 w-3" />
              Mock Mode Active
            </Badge>
          )}
        </div>
      </div>

      {/* Usage Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Dashboard
          </CardTitle>
          <CardDescription>Monitor your API usage and costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Total Requests
              </div>
              <div className="text-2xl font-bold">{usage?.totalRequests || 0}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total Cost
              </div>
              <div className="text-2xl font-bold">{formatCurrency(usage?.totalCost || 0)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last Request
              </div>
              <div className="text-sm">
                {usage?.lastRequestAt 
                  ? new Date(usage.lastRequestAt).toLocaleString()
                  : 'Never'
                }
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                Error Rate
              </div>
              <div className="text-2xl font-bold">
                {usage?.totalRequests 
                  ? `${Math.round((usage.errors / usage.totalRequests) * 100)}%`
                  : '0%'
                }
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Used</span>
              <span>{formatCurrency(usage?.totalCost || 0)} / {formatCurrency(10)}</span>
            </div>
            <Progress value={budgetUsed} className="h-2" />
            {budgetUsed > 80 && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've used {Math.round(budgetUsed)}% of your budget
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Playground */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            API Playground
          </CardTitle>
          <CardDescription>Execute API requests and view responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Provider and Endpoint Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {apiSandbox.state.providers.map(provider => (
                      <SelectItem key={provider.name} value={provider.name}>
                        {provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Endpoint</Label>
                <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    {(providerEndpoints[selectedProvider] || []).map(endpoint => (
                      <SelectItem key={endpoint.endpoint} value={endpoint.endpoint}>
                        {endpoint.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Request Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Request Body</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(requestBody)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="Enter JSON request body..."
                className="font-mono text-sm min-h-[200px]"
              />
            </div>

            {/* Execute Button */}
            <Button
              onClick={handleExecuteRequest}
              disabled={isLoading || !selectedEndpoint}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Execute Request
                </>
              )}
            </Button>

            {/* Response */}
            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Response</Label>
                  <div className="flex items-center gap-2">
                    {response.cached && (
                      <Badge variant="secondary">Cached</Badge>
                    )}
                    {response.duration && (
                      <Badge variant="outline">{response.duration}ms</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className={cn(
                  "rounded-lg border p-4 overflow-auto max-h-[400px]",
                  response.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                )}>
                  <pre ref={responseRef} className="text-sm">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
                
                {response.usage && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Tokens: {response.usage.totalTokens}</span>
                    <span>Cost: {formatCurrency(response.usage.cost)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Debug Logs
            </div>
            <Switch
              checked={showDebugLogs}
              onCheckedChange={setShowDebugLogs}
            />
          </CardTitle>
        </CardHeader>
        {showDebugLogs && (
          <CardContent>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm max-h-[300px] overflow-auto">
              {debugLogs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="py-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All requests are sanitized and rate-limited. API keys are encrypted and never exposed.
          {apiSandbox.state.mockMode && ' Mock mode is active - no real API calls are made.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}