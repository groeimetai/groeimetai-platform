import { EventEmitter } from 'events';

export interface ExecutionOptions {
  language: 'python' | 'javascript' | 'typescript';
  code: string;
  timeLimit?: number; // milliseconds
  memoryLimit?: number; // MB
  allowNetwork?: boolean;
  packages?: string[];
  files?: { [filename: string]: string };
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsed?: number;
  variables?: { [key: string]: any };
}

export interface ExecutionProgress {
  type: 'stdout' | 'stderr' | 'system';
  data: string;
  timestamp: number;
}

class CodeExecutionService extends EventEmitter {
  private pythonWorker: Worker | null = null;
  private executionTimeout: NodeJS.Timeout | null = null;
  private currentExecution: string | null = null;

  constructor() {
    super();
    this.initializePythonWorker();
  }

  private initializePythonWorker() {
    if (typeof window !== 'undefined' && window.Worker) {
      this.pythonWorker = new Worker(
        new URL('../workers/pythonWorker.ts', import.meta.url),
        { type: 'module' }
      );

      this.pythonWorker.onmessage = (event) => {
        const { type, data, executionId } = event.data;
        
        if (executionId !== this.currentExecution) return;

        switch (type) {
          case 'ready':
            this.emit('ready');
            break;
          case 'stdout':
          case 'stderr':
            this.emit('progress', {
              type,
              data,
              timestamp: Date.now()
            } as ExecutionProgress);
            break;
          case 'result':
            this.handleExecutionResult(data);
            break;
          case 'error':
            this.handleExecutionError(data);
            break;
        }
      };

      this.pythonWorker.onerror = (error) => {
        console.error('Python worker error:', error);
        this.emit('error', error);
      };
    }
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.currentExecution = Math.random().toString(36).substring(7);

    try {
      // Clear any existing timeout
      if (this.executionTimeout) {
        clearTimeout(this.executionTimeout);
      }

      // Set execution timeout
      const timeLimit = options.timeLimit || 30000; // Default 30 seconds
      const timeoutPromise = new Promise<ExecutionResult>((_, reject) => {
        this.executionTimeout = setTimeout(() => {
          this.terminateExecution();
          reject(new Error('Execution timeout exceeded'));
        }, timeLimit);
      });

      // Execute code based on language
      const executionPromise = this.executeByLanguage(options);

      // Race between execution and timeout
      const result = await Promise.race([executionPromise, timeoutPromise]) as ExecutionResult;

      // Clear timeout if execution completed
      if (this.executionTimeout) {
        clearTimeout(this.executionTimeout);
        this.executionTimeout = null;
      }

      return {
        ...result,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      };
    } finally {
      this.currentExecution = null;
    }
  }

  private async executeByLanguage(options: ExecutionOptions): Promise<ExecutionResult> {
    switch (options.language) {
      case 'python':
        return this.executePython(options);
      case 'javascript':
        return this.executeJavaScript(options);
      case 'typescript':
        return this.executeTypeScript(options);
      default:
        throw new Error(`Unsupported language: ${options.language}`);
    }
  }

  private executePython(options: ExecutionOptions): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      if (!this.pythonWorker) {
        reject(new Error('Python worker not initialized'));
        return;
      }

      const messageHandler = (event: MessageEvent) => {
        const { type, data, executionId } = event.data;
        
        if (executionId !== this.currentExecution) return;

        if (type === 'result') {
          this.pythonWorker?.removeEventListener('message', messageHandler);
          resolve(data);
        } else if (type === 'error') {
          this.pythonWorker?.removeEventListener('message', messageHandler);
          reject(new Error(data.error));
        }
      };

      this.pythonWorker.addEventListener('message', messageHandler);

      this.pythonWorker.postMessage({
        type: 'execute',
        executionId: this.currentExecution,
        code: options.code,
        packages: options.packages || [],
        files: options.files || {},
        memoryLimit: options.memoryLimit,
        allowNetwork: options.allowNetwork
      });
    });
  }

  private async executeJavaScript(options: ExecutionOptions): Promise<ExecutionResult> {
    const output: string[] = [];
    const errors: string[] = [];

    // Create sandboxed console
    const sandboxedConsole = {
      log: (...args: any[]) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        output.push(message);
        this.emit('progress', {
          type: 'stdout',
          data: message + '\n',
          timestamp: Date.now()
        } as ExecutionProgress);
      },
      error: (...args: any[]) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        errors.push(message);
        this.emit('progress', {
          type: 'stderr',
          data: message + '\n',
          timestamp: Date.now()
        } as ExecutionProgress);
      },
      warn: (...args: any[]) => {
        sandboxedConsole.log('Warning:', ...args);
      },
      info: (...args: any[]) => {
        sandboxedConsole.log(...args);
      }
    };

    try {
      // Create sandboxed environment
      const sandbox = {
        console: sandboxedConsole,
        setTimeout: undefined,
        setInterval: undefined,
        setImmediate: undefined,
        XMLHttpRequest: undefined,
        fetch: options.allowNetwork ? fetch : undefined,
        // Add safe globals
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        JSON,
        Promise,
        Map,
        Set,
        WeakMap,
        WeakSet
      };

      // Execute in sandboxed context
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const sandboxedFunction = new AsyncFunction(
        ...Object.keys(sandbox),
        options.code
      );

      await sandboxedFunction(...Object.values(sandbox));

      return {
        output: output.join('\n'),
        error: errors.length > 0 ? errors.join('\n') : undefined,
        executionTime: 0 // Will be set by parent
      };
    } catch (error) {
      return {
        output: output.join('\n'),
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0
      };
    }
  }

  private async executeTypeScript(options: ExecutionOptions): Promise<ExecutionResult> {
    try {
      // For TypeScript, we'll need to transpile first
      // This is a simplified version - in production, you'd use the TypeScript compiler
      const { transpileModule } = await import('typescript');
      
      const result = transpileModule(options.code, {
        compilerOptions: {
          module: 1, // CommonJS
          target: 99, // ESNext
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      });

      if (result.diagnostics && result.diagnostics.length > 0) {
        const errors = result.diagnostics.map(d => 
          d.messageText.toString()
        ).join('\n');
        
        return {
          output: '',
          error: errors,
          executionTime: 0
        };
      }

      // Execute the transpiled JavaScript
      return this.executeJavaScript({
        ...options,
        language: 'javascript',
        code: result.outputText
      });
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'TypeScript compilation failed',
        executionTime: 0
      };
    }
  }

  private handleExecutionResult(data: ExecutionResult) {
    this.emit('complete', data);
  }

  private handleExecutionError(data: { error: string }) {
    this.emit('error', new Error(data.error));
  }

  terminateExecution() {
    if (this.pythonWorker) {
      this.pythonWorker.postMessage({
        type: 'terminate',
        executionId: this.currentExecution
      });
    }
    this.currentExecution = null;
  }

  async installPackages(packages: string[]): Promise<void> {
    if (!this.pythonWorker) {
      throw new Error('Python worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        const { type } = event.data;
        
        if (type === 'packagesInstalled') {
          this.pythonWorker?.removeEventListener('message', messageHandler);
          resolve();
        } else if (type === 'error') {
          this.pythonWorker?.removeEventListener('message', messageHandler);
          reject(new Error(event.data.error));
        }
      };

      this.pythonWorker.addEventListener('message', messageHandler);

      this.pythonWorker.postMessage({
        type: 'installPackages',
        packages
      });
    });
  }

  destroy() {
    if (this.executionTimeout) {
      clearTimeout(this.executionTimeout);
    }
    if (this.pythonWorker) {
      this.pythonWorker.terminate();
      this.pythonWorker = null;
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const codeExecutionService = new CodeExecutionService();

// Export for testing
export { CodeExecutionService };