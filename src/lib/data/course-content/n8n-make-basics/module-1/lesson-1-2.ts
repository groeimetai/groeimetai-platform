import type { Lesson } from '@/lib/data/courses';

export const lesson1_2: Lesson = {
  id: 'lesson-1-2',
  title: 'Acties begrijpen en data transformeren',
  duration: '25 min',
  content: `
# Acties begrijpen en data transformeren

## Acties: De bouwblokken van je automation

Als triggers de startknop zijn, dan zijn **acties** de taken die je automation uitvoert. Denk aan acties als de individuele stappen in een recept - elke stap brengt je dichter bij het eindresultaat.

## Soorten acties

### 1. **Data ophalen (GET)**
Informatie verzamelen uit systemen.

**Voorbeelden:**
- Klantgegevens ophalen uit CRM
- Laatste tweets van een account lezen
- Producten uit webshop inventaris checken

### 2. **Data versturen (POST/PUT)**
Nieuwe informatie toevoegen of bestaande updaten.

**Voorbeelden:**
- Nieuwe lead toevoegen aan CRM
- Email versturen
- Factuur aanmaken

### 3. **Data transformeren**
Informatie omzetten naar het juiste formaat.

**Voorbeelden:**
- CSV naar JSON converteren
- Datums formatteren
- Tekst vertalen

### 4. **Beslissingen nemen (Conditionals)**
Verschillende paden kiezen op basis van data.

**Voorbeelden:**
- Als klant VIP is → premium service
- Als bedrag > €1000 → manager goedkeuring

## Data transformatie in detail

### Waarom is transformatie belangrijk?
Verschillende systemen "spreken" verschillende talen. Je CRM verwacht misschien "Jan Jansen" terwijl je email tool "firstname: Jan, lastname: Jansen" nodig heeft.

### N8N Set node configuratie:
\`\`\`json
{
  "nodes": [
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "fullName",
              "value": "={{\$json[\\"first_name\\"]}} {{\$json[\\"last_name\\"]}}"
            },
            {
              "name": "emailLowercase",
              "value": "={{\$json[\\"email\\"].toLowerCase()}}"
            }
          ],
          "number": [
            {
              "name": "totalAmount",
              "value": "={{\$json[\\"price\\"] * \$json[\\"quantity\\"]}}"
            }
          ]
        }
      },
      "name": "Transform Customer Data",
      "type": "n8n-nodes-base.set"
    }
  ]
}
\`\`\`

### Make Transform configuratie:
\`\`\`json
{
  "module": "util:SetVariables",
  "parameters": {
    "variables": [
      {
        "name": "customerFullName",
        "value": "{{1.firstName}} {{1.lastName}}"
      },
      {
        "name": "orderDate",
        "value": "{{formatDate(now; \\"DD-MM-YYYY\\")}}"
      },
      {
        "name": "isVIP",
        "value": "{{if(1.totalOrders > 10; true; false)}}"
      }
    ]
  }
}
\`\`\`

## Veelgebruikte transformatie patronen

### 1. **Tekst manipulatie**
\`\`\`javascript
// Hoofdletters eerste letter
const capitalized = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

// Email domein extraheren
const domain = email.split('@')[1];

// Telefoonnummer formatteren
const formatted = phone.replace(/(\\d{2})(\\d{8})/, '+31 $1 $2');
\`\`\`

### 2. **Datum en tijd**
\`\`\`javascript
// Huidige datum in NL formaat
const today = new Date().toLocaleDateString('nl-NL');

// Datum 7 dagen in de toekomst
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

// Werkdagen berekenen
function addWorkdays(startDate, days) {
  let date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      added++;
    }
  }
  return date;
}
\`\`\`

### 3. **Arrays en lijsten**
\`\`\`javascript
// Items filteren
const activeUsers = users.filter(user => user.status === 'active');

// Prijzen optellen
const total = items.reduce((sum, item) => sum + item.price, 0);

// Unieke waarden
const uniqueEmails = [...new Set(emails)];
\`\`\`

## Best practices voor acties

1. **Houd het simpel**: Één actie = één duidelijke taak
2. **Valideer altijd**: Check of data bestaat voordat je het gebruikt
3. **Error handling**: Plan wat er gebeurt als een actie faalt
4. **Logging**: Documenteer belangrijke transformaties
5. **Test met echte data**: Gebruik realistische testdata

## Actie ketens bouwen

Een goede automation bestaat uit een logische keten van acties:

1. **Trigger**: Nieuw contactformulier
2. **Validatie**: Check verplichte velden
3. **Transformatie**: Format data voor CRM
4. **Actie 1**: Maak contact in CRM
5. **Actie 2**: Stuur welkomstmail
6. **Actie 3**: Notificatie naar sales team
7. **Logging**: Registreer succesvolle verwerking
  `,
  codeExamples: [
    {
      id: 'example-1-2-1',
      title: 'Complete data transformatie workflow',
      language: 'javascript',
      code: `// N8N Function node voor order verwerking
const orders = items.map(item => {
  const order = item.json;
  
  // Bereken totalen
  const subtotal = order.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.21; // 21% BTW
  const total = subtotal + tax;
  
  // Format voor factuur systeem
  return {
    json: {
      invoice: {
        number: \`INV-\${new Date().getFullYear()}-\${order.orderId}\`,
        date: new Date().toISOString(),
        customer: {
          name: \`\${order.customer.firstName} \${order.customer.lastName}\`,
          email: order.customer.email.toLowerCase(),
          address: {
            street: order.shipping.street,
            city: order.shipping.city,
            postalCode: order.shipping.postalCode,
            country: 'Nederland'
          }
        },
        lines: order.items.map(item => ({
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity
        })),
        totals: {
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100
        },
        status: total > 1000 ? 'requires_approval' : 'auto_approved'
      }
    }
  };
});

return orders;`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-2-1',
      title: 'Bouw een data transformatie flow',
      description: 'Maak een workflow die contactformulier data ontvangt en transformeert naar CRM-formaat. Inclusief: naam splitsen, email lowercase maken, en datum toevoegen.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Input: { "fullName": "Jan Jansen", "email": "Jan.Jansen@EXAMPLE.com" }

// 1. Splits de naam in voor- en achternaam.
// 2. Maak het emailadres lowercase.
// 3. Voeg een veld toe met de huidige datum.
// Output: { "firstName": "Jan", "lastName": "Jansen", "email": "jan.jansen@example.com", "createdAt": "..." }
`,
      hints: [
        'Gebruik de `split()` functie om de naam te splitsen.',
        'Gebruik de `toLowerCase()` functie voor het emailadres.',
        'Gebruik `new Date().toISOString()` om de huidige datum toe te voegen.'
      ]
    },
    {
      id: 'assignment-1-2-2',
      title: 'Conditionele acties toevoegen',
      description: 'Breid je workflow uit met een IF-statement: als email eindigt op @company.com, tag als "Enterprise", anders als "Regular".',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Input: { "email": "test@company.com" }

// 1. Gebruik een IF-node (N8N) of een Router (Make) om de conditie te checken.
// 2. Conditie: \`email.endsWith('@company.com')\`
// 3. Voeg een \`tag\` veld toe met de juiste waarde.
`,
      hints: [
        'De `endsWith()` functie is een handige manier om het domein te checken.',
        'Zorg voor een default pad voor emails die niet aan de conditie voldoen.'
      ]
    }
  ],
  resources: [
    {
      title: 'N8N Expressions documentatie',
      url: 'https://docs.n8n.io/code-examples/expressions/',
      type: 'documentation'
    },
    {
      title: 'Make Data transformation guide',
      url: 'https://www.make.com/en/help/functions/general-functions',
      type: 'guide'
    }
  ]
};