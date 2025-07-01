import type { Lesson } from '@/lib/data/courses';

export const lesson1_1: Lesson = {
  id: 'lesson-1-1',
  title: 'Wat zijn triggers en hoe werken ze?',
  duration: '20 min',
  content: `
# Wat zijn triggers en hoe werken ze?

## Stel je voor: je digitale assistent die nooit slaapt

Een **trigger** is het startpunt van elke automation - het moment waarop je digitale assistent wakker wordt en aan het werk gaat. Net zoals je wekker je 's ochtends wakker maakt, zorgt een trigger ervoor dat je automation begint te werken.

## De 3 hoofdtypen triggers

### 1. **Webhook Triggers** - De deurbel van je automation
Een webhook is als een deurbel: wanneer iemand aanbelt (data stuurt), gaat je automation direct aan de slag.

**Wanneer gebruik je dit?**
- Onmiddellijke reactie nodig (bijvoorbeeld: klant vult formulier in)
- Real-time updates van externe systemen
- Integratie met moderne apps zoals Stripe, Typeform, of Calendly

**Voorbeeld scenario:**
Een klant vult je contactformulier in → Webhook ontvangt data → Automation stuurt welkomstmail en maakt CRM-record aan.

### 2. **Schedule Triggers** - De wekker van je automation
Schedule triggers werken op vaste tijden, net als je agenda-afspraken.

**Wanneer gebruik je dit?**
- Dagelijkse rapportages genereren
- Wekelijkse backups maken
- Maandelijkse facturen versturen

**Voorbeeld scenario:**
Elke maandag om 9:00 → Check nieuwe orders → Genereer weekrapport → Stuur naar management.

### 3. **Manual Triggers** - De startknop voor jou
Soms wil je zelf bepalen wanneer een automation start. Manual triggers geven jou de controle.

**Wanneer gebruik je dit?**
- Testen van nieuwe workflows
- Eenmalige bulk-acties
- Processen die menselijke goedkeuring vereisen

## Triggers in de praktijk

### N8N Webhook configuratie:
\`\`\`json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "contact-form",
        "responseMode": "onReceived",
        "responseData": "allEntries"
      },
      "name": "Webhook - Contactformulier",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    }
  ]
}
\`\`\`

### Make (Integromat) Schedule configuratie:
\`\`\`json
{
  "name": "Dagelijkse Backup",
  "type": "schedule",
  "schedule": {
    "type": "interval",
    "interval": "day",
    "time": "09:00",
    "timezone": "Europe/Amsterdam"
  }
}
\`\`\`

## Pro tips voor triggers

1. **Test altijd je webhook URL** - Gebruik tools zoals Postman of de ingebouwde test-functie
2. **Zet tijdzones correct** - Vooral belangrijk bij internationale teams
3. **Gebruik descriptieve namen** - "Webhook_ContactForm_NL" is beter dan "Webhook1"
4. **Documenteer je endpoints** - Houd bij welke data je webhook verwacht

## Veelvoorkomende valkuilen

- **Webhook timeout**: Zorg dat je automation binnen 30 seconden reageert
- **Dubbele triggers**: Check of je webhook niet meerdere keren vuurt
- **Tijdzone verwarring**: Gebruik altijd consistente tijdzones in je schedules
  `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'N8N Webhook met data validatie',
      language: 'javascript',
      code: `// In N8N Function node na je webhook
const requiredFields = ['email', 'name', 'message'];
const incomingData = items[0].json;

// Valideer of alle velden aanwezig zijn
for (const field of requiredFields) {
  if (!incomingData[field]) {
    throw new Error(\`Veld '\${field}' ontbreekt in webhook data\`);
  }
}

// Valideer email format
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
if (!emailRegex.test(incomingData.email)) {
  throw new Error('Ongeldig email adres');
}

// Data is valide, ga door met verwerking
return items;`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-1-1',
      title: 'Maak je eerste webhook trigger',
      description: 'Configureer een webhook in N8N of Make die reageert op een testformulier. Test deze met een tool zoals webhook.site of Postman.',
      difficulty: 'easy',
      type: 'project',
      initialCode: `// 1. Maak een nieuwe workflow in N8N of een nieuw scenario in Make.
// 2. Voeg een webhook trigger toe en kopieer de URL.
// 3. Gebruik Postman of een andere tool om een POST request te sturen met een JSON body.
// 4. Verifieer dat de data correct wordt ontvangen in de tool.
`,
      hints: [
        'Zorg ervoor dat je de `Content-Type` header instelt op `application/json`.',
        'Begin met een simpele JSON body, zoals `{"name": "Test"}`.',
        'In N8N, vergeet niet om op `Listen for Test Event` te klikken.'
      ]
    },
    {
      id: 'assignment-1-1-2',
      title: 'Plan een dagelijkse taak',
      description: 'Stel een schedule trigger in die elke werkdag om 9:00 een notificatie stuurt met de tekst "Tijd voor je dagelijkse standup!"',
      difficulty: 'easy',
      type: 'project',
      initialCode: `// 1. Maak een nieuwe workflow/scenario.
// 2. Voeg een schedule trigger toe (Cron in N8N, Schedule in Make).
// 3. Stel de trigger in om elke werkdag om 9:00 te draaien.
// 4. Voeg een actie toe die een notificatie verstuurt (bijv. via email of Slack).
`,
      hints: [
        'In N8N kun je een Cron expression gebruiken: `0 9 * * 1-5`.',
        'In Make kun je de dagen van de week selecteren in de schedule module.',
        'Test de trigger door hem handmatig uit te voeren.'
      ]
    }
  ],
  resources: [
    {
      title: 'N8N Webhook documentatie',
      url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/',
      type: 'documentation'
    },
    {
      title: 'Make Webhooks guide',
      url: 'https://www.make.com/en/help/tools/webhooks',
      type: 'guide'
    }
  ]
}