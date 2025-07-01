'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  Clock, 
  Trophy, 
  Code2, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Users,
  Timer,
  Zap,
  RefreshCw
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { formatTime } from '@/lib/utils';

export interface TestCase {
  id: string;
  input: any;
  expectedOutput: any;
  description?: string;
  hidden?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit?: number; // in seconds
  starterCode: {
    javascript?: string;
    python?: string;
  };
  testCases: TestCase[];
  hints: string[];
  solution?: {
    javascript?: string;
    python?: string;
  };
  points: number;
  tags: string[];
}

interface CodingChallengeProps {
  challenge: Challenge;
  onComplete: (timeSpent: number, testsPass: number, totalTests: number) => void;
  enableLeaderboard?: boolean;
  enablePeerReview?: boolean;
}

export function CodingChallenge({
  challenge,
  onComplete,
  enableLeaderboard = true,
  enablePeerReview = true
}: CodingChallengeProps) {
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState(challenge.starterCode[language] || '');
  const [testResults, setTestResults] = useState<Map<string, { passed: boolean; output: any; error?: string }>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [usedHints, setUsedHints] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    if (!startTime || submitted) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);

      // Check time limit
      if (challenge.timeLimit && elapsed >= challenge.timeLimit) {
        handleSubmit();
        toast({
          title: 'Time\'s up!',
          description: 'The challenge has been automatically submitted.',
          variant: 'destructive'
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, submitted, challenge.timeLimit]);

  // Update code when language changes
  useEffect(() => {
    setCode(challenge.starterCode[language] || '');
  }, [language, challenge]);

  const runTests = async () => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    setIsRunning(true);
    const results = new Map<string, { passed: boolean; output: any; error?: string }>();

    // Simulate test execution
    for (const testCase of challenge.testCases) {
      if (testCase.hidden && !submitted) continue;

      try {
        // In a real implementation, this would execute code in a sandbox
        const result = await simulateTestExecution(code, testCase, language);
        results.set(testCase.id, result);
      } catch (error) {
        results.set(testCase.id, {
          passed: false,
          output: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);

    // Check if all tests pass
    const allPassed = Array.from(results.values()).every(r => r.passed);
    if (allPassed && !submitted) {
      toast({
        title: 'All tests passed!',
        description: 'Great job! You can submit your solution.',
      });
    }
  };

  const simulateTestExecution = async (
    userCode: string,
    testCase: TestCase,
    lang: 'javascript' | 'python'
  ): Promise<{ passed: boolean; output: any; error?: string }> => {
    // Simulate async execution
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock test execution
    // In production, this would run in a secure sandbox
    const mockSuccess = Math.random() > 0.3;
    
    if (mockSuccess) {
      return {
        passed: true,
        output: testCase.expectedOutput
      };
    } else {
      return {
        passed: false,
        output: 'Different output',
        error: 'Output does not match expected result'
      };
    }
  };

  const handleSubmit = () => {
    if (!startTime) return;

    const testsPass = Array.from(testResults.values()).filter(r => r.passed).length;
    const totalTests = challenge.testCases.length;
    
    setSubmitted(true);
    onComplete(timeSpent, testsPass, totalTests);
  };

  const showNextHint = () => {
    if (usedHints < challenge.hints.length) {
      setUsedHints(prev => prev + 1);
      setShowHints(true);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return '';
    }
  };

  const passedTests = Array.from(testResults.values()).filter(r => r.passed).length;
  const totalVisibleTests = challenge.testCases.filter(tc => !tc.hidden || submitted).length;
  const progress = totalVisibleTests > 0 ? (passedTests / totalVisibleTests) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <span className="text-sm text-gray-500">{challenge.category}</span>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{challenge.points} points</span>
                  </div>
                </div>
              </CardDescription>
            </div>
            {challenge.timeLimit && (
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  <span className="text-2xl font-mono font-bold">
                    {formatTime(challenge.timeLimit - timeSpent)}
                  </span>
                </div>
                <Progress
                  value={(timeSpent / challenge.timeLimit) * 100}
                  className="mt-2 h-2"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none mb-4">
            <p>{challenge.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {challenge.tags.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Code Editor</CardTitle>
                <Tabs value={language} onValueChange={(v) => setLanguage(v as 'javascript' | 'python')}>
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <CodeMirror
                  value={code}
                  onChange={setCode}
                  height="400px"
                  theme={oneDark}
                  extensions={[language === 'javascript' ? javascript() : python()]}
                  editable={!submitted}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={runTests}
                  disabled={isRunning || submitted}
                  className="flex-1"
                >
                  {isRunning ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Running...</>
                  ) : (
                    <><PlayCircle className="mr-2 h-4 w-4" /> Run Tests</>
                  )}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!startTime || submitted || testResults.size === 0}
                  variant="default"
                >
                  Submit Solution
                </Button>
              </div>
            </CardContent>
          </Card>

          {!submitted && challenge.hints.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Hints
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showNextHint}
                    disabled={usedHints >= challenge.hints.length}
                  >
                    {usedHints === 0
                      ? 'Show Hint'
                      : `Show Next Hint (${usedHints}/${challenge.hints.length})`}
                  </Button>
                </div>
              </CardHeader>
              {showHints && (
                <CardContent>
                  <AnimatePresence>
                    {challenge.hints.slice(0, usedHints).map((hint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <p className="text-sm">
                          <strong>Hint {index + 1}:</strong> {hint}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <p className="text-xs text-gray-500 mt-2">
                    Using hints will reduce your final score by {usedHints * 10}%
                  </p>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Results</CardTitle>
              {testResults.size > 0 && (
                <Progress value={progress} className="mt-2" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {challenge.testCases.map((testCase, index) => {
                  if (testCase.hidden && !submitted) return null;
                  
                  const result = testResults.get(testCase.id);
                  if (!result) {
                    return (
                      <div key={testCase.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Test {index + 1}: {testCase.description || 'No description'}
                          </span>
                          <Badge variant="outline">Not run</Badge>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={testCase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg ${
                        result.passed
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          Test {index + 1}
                        </span>
                        {testCase.hidden && (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </div>
                      {testCase.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {testCase.description}
                        </p>
                      )}
                      <div className="text-xs font-mono">
                        <div>Input: {JSON.stringify(testCase.input)}</div>
                        <div>Expected: {JSON.stringify(testCase.expectedOutput)}</div>
                        {result.output !== undefined && (
                          <div>Got: {JSON.stringify(result.output)}</div>
                        )}
                        {result.error && (
                          <div className="text-red-600 dark:text-red-400 mt-1">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {enableLeaderboard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Complete the challenge to see how you rank!
                </p>
              </CardContent>
            </Card>
          )}

          {enablePeerReview && submitted && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Peer Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Submit for Peer Review
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Get feedback from other learners and earn bonus XP!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}