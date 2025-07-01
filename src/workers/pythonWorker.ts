/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

interface PyodideInterface {
  runPython: (code: string) => any;
  loadPackage: (packages: string | string[]) => Promise<void>;
  globals: any;
  FS: any;
  version: string;
}

declare function loadPyodide(config?: {
  indexURL?: string;
  fullStdLib?: boolean;
}): Promise<PyodideInterface>;

class PythonWorker {
  private pyodide: PyodideInterface | null = null;
  private isInitialized = false;
  private currentExecution: string | null = null;
  private outputBuffer: string[] = [];
  private errorBuffer: string[] = [];

  async initialize() {
    try {
      // Load Pyodide
      self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
      
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        fullStdLib: false // Load packages on demand
      });

      // Set up Python environment
      await this.setupPythonEnvironment();
      
      this.isInitialized = true;
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ 
        type: 'error', 
        data: { error: `Failed to initialize Pyodide: ${error}` } 
      });
    }
  }

  private async setupPythonEnvironment() {
    if (!this.pyodide) return;

    // Redirect stdout and stderr
    this.pyodide.runPython(`
import sys
from io import StringIO
import js

class OutputCapture:
    def __init__(self, output_type):
        self.output_type = output_type
        self.buffer = StringIO()
    
    def write(self, text):
        self.buffer.write(text)
        js.postOutput(self.output_type, text)
    
    def flush(self):
        pass
    
    def getvalue(self):
        return self.buffer.getvalue()

# Create custom stdout and stderr
sys.stdout = OutputCapture('stdout')
sys.stderr = OutputCapture('stderr')

# Import commonly used modules
import json
import math
import random
import datetime
import re
import collections
import itertools
import functools

# Create a safe environment for code execution
def execute_user_code(code, globals_dict=None):
    if globals_dict is None:
        globals_dict = {
            '__builtins__': __builtins__,
            'json': json,
            'math': math,
            'random': random,
            'datetime': datetime,
            're': re,
            'collections': collections,
            'itertools': itertools,
            'functools': functools
        }
    
    # Reset output buffers
    sys.stdout = OutputCapture('stdout')
    sys.stderr = OutputCapture('stderr')
    
    try:
        exec(code, globals_dict)
        return {
            'success': True,
            'output': sys.stdout.getvalue(),
            'error': sys.stderr.getvalue(),
            'variables': {k: v for k, v in globals_dict.items() 
                         if not k.startswith('_') and k not in ['__builtins__', 'json', 'math', 'random', 'datetime', 're', 'collections', 'itertools', 'functools']}
        }
    except Exception as e:
        import traceback
        return {
            'success': False,
            'output': sys.stdout.getvalue(),
            'error': sys.stderr.getvalue() + '\\n' + traceback.format_exc(),
            'variables': {}
        }
    `);

    // Expose postOutput function to Python
    self.postOutput = (type: string, data: string) => {
      if (this.currentExecution) {
        self.postMessage({
          type,
          data,
          executionId: this.currentExecution
        });
        
        if (type === 'stdout') {
          this.outputBuffer.push(data);
        } else if (type === 'stderr') {
          this.errorBuffer.push(data);
        }
      }
    };
  }

  async execute(executionId: string, code: string, options: {
    packages?: string[];
    files?: { [filename: string]: string };
    memoryLimit?: number;
    allowNetwork?: boolean;
  }) {
    if (!this.isInitialized || !this.pyodide) {
      self.postMessage({
        type: 'error',
        executionId,
        data: { error: 'Python environment not initialized' }
      });
      return;
    }

    this.currentExecution = executionId;
    this.outputBuffer = [];
    this.errorBuffer = [];

    try {
      // Install required packages
      if (options.packages && options.packages.length > 0) {
        await this.installPackages(options.packages);
      }

      // Create files in virtual filesystem
      if (options.files) {
        this.createVirtualFiles(options.files);
      }

      // Disable network access if needed
      if (!options.allowNetwork) {
        this.pyodide.runPython(`
import sys
# Remove modules that can make network requests
for module in ['urllib', 'urllib2', 'urllib3', 'requests', 'httplib', 'httplib2', 'socket']:
    if module in sys.modules:
        del sys.modules[module]
        `);
      }

      // Execute the code
      const startTime = performance.now();
      const result = this.pyodide.runPython(`execute_user_code(${JSON.stringify(code)})`);
      const endTime = performance.now();

      // Convert Python dict to JS object
      const jsResult = result.toJs();
      
      self.postMessage({
        type: 'result',
        executionId,
        data: {
          output: jsResult.get('output') || this.outputBuffer.join(''),
          error: jsResult.get('error') || (this.errorBuffer.length > 0 ? this.errorBuffer.join('') : undefined),
          executionTime: endTime - startTime,
          variables: jsResult.get('variables') ? Object.fromEntries(jsResult.get('variables')) : {}
        }
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        executionId,
        data: { error: `Execution error: ${error}` }
      });
    } finally {
      this.currentExecution = null;
    }
  }

  async installPackages(packages: string[]) {
    if (!this.pyodide) return;

    try {
      // Filter out already loaded packages
      const packagesToLoad = packages.filter(pkg => {
        try {
          this.pyodide!.runPython(`import ${pkg.split('==')[0]}`);
          return false; // Package already loaded
        } catch {
          return true; // Package needs to be loaded
        }
      });

      if (packagesToLoad.length > 0) {
        await this.pyodide.loadPackage(packagesToLoad);
      }
    } catch (error) {
      throw new Error(`Failed to install packages: ${error}`);
    }
  }

  createVirtualFiles(files: { [filename: string]: string }) {
    if (!this.pyodide) return;

    Object.entries(files).forEach(([filename, content]) => {
      const dir = filename.substring(0, filename.lastIndexOf('/'));
      if (dir) {
        this.pyodide!.runPython(`
import os
os.makedirs('${dir}', exist_ok=True)
        `);
      }
      
      this.pyodide!.FS.writeFile(filename, content);
    });
  }

  terminate() {
    this.currentExecution = null;
    this.outputBuffer = [];
    this.errorBuffer = [];
  }
}

// Initialize worker
const worker = new PythonWorker();

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const { type, executionId, code, packages, files, memoryLimit, allowNetwork } = event.data;

  switch (type) {
    case 'initialize':
      await worker.initialize();
      break;
    
    case 'execute':
      await worker.execute(executionId, code, {
        packages,
        files,
        memoryLimit,
        allowNetwork
      });
      break;
    
    case 'installPackages':
      try {
        await worker.installPackages(packages);
        self.postMessage({ type: 'packagesInstalled' });
      } catch (error) {
        self.postMessage({ 
          type: 'error', 
          data: { error: error instanceof Error ? error.message : 'Package installation failed' } 
        });
      }
      break;
    
    case 'terminate':
      worker.terminate();
      break;
  }
});

// Initialize on load
worker.initialize();