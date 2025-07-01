'use client'

import { useEffect, useState } from 'react'
import { CodeBlock } from './CodeEditor'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  const [processedContent, setProcessedContent] = useState('')

  useEffect(() => {
    // Basic markdown parsing - in productie zou je een library zoals react-markdown gebruiken
    let html = content

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')

    // Bold and italic
    html = html.replace(/\*\*\*(.*)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*)\*/g, '<em>$1</em>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-4">• $1</li>')
    html = html.replace(/^- (.+)$/gim, '<li class="ml-4">• $1</li>')
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-4 list-decimal">$1</li>')

    // Wrap consecutive list items
    html = html.replace(/(<li class="ml-4">.*<\/li>\n)+/g, (match) => {
      return `<ul class="space-y-1 my-4">${match}</ul>`
    })
    html = html.replace(/(<li class="ml-4 list-decimal">.*<\/li>\n)+/g, (match) => {
      return `<ol class="space-y-1 my-4 list-decimal list-inside">${match}</ol>`
    })

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-4">')
    html = `<p class="mb-4">${html}</p>`

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="my-4" data-code-block data-lang="${lang || 'text'}">${code.trim()}</div>`
    })

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic">$1</blockquote>')

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-8 border-gray-300">')

    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(cell => cell.trim())
      const isHeader = cells.every(cell => cell.includes('---'))
      if (isHeader) return ''
      
      const cellHtml = cells.map(cell => `<td class="border px-2 py-1">${cell.trim()}</td>`).join('')
      return `<tr>${cellHtml}</tr>`
    })

    // Wrap tables
    html = html.replace(/(<tr>.*<\/tr>\n)+/g, (match) => {
      return `<table class="border-collapse border my-4">${match}</table>`
    })

    setProcessedContent(html)
  }, [content])

  useEffect(() => {
    // Render code blocks with syntax highlighting
    const codeBlocks = document.querySelectorAll('[data-code-block]')
    codeBlocks.forEach((block) => {
      const lang = block.getAttribute('data-lang') || 'text'
      const code = block.textContent || ''
      const wrapper = document.createElement('div')
      wrapper.className = 'my-4'
      block.parentNode?.replaceChild(wrapper, block)
      
      // For now, just render as pre block
      // In production, you'd use a syntax highlighter
      const pre = document.createElement('pre')
      pre.className = 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto'
      const codeEl = document.createElement('code')
      codeEl.className = `language-${lang}`
      codeEl.textContent = code
      pre.appendChild(codeEl)
      wrapper.appendChild(pre)
    })
  }, [processedContent])

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}