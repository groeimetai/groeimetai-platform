// Main CodeSandbox component
export { default as CodeSandbox } from './index.tsx';

// Simpler components for specific use cases
export { SimpleCodeRunner } from './SimpleCodeRunner';
export { CodeSnippet } from './CodeSnippet';
export { LessonCodeBlock } from './LessonCodeBlock';

// Re-export types from the execution service
export type { ExecutionOptions, ExecutionResult, ExecutionProgress } from '@/services/codeExecutionService';