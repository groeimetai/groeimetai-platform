'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Question } from './QuizEngine';
import { motion } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeCompletionQuestionProps {
  question: Question;
  onAnswer: (answer: { code: string; testsPass: boolean }) => void;
  disabled: boolean;
}

export function CodeCompletionQuestion({ question, onAnswer, disabled }: CodeCompletionQuestionProps) {
  const [code, setCode] = useState(question.codeTemplate || '');
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setHasRun(true);
    
    // Simulate test execution (in real app, this would run in a sandboxed environment)
    const results = await simulateTestExecution(code, question.testCases || []);
    setTestResults(results);
    
    const allPassed = results.every(r => r.passed);
    if (!disabled) {
      onAnswer({ code, testsPass: allPassed });
    }
    
    setIsRunning(false);
  };

  const simulateTestExecution = async (
    userCode: string,
    testCases: { input: string; expectedOutput: string }[]
  ): Promise<{ passed: boolean; message: string }[]> => {
    // Simulate async test execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock test results (in real app, execute code in sandbox)
    return testCases.map((testCase, index) => {
      // Simple mock validation
      const hasSolution = userCode.includes('return') || userCode.includes('print');
      const passed = hasSolution && Math.random() > 0.3; // 70% pass rate for demo
      
      return {
        passed,
        message: passed
          ? `Test ${index + 1}: Passed - ${testCase.input} → ${testCase.expectedOutput}`
          : `Test ${index + 1}: Failed - Expected ${testCase.expectedOutput}, but got different output`
      };
    });
  };

  const getLanguage = () => {
    // Detect language from code template
    if (code.includes('def ') || code.includes('print(')) return python();
    return javascript();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{question.question}</h3>
      
      <div className="space-y-4">
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <CodeMirror
            value={code}
            onChange={(value) => setCode(value)}
            height="300px"
            theme={oneDark}
            extensions={[getLanguage()]}
            editable={!disabled}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              highlightSelectionMatches: true,
              searchKeymap: true,
            }}
          />
        </div>

        {question.testCases && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Cases:</h4>
            <ul className="space-y-1 text-sm">
              {question.testCases.map((tc, index) => (
                <li key={index} className="font-mono">
                  Input: {tc.input} → Expected: {tc.expectedOutput}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!disabled && !hasRun && (
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        )}

        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                  result.passed
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}
              >
                {result.passed ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span className="font-mono">{result.message}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}