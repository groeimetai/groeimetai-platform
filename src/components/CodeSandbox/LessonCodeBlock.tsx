'use client';

import React, { useState, useEffect } from 'react';
import CodeSandbox from './index.tsx';
import { SimpleCodeRunner } from './SimpleCodeRunner';
import { CodeSnippet } from './CodeSnippet';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Code2, Lightbulb } from 'lucide-react';

interface LessonCodeBlockProps {
  type?: 'sandbox' | 'runner' | 'snippet';
  code: string;
  solution?: string;
  language?: 'python' | 'javascript' | 'typescript';
  title?: string;
  description?: string;
  instructions?: string;
  hints?: string[];
  expectedOutput?: string;
  packages?: string[];
  files?: { [filename: string]: string };
  showSolution?: boolean;
  lessonId?: string;
  exerciseId?: string;
  onComplete?: () => void;
}

export function LessonCodeBlock({
  type = 'runner',
  code,
  solution,
  language = 'python',
  title,
  description,
  instructions,
  hints = [],
  expectedOutput,
  packages = [],
  files = {},
  showSolution = false,
  lessonId,
  exerciseId,
  onComplete
}: LessonCodeBlockProps) {
  const [completed, setCompleted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  useEffect(() => {
    // Load completion status from localStorage
    if (lessonId && exerciseId) {
      const key = `exercise_${lessonId}_${exerciseId}`;
      const isCompleted = localStorage.getItem(key) === 'true';
      setCompleted(isCompleted);
    }
  }, [lessonId, exerciseId]);

  const handleSuccess = () => {
    if (!completed) {
      setCompleted(true);
      
      // Save completion status
      if (lessonId && exerciseId) {
        const key = `exercise_${lessonId}_${exerciseId}`;
        localStorage.setItem(key, 'true');
      }
      
      onComplete?.();
    }
  };

  const revealNextHint = () => {
    if (hintsRevealed < hints.length) {
      setHintsRevealed(hintsRevealed + 1);
      setShowHints(true);
    }
  };

  if (type === 'snippet') {
    return (
      <div className="space-y-4">
        {instructions && (
          <Alert>
            <Code2 className="h-4 w-4" />
            <AlertDescription>{instructions}</AlertDescription>
          </Alert>
        )}
        <CodeSnippet
          code={code}
          language={language}
          title={title}
        />
      </div>
    );
  }

  if (type === 'sandbox') {
    return (
      <div className="space-y-4">
        {instructions && (
          <Alert>
            <Code2 className="h-4 w-4" />
            <AlertDescription>{instructions}</AlertDescription>
          </Alert>
        )}
        <CodeSandbox
          lessonId={lessonId}
          initialCode={code}
          language={language}
          title={title}
          description={description}
          packages={packages}
          files={files}
          expectedOutput={expectedOutput}
          hints={showHints ? hints.slice(0, hintsRevealed) : []}
          onExecute={(code) => {
            if (expectedOutput) {
              // Check if output matches expected
              // This is handled in the CodeSandbox component
            }
          }}
          autoGrade={!!expectedOutput}
        />
        {completed && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600">
              Exercise completed successfully!
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Default to 'runner' type
  return (
    <Card className="p-6 space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="text-muted-foreground">{description}</p>}
      
      {instructions && (
        <Alert>
          <Code2 className="h-4 w-4" />
          <AlertDescription>{instructions}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="exercise" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercise">
            Exercise
            {completed && (
              <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="solution" disabled={!showSolution && !completed}>
            Solution
            {(!showSolution && !completed) && (
              <Badge variant="secondary" className="ml-2">Locked</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercise" className="space-y-4">
          <SimpleCodeRunner
            code={code}
            language={language}
            editable={true}
            expectedOutput={expectedOutput}
            onSuccess={handleSuccess}
          />

          {hints.length > 0 && !completed && (
            <div className="space-y-2">
              <button
                onClick={revealNextHint}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-2"
                disabled={hintsRevealed >= hints.length}
              >
                <Lightbulb className="w-4 h-4" />
                {showHints
                  ? hintsRevealed < hints.length
                    ? `Show next hint (${hintsRevealed}/${hints.length})`
                    : `All hints revealed (${hints.length}/${hints.length})`
                  : `Need a hint? (${hints.length} available)`}
              </button>

              {showHints && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {hints.slice(0, hintsRevealed).map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="solution" className="space-y-4">
          {(showSolution || completed) && solution && (
            <>
              <Alert>
                <AlertDescription>
                  This is one possible solution. There may be other valid approaches!
                </AlertDescription>
              </Alert>
              <SimpleCodeRunner
                code={solution}
                language={language}
                editable={false}
                expectedOutput={expectedOutput}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}