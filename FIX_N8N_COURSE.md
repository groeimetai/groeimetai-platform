# Fix N8N-Make-Basics Course Content

## Het probleem
De cursus "De Basis van Automations - N8N/Make" toont geen lesmateriaal, terwijl de content wel bestaat.

## Wat ik heb gevonden:

### 1. Course content bestaat ✅
- Alle modules en lessen bestaan in `/src/lib/data/course-content/n8n-make-basics/`
- 4 modules met elk 5 lessen
- Export naam is `n8nMakeBasicsModules`

### 2. Probleem met course loader
De course-loader.ts moet de juiste export naam vinden:
- Course ID: `n8n-make-basics`
- Export naam: `n8nMakeBasicsModules`
- Verwachte pattern: n8n blijft lowercase, Make en Basics worden capitalized

### 3. Oplossingen geïmplementeerd:

#### A. Verbeterde camelCase functie
```typescript
function toCamelCase(str: string): string {
  // Special handling for n8n -> n8n (keep lowercase)
  return str.split('-').map((word, index) => {
    if (word === 'n8n' || word === 'ai') return word;
    return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
  }).join('');
}
```

#### B. Debug logging toegevoegd
- Toont welke exports beschikbaar zijn
- Laat zien welke pattern wordt gebruikt

#### C. Test endpoint gemaakt
Ga naar: http://localhost:3000/api/test-n8n-course

Dit toont:
- Of de modules correct laden
- Hoeveel lessen per module
- Of de content aanwezig is

## Wat je nu moet doen:

1. **Herstart je dev server**
```bash
npm run dev
```

2. **Test de course**
- Ga naar de cursus pagina
- Check of je nu lessen ziet

3. **Als het nog niet werkt**
- Check de console logs voor debug info
- Ga naar /api/test-n8n-course voor details