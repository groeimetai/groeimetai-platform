import type { Lesson, CodeExample, Assignment } from '@/lib/data/courses';

export const lesson1_2: Lesson = {
  id: 'lesson-2',
  title: 'Je eerste webhook ontvangen',
  duration: '30 min',
  content: `
## Je eerste webhook ontvangen

In deze les leer je hoe je webhook endpoints opzet en test met verschillende tools. We behandelen zowel testomgevingen als professionele no-code platforms.

### Wat gaan we doen?

1. Webhook endpoints instellen
2. Testen met webhook.site en ngrok
3. N8N webhook configuratie
4. Make.com webhook setup
5. Webhook requests debuggen

### 1. Setting up webhook endpoints

Een webhook endpoint is een URL waar externe services data naartoe kunnen sturen. Dit is de basis van elke webhook integratie.

#### Belangrijke concepten:
- **Endpoint URL**: De specifieke URL waar je webhook data ontvangt
- **HTTP methodes**: Meestal POST, soms ook GET
- **Response codes**: 200 OK betekent succesvol ontvangen
- **Payload**: De data die je ontvangt (meestal JSON)

### 2. Testen met webhook.site

Webhook.site is een gratis tool om webhooks te testen zonder code te schrijven.

#### Stap-voor-stap tutorial:

1. **Ga naar webhook.site**
   - Open [https://webhook.site](https://webhook.site)
   - Je krijgt automatisch een unieke URL toegewezen

2. **Kopieer je unieke URL**
   - Deze ziet er uit als: \`https://webhook.site/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6\`
   - Dit is je tijdelijke webhook endpoint

3. **Test je webhook**
   - Gebruik een tool zoals Postman of curl
   - Verstuur een POST request naar je URL:
   \`\`\`bash
   curl -X POST https://webhook.site/jouw-unieke-url \\
     -H "Content-Type: application/json" \\
     -d '{"test": "data", "timestamp": "2024-01-01"}'
   \`\`\`

4. **Bekijk de ontvangen data**
   - Refresh webhook.site
   - Je ziet alle details: headers, body, timestamp

### 3. Lokaal testen met ngrok

Ngrok maakt je lokale server bereikbaar via internet - perfect voor development.

#### Installatie en setup:

1. **Download ngrok**
   \`\`\`bash
   # macOS (met Homebrew)
   brew install ngrok
   
   # Of download van https://ngrok.com/download
   \`\`\`

2. **Start een lokale server**
   \`\`\`javascript
   // Simpele Node.js webhook server
   const express = require('express');
   const app = express();
   
   app.use(express.json());
   
   app.post('/webhook', (req, res) => {
     console.log('Webhook ontvangen:', req.body);
     res.status(200).send('OK');
   });
   
   app.listen(3000, () => {
     console.log('Server draait op port 3000');
   });
   \`\`\`

3. **Expose met ngrok**
   \`\`\`bash
   ngrok http 3000
   \`\`\`

4. **Gebruik de ngrok URL**
   - Je krijgt een URL zoals: \`https://abc123.ngrok.io\`
   - Je webhook endpoint is: \`https://abc123.ngrok.io/webhook\`

### 4. N8N webhook setup

N8N is een krachtige workflow automation tool met ingebouwde webhook support.

#### Stap-voor-stap configuratie:

1. **Maak een nieuwe workflow**
   - Open N8N dashboard
   - Klik op "New Workflow"

2. **Voeg een Webhook node toe**
   - Sleep de "Webhook" node naar je canvas
   - Dubbelklik om te configureren

3. **Configureer de webhook**
   - **Webhook URL**: Wordt automatisch gegenereerd
   - **HTTP Method**: Kies POST (meest gebruikt)
   - **Path**: Bijvoorbeeld \`/mijn-webhook\`
   - **Response Mode**: "When last node finishes"
   - **Response Data**: "First entry JSON"

4. **Test je webhook**
   - Klik op "Listen for Test Event"
   - Stuur een test request naar de webhook URL
   - N8N toont de ontvangen data

5. **Voeg vervolgacties toe**
   - Sleep extra nodes naar je workflow
   - Bijvoorbeeld: "Set" node om data te transformeren
   - Of "HTTP Request" node om data door te sturen

6. **Activeer de workflow**
   - Klik op "Active" toggle
   - Je webhook is nu live!

### 5. Make.com webhook configuration

Make.com (voorheen Integromat) biedt visuele webhook integraties.

#### Setup tutorial:

1. **Maak een nieuw scenario**
   - Log in op Make.com
   - Klik op "Create a new scenario"

2. **Voeg een Webhook module toe**
   - Zoek naar "Webhooks"
   - Kies "Custom webhook"

3. **Configureer de webhook**
   - Klik op "Add"
   - Geef je webhook een naam
   - Make genereert automatisch een URL

4. **Stel data structure in**
   - Klik op "Determine data structure"
   - Stuur een sample request
   - Make analyseert automatisch de JSON structuur

5. **Test de webhook**
   \`\`\`bash
   curl -X POST https://hook.eu1.make.com/jouw-webhook-url \\
     -H "Content-Type: application/json" \\
     -d '{
       "order_id": "12345",
       "customer": "Jan Jansen",
       "amount": 99.99
     }'
   \`\`\`

6. **Voeg modules toe**
   - Bijvoorbeeld: Google Sheets om data op te slaan
   - Of Email om notificaties te versturen
`,
  assignments: [
    {
      id: 'assignment-2-1',
      title: 'Setup je eerste webhook receiver',
      description: 'Maak een werkende webhook receiver in N8N of Make.com en test deze met Postman.',
      difficulty: 'easy',
      type: 'project',
      initialCode: `// 1. Maak een webhook endpoint in N8N of Make.com.
// 2. Gebruik Postman om een POST request te sturen met een simpele JSON body.
// 3. Voeg een actie toe om de ontvangen data te loggen of naar een Google Sheet te schrijven.
// 4. Verifieer dat de data correct wordt verwerkt.
`,
      hints: [
        'Begin met een simpele workflow om de basis te begrijpen.',
        'Gebruik de `Listen for Test Event` feature in N8N om je webhook te debuggen.',
        'In Make.com, gebruik `Run once` om het scenario te testen.'
      ]
    }
  ],
  resources: [
    {
      title: 'Postman - API Platform',
      url: 'https://www.postman.com/',
      type: 'tool'
    },
    {
      title: 'Ngrok - Secure Tunnels to Localhost',
      url: 'https://ngrok.com/',
      type: 'tool'
    }
  ]
};