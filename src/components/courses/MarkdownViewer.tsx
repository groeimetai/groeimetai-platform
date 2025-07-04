'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  // Handle undefined or null content
  if (!content) {
    return <div className={`${className} text-gray-500`}>No content available</div>
  }

  // Pre-process content to escape problematic patterns
  const processedContent = content
    // Preserve N8N/Make.com template expressions in code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      // Replace {{ with a placeholder inside code blocks to prevent React issues
      return match.replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;')
    })
  const components: Components = {
    // Headers
    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-bold mt-4 mb-2">{children}</h4>,
    h5: ({ children }) => <h5 className="text-base font-bold mt-3 mb-2">{children}</h5>,
    h6: ({ children }) => <h6 className="text-sm font-bold mt-3 mb-2">{children}</h6>,
    
    // Paragraphs
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-700 hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Lists
    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-4 ml-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-4 ml-4">{children}</ol>,
    li: ({ children }) => <li className="ml-2">{children}</li>,
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
        {children}
      </blockquote>
    ),
    
    // Code
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      
      return !inline && language ? (
        <div className="my-4">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
          {children}
        </code>
      )
    },
    
    // Pre (for code blocks without language)
    pre: ({ children }) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    ),
    
    // Horizontal rule
    hr: () => <hr className="my-8 border-gray-300" />,
    
    // Strong and emphasis
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="border-collapse border border-gray-300 w-full">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-gray-300">{children}</tr>,
    th: ({ children }) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-4 py-2">{children}</td>
    ),
    
    // Images
    img: ({ src, alt }) => (
      <img 
        src={src} 
        alt={alt || ''} 
        className="max-w-full h-auto rounded-lg my-4" 
      />
    ),
  }

  return (
    <div className={`${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}