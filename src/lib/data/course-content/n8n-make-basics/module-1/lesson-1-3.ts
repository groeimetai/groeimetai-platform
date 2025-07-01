import type { Lesson } from '@/lib/data/courses';

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'N8N vs Make: Welke tool wanneer?',
  duration: '20 min',
  content: `
# N8N vs Make: Welke tool wanneer gebruiken?

## De automation tool dilemma

Beide N8N en Make (voorheen Integromat) zijn krachtige automation platforms, maar ze hebben verschillende sterktes. Het kiezen van de juiste tool kan het verschil maken tussen een soepele implementatie en onnodige hoofdpijn.

## N8N: De open-source krachtpatser

### Wanneer kies je N8N?

**1. Je hebt technische controle nodig**
- Self-hosted optie voor maximale privacy
- Aangepaste nodes kunnen worden gebouwd
- Directe database toegang mogelijk
- Geen limieten op executions (self-hosted)

**2. Complex data processing**
- JavaScript code nodes voor geavanceerde logica
- Bulk operaties en loops
- Custom API integraties
- Data transformaties met volledige programmeer vrijheid

**3. Budget bewust**
- Gratis self-hosted versie
- Geen betaling per operation
- Schaalbaar zonder extra kosten

### N8N nadelen
- Steilere leercurve
- Minder voorgebouwde integraties
- Zelf onderhoud bij self-hosting
- Minder visueel gepolijst

## Make: De gebruiksvriendelijke alleskunner

### Wanneer kies je Make?

**1. Snelle implementatie gewenst**
- 1000+ kant-en-klare app integraties
- Geen technische setup nodig
- Intuïtieve drag-and-drop interface
- Uitgebreide templates bibliotheek

**2. Team collaboration**
- Gedeelde scenarios
- Versie geschiedenis
- Team permissies
- Ingebouwde documentatie

**3. Betrouwbaarheid cruciaal**
- 99.9% uptime SLA
- Automatische error handling
- Ingebouwde retry mechanismes
- Professionele support

### Make nadelen
- Betaald per operation
- Minder flexibiliteit in custom code
- Vendor lock-in
- Kosten kunnen snel oplopen

## Directe vergelijking

| Feature | N8N | Make |
|---------|-----|------|
| **Pricing model** | Gratis (self-hosted) of SaaS | Pay-per-operation |
| **Aantal integraties** | 350+ | 1000+ |
| **Custom code** | ✅ Volledig JavaScript | ⚠️ Beperkt |
| **Learning curve** | Steil | Geleidelijk |
| **Self-hosting** | ✅ Ja | ❌ Nee |
| **Visual editor** | Goed | Uitstekend |
| **Error handling** | Manual setup | Automatisch |
| **Webhooks** | Onbeperkt | Limiet per plan |
| **Team features** | Basic | Uitgebreid |
| **Templates** | Community | Professioneel |

## Use case scenarios

### Scenario 1: E-commerce automation
**Requirement**: Order processing, inventory sync, email notifications

**Beste keuze: Make**
- Shopify, WooCommerce integraties out-of-the-box
- Betrouwbare email delivery
- Geen technische maintenance

### Scenario 2: Data pipeline voor analytics
**Requirement**: Database queries, complex transformaties, custom dashboards

**Beste keuze: N8N**
- Direct database access
- JavaScript voor complexe berekeningen
- Geen limieten op data volume

### Scenario 3: Marketing automation bureau
**Requirement**: Meerdere klanten, verschillende workflows, white-label

**Beste keuze: N8N (self-hosted)**
- Geen per-client kosten
- Volledige controle en customization
- White-label mogelijkheden

### Scenario 4: HR onboarding process
**Requirement**: Google Workspace, Slack, HR tools integratie

**Beste keuze: Make**
- Alle tools direct beschikbaar
- IT team niet nodig
- Compliance certificeringen

## Hybride aanpak

Sommige organisaties gebruiken beide tools:

1. **Make voor business-critical flows**
   - Customer-facing automations
   - Financial processes
   - Compliance-gevoelige workflows

2. **N8N voor interne tools**
   - Data processing
   - Development workflows
   - Experimental automations

## Migratie overwegingen

### Van Make naar N8N:
\`\`\`javascript
// Make webhook data structuur
{
  "bundle": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}

// N8N equivalent
{
  "body": {
    "name": "John Doe", 
    "email": "john@example.com"
  }
}
\`\`\`

### Van N8N naar Make:
- Exporteer workflows als JSON
- Map node types naar Make modules
- Rebuild expressions in Make syntax
- Test thoroughly met kleine datasets

## Decision framework

Stel jezelf deze vragen:

1. **Budget**: Eenmalig vs doorlopend?
2. **Team**: Technisch vs non-technisch?
3. **Schaal**: 100 vs 100.000 operations/maand?
4. **Integraties**: Standard vs custom?
5. **Support**: Community vs professioneel?
6. **Compliance**: Data locatie belangrijk?

## Eindadvies

**Kies N8N als:**
- Je een technisch team hebt
- Budget belangrijker is dan convenience
- Je custom integraties nodig hebt
- Data privacy cruciaal is

**Kies Make als:**
- Snelheid van implementatie prioriteit is
- Je veel standard integraties gebruikt
- Non-tech team de tool moet beheren
- Enterprise support gewenst is
  `,
  codeExamples: [
    {
      id: 'code-1-3-1',
      title: 'Vergelijkbare workflow in beide tools',
      language: 'javascript',
      code: `// N8N Implementation
{
  "nodes": [{
    "name": "Webhook",
    "type": "n8n-nodes-base.webhook",
    "parameters": {
      "path": "new-order"
    }
  }, {
    "name": "Transform Data",
    "type": "n8n-nodes-base.function",
    "parameters": {
      "functionCode": "return [{json: {
        orderId: items[0].json.id,
        customer: items[0].json.customer_email,
        total: items[0].json.total_price
      }}];"
    }
  }]
}

// Make Equivalent
{
  "modules": [{
    "type": "webhook",
    "name": "New Order Webhook"
  }, {
    "type": "util:SetVariables",
    "parameters": {
      "orderId": "{{1.id}}",
      "customer": "{{1.customer_email}}",
      "total": "{{1.total_price}}"
    }
  }]
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-3-1',
      title: 'Tool selectie oefening',
      description: 'Analyseer 3 automation scenarios uit je eigen organisatie. Bepaal voor elk scenario welke tool (N8N of Make) het beste past en documenteer je reasoning.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Scenario 1: ...
// Scenario 2: ...
// Scenario 3: ...

// Voor elk scenario, beantwoord:
// - Welke tool kies je?
// - Waarom is deze tool de beste keuze?
// - Wat zijn de mogelijke nadelen van je keuze?
`,
      hints: [
        'Gebruik het decision framework uit de les.',
        'Denk aan factoren zoals budget, technische kennis, en schaalbaarheid.',
        'Er is niet altijd één juist antwoord, de beargumentatie is het belangrijkst.'
      ]
    },
    {
      id: 'assignment-1-3-2',
      title: 'Kosten calculator',
      description: 'Bereken de maandelijkse kosten voor een workflow die 10.000 operations per maand draait in beide tools. Include hosting kosten voor N8N.',
      difficulty: 'easy',
      type: 'project',
      initialCode: `// Aannames:
// - N8N self-hosted op een $10/maand server.
// - Make.com op het Pro plan.

// Bereken de kosten voor N8N.
// Bereken de kosten voor Make.com.
// Vergelijk de resultaten.
`,
      hints: [
        'Bekijk de actuele prijzen op de websites van N8N en Make.com.',
        'Vergeet niet de kosten voor data transfer en opslag mee te nemen bij self-hosting.'
      ]
    }
  ],
  resources: [
    {
      title: 'N8N vs Make detailed comparison',
      url: 'https://n8n.io/blog/n8n-vs-zapier-vs-make/',
      type: 'article'
    },
    {
      title: 'Make pricing calculator',
      url: 'https://www.make.com/en/pricing',
      type: 'tool'
    }
  ]
};