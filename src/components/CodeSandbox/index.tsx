'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { codeExecutionService, ExecutionOptions, ExecutionProgress } from '@/services/codeExecutionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Square, Download, Upload, Copy, CheckCircle2, AlertCircle, Terminal, FileCode2, History, Settings, Share2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface CodeSandboxProps {
  lessonId?: string;
  initialCode?: string;
  language?: 'python' | 'javascript' | 'typescript';
  height?: string;
  title?: string;
  description?: string;
  packages?: string[];
  files?: { [filename: string]: string };
  onExecute?: (code: string) => void;
  onCodeChange?: (code: string) => void;
  enableCollaboration?: boolean;
  enableSharing?: boolean;
  autoGrade?: boolean;
  expectedOutput?: string;
  hints?: string[];
}

interface ExecutionHistoryItem {
  id: string;
  code: string;
  language: string;
  timestamp: Date;
  output: string;
  error?: string;
  executionTime: number;
}

const defaultCode = {
  python: `# Welcome to the Python sandbox!
# You can write and execute Python code here

def greet(name):
    return f"Hello, {name}!"

# Try it out:
print(greet("Student"))

# You can use common libraries:
import math
print(f"Pi is approximately {math.pi:.4f}")
`,
  javascript: `// Welcome to the JavaScript sandbox!
// You can write and execute JavaScript code here

function greet(name) {
  return \`Hello, \${name}!\`;
}

// Try it out:
console.log(greet("Student"));

// Modern JavaScript features are supported:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);
`,
  typescript: `// Welcome to the TypeScript sandbox!
// You can write and execute TypeScript code here

interface Person {
  name: string;
  age: number;
}

function greet(person: Person): string {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

// Try it out:
const student: Person = { name: "Student", age: 25 };
console.log(greet(student));

// TypeScript features are supported:
const numbers: number[] = [1, 2, 3, 4, 5];
const doubled = numbers.map((n: number): number => n * 2);
console.log("Doubled:", doubled);
`
};

export default function CodeSandbox({
  lessonId,
  initialCode,
  language = 'python',
  height = '600px',
  title = 'Code Editor',
  description,
  packages = [],
  files = {},
  onExecute,
  onCodeChange,
  enableCollaboration = false,
  enableSharing = false,
  autoGrade = false,
  expectedOutput,
  hints = []
}: CodeSandboxProps) {
  const [code, setCode] = useState(initialCode || defaultCode[language]);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [timeLimit, setTimeLimit] = useState(30);
  const [memoryLimit, setMemoryLimit] = useState(128);
  const [allowNetwork, setAllowNetwork] = useState(false);
  const editorRef = useRef<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for execution progress
    const handleProgress = (progress: ExecutionProgress) => {
      if (progress.type === 'stdout') {
        setOutput(prev => prev + progress.data);
        scrollToBottom();
      } else if (progress.type === 'stderr') {
        setError(prev => (prev || '') + progress.data);
      }
    };

    codeExecutionService.on('progress', handleProgress);

    return () => {
      codeExecutionService.off('progress', handleProgress);
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });

    // Configure editor options
    editor.updateOptions({
      fontSize,
      wordWrap: wordWrap ? 'on' : 'off',
      minimap: { enabled: minimap },
      scrollBeyondLastLine: false,
      automaticLayout: true
    });
  };

  const handleEditorChange: OnChange = (value, event) => {
    const newCode = value || '';
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput('');
    setError(null);
    setExecutionTime(null);

    try {
      const options: ExecutionOptions = {
        language: selectedLanguage,
        code,
        timeLimit: timeLimit * 1000,
        memoryLimit,
        allowNetwork,
        packages,
        files
      };

      const result = await codeExecutionService.execute(options);

      setOutput(result.output);
      if (result.error) {
        setError(result.error);
      }
      setExecutionTime(result.executionTime);

      // Add to history
      const historyItem: ExecutionHistoryItem = {
        id: Date.now().toString(),
        code,
        language: selectedLanguage,
        timestamp: new Date(),
        output: result.output,
        error: result.error,
        executionTime: result.executionTime
      };
      setExecutionHistory(prev => [historyItem, ...prev].slice(0, 10));

      // Auto-grading
      if (autoGrade && expectedOutput) {
        const passed = result.output.trim() === expectedOutput.trim();
        if (passed) {
          toast({
            title: 'Correct!',
            description: 'Your code produces the expected output.',
            duration: 5000
          });
        } else {
          toast({
            title: 'Not quite right',
            description: 'Your output doesn\'t match the expected result. Try again!',
            duration: 5000
          });
        }
      }

      if (onExecute) {
        onExecute(code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    codeExecutionService.terminateExecution();
    setIsExecuting(false);
    setOutput(prev => prev + '\n\n--- Execution terminated ---\n');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Code copied to clipboard',
        duration: 2000
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Unable to copy code to clipboard',
        duration: 2000
      });
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'typescript' ? 'ts' : 'js'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadCode = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,.js,.ts,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        setCode(text);
        toast({
          title: 'File uploaded',
          description: 'Code loaded from file',
          duration: 2000
        });
      }
    };
    input.click();
  };

  const handleShareCode = async () => {
    if (!enableSharing) return;

    try {
      // In a real implementation, this would create a shareable link
      const shareData = {
        code,
        language: selectedLanguage,
        timestamp: new Date().toISOString()
      };
      
      // For demo purposes, we'll just copy a data URL
      const dataUrl = `data:text/plain;base64,${btoa(JSON.stringify(shareData))}`;
      await navigator.clipboard.writeText(dataUrl);
      
      toast({
        title: 'Share link created',
        description: 'Link copied to clipboard',
        duration: 3000
      });
    } catch (err) {
      toast({
        title: 'Failed to share',
        description: 'Unable to create share link',
        duration: 2000
      });
    }
  };

  const loadFromHistory = (item: ExecutionHistoryItem) => {
    setCode(item.code);
    setSelectedLanguage(item.language as any);
    setOutput(item.output);
    setError(item.error || null);
    setExecutionTime(item.executionTime);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {enableCollaboration && (
              <Button variant="outline" size="sm" disabled>
                <Users className="w-4 h-4 mr-2" />
                Collaborate
              </Button>
            )}
            {enableSharing && (
              <Button variant="outline" size="sm" onClick={handleShareCode}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings && (
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]) => setFontSize(value)}
                  min={10}
                  max={24}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Time Limit (seconds)</Label>
                <Slider
                  value={[timeLimit]}
                  onValueChange={([value]) => setTimeLimit(value)}
                  min={5}
                  max={300}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Memory Limit (MB)</Label>
                <Slider
                  value={[memoryLimit]}
                  onValueChange={([value]) => setMemoryLimit(value)}
                  min={16}
                  max={512}
                  step={16}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="theme"
                  checked={theme === 'vs-dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'vs-dark' : 'light')}
                />
                <Label htmlFor="theme">Dark Theme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="wordWrap"
                  checked={wordWrap}
                  onCheckedChange={setWordWrap}
                />
                <Label htmlFor="wordWrap">Word Wrap</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="minimap"
                  checked={minimap}
                  onCheckedChange={setMinimap}
                />
                <Label htmlFor="minimap">Minimap</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="network"
                  checked={allowNetwork}
                  onCheckedChange={setAllowNetwork}
                />
                <Label htmlFor="network">Allow Network</Label>
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={selectedLanguage} onValueChange={(value: any) => setSelectedLanguage(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{packages.length} packages</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleUploadCode}>
              <Upload className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownloadCode}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyCode}>
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            {isExecuting ? (
              <Button variant="destructive" onClick={handleStop}>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button onClick={handleExecute}>
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="output">
              Output
              {(output || error) && (
                <Badge variant={error ? "destructive" : "default"} className="ml-2">
                  {error ? "Error" : "Success"}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">
              History
              {executionHistory.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {executionHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-4">
            <div className="border rounded-lg overflow-hidden" style={{ height }}>
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                theme={theme}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize,
                  wordWrap: wordWrap ? 'on' : 'off',
                  minimap: { enabled: minimap },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true
                }}
              />
            </div>
            {hints.length > 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Hints:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="output" className="mt-4">
            <ScrollArea className="h-[400px] rounded-lg border bg-slate-950 p-4">
              <div className="font-mono text-sm">
                {isExecuting && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing...
                  </div>
                )}
                {output && (
                  <pre className="text-green-400 whitespace-pre-wrap" ref={outputRef}>
                    {output}
                  </pre>
                )}
                {error && (
                  <pre className="text-red-400 whitespace-pre-wrap mt-4">
                    {error}
                  </pre>
                )}
                {executionTime !== null && (
                  <div className="text-gray-400 mt-4 pt-4 border-t border-gray-800">
                    <Terminal className="inline w-4 h-4 mr-2" />
                    Executed in {executionTime.toFixed(2)}ms
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[400px]">
              {executionHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No execution history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executionHistory.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 cursor-pointer hover:bg-accent"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{item.language}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-xs font-mono line-clamp-3">
                        {item.code}
                      </pre>
                      {item.error ? (
                        <Badge variant="destructive" className="mt-2">
                          Error
                        </Badge>
                      ) : (
                        <Badge variant="default" className="mt-2">
                          Success - {item.executionTime.toFixed(2)}ms
                        </Badge>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CodeSandbox;