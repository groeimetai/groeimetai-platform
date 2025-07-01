'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  className?: string;
}

export function CodeSnippet({
  code,
  language = 'plaintext',
  title,
  showLineNumbers = true,
  showCopyButton = true,
  className
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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

  const lines = code.split('\n');

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {(title || showCopyButton) && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          {title && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{title}</span>
              {language && (
                <span className="text-xs text-muted-foreground">
                  {language}
                </span>
              )}
            </div>
          )}
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      )}
      
      <div className="p-4 bg-slate-950 text-slate-50 rounded-b-lg overflow-x-auto">
        <div className="flex">
          {showLineNumbers && (
            <div className="flex-shrink-0 pr-4 text-right select-none">
              {lines.map((_, i) => (
                <div key={i} className="text-xs text-slate-500">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <pre className="flex-1">
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      </div>
    </Card>
  );
}