# Code Execution Components Usage Guide

This guide shows how to integrate the code execution components into your lessons.

## Components Overview

### 1. CodeSandbox
Full-featured code editor with Monaco Editor, multiple language support, and advanced features.

```tsx
import { CodeSandbox } from '@/components/CodeSandbox';

<CodeSandbox
  lessonId="python-basics"
  initialCode={`def greet(name):
    return f"Hello, {name}!"
    
print(greet("World"))`}
  language="python"
  title="Python Functions"
  description="Learn how to create and use functions in Python"
  packages={['numpy', 'pandas']}
  enableCollaboration={true}
  enableSharing={true}
  autoGrade={true}
  expectedOutput="Hello, World!"
  hints={[
    "Remember to call the function with a string argument",
    "The function should return a formatted string"
  ]}
/>
```

### 2. SimpleCodeRunner
Lightweight code runner for quick exercises and examples.

```tsx
import { SimpleCodeRunner } from '@/components/CodeSandbox';

<SimpleCodeRunner
  code={`# Calculate the sum of two numbers
a = 5
b = 3
print(a + b)`}
  language="python"
  editable={true}
  expectedOutput="8"
  onSuccess={() => console.log('Exercise completed!')}
/>
```

### 3. CodeSnippet
Non-executable code display with syntax highlighting.

```tsx
import { CodeSnippet } from '@/components/CodeSandbox';

<CodeSnippet
  code={`// Example of async/await in JavaScript
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}`}
  language="javascript"
  title="Async/Await Example"
  showLineNumbers={true}
  showCopyButton={true}
/>
```

### 4. LessonCodeBlock
Complete lesson integration with exercise/solution tabs and progress tracking.

```tsx
import { LessonCodeBlock } from '@/components/CodeSandbox';

<LessonCodeBlock
  type="runner"
  lessonId="functions-101"
  exerciseId="exercise-1"
  title="Exercise: Create a Calculator Function"
  description="Create a function that performs basic arithmetic operations"
  instructions="Complete the calculate function to handle add, subtract, multiply, and divide operations"
  code={`def calculate(a, b, operation):
    # Your code here
    pass

# Test your function
print(calculate(10, 5, "add"))      # Should print: 15
print(calculate(10, 5, "subtract")) # Should print: 5
print(calculate(10, 5, "multiply")) # Should print: 50
print(calculate(10, 5, "divide"))   # Should print: 2.0`}
  solution={`def calculate(a, b, operation):
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        return a / b if b != 0 else "Cannot divide by zero"
    else:
        return "Invalid operation"

# Test your function
print(calculate(10, 5, "add"))      # Should print: 15
print(calculate(10, 5, "subtract")) # Should print: 5
print(calculate(10, 5, "multiply")) # Should print: 50
print(calculate(10, 5, "divide"))   # Should print: 2.0`}
  expectedOutput={`15
5
50
2.0`}
  hints={[
    "Use if/elif statements to check the operation type",
    "Remember to handle division by zero",
    "Each operation should return the result, not print it"
  ]}
  language="python"
  showSolution={false}
  onComplete={() => {
    // Track completion in your analytics
    console.log('Exercise completed!');
  }}
/>
```

## Integration in Lessons

### Example Lesson Structure

```typescript
// In your lesson file (e.g., lesson-1-1.ts)
export const lesson = {
  id: 'python-functions-basics',
  title: 'Introduction to Functions',
  content: `
# Introduction to Functions

Functions are reusable blocks of code that perform specific tasks.

## Example 1: Simple Function

<CodeSnippet
  code="def greet(name):
    return f'Hello, {name}!'
    
# Using the function
message = greet('Alice')
print(message)"
  language="python"
  title="Basic Function Example"
/>

## Try It Yourself

<SimpleCodeRunner
  code="# Modify this function to greet in a different language
def greet(name):
    return f'Hello, {name}!'
    
print(greet('Student'))"
  language="python"
  editable={true}
/>

## Exercise: Temperature Converter

<LessonCodeBlock
  type="runner"
  lessonId="python-functions-basics"
  exerciseId="temp-converter"
  title="Temperature Converter"
  instructions="Create a function that converts Celsius to Fahrenheit. Formula: F = (C × 9/5) + 32"
  code="def celsius_to_fahrenheit(celsius):
    # Your code here
    pass

# Test cases
print(celsius_to_fahrenheit(0))    # Should print: 32.0
print(celsius_to_fahrenheit(100))  # Should print: 212.0
print(celsius_to_fahrenheit(37))   # Should print: 98.6"
  expectedOutput="32.0
212.0
98.6"
  hints={[
    "The formula is: fahrenheit = (celsius * 9/5) + 32",
    "Make sure to return the result, not print it in the function"
  ]}
/>
`,
  // ... other lesson properties
};
```

## Security Features

All code execution happens in a sandboxed environment with:

1. **Resource Limits**
   - Execution time limit (default: 30 seconds)
   - Memory limit (default: 128MB)
   - No filesystem access
   - Network access disabled by default

2. **Language-Specific Restrictions**
   - Python: No access to os, subprocess, sys modules
   - JavaScript: No access to Node.js APIs, limited browser APIs
   - TypeScript: Transpiled and executed as JavaScript

3. **User Isolation**
   - Each execution runs in its own worker thread
   - No shared state between executions
   - Automatic cleanup after execution

## Advanced Features

### Custom Packages
```tsx
<CodeSandbox
  packages={['numpy', 'pandas', 'matplotlib']}
  initialCode={`import numpy as np
import pandas as pd

# Create a DataFrame
data = {'A': [1, 2, 3], 'B': [4, 5, 6]}
df = pd.DataFrame(data)
print(df)`}
/>
```

### Multiple Files
```tsx
<CodeSandbox
  files={{
    'utils.py': `def helper_function(x):
    return x * 2`,
    'data.json': `{"name": "test", "value": 42}`
  }}
  initialCode={`from utils import helper_function
import json

with open('data.json', 'r') as f:
    data = json.load(f)
    
print(helper_function(data['value']))`}
/>
```

### Collaborative Editing (Coming Soon)
```tsx
<CodeSandbox
  enableCollaboration={true}
  lessonId="collaborative-coding"
  // Users can see each other's cursors and edits in real-time
/>
```

## Best Practices

1. **Start Simple**: Use `SimpleCodeRunner` for basic exercises
2. **Provide Clear Instructions**: Always include what the student should accomplish
3. **Use Progressive Hints**: Start with general hints, get more specific
4. **Test Expected Output**: Make sure your expected output exactly matches the actual output
5. **Handle Edge Cases**: Consider what happens with invalid input
6. **Track Progress**: Use `onComplete` callbacks to track student progress

## Troubleshooting

### Common Issues

1. **Code won't run**: Check browser console for errors, ensure Pyodide loaded
2. **Output mismatch**: Check for trailing newlines or spaces in expected output
3. **Package not found**: Not all Python packages are available in Pyodide
4. **Performance issues**: Large computations may timeout, adjust limits if needed

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may have slower WebAssembly performance)
- Mobile: Limited support, not recommended for complex exercises