import type { Lesson } from '@/lib/data/courses';

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Je eerste automation bouwen',
  duration: '30 min',
  content: `
# Je eerste automation bouwen

## Van idee naar werkende automation

Vandaag bouwen we samen je eerste echte automation: een systeem dat nieuwe contactformulier inzendingen automatisch verwerkt. Dit is een perfecte starter automation omdat het praktisch is en alle basis concepten bevat.

## Wat gaan we bouwen?

**De "Contact Form Pro" automation:**
1. Ontvangt formulier inzendingen
2. Valideert de data
3. Stuurt een bevestigingsmail
4. Slaat contact op in spreadsheet/CRM
5. Notificeert je team via Slack/email

## Stap 1: Planning en voorbereiding

### Benodigdheden checklist:
- [ ] N8N of Make account
- [ ] Email account (Gmail, Outlook, of SMTP)
- [ ] Google Sheets of Airtable account
- [ ] Slack workspace (optioneel)
- [ ] Test email adres

### Teken je workflow:
Voordat je begint met bouwen, schets je automation op papier:
\`\`\`
[Webhook] → [Validate] → [Send Email] → [Save Contact] → [Notify Team]
     ↓           ↓             ↓               ↓              ↓
  Trigger    Check data    Thank you      Spreadsheet    Slack/Email
\`\`\`

## Stap 2: De trigger opzetten

### In N8N:
1. Sleep een **Webhook** node naar je canvas
2. Configureer:
   - HTTP Method: POST
   - Path: \`contact-form\`
   - Response Mode: "On Received"
   - Response Code: 200
   - Response Data: "First Entry JSON"

3. Kopieer je webhook URL (bijvoorbeeld: \`https://your-n8n.com/webhook/contact-form\`)

### In Make:
1. Voeg een **Webhooks > Custom webhook** module toe
2. Klik "Add" om een nieuwe webhook te maken
3. Naam: "Contact Form Submissions"
4. Kopieer de gegenereerde URL

## Stap 3: Data structuur bepalen

Test je webhook met deze sample data:
\`\`\`json
{
  "name": "Jan Jansen",
  "email": "jan@example.com",
  "company": "Voorbeeld BV",
  "phone": "+31612345678",
  "message": "Ik ben geïnteresseerd in jullie diensten.",
  "source": "website",
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

## Stap 4: Validatie toevoegen

### N8N validatie:
\`\`\`javascript
// In een Function node
const required = ['name', 'email', 'message'];
const data = items[0].json;
const errors = [];

// Check verplichte velden
required.forEach(field => {
  if (!data[field] || data[field].trim() === '') {
    errors.push(\`\${field} is verplicht\`);
  }
});

// Valideer email
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
if (data.email && !emailRegex.test(data.email)) {
  errors.push('Ongeldig email adres');
}

// Als er errors zijn, stop de workflow
if (errors.length > 0) {
  throw new Error('Validatie mislukt: ' + errors.join(', '));
}

// Anders, ga door met de validated data
return [{
  json: {
    ...data,
    validated: true,
    processedAt: new Date().toISOString()
  }
}];
\`\`\`

### Make validatie:
Gebruik een **Router** module met filters:
- Route 1: Email contains "@" AND name is not empty
- Route 2: Error handling pad

## Stap 5: Bevestigingsmail versturen

### Email template:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f4f4f4; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bedankt voor je bericht!</h1>
        </div>
        <div class="content">
            <p>Beste {{name}},</p>
            <p>We hebben je bericht in goede orde ontvangen. Ons team neemt binnen 24 uur contact met je op.</p>
            <p><strong>Je bericht:</strong><br>{{message}}</p>
            <p>Met vriendelijke groet,<br>Het Team</p>
        </div>
        <div class="footer">
            <p>Dit is een automatisch gegenereerd bericht.</p>
        </div>
    </div>
</body>
</html>
\`\`\`

## Stap 6: Contact opslaan

### Google Sheets integratie:
1. Maak een spreadsheet met kolommen:
   - Timestamp
   - Name
   - Email
   - Company
   - Phone
   - Message
   - Source
   - Status

2. In N8N: Gebruik **Google Sheets** node
   - Operation: Append
   - Document ID: [je sheet ID]
   - Sheet Name: "Contacts"

3. In Make: Gebruik **Google Sheets > Add a Row** module

## Stap 7: Team notificatie

### Slack notificatie:
\`\`\`json
{
  "channel": "#sales",
  "text": "Nieuw contact via website!",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Nieuwe lead ontvangen*\\n*Naam:* {{name}}\\n*Email:* {{email}}\\n*Bedrijf:* {{company}}"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Bericht:*\\n{{message}}"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Open in CRM"
          },
          "url": "https://your-crm.com/contacts/{{email}}"
        }
      ]
    }
  ]
}
\`\`\`

## Stap 8: Error handling toevoegen

### Best practices:
1. **Try-Catch blocks**: Vang errors op
2. **Fallback routes**: Alternatieve paden bij fouten
3. **Error notifications**: Alert jezelf bij problemen
4. **Logging**: Bewaar alle events voor debugging

### Error notification template:
\`\`\`javascript
// N8N Error workflow
const error = \$items("Catch")[0].json.error;
const workflow = \$workflow.name;
const time = new Date().toLocaleString('nl-NL');

return [{
  json: {
    subject: \`[URGENT] Automation Error: \${workflow}\`,
    message: \`
Error opgetreden in workflow: \${workflow}
Tijd: \${time}
Error: \${error.message}
Stack: \${error.stack}

Check de logs voor meer details.
    \`,
    priority: 'high'
  }
}];
\`\`\`

## Stap 9: Testen en optimaliseren

### Test checklist:
- [ ] Verstuur 5 test submissions
- [ ] Test met ontbrekende velden
- [ ] Test met ongeldige email
- [ ] Check of emails aankomen
- [ ] Verifieer spreadsheet entries
- [ ] Controleer Slack notifications

### Performance tips:
1. **Webhook response**: Stuur direct een 200 OK
2. **Async processing**: Gebruik queues voor zware taken
3. **Rate limiting**: Voorkom spam met throttling
4. **Monitoring**: Set up uptime checks

## Complete workflow export

### N8N workflow:
[Download complete workflow JSON](https://example.com/contact-form-workflow.json)

### Make blueprint:
[Download Make blueprint](https://example.com/contact-form-blueprint.json)

## Volgende stappen

Nu je eerste automation draait, kun je uitbreiden met:
- Lead scoring op basis van bedrijfsgrootte
- Automatische CRM taak aanmaken
- Integratie met calendar voor follow-up
- A/B testing van email templates
- Analytics dashboard voor conversies
  `,
  codeExamples: [
    {
      id: 'code-1-4-1',
      title: 'Complete N8N workflow code',
      language: 'json',
      code: `{
  "name": "Contact Form Pro",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "contact-form",
        "responseMode": "onReceived",
        "responseCode": 200,
        "responseData": "firstEntryJson"
      },
      "name": "Contact Form Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "contact-form-webhook"
    },
    {
      "parameters": {
        "functionCode": "// Data validation\\nconst required = ['name', 'email', 'message'];\\nconst data = items[0].json;\\nconst errors = [];\\n\\nrequired.forEach(field => {\\n  if (!data[field]) errors.push(\`Missing \${field}\`);\\n});\\n\\nif (errors.length > 0) {\\n  throw new Error(errors.join(', '));\\n}\\n\\nreturn items;"
      },
      "name": "Validate Data",
      "type": "n8n-nodes-base.function",
      "position": [450, 300]
    },
    {
      "parameters": {
        "fromEmail": "noreply@company.com",
        "toEmail": "={{\$json[\\"email\\"]}}",
        "subject": "Bedankt voor je bericht!",
        "emailType": "html",
        "htmlBody": "<h1>Bedankt {{\$json[\\"name\\"]}}!</h1><p>We hebben je bericht ontvangen.</p>"
      },
      "name": "Send Confirmation Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Contact Form Webhook": {
      "main": [[{"node": "Validate Data", "type": "main", "index": 0}]]
    },
    "Validate Data": {
      "main": [[{"node": "Send Confirmation Email", "type": "main", "index": 0}]]
    }
  }
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-4-1',
      title: 'Bouw de complete Contact Form automation',
      description: 'Implementeer de volledige workflow inclusief alle 5 stappen. Test met minimaal 10 inzendingen en documenteer eventuele problemen.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// 1. Zet de webhook trigger op.
// 2. Voeg data validatie toe.
// 3. Configureer de bevestigingsmail.
// 4. Sla de data op in een Google Sheet.
// 5. Stuur een notificatie naar Slack.
`,
      hints: [
        'Gebruik de `Test` knop in N8N/Make om elke stap te debuggen.',
        'Maak een aparte sheet voor testdata.',
        'Gebruik een test-kanaal in Slack voor de notificaties.'
      ]
    },
    {
      id: 'assignment-1-4-2',
      title: 'Voeg een extra feature toe',
      description: 'Breid je automation uit met één extra feature: lead scoring, auto-reply variaties op basis van tijd, of integratie met een extra tool.',
      difficulty: 'hard',
      type: 'project',
      initialCode: `// Kies een van de volgende features om toe te voegen:

// A. Lead Scoring:
//    - Geef een score op basis van bedrijfsgrootte of email domein.
//    - Sla de score op in de spreadsheet.

// B. Auto-reply variaties:
//    - Stuur een andere email buiten kantooruren.

// C. Extra tool integratie:
//    - Voeg de contactpersoon toe aan een mailinglijst (bijv. Mailchimp).
`,
      hints: [
        'Gebruik een `IF` node of `Router` om de logica te splitsen.',
        'Je hebt mogelijk een extra API key of authenticatie nodig voor de nieuwe tool.',
        'Documenteer de nieuwe feature in je workflow.'
      ]
    }
  ],
  resources: [
    {
      title: 'Webhook testing tool',
      url: 'https://webhook.site/',
      type: 'tool'
    },
    {
      title: 'Email HTML templates',
      url: 'https://github.com/leemunroe/responsive-html-email-template',
      type: 'code'
    }
  ]
};