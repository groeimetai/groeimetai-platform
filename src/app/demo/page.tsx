'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DemoPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">GroeimetAI Platform Demo</h1>
      
      {loading ? (
        <div className="text-center">Loading system status...</div>
      ) : testResults ? (
        <div className="space-y-8">
          {/* System Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Overall platform health and configuration status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-2xl font-bold ${getStatusColor(testResults.summary.status)}`}>
                    {testResults.summary.status.toUpperCase()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold">{testResults.summary.percentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Passed Checks</p>
                  <p className="text-2xl font-bold">{testResults.summary.passed}/{testResults.summary.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Environment</p>
                  <p className="text-2xl font-bold">{testResults.environment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>Required API keys and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResults.checks.envVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key} API Key</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(value as boolean)}
                      <Badge variant={value ? 'success' : 'destructive'}>
                        {value ? 'Configured' : 'Missing'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services Status */}
          <Card>
            <CardHeader>
              <CardTitle>API Services</CardTitle>
              <CardDescription>Core API endpoints status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResults.checks.services).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(value as boolean)}
                      <Badge variant={value ? 'success' : 'destructive'}>
                        {value ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Status */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>AI and course management features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResults.checks.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(value as boolean)}
                      <Badge variant={value ? 'success' : 'destructive'}>
                        {value ? 'Ready' : 'Not Ready'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {testResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Setup Recommendations</CardTitle>
                <CardDescription>Actions needed to fully configure the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Try Demo Features</CardTitle>
              <CardDescription>Test the platform functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    const chatButton = document.querySelector('[aria-label="Open cursus assistent chat"]') as HTMLButtonElement;
                    chatButton?.click();
                  }}
                  className="w-full"
                  disabled={!testResults.checks.features.chatbot}
                >
                  Open Course Chatbot
                </Button>
                <Button
                  onClick={() => window.location.href = '/cursussen'}
                  className="w-full"
                  variant="outline"
                >
                  Browse Courses
                </Button>
                <Button
                  onClick={() => window.location.href = '/api/courses/search?q=langchain'}
                  className="w-full"
                  variant="outline"
                  disabled={!testResults.checks.features.courseSearch}
                >
                  Test Search API
                </Button>
                <Button
                  onClick={() => window.location.href = '/api/courses/recommend'}
                  className="w-full"
                  variant="outline"
                  disabled={!testResults.checks.features.recommendations}
                >
                  Test Recommendations API
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-red-600">
          Failed to load system status. Please check the console for errors.
        </div>
      )}
    </div>
  );
}