'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }
)

interface CodeEditorProps {
  value: string
  onChange?: (value: string | undefined) => void
  language?: string
  height?: string
  readOnly?: boolean
  theme?: 'light' | 'dark'
  options?: any
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
  theme = 'dark',
  options = {}
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Add custom themes if needed
    monaco.editor.defineTheme('groeimetai-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1a1b26',
        'editor.foreground': '#a9b1d6',
        'editor.lineHighlightBackground': '#24283b',
        'editor.selectionBackground': '#364a82',
        'editor.inactiveSelectionBackground': '#3a3d5c'
      }
    })

    // Set theme
    monaco.editor.setTheme(theme === 'dark' ? 'groeimetai-dark' : 'vs')

    // Configure languages
    if (language === 'python') {
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: () => {
          return {
            suggestions: [
              {
                label: 'import openai',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'import openai\n\nopenai.api_key = "your-api-key"',
                documentation: 'Import OpenAI library'
              },
              {
                label: 'import langchain',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'from langchain import LLMChain, PromptTemplate',
                documentation: 'Import LangChain components'
              }
            ]
          }
        }
      })
    }
  }

  const defaultOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    theme: theme === 'dark' ? 'vs-dark' : 'vs',
    readOnly,
    ...options
  }

  // Fallback voor als Monaco niet laadt
  if (typeof window === 'undefined') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg resize-none"
        style={{ height }}
      />
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden" style={{ height }}>
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={defaultOptions}
        loading={
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        }
      />
    </div>
  )
}

// Export a simple syntax highlighter for read-only code blocks
export function CodeBlock({ 
  code, 
  language = 'javascript',
  className = '' 
}: { 
  code: string
  language?: string
  className?: string 
}) {
  return (
    <pre className={`bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto ${className}`}>
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  )
}