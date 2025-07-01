import { Lesson } from '@/lib/data/courses'

export const lesson1_3: Lesson = {
  id: 'lesson-1-3',
  title: 'Filters en conditional routing',
  duration: '30 min',
  content: `
# Filters en conditional routing

In deze les duiken we diep in geavanceerde filtertechnieken en dynamische routing binnen workflows. Je leert hoe je complexe condities opstelt en hoe je workflows kunt laten reageren op verschillende scenario's.

## Advanced filter techniques

### Meerdere conditielagen
Filters in moderne workflow tools kunnen veel meer dan simpele if-then statements. Je kunt complexe filterlogica bouwen met:

- **AND/OR operatoren**: Combineer meerdere condities
- **Nested filters**: Filters binnen filters voor complexe beslisbomen
- **Array filtering**: Filter specifieke items uit lijsten
- **Regular expressions**: Pattern matching voor tekst

### Praktijkvoorbeeld: Lead scoring
\`\`\`javascript
// Filter leads op basis van meerdere criteria
if (lead.score > 80 && 
    (lead.source === 'website' || lead.source === 'webinar') &&
    lead.country === 'Netherlands') {
    // Route naar sales team
} else if (lead.score > 50 && lead.hasDownload) {
    // Route naar nurturing campagne
} else {
    // Route naar algemene nieuwsbrief
}
\`\`\`

## Dynamic routing

### Route bepaling op runtime
In plaats van vaste routes, kun je de bestemming van data dynamisch bepalen:

1. **Lookup tables**: Gebruik externe data om routes te bepalen
2. **Calculated routes**: Bereken de route op basis van inputdata
3. **Time-based routing**: Route op basis van tijd of datum
4. **Load balancing**: Verdeel werk over meerdere routes

### Implementatie met n8n
\`\`\`json
{
  "nodes": [
    {
      "name": "Dynamic Router",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "dataType": "expression",
        "value1": "={{\$json.priority}}{{\$json.department}}",
        "rules": {
          "rules": [
            {
              "value2": "highsales",
              "output": 0
            },
            {
              "value2": "highsupport",
              "output": 1
            },
            {
              "value2": "=~/medium.*/",
              "output": 2
            }
          ]
        }
      }
    }
  ]
}
\`\`\`

## Complex conditions

### Multi-variabele beslissingen
Bouw beslissingslogica die rekening houdt met meerdere variabelen tegelijk:

- **Weighted scoring**: Geef verschillende gewichten aan condities
- **Threshold logic**: Werk met drempelwaarden
- **State machines**: Hou rekening met de huidige staat
- **Historical context**: Gebruik eerdere beslissingen

### Best practices
1. **Documenteer je logica**: Complexe filters worden snel onleesbaar
2. **Test edge cases**: Wat gebeurt er bij onverwachte input?
3. **Gebruik helper functies**: Splits complexe logica op
4. **Monitor performance**: Complexe filters kunnen traag worden

## Oefening: Bouw een intelligent ticket routing systeem
Implementeer een systeem dat support tickets automatisch routeert op basis van:
- Urgentie (1-5 schaal)
- Type probleem (technisch, billing, algemeen)
- Klant tier (free, pro, enterprise)
- Beschikbaarheid support team
- Historische response tijden
        `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'Advanced filter met multiple conditions',
      language: 'javascript',
      code: `// n8n Function node voor complexe filtering
const items = $input.all();

return items.filter(item => {
  const data = item.json;
  
  // Complex filter logic
  const priorityCheck = data.priority >= 3;
  const categoryCheck = ['urgent', 'critical'].includes(data.category);
  const timeCheck = new Date(data.created).getHours() >= 9 && 
                    new Date(data.created).getHours() <= 17;
  
  // Combine conditions with weights
  const score = (priorityCheck ? 40 : 0) + 
                (categoryCheck ? 35 : 0) + 
                (timeCheck ? 25 : 0);
  
  return score >= 60; // Threshold for routing
}).map(item => ({
  json: {
    ...item.json,
    routingScore: calculateScore(item.json),
    suggestedRoute: determineRoute(item.json)
  }
}));

function calculateScore(data) {
  // Implementatie van scoring logica
}

function determineRoute(data) {
  // Implementatie van route bepaling
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-1-3-1',
      title: 'Intelligent Email Sorter',
      description: 'Bouw een workflow die inkomende emails automatisch sorteert en routeert op basis van afzender, onderwerp, en content. Gebruik regex patterns en multi-level filtering.',
      difficulty: 'medium',
      type: 'project',
      initialCode: `// Input: { from: '...', subject: '...', body: '...' }

// 1. Filter op afzender (bijv. specifieke domeinen)
// 2. Filter op onderwerp (bijv. keywords als 'factuur', 'klacht')
// 3. Gebruik regex om ordernummers of klant-IDs uit de body te halen
// 4. Routeer naar verschillende mappen of stuur notificaties op basis van de filters
`,
      hints: [
        'Gebruik de Email Trigger node in N8N.',
        'Combineer meerdere condities in je filters voor nauwkeurigheid.',
        'Test met verschillende soorten emails om je logica te verfijnen.'
      ]
    }
  ],
  resources: [
    {
      title: 'n8n Switch Node Documentation',
      url: 'https://docs.n8n.io/nodes/n8n-nodes-base.switch/',
      type: 'documentation'
    },
    {
      title: 'Regular Expressions Guide',
      url: 'https://regexr.com/',
      type: 'tool'
    }
  ]
}