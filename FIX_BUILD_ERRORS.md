# Build Errors Fix

## Current Issues (5 syntax errors)

1. **chatgpt-gemini-masterclass/module-3/lesson-3-1.ts** ✅ FIXED
   - Template literal conflict in code block

2. **chatgpt-gemini-masterclass/module-5/lesson-5-1.ts** ✅ FIXED
   - CodeSandbox component with code prop issues

3. **chatgpt-gemini-masterclass/module-5/lesson-5-2.ts** ✅ FIXED
   - CodeSandbox component with code prop issues

4. **claude-flow-ai-swarming/module-3/lesson-3-2.ts** ✅ FIXED
   - Duplicate export

5. **crewai-agent-teams/module-3/lesson-3-4.ts** ❌ PENDING
   - Python f-string syntax in code block
   - Line 1385: `${investment_amount:,.0f}`

6. **langchain-basics/module-4/lesson-4-2.ts** ❌ PENDING
   - Python f-string syntax in code block
   - Line 182: `${metrics['cost_per_1k_tokens']}`

7. **n8n-make-basics/module-3/lesson-3-2.ts** ❌ PENDING
   - String escaping issue in JSON
   - Line 300: Complex JavaScript string

## Temporary Workaround

For now, we can:
1. Skip these modules during build
2. Or simplify the content to avoid syntax conflicts

## Long-term Solution

Convert to MDX files that properly handle code blocks and React components.