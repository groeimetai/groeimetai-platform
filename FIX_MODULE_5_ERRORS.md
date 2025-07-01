# Module 5 Syntax Errors Fix

De errors in module 5 komen doordat er React componenten (zoals `<CodeSandbox>`) binnen de content string staan met code props die backticks gebruiken. Dit zorgt voor conflicts.

## Probleem

```typescript
content: `
<CodeSandbox 
  code={`...code...`}  // Dit kan niet binnen een template literal!
/>
`
```

## Oplossingen

### Optie 1: Gebruik escaped strings
Vervang de backticks in de code prop met normale strings:
```typescript
code={"import { OpenAI } from 'openai';\\n..."}
```

### Optie 2: Haal componenten uit content
Verplaats de CodeSandbox componenten naar een apart veld:
```typescript
export const lesson5_1: Lesson = {
  content: `# CRM Integration...`,
  components: {
    salesforceExample: <CodeSandbox ... />
  }
}
```

### Optie 3: Gebruik MDX
Converteer naar MDX files die React componenten native ondersteunen.

## Snelle Fix
Voor nu gaan we de code props escapen om de build errors op te lossen.