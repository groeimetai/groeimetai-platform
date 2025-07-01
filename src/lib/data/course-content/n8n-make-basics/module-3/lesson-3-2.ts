import type { Lesson } from '@/lib/data/courses';

export const lesson3_2: Lesson = {
  id: 'lesson-3-2',
  title: 'Conditional Branching & Decision Trees',
  duration: '75 min',
  content: `
# Conditional Branching & Decision Trees in N8N

## Introductie

In deze les leren we hoe je complexe beslisbomen bouwt in N8N met IF en Switch nodes. We behandelen drie complete workflows die je direct kunt downloaden en gebruiken in je eigen N8N omgeving. Alle voorbeelden gebruiken Nederlandse business scenarios met realistische data.

## Workflow 1: Nederlandse Factuur Processing met BTW Routing

Deze workflow automatiseert het verwerken van inkomende facturen met intelligente BTW routing gebaseerd op Nederlandse belastingregels.

### Complete Workflow JSON

\`\`\`json
{
  "name": "Nederlandse Factuur BTW Router",
  "nodes": [
    {
      "parameters": {
        "path": "invoice-webhook",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Invoice Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json[\"leverancier\"][\"land\"]}}",
              "value2": "NL"
            }
          ]
        }
      },
      "id": "check-dutch-supplier",
      "name": "Nederlandse Leverancier?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "dataPropertyName": "btwPercentage",
        "rules": {
          "rules": [
            {
              "operation": "equals",
              "output": 0,
              "value": 0
            },
            {
              "operation": "equals",
              "output": 1,
              "value": 9
            },
            {
              "operation": "equals",
              "output": 2,
              "value": 21
            }
          ]
        },
        "fallbackOutput": 3
      },
      "id": "btw-switch",
      "name": "BTW Percentage Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [650, 200]
    },
    {
      "parameters": {
        "functionCode": "// Valideer Nederlandse factuur\nconst factuur = $input.first().json;\nconst errors = [];\n\n// Valideer BTW nummer\nconst btwRegex = /^NL[0-9]{9}B[0-9]{2}$/;\nif (!btwRegex.test(factuur.leverancier.btwNummer)) {\n  errors.push('Ongeldig BTW nummer');\n}\n\n// Valideer factuur totaal\nlet berekendTotaal = 0;\nfor (const regel of factuur.regels) {\n  const regelTotaal = regel.aantal * regel.prijsPerStuk;\n  const btwBedrag = regelTotaal * (regel.btwPercentage / 100);\n  berekendTotaal += regelTotaal + btwBedrag;\n}\n\nif (Math.abs(berekendTotaal - factuur.totaalBedrag) > 0.01) {\n  errors.push('Factuur totaal klopt niet');\n}\n\n// Bepaal BTW routing\nlet btwCategorie = 'standaard';\nif (factuur.productType === 'voedsel') {\n  btwCategorie = 'verlaagd';\n} else if (factuur.productType === 'export') {\n  btwCategorie = 'vrijgesteld';\n}\n\nreturn [{\n  json: {\n    ...factuur,\n    validatie: {\n      geldig: errors.length === 0,\n      errors: errors\n    },\n    btwCategorie: btwCategorie,\n    verwerkingsDatum: new Date().toISOString()\n  }\n}];"
      },
      "id": "validate-invoice",
      "name": "Valideer Factuur",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [650, 350]
    },
    {
      "parameters": {
        "content": "## BTW 0% - Vrijgesteld\n\nVerwerk facturen zonder BTW:\n- Export buiten EU\n- Medische diensten\n- Onderwijs",
        "height": 150,
        "width": 250
      },
      "id": "note-0-btw",
      "name": "0% BTW Processing",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [900, 50]
    },
    {
      "parameters": {
        "functionCode": "// Process 0% BTW facturen\nconst factuur = $input.first().json;\n\nreturn [{\n  json: {\n    ...factuur,\n    verwerking: {\n      type: 'BTW_VRIJGESTELD',\n      boeking: {\n        grootboek: '8000', // Omzet vrijgesteld\n        kostenplaats: factuur.kostenplaats || '000',\n        btw: 0,\n        netto: factuur.totaalBedrag\n      },\n      goedkeuring: 'automatisch',\n      datum: new Date().toISOString()\n    }\n  }\n}];"
      },
      "id": "process-0-btw",
      "name": "Process 0% BTW",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1100, 100]
    },
    {
      "parameters": {
        "functionCode": "// Process 9% BTW facturen (verlaagd tarief)\nconst factuur = $input.first().json;\n\nreturn [{\n  json: {\n    ...factuur,\n    verwerking: {\n      type: 'BTW_VERLAAGD',\n      boeking: {\n        grootboek: '8100', // Omzet verlaagd tarief\n        kostenplaats: factuur.kostenplaats || '000',\n        btw: factuur.totaalBedrag * 0.09 / 1.09,\n        netto: factuur.totaalBedrag / 1.09\n      },\n      controle: {\n        productCategorie: ['voedsel', 'boeken', 'medicijnen'],\n        geldig: ['voedsel', 'boeken', 'medicijnen'].includes(factuur.productType)\n      },\n      datum: new Date().toISOString()\n    }\n  }\n}];"
      },
      "id": "process-9-btw",
      "name": "Process 9% BTW",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1100, 250]
    },
    {
      "parameters": {
        "functionCode": "// Process 21% BTW facturen (standaard tarief)\nconst factuur = $input.first().json;\n\nreturn [{\n  json: {\n    ...factuur,\n    verwerking: {\n      type: 'BTW_HOOG',\n      boeking: {\n        grootboek: '8200', // Omzet hoog tarief\n        kostenplaats: factuur.kostenplaats || '000',\n        btw: factuur.totaalBedrag * 0.21 / 1.21,\n        netto: factuur.totaalBedrag / 1.21\n      },\n      datum: new Date().toISOString()\n    }\n  }\n}];"
      },
      "id": "process-21-btw",
      "name": "Process 21% BTW",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1100, 400]
    },
    {
      "parameters": {
        "functionCode": "// Error handler voor ongeldige BTW percentages\nconst factuur = $input.first().json;\n\nreturn [{\n  json: {\n    error: true,\n    message: 'Ongeldig BTW percentage',\n    factuur: factuur,\n    suggestie: 'Controleer BTW percentage en productcategorie',\n    datum: new Date().toISOString()\n  }\n}];"
      },
      "id": "btw-error-handler",
      "name": "BTW Error Handler",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1100, 550]
    },
    {
      "parameters": {
        "resource": "database",
        "operation": "insert",
        "table": "processed_invoices",
        "columns": "factuur_nummer,leverancier,btw_percentage,totaal_bedrag,verwerkt_op",
        "options": {}
      },
      "id": "save-to-database",
      "name": "Save to Database",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2,
      "position": [1350, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json[\"validatie\"][\"geldig\"]}}",
              "value2": true
            }
          ]
        }
      },
      "id": "validation-check",
      "name": "Validatie OK?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 500]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "resource": "messageCompose",
        "recipient": "finance@company.nl",
        "subject": "Factuur Validatie Fout",
        "messageType": "html",
        "message": "<h3>Factuur validatie mislukt</h3>\n<p>Factuur: {{$json[\"factuurNummer\"]}}</p>\n<p>Fouten: {{$json[\"validatie\"][\"errors\"].join(', ')}}</p>",
        "options": {}
      },
      "id": "send-error-email",
      "name": "Email Error Alert",
      "type": "n8n-nodes-base.microsoftOutlook",
      "typeVersion": 2,
      "position": [700, 600]
    }
  ],
  "connections": {
    "Invoice Webhook": {
      "main": [[{"node": "Nederlandse Leverancier?", "type": "main", "index": 0}]]
    },
    "Nederlandse Leverancier?": {
      "main": [
        [{"node": "BTW Percentage Router", "type": "main", "index": 0}],
        [{"node": "Valideer Factuur", "type": "main", "index": 0}]
      ]
    },
    "BTW Percentage Router": {
      "main": [
        [{"node": "Process 0% BTW", "type": "main", "index": 0}],
        [{"node": "Process 9% BTW", "type": "main", "index": 0}],
        [{"node": "Process 21% BTW", "type": "main", "index": 0}],
        [{"node": "BTW Error Handler", "type": "main", "index": 0}]
      ]
    },
    "Process 0% BTW": {
      "main": [[{"node": "Save to Database", "type": "main", "index": 0}]]
    },
    "Process 9% BTW": {
      "main": [[{"node": "Save to Database", "type": "main", "index": 0}]]
    },
    "Process 21% BTW": {
      "main": [[{"node": "Save to Database", "type": "main", "index": 0}]]
    },
    "Valideer Factuur": {
      "main": [[{"node": "Validatie OK?", "type": "main", "index": 0}]]
    },
    "Validatie OK?": {
      "main": [
        [{"node": "BTW Percentage Router", "type": "main", "index": 0}],
        [{"node": "Email Error Alert", "type": "main", "index": 0}]
      ]
    }
  }
}
\`\`\`

## Workflow 2: Customer Support Ticket Routing

Deze workflow routeert support tickets automatisch naar de juiste afdeling gebaseerd op prioriteit, type en klant status.

### Complete Workflow JSON

\`\`\`json
{
  "name": "Support Ticket Router NL",
  "nodes": [
    {
      "parameters": {
        "events": ["ticket:created"],
        "additionalFields": {}
      },
      "id": "zendesk-trigger",
      "name": "New Support Ticket",
      "type": "n8n-nodes-base.zendeskTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Analyseer ticket en bepaal routing\nconst ticket = $input.first().json;\n\n// Keywords voor verschillende categorieën\nconst technicalKeywords = ['bug', 'error', 'crash', 'niet werkt', 'probleem', 'storing'];\nconst billingKeywords = ['factuur', 'betaling', 'abonnement', 'kosten', 'prijs', 'btw'];\nconst salesKeywords = ['demo', 'trial', 'aanschaf', 'kopen', 'offerte', 'korting'];\n\n// Analyseer ticket tekst\nconst content = (ticket.subject + ' ' + ticket.description).toLowerCase();\nlet category = 'general';\nlet priority = ticket.priority || 'normal';\n\n// Bepaal categorie\nif (technicalKeywords.some(keyword => content.includes(keyword))) {\n  category = 'technical';\n} else if (billingKeywords.some(keyword => content.includes(keyword))) {\n  category = 'billing';\n} else if (salesKeywords.some(keyword => content.includes(keyword))) {\n  category = 'sales';\n}\n\n// Verhoog prioriteit voor VIP klanten\nconst vipDomains = ['@enterprise.nl', '@vip-customer.com', '@partner.nl'];\nconst isVIP = vipDomains.some(domain => ticket.email.endsWith(domain));\n\nif (isVIP && priority === 'normal') {\n  priority = 'high';\n}\n\n// SLA berekening\nconst slaHours = {\n  urgent: 1,\n  high: 4,\n  normal: 24,\n  low: 48\n};\n\nconst slaDeadline = new Date();\nslaDeadline.setHours(slaDeadline.getHours() + slaHours[priority]);\n\nreturn [{\n  json: {\n    ...ticket,\n    analysis: {\n      category: category,\n      priority: priority,\n      isVIP: isVIP,\n      slaDeadline: slaDeadline.toISOString(),\n      responseTime: slaHours[priority] + ' uur'\n    }\n  }\n}];"
      },
      "id": "analyze-ticket",
      "name": "Analyze Ticket",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "dataPropertyName": "analysis.priority",
        "rules": {
          "rules": [
            {
              "operation": "equals",
              "output": 0,
              "value": "urgent"
            },
            {
              "operation": "equals",
              "output": 1,
              "value": "high"
            },
            {
              "operation": "equals",
              "output": 2,
              "value": "normal"
            },
            {
              "operation": "equals",
              "output": 3,
              "value": "low"
            }
          ]
        }
      },
      "id": "priority-router",
      "name": "Priority Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "functionCode": "// Urgent ticket handling\nconst ticket = $input.first().json;\n\nconst urgentActions = {\n  assignTo: 'senior-support-team',\n  tags: ['urgent', 'sla-1h', ticket.analysis.category],\n  customFields: {\n    escalation_level: 3,\n    auto_escalate: true,\n    notify_manager: true\n  },\n  internalNote: 'URGENT TICKET - SLA: 1 uur - Categorie: ' + ticket.analysis.category + ' - VIP Status: ' + (ticket.analysis.isVIP ? 'JA' : 'NEE')\n};\n\nreturn [{\n  json: {\n    ticketId: ticket.id,\n    actions: urgentActions,\n    notifications: [\n      {\n        type: 'slack',\n        channel: '#urgent-support',\n        message: '@channel Urgent ticket #' + ticket.id + ' van ' + ticket.email\n      },\n      {\n        type: 'sms',\n        to: '+31612345678',\n        message: 'Urgent ticket #' + ticket.id + ' requires immediate attention'\n      }\n    ]\n  }\n}];"
      },
      "id": "handle-urgent",
      "name": "Handle Urgent",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 100]
    },
    {
      "parameters": {
        "functionCode": "// HIGH priority ticket handling\nconst ticket = $input.first().json;\n\nconst highActions = {\n  assignTo: ticket.analysis.category + '-team',\n  tags: ['high-priority', 'sla-4h', ticket.analysis.category],\n  customFields: {\n    escalation_level: 2,\n    priority_reason: ticket.analysis.isVIP ? 'VIP Customer' : 'High Priority Request'\n  },\n  autoResponse: {\n    template: 'high_priority_nl',\n    variables: {\n      name: ticket.name,\n      responseTime: '4 uur',\n      ticketNumber: ticket.id\n    }\n  }\n};\n\nreturn [{\n  json: {\n    ticketId: ticket.id,\n    actions: highActions,\n    routing: {\n      team: ticket.analysis.category,\n      assignmentMethod: 'round-robin',\n      backupTeam: 'general-support'\n    }\n  }\n}];"
      },
      "id": "handle-high",
      "name": "Handle High Priority",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 250]
    },
    {
      "parameters": {
        "functionCode": "// NORMAL priority ticket handling\nconst ticket = $input.first().json;\n\n// Bepaal team based op categorie\nconst teamMapping = {\n  technical: 'tech-support-nl',\n  billing: 'finance-support-nl',\n  sales: 'sales-support-nl',\n  general: 'general-support-nl'\n};\n\nconst normalActions = {\n  assignTo: teamMapping[ticket.analysis.category],\n  tags: ['sla-24h', ticket.analysis.category],\n  customFields: {\n    escalation_level: 1,\n    expected_resolution: '1-2 werkdagen'\n  },\n  autoResponse: {\n    template: 'standard_response_nl',\n    variables: {\n      name: ticket.name,\n      responseTime: '24 uur',\n      ticketNumber: ticket.id\n    }\n  }\n};\n\nreturn [{\n  json: {\n    ticketId: ticket.id,\n    actions: normalActions,\n    workflow: 'standard'\n  }\n}];"
      },
      "id": "handle-normal",
      "name": "Handle Normal Priority",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 400]
    },
    {
      "parameters": {
        "functionCode": "// LOW priority ticket handling\nconst ticket = $input.first().json;\n\nconst lowActions = {\n  assignTo: 'ticket-pool',\n  tags: ['low-priority', 'sla-48h', ticket.analysis.category],\n  customFields: {\n    escalation_level: 0,\n    queue_position: 'end'\n  },\n  autoResponse: {\n    template: 'low_priority_nl',\n    variables: {\n      name: ticket.name,\n      responseTime: '2 werkdagen',\n      ticketNumber: ticket.id,\n      selfServiceUrl: 'https://support.company.nl/help'\n    }\n  }\n};\n\nreturn [{\n  json: {\n    ticketId: ticket.id,\n    actions: lowActions,\n    automation: {\n      suggestKBArticles: true,\n      autoCloseAfterDays: 7\n    }\n  }\n}];"
      },
      "id": "handle-low",
      "name": "Handle Low Priority",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 550]
    },
    {
      "parameters": {
        "resource": "ticket",
        "operation": "update",
        "id": "={{$json[\"ticketId\"]}}",
        "updateFields": {
          "assigneeId": "={{$json[\"actions\"][\"assignTo\"]}}",
          "tags": "={{$json[\"actions\"][\"tags\"]}}",
          "customFields": "={{$json[\"actions\"][\"customFields\"]}}"
        }
      },
      "id": "update-zendesk",
      "name": "Update Zendesk Ticket",
      "type": "n8n-nodes-base.zendesk",
      "typeVersion": 1,
      "position": [1150, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json[\"notifications\"] !== undefined}}",
              "value2": true
            }
          ]
        }
      },
      "id": "check-notifications",
      "name": "Need Notifications?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1150, 100]
    },
    {
      "parameters": {
        "resource": "channel",
        "operation": "post",
        "channel": "={{$json[\"notifications\"][0][\"channel\"]}}",
        "text": "={{$json[\"notifications\"][0][\"message\"]}}",
        "otherOptions": {}
      },
      "id": "slack-notification",
      "name": "Slack Alert",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2,
      "position": [1350, 50]
    }
  ],
  "connections": {
    "New Support Ticket": {
      "main": [[{"node": "Analyze Ticket", "type": "main", "index": 0}]]
    },
    "Analyze Ticket": {
      "main": [[{"node": "Priority Router", "type": "main", "index": 0}]]
    },
    "Priority Router": {
      "main": [
        [{"node": "Handle Urgent", "type": "main", "index": 0}],
        [{"node": "Handle High Priority", "type": "main", "index": 0}],
        [{"node": "Handle Normal Priority", "type": "main", "index": 0}],
        [{"node": "Handle Low Priority", "type": "main", "index": 0}]
      ]
    },
    "Handle Urgent": {
      "main": [
        [{"node": "Update Zendesk Ticket", "type": "main", "index": 0}],
        [{"node": "Check Notifications", "type": "main", "index": 0}]
      ]
    },
    "Handle High Priority": {
      "main": [[{"node": "Update Zendesk Ticket", "type": "main", "index": 0}]]
    },
    "Handle Normal Priority": {
      "main": [[{"node": "Update Zendesk Ticket", "type": "main", "index": 0}]]
    },
    "Handle Low Priority": {
      "main": [[{"node": "Update Zendesk Ticket", "type": "main", "index": 0}]]
    },
    "Check Notifications": {
      "main": [
        [{"node": "Slack Alert", "type": "main", "index": 0}],
        []
      ]
    }
  }
}
\`\`\`

## Workflow 3: Order Fulfillment met Inventory Checks

Deze workflow verwerkt orders met real-time voorraad controles en intelligente fulfillment routing.

### Complete Workflow JSON

\`\`\`json
{
  "name": "Order Fulfillment NL",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "order-fulfillment",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "order-webhook",
      "name": "Order Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [250, 400]
    },
    {
      "parameters": {
        "functionCode": "// Check inventory voor alle order items\nconst order = $input.first().json;\nconst inventoryAPI = 'https://api.inventory.nl/v1/check';\n\nconst inventoryChecks = [];\n\nfor (const item of order.items) {\n  // Simuleer inventory check (vervang met echte API call)\n  const stockLevel = Math.floor(Math.random() * 100);\n  const reserved = Math.floor(Math.random() * 20);\n  const available = stockLevel - reserved;\n  \n  inventoryChecks.push({\n    sku: item.sku,\n    naam: item.naam,\n    gevraagd: item.aantal,\n    voorraad: stockLevel,\n    gereserveerd: reserved,\n    beschikbaar: available,\n    voldoende: available >= item.aantal,\n    locaties: [\n      { warehouse: 'Amsterdam', voorraad: Math.floor(available * 0.6) },\n      { warehouse: 'Rotterdam', voorraad: Math.floor(available * 0.4) }\n    ]\n  });\n}\n\n// Bepaal order fulfillment status\nconst allItemsAvailable = inventoryChecks.every(check => check.voldoende);\nconst partiallyAvailable = inventoryChecks.some(check => check.voldoende);\nconst totalValue = order.items.reduce((sum, item) => sum + (item.prijs * item.aantal), 0);\n\nreturn [{\n  json: {\n    ...order,\n    inventory: {\n      checks: inventoryChecks,\n      allAvailable: allItemsAvailable,\n      partialAvailable: partiallyAvailable,\n      fulfillmentType: allItemsAvailable ? 'complete' : partiallyAvailable ? 'partial' : 'backorder'\n    },\n    orderValue: totalValue,\n    isHighValue: totalValue > 500\n  }\n}];"
      },
      "id": "check-inventory",
      "name": "Check Inventory",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 400]
    },
    {
      "parameters": {
        "dataPropertyName": "inventory.fulfillmentType",
        "rules": {
          "rules": [
            {
              "operation": "equals",
              "output": 0,
              "value": "complete"
            },
            {
              "operation": "equals",
              "output": 1,
              "value": "partial"
            },
            {
              "operation": "equals",
              "output": 2,
              "value": "backorder"
            }
          ]
        }
      },
      "id": "fulfillment-router",
      "name": "Fulfillment Type",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [650, 400]
    },
    {
      "parameters": {
        "functionCode": "// Process complete fulfillment\\nconst order = $input.first().json;\\n\\n// Bepaal beste warehouse voor verzending\\nconst warehouseSelection = selectOptimalWarehouse(order);\\n\\n// Create fulfillment instructies\\nconst fulfillment = {\\n  orderId: order.orderId,\\n  type: 'COMPLETE_FULFILLMENT',\\n  priority: order.isHighValue ? 'HIGH' : 'NORMAL',\\n  warehouse: warehouseSelection.warehouse,\\n  \\n  pickingList: order.items.map(item => ({\\n    sku: item.sku,\\n    naam: item.naam,\\n    aantal: item.aantal,\\n    locatie: getPickLocation(item.sku, warehouseSelection.warehouse)\\n  })),\\n  \\n  shipping: {\\n    method: determineShippingMethod(order),\\n    carrier: order.leveringsOpties?.carrier || 'PostNL',\\n    service: order.leveringsOpties?.service || 'Standard',\\n    address: order.leveringsAdres\\n  },\\n  \\n  timeline: {\\n    orderDate: new Date().toISOString(),\\n    expectedPicking: addWorkingHours(new Date(), 2),\\n    expectedShipping: addWorkingHours(new Date(), 4),\\n    expectedDelivery: addWorkingDays(new Date(), order.leveringsOpties?.express ? 1 : 2)\\n  }\\n};\\n\\nfunction selectOptimalWarehouse(order) {\\n  // Logica voor warehouse selectie based op postcode\\n  const postcode = parseInt(order.leveringsAdres.postcode);\\n  if (postcode >= 1000 && postcode <= 2999) {\\n    return { warehouse: 'Amsterdam', region: 'Noord-Holland' };\\n  } else if (postcode >= 3000 && postcode <= 3999) {\\n    return { warehouse: 'Rotterdam', region: 'Zuid-Holland' };\\n  }\\n  return { warehouse: 'Amsterdam', region: 'Default' };\\n}\\n\\nfunction getPickLocation(sku, warehouse) {\\n  // Simuleer locatie in warehouse\\n  const row = String.fromCharCode(65 + Math.floor(Math.random() * 10));\\n  const rack = Math.floor(Math.random() * 20) + 1;\\n  const shelf = Math.floor(Math.random() * 5) + 1;\\n  return warehouse + '-' + row + rack + '-' + shelf;\\n}\\n\\nfunction determineShippingMethod(order) {\\n  if (order.leveringsOpties?.express) return 'EXPRESS';\\n  if (order.orderValue > 1000) return 'PRIORITY';\\n  return 'STANDARD';\\n}\\n\\nfunction addWorkingHours(date, hours) {\\n  const result = new Date(date);\\n  result.setHours(result.getHours() + hours);\\n  return result.toISOString();\\n}\\n\\nfunction addWorkingDays(date, days) {\\n  const result = new Date(date);\\n  let added = 0;\\n  while (added < days) {\\n    result.setDate(result.getDate() + 1);\\n    if (result.getDay() !== 0 && result.getDay() !== 6) {\\n      added++;\\n    }\\n  }\\n  return result.toISOString();\\n}\\n\\nreturn [{ json: fulfillment }];"
      },
      "id": "complete-fulfillment",
      "name": "Complete Fulfillment",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 200]
    },
    {
      "parameters": {
        "functionCode": "// Process partial fulfillment\nconst order = $input.first().json;\n\n// Split order in available en backorder items\nconst availableItems = [];\nconst backorderItems = [];\n\norder.inventory.checks.forEach((check, index) => {\n  const item = order.items[index];\n  if (check.voldoende) {\n    availableItems.push(item);\n  } else if (check.beschikbaar > 0) {\n    // Partial availability\n    availableItems.push({\n      ...item,\n      aantal: check.beschikbaar,\n      oorspronkelijkAantal: item.aantal\n    });\n    backorderItems.push({\n      ...item,\n      aantal: item.aantal - check.beschikbaar\n    });\n  } else {\n    backorderItems.push(item);\n  }\n});\n\nconst partialFulfillment = {\n  orderId: order.orderId,\n  type: 'PARTIAL_FULFILLMENT',\n  \n  shipment1: {\n    items: availableItems,\n    status: 'ready_to_ship',\n    expectedShipping: addWorkingHours(new Date(), 4)\n  },\n  \n  shipment2: {\n    items: backorderItems,\n    status: 'waiting_for_stock',\n    expectedAvailability: addWorkingDays(new Date(), 5),\n    customerNotification: {\n      type: 'email',\n      template: 'partial_shipment_nl',\n      data: {\n        availableItems: availableItems.length,\n        backorderItems: backorderItems.length,\n        expectedDate: addWorkingDays(new Date(), 7)\n      }\n    }\n  },\n  \n  customerOptions: {\n    acceptPartial: true,\n    cancelBackorder: false,\n    notifyOnAvailability: true\n  }\n};\n\nfunction addWorkingHours(date, hours) {\n  const result = new Date(date);\n  result.setHours(result.getHours() + hours);\n  return result.toISOString();\n}\n\nfunction addWorkingDays(date, days) {\n  const result = new Date(date);\n  let added = 0;\n  while (added < days) {\n    result.setDate(result.getDate() + 1);\n    if (result.getDay() !== 0 && result.getDay() !== 6) {\n      added++;\n    }\n  }\n  return result.toISOString();\n}\n\nreturn [{ json: partialFulfillment }];"
      },
      "id": "partial-fulfillment",
      "name": "Partial Fulfillment",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 400]
    },
    {
      "parameters": {
        "functionCode": "// Process backorder\nconst order = $input.first().json;\n\n// Calculate restock dates voor items\nconst restockInfo = order.inventory.checks.map(check => {\n  // Simuleer restock information\n  const restockDate = new Date();\n  restockDate.setDate(restockDate.getDate() + Math.floor(Math.random() * 14) + 7);\n  \n  return {\n    sku: check.sku,\n    naam: check.naam,\n    huidigeVoorraad: check.beschikbaar,\n    gevraagd: check.gevraagd,\n    tekort: check.gevraagd - check.beschikbaar,\n    verwachteRestock: restockDate.toISOString(),\n    leverancier: 'Supplier_' + check.sku.substring(0, 3)\n  };\n});\n\nconst backorder = {\n  orderId: order.orderId,\n  type: 'BACKORDER',\n  status: 'waiting_for_inventory',\n  \n  restockDetails: restockInfo,\n  estimatedFulfillment: getLatestRestockDate(restockInfo),\n  \n  customerCommunication: {\n    initialNotification: {\n      sent: new Date().toISOString(),\n      template: 'backorder_notification_nl',\n      includeAlternatives: true\n    },\n    updateFrequency: 'weekly',\n    allowCancellation: true,\n    offerAlternatives: suggestAlternatives(order.items)\n  },\n  \n  internalActions: {\n    priorityRestock: order.isHighValue,\n    notifyPurchasing: true,\n    reserveOnArrival: true,\n    escalateAfterDays: 14\n  },\n  \n  financialHandling: {\n    chargeNow: false,\n    chargeOnShipment: true,\n    offerDiscount: order.orderValue > 500 ? 10 : 5\n  }\n};\n\nfunction getLatestRestockDate(restockInfo) {\n  const dates = restockInfo.map(info => new Date(info.verwachteRestock));\n  const latest = new Date(Math.max(...dates));\n  latest.setDate(latest.getDate() + 2); // Add processing time\n  return latest.toISOString();\n}\n\nfunction suggestAlternatives(items) {\n  // Simuleer alternative products\n  return items.map(item => ({\n    original: item.sku,\n    alternatives: [\n      {\n        sku: item.sku + '_ALT1',\n        naam: item.naam + ' (Alternatief)',\n        beschikbaar: true,\n        prijsVerschil: Math.random() * 10 - 5\n      }\n    ]\n  }));\n}\n\nreturn [{ json: backorder }];"
      },
      "id": "backorder-handling",
      "name": "Backorder Handling",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 600]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json[\"isHighValue\"]}}",
              "value2": true
            }
          ]
        }
      },
      "id": "check-high-value",
      "name": "High Value Order?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1150, 300]
    },
    {
      "parameters": {
        "functionCode": "// Special handling voor high value orders\\nconst fulfillment = $input.first().json;\\n\\nconst highValueProtocol = {\\n  orderId: fulfillment.orderId,\\n  \\n  securityMeasures: {\\n    requireSignature: true,\\n    requireIdVerification: true,\\n    insuredShipping: true,\\n    trackingLevel: 'enhanced',\\n    photoOnDelivery: true\\n  },\\n  \\n  packagingRequirements: {\\n    doubleBoxing: true,\\n    tamperEvidentSeals: true,\\n    fragileLabels: true,\\n    customPackaging: 'high-value-box'\\n  },\\n  \\n  notifications: [\\n    {\\n      recipient: 'warehouse-manager@company.nl',\\n      type: 'email',\\n      message: 'High value order ' + fulfillment.orderId + ' requires special handling'\\n    },\\n    {\\n      recipient: 'security@company.nl',\\n      type: 'system',\\n      message: 'Monitor high value shipment'\\n    }\\n  ],\\n  \\n  qualityChecks: {\\n    photographItems: true,\\n    doubleCountVerification: true,\\n    managerApproval: true\\n  }\\n};\\n\\nreturn [{\\n  json: {\\n    ...fulfillment,\\n    highValueProtocol: highValueProtocol\\n  }\\n}];"
      },
      "id": "high-value-protocol",
      "name": "High Value Protocol",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1350, 250]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.wms.nl/v1/fulfillment",
        "authentication": "oAuth2",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "fulfillmentData",
              "value": "={{JSON.stringify($json)}}"
            }
          ]
        },
        "options": {}
      },
      "id": "send-to-wms",
      "name": "Send to WMS",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1550, 400]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{JSON.stringify({\\n  success: true,\\n  orderId: $json[\\"orderId\\"],\\n  fulfillmentType: $json[\\"type\\"],\\n  message: \\"Order fulfillment initiated\\",\\n  trackingInfo: $json[\\"shipping\\"] || $json[\\"shipment1\\"] || $json[\\"estimatedFulfillment\\"]\\n})}}",
        "options": {}
      },
      "id": "webhook-response",
      "name": "Webhook Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1750, 400]
    }
  ],
  "connections": {
    "Order Webhook": {
      "main": [[{"node": "Check Inventory", "type": "main", "index": 0}]]
    },
    "Check Inventory": {
      "main": [[{"node": "Fulfillment Type", "type": "main", "index": 0}]]
    },
    "Fulfillment Type": {
      "main": [
        [{"node": "Complete Fulfillment", "type": "main", "index": 0}],
        [{"node": "Partial Fulfillment", "type": "main", "index": 0}],
        [{"node": "Backorder Handling", "type": "main", "index": 0}]
      ]
    },
    "Complete Fulfillment": {
      "main": [[{"node": "High Value Order?", "type": "main", "index": 0}]]
    },
    "Partial Fulfillment": {
      "main": [[{"node": "High Value Order?", "type": "main", "index": 0}]]
    },
    "Backorder Handling": {
      "main": [[{"node": "Send to WMS", "type": "main", "index": 0}]]
    },
    "High Value Order?": {
      "main": [
        [{"node": "High Value Protocol", "type": "main", "index": 0}],
        [{"node": "Send to WMS", "type": "main", "index": 0}]
      ]
    },
    "High Value Protocol": {
      "main": [[{"node": "Send to WMS", "type": "main", "index": 0}]]
    },
    "Send to WMS": {
      "main": [[{"node": "Webhook Response", "type": "main", "index": 0}]]
    }
  }
}
\`\`\`

## Best Practices voor Conditional Branching

### 1. Error Handling in Elke Branch
- Implementeer fallback routes voor onverwachte scenarios
- Log errors voor debugging
- Gebruik try-catch blocks in Function nodes

### 2. Performance Optimalisatie
- Plaats meest waarschijnlijke conditions eerst
- Gebruik Switch nodes voor multiple options
- Minimaliseer API calls in branches

### 3. Maintainability
- Gebruik duidelijke node namen
- Document complexe logica
- Test alle mogelijke paths

### 4. Nederlandse Business Logic
- Implementeer BTW validatie correct
- Houd rekening met Nederlandse feestdagen
- Gebruik correcte datum/tijd formats

## Conclusie

Deze drie workflows demonstreren de kracht van conditional branching in N8N voor Nederlandse business automatisering. Door IF en Switch nodes slim te combineren met Function nodes kun je complexe beslisbomen bouwen die zich aanpassen aan elke situatie.
`,
  codeExamples: [],
  assignments: [],
  resources: []
};