'use client';

import React, { useState } from 'react';
import { codeExecutionService } from '@/services/codeExecutionService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleCodeRunnerProps {
  code: string;
  language?: 'python' | 'javascript' | 'typescript';
  editable?: boolean;
  showLineNumbers?: boolean;
  expectedOutput?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SimpleCodeRunner({
  code,
  language = 'python',
  editable = false,
  showLineNumbers = true,
  expectedOutput,
  className,
  onSuccess,
  onError
}: SimpleCodeRunnerProps) {
  const [currentCode, setCurrentCode] = useState(code);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setError(null);
    setIsCorrect(null);

    try {
      const result = await codeExecutionService.execute({
        language,
        code: currentCode,
        timeLimit: 10000, // 10 seconds
        memoryLimit: 64, // 64MB
        allowNetwork: false
      });

      setOutput(result.output);
      
      if (result.error) {
        setError(result.error);
        onError?.(result.error);
      } else {
        if (expectedOutput) {
          const correct = result.output.trim() === expectedOutput.trim();
          setIsCorrect(correct);
          if (correct) {
            onSuccess?.();
          }
        } else {
          onSuccess?.();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const renderCodeWithLineNumbers = (code: string) => {
    const lines = code.split('\n');
    return (
      <div className="flex">
        {showLineNumbers && (
          <div className="flex-shrink-0 pr-4 text-right">
            {lines.map((_, i) => (
              <div key={i} className="text-xs text-muted-foreground">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-x-auto">
          {editable ? (
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm"
              rows={lines.length}
              spellCheck={false}
            />
          ) : (
            <pre className="font-mono text-sm">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="relative overflow-hidden">
        <div className="absolute top-2 right-2 z-10">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run
              </>
            )}
          </Button>
        </div>
        
        <div className="p-4 bg-slate-950 text-slate-50 rounded-lg">
          {renderCodeWithLineNumbers(currentCode)}
        </div>
      </Card>

      {(output || error) && (
        <Card className="p-4 bg-slate-950 text-slate-50">
          <div className="flex items-start gap-2">
            {error ? (
              <>
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <pre className="text-red-400 text-sm whitespace-pre-wrap">
                  {error}
                </pre>
              </>
            ) : (
              <>
                {isCorrect !== null && (
                  isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )
                )}
                <pre className="text-green-400 text-sm whitespace-pre-wrap">
                  {output}
                </pre>
              </>
            )}
          </div>
        </Card>
      )}

      {expectedOutput && isCorrect === false && (
        <Alert>
          <AlertDescription>
            Your output doesn't match the expected result. Try again!
          </AlertDescription>
        </Alert>
      )}

      {isCorrect === true && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-600">
            Correct! Your code produces the expected output.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}