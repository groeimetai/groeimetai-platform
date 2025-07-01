import { CourseLesson } from '@/lib/types/course'

export const lesson31: CourseLesson = {
  id: 'n8n-module-3-lesson-1',
  title: 'Multi-step Automations',
  duration: '45 minuten',
  objectives: [
    'Complexe workflows bouwen met 5+ stappen',
    'Error handling en retry logic implementeren',
    'Performance optimalisatie technieken toepassen',
    'Realistische Nederlandse business cases automatiseren'
  ],
  sections: [
    {
      id: 'intro-multi-step',
      title: 'Introductie Multi-step Workflows',
      content: `
# Multi-step Automations in N8N

Bij echte bedrijfsprocessen heb je vaak workflows nodig met vele stappen. 
Deze les focust op drie realistische Nederlandse business cases.

## Wat je gaat leren:
- **Order Processing**: Complete e-commerce flow van bestelling tot levering
- **Employee Onboarding**: Automatische setup nieuwe medewerkers
- **Financial Reporting**: Geautomatiseerde rapportage generatie

## Best Practices:
- Gebruik sub-workflows voor herbruikbare componenten
- Implementeer error handling op elk kritiek punt
- Monitor performance met execution time tracking
      `
    },
    {
      id: 'ecommerce-order-workflow',
      title: 'Nederlandse E-commerce Order Processing',
      content: `
# E-commerce Order Processing Workflow

Complete order verwerkingsflow voor Nederlandse webshops met BTW, iDEAL betaling en PostNL integratie.

## Workflow Stappen:

### 1. Order Ontvangst (Webhook)
- Ontvang order van WooCommerce/Shopify
- Valideer order data
- Check voorraad status

### 2. BTW Berekening
- Bereken 21% BTW voor standaard producten
- 9% BTW voor voedsel/boeken
- 0% BTW voor export buiten EU

### 3. iDEAL Payment Processing
- Initieer iDEAL betaling via Mollie/Stripe
- Wacht op payment webhook
- Update order status

### 4. Voorraad Update
- Verminder voorraad in ERP
- Trigger reorder bij lage voorraad
- Update product availability

### 5. PostNL Label Generatie
- Genereer verzendlabel
- Stuur Track & Trace naar klant
- Plan pickup bij magazijn

### 6. Facturatie
- Genereer PDF factuur
- Stuur naar boekhouding (e-Boekhouden.nl)
- Email factuur naar klant

### 7. CRM Update
- Update klantgegevens in HubSpot/Pipedrive
- Log order historie
- Trigger follow-up campaigns
      `,
      codeExamples: [
        {
          title: 'Complete E-commerce Order Workflow',
          language: 'json',
          code: `{
  "name": "Nederlandse E-commerce Order Processing",
  "nodes": [
    {
      "name": "Order Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "order-received",
        "responseMode": "onReceived",
        "options": {
          "responseData": "allEntries",
          "responsePropertyName": "data"
        }
      }
    },
    {
      "name": "Validate Order",
      "type": "n8n-nodes-base.if",
      "position": [450, 300],
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.totalAmount}}",
              "operation": "larger",
              "value2": 0
            }
          ],
          "string": [
            {
              "value1": "={{$json.customerEmail}}",
              "operation": "isNotEmpty"
            }
          ]
        }
      }
    },
    {
      "name": "Calculate VAT",
      "type": "n8n-nodes-base.function",
      "position": [650, 300],
      "parameters": {
        "functionCode": "const items = $input.first().json.items;\\nlet totalExVat = 0;\\nlet totalVat = 0;\\n\\nitems.forEach(item => {\\n  const price = item.price * item.quantity;\\n  totalExVat += price;\\n  \\n  // Bepaal BTW percentage\\n  let vatRate = 0.21; // Standaard 21%\\n  \\n  if (item.category === 'food' || item.category === 'books') {\\n    vatRate = 0.09; // Verlaagd tarief\\n  } else if ($input.first().json.shippingCountry !== 'NL' && \\n             !['BE','DE','FR'].includes($input.first().json.shippingCountry)) {\\n    vatRate = 0; // Export buiten EU\\n  }\\n  \\n  totalVat += price * vatRate;\\n});\\n\\nreturn {\\n  totalExVat: totalExVat.toFixed(2),\\n  totalVat: totalVat.toFixed(2),\\n  totalIncVat: (totalExVat + totalVat).toFixed(2),\\n  orderData: $input.first().json\\n};"
      }
    },
    {
      "name": "Check Inventory",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.inventory.nl/check",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "items",
              "value": "={{$json.orderData.items}}"
            }
          ]
        },
        "options": {
          "retry": {
            "retryOnStatusCode": "5XX",
            "maxTries": 3,
            "waitBetweenTries": 2000
          }
        }
      }
    },
    {
      "name": "iDEAL Payment",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.mollie.com/v2/payments",
        "authentication": "genericCredentialType",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "amount",
              "value": "={{{\\"currency\\":\\"EUR\\",\\"value\\":$json.totalIncVat}}}"
            },
            {
              "name": "method",
              "value": "ideal"
            },
            {
              "name": "description",
              "value": "=Order {{$json.orderData.orderId}}"
            },
            {
              "name": "redirectUrl",
              "value": "https://shop.nl/order-complete"
            },
            {
              "name": "webhookUrl",
              "value": "={{$env.N8N_WEBHOOK_URL}}/payment-status"
            }
          ]
        }
      }
    },
    {
      "name": "Wait for Payment",
      "type": "n8n-nodes-base.wait",
      "position": [1250, 300],
      "parameters": {
        "resume": "webhook",
        "webhookPath": "payment-status",
        "options": {
          "timeout": 1800,
          "fallbackOutput": "timeout"
        }
      }
    },
    {
      "name": "Update Inventory",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1450, 300],
      "parameters": {
        "method": "PUT",
        "url": "https://api.inventory.nl/update",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "orderId",
              "value": "={{$json.orderData.orderId}}"
            },
            {
              "name": "items",
              "value": "={{$json.orderData.items}}"
            },
            {
              "name": "action",
              "value": "reserve"
            }
          ]
        }
      }
    },
    {
      "name": "Generate PostNL Label",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1650, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.postnl.nl/shipments/v2/label",
        "authentication": "genericCredentialType",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "CustomerCode",
              "value": "={{$credentials.postnlCustomerCode}}"
            },
            {
              "name": "CustomerNumber",
              "value": "={{$credentials.postnlCustomerNumber}}"
            },
            {
              "name": "Shipments",
              "value": "={{[{\\"Addresses\\":[{\\"AddressType\\":\\"01\\",\\"City\\":$json.orderData.shippingCity,\\"Street\\":$json.orderData.shippingStreet,\\"HouseNr\\":$json.orderData.shippingHouseNr,\\"Zipcode\\":$json.orderData.shippingZipcode,\\"CountryCode\\":\\"NL\\"}],\\"ProductCodeDelivery\\":\\"3085\\"}]}}"
            }
          ]
        }
      }
    },
    {
      "name": "Generate Invoice",
      "type": "n8n-nodes-base.function",
      "position": [1850, 300],
      "parameters": {
        "functionCode": "// Genereer factuur data\\nconst invoiceData = {\\n  invoiceNumber: \`INV-\${new Date().getFullYear()}-\${Date.now()}\`,\\n  invoiceDate: new Date().toISOString().split('T')[0],\\n  customer: $json.orderData.customerName,\\n  email: $json.orderData.customerEmail,\\n  items: $json.orderData.items,\\n  totalExVat: $json.totalExVat,\\n  totalVat: $json.totalVat,\\n  totalIncVat: $json.totalIncVat,\\n  paymentMethod: 'iDEAL',\\n  paymentStatus: 'Betaald'\\n};\\n\\nreturn invoiceData;"
      }
    },
    {
      "name": "Send to e-Boekhouden",
      "type": "n8n-nodes-base.httpRequest",
      "position": [2050, 300],
      "parameters": {
        "method": "POST",
        "url": "https://soap.e-boekhouden.nl/soap.asmx",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "text/xml; charset=utf-8"
            },
            {
              "name": "SOAPAction",
              "value": "http://www.e-boekhouden.nl/AddFactuur"
            }
          ]
        }
      }
    },
    {
      "name": "Update CRM",
      "type": "n8n-nodes-base.httpRequest",
      "position": [2250, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.hubapi.com/crm/v3/objects/deals",
        "authentication": "genericCredentialType",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "properties",
              "value": "={{{\\"dealname\\":\\"Order \\" + $json.orderData.orderId,\\"amount\\":$json.totalIncVat,\\"pipeline\\":\\"default\\",\\"dealstage\\":\\"closedwon\\",\\"closedate\\":new Date().getTime()}}}"
            }
          ]
        }
      }
    },
    {
      "name": "Error Handler",
      "type": "n8n-nodes-base.errorTrigger",
      "position": [1250, 500],
      "parameters": {}
    },
    {
      "name": "Log Error",
      "type": "n8n-nodes-base.function",
      "position": [1450, 500],
      "parameters": {
        "functionCode": "const error = $input.first().json;\\n\\n// Log naar Sentry of eigen error tracking\\nconst errorLog = {\\n  timestamp: new Date().toISOString(),\\n  workflow: 'E-commerce Order Processing',\\n  orderId: error.orderId || 'unknown',\\n  errorMessage: error.message,\\n  errorStack: error.stack,\\n  nodeFailure: error.node\\n};\\n\\n// Stuur notificatie naar ops team\\nreturn errorLog;"
      }
    }
  ],
  "connections": {
    "Order Webhook": {
      "main": [[{"node": "Validate Order", "type": "main", "index": 0}]]
    },
    "Validate Order": {
      "main": [
        [{"node": "Calculate VAT", "type": "main", "index": 0}],
        [{"node": "Error Handler", "type": "main", "index": 0}]
      ]
    },
    "Calculate VAT": {
      "main": [[{"node": "Check Inventory", "type": "main", "index": 0}]]
    },
    "Check Inventory": {
      "main": [[{"node": "iDEAL Payment", "type": "main", "index": 0}]]
    },
    "iDEAL Payment": {
      "main": [[{"node": "Wait for Payment", "type": "main", "index": 0}]]
    },
    "Wait for Payment": {
      "main": [[{"node": "Update Inventory", "type": "main", "index": 0}]]
    },
    "Update Inventory": {
      "main": [[{"node": "Generate PostNL Label", "type": "main", "index": 0}]]
    },
    "Generate PostNL Label": {
      "main": [[{"node": "Generate Invoice", "type": "main", "index": 0}]]
    },
    "Generate Invoice": {
      "main": [[{"node": "Send to e-Boekhouden", "type": "main", "index": 0}]]
    },
    "Send to e-Boekhouden": {
      "main": [[{"node": "Update CRM", "type": "main", "index": 0}]]
    },
    "Error Handler": {
      "main": [[{"node": "Log Error", "type": "main", "index": 0}]]
    }
  }
}`
        }
      ]
    },
    {
      id: 'employee-onboarding-workflow',
      title: 'Employee Onboarding Automation',
      content: `
# Geautomatiseerde Employee Onboarding

Complete onboarding flow voor nieuwe Nederlandse medewerkers met alle wettelijke vereisten.

## Workflow Componenten:

1. **HR Systeem Integratie** - AFAS/Loket.nl koppeling
2. **Account Provisioning** - Microsoft 365, Slack, tools
3. **Hardware Bestelling** - Laptop, telefoon, accessories
4. **Documenten Generatie** - Contract, handboek, policies
5. **Training Planning** - Onboarding sessions, e-learning
6. **Compliance Checks** - VOG aanvraag, diploma verificatie
      `,
      codeExamples: [
        {
          title: 'Employee Onboarding Workflow',
          language: 'json',
          code: `{
  "name": "Nederlandse Employee Onboarding",
  "nodes": [
    {
      "name": "New Employee Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "new-employee"
      }
    },
    {
      "name": "Create in AFAS",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.afas.nl/profitrestservice/employee",
        "authentication": "genericCredentialType",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "Employee",
              "value": "={{{\\"FirstName\\":$json.firstName,\\"LastName\\":$json.lastName,\\"BSN\\":$json.bsn,\\"StartDate\\":$json.startDate,\\"Function\\":$json.jobTitle,\\"Department\\":$json.department}}}"
            }
          ]
        }
      }
    },
    {
      "name": "Create Microsoft 365",
      "type": "n8n-nodes-base.microsoftGraph",
      "position": [650, 300],
      "parameters": {
        "resource": "user",
        "operation": "create",
        "displayName": "={{$json.firstName}} {{$json.lastName}}",
        "userPrincipalName": "={{$json.firstName.toLowerCase()}}.{{$json.lastName.toLowerCase()}}@company.nl",
        "mailNickname": "={{$json.firstName.toLowerCase()}}{{$json.lastName.toLowerCase()}}",
        "accountEnabled": true,
        "passwordProfile": {
          "forceChangePasswordNextSignIn": true,
          "password": "={{$json.temporaryPassword}}"
        }
      }
    },
    {
      "name": "Generate Documents",
      "type": "n8n-nodes-base.function",
      "position": [850, 300],
      "parameters": {
        "functionCode": "const employee = $input.first().json;\\n\\n// Genereer documenten lijst\\nconst documents = [\\n  {\\n    type: 'arbeidsovereenkomst',\\n    template: employee.contractType === 'bepaald' ? 'contract_bepaald_tijd' : 'contract_onbepaald',\\n    data: {\\n      naam: \`\${employee.firstName} \${employee.lastName}\`,\\n      functie: employee.jobTitle,\\n      salaris: employee.salary,\\n      startdatum: employee.startDate,\\n      einddatum: employee.endDate || null\\n    }\\n  },\\n  {\\n    type: 'geheimhoudingsverklaring',\\n    template: 'nda_standard',\\n    data: {\\n      naam: \`\${employee.firstName} \${employee.lastName}\`,\\n      datum: new Date().toISOString().split('T')[0]\\n    }\\n  },\\n  {\\n    type: 'vog_aanvraag',\\n    template: 'vog_formulier',\\n    required: ['IT', 'Finance', 'HR'].includes(employee.department)\\n  }\\n];\\n\\nreturn documents;"
      }
    },
    {
      "name": "Order Hardware",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.centralpoint.nl/order",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "items",
              "value": "={{$json.hardwarePackage}}"
            },
            {
              "name": "delivery",
              "value": "={{{\\"address\\":$json.workLocation === 'remote' ? $json.homeAddress : $json.officeAddress,\\"date\\":$json.startDate}}}"
            }
          ]
        }
      }
    },
    {
      "name": "Create Slack Account",
      "type": "n8n-nodes-base.slack",
      "position": [1250, 300],
      "parameters": {
        "resource": "user",
        "operation": "invite",
        "email": "={{$json.email}}",
        "channels": ["general", "{{$json.department.toLowerCase()}}"]
      }
    },
    {
      "name": "Schedule Training",
      "type": "n8n-nodes-base.googleCalendar",
      "position": [1450, 300],
      "parameters": {
        "operation": "create",
        "calendar": "training@company.nl",
        "summary": "Onboarding Training - {{$json.firstName}} {{$json.lastName}}",
        "start": "={{$json.startDate}}T09:00:00",
        "end": "={{$json.startDate}}T17:00:00",
        "attendees": "={{$json.email}},hr@company.nl,{{$json.managerEmail}}"
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [1650, 300],
      "parameters": {
        "fromEmail": "hr@company.nl",
        "toEmail": "={{$json.email}}",
        "subject": "Welkom bij {{$json.companyName}}!",
        "html": "<h1>Welkom {{$json.firstName}}!</h1><p>We kijken ernaar uit om met je samen te werken.</p><p>Je eerste werkdag is op {{$json.startDate}}.</p><p>Belangrijke informatie:</p><ul><li>Aanvangstijd: 09:00</li><li>Locatie: {{$json.officeAddress}}</li><li>Contact HR: hr@company.nl</li></ul>",
        "attachments": "onboarding-guide.pdf"
      }
    },
    {
      "name": "Create Jira Onboarding",
      "type": "n8n-nodes-base.jira",
      "position": [1850, 300],
      "parameters": {
        "operation": "create",
        "project": "ONBOARD",
        "issueType": "Task",
        "summary": "Onboarding - {{$json.firstName}} {{$json.lastName}}",
        "description": "Complete onboarding checklist voor nieuwe medewerker",
        "assignee": "{{$json.managerEmail}}",
        "labels": ["onboarding", "{{$json.department}}"]
      }
    },
    {
      "name": "Notify Manager",
      "type": "n8n-nodes-base.slack",
      "position": [2050, 300],
      "parameters": {
        "channel": "@{{$json.managerSlackId}}",
        "text": "Nieuwe medewerker {{$json.firstName}} {{$json.lastName}} start op {{$json.startDate}}. Alle accounts zijn aangemaakt en hardware is besteld.",
        "attachments": [{
          "color": "good",
          "fields": [
            {
              "title": "Email",
              "value": "{{$json.email}}",
              "short": true
            },
            {
              "title": "Department",
              "value": "{{$json.department}}",
              "short": true
            }
          ]
        }]
      }
    }
  ],
  "connections": {
    "New Employee Trigger": {
      "main": [[{"node": "Create in AFAS", "type": "main", "index": 0}]]
    },
    "Create in AFAS": {
      "main": [[{"node": "Create Microsoft 365", "type": "main", "index": 0}]]
    },
    "Create Microsoft 365": {
      "main": [[{"node": "Generate Documents", "type": "main", "index": 0}]]
    },
    "Generate Documents": {
      "main": [[{"node": "Order Hardware", "type": "main", "index": 0}]]
    },
    "Order Hardware": {
      "main": [[{"node": "Create Slack Account", "type": "main", "index": 0}]]
    },
    "Create Slack Account": {
      "main": [[{"node": "Schedule Training", "type": "main", "index": 0}]]
    },
    "Schedule Training": {
      "main": [[{"node": "Send Welcome Email", "type": "main", "index": 0}]]
    },
    "Send Welcome Email": {
      "main": [[{"node": "Create Jira Onboarding", "type": "main", "index": 0}]]
    },
    "Create Jira Onboarding": {
      "main": [[{"node": "Notify Manager", "type": "main", "index": 0}]]
    }
  }
}`
        }
      ]
    },
    {
      id: 'financial-reporting-workflow',
      title: 'Financial Report Generation',
      content: `
# Geautomatiseerde Financiële Rapportage

Maandelijkse rapportage voor Nederlandse bedrijven met KvK en belastingdienst integraties.

## Proces Stappen:

1. **Data Collectie** - Verzamel data uit meerdere bronnen
2. **BTW Aangifte** - Bereken en controleer BTW
3. **Grootboek Export** - Genereer grootboek overzicht
4. **KPI Berekeningen** - Omzet, marge, cashflow
5. **Rapport Generatie** - PDF met grafieken
6. **Distributie** - Email naar stakeholders
      `,
      codeExamples: [
        {
          title: 'Financial Reporting Workflow',
          language: 'json',
          code: `{
  "name": "Maandelijkse Financiële Rapportage",
  "nodes": [
    {
      "name": "Monthly Schedule",
      "type": "n8n-nodes-base.cron",
      "position": [250, 300],
      "parameters": {
        "cronExpression": "0 9 1 * *",
        "timezone": "Europe/Amsterdam"
      }
    },
    {
      "name": "Collect Sales Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 200],
      "parameters": {
        "method": "GET",
        "url": "https://api.exact.nl/sales/summary",
        "queryParameters": {
          "parameters": [
            {
              "name": "startDate",
              "value": "={{$today.minus({months:1}).startOf('month').toISO()}}"
            },
            {
              "name": "endDate",
              "value": "={{$today.minus({months:1}).endOf('month').toISO()}}"
            }
          ]
        }
      }
    },
    {
      "name": "Collect Purchase Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 400],
      "parameters": {
        "method": "GET",
        "url": "https://api.exact.nl/purchases/summary",
        "queryParameters": {
          "parameters": [
            {
              "name": "startDate",
              "value": "={{$today.minus({months:1}).startOf('month').toISO()}}"
            },
            {
              "name": "endDate",
              "value": "={{$today.minus({months:1}).endOf('month').toISO()}}"
            }
          ]
        }
      }
    },
    {
      "name": "Calculate BTW",
      "type": "n8n-nodes-base.function",
      "position": [650, 300],
      "parameters": {
        "functionCode": "const salesData = $input.all()[0].json;\\nconst purchaseData = $input.all()[1].json;\\n\\n// BTW berekeningen\\nconst btwHoog = salesData.vatHigh - purchaseData.vatHigh;\\nconst btwLaag = salesData.vatLow - purchaseData.vatLow;\\nconst btwVerlegd = salesData.vatReversed;\\nconst btwEu = salesData.vatEU;\\n\\nconst btwAangifte = {\\n  periode: $today.minus({months:1}).toFormat('yyyy-MM'),\\n  omzetBelast: {\\n    hoog: salesData.turnoverHigh,\\n    laag: salesData.turnoverLow,\\n    vrijgesteld: salesData.turnoverExempt\\n  },\\n  btw: {\\n    hoogTarief: btwHoog,\\n    laagTarief: btwLaag,\\n    verlegd: btwVerlegd,\\n    eu: btwEu,\\n    totaal: btwHoog + btwLaag - btwVerlegd\\n  },\\n  teBetalen: Math.max(0, btwHoog + btwLaag - btwVerlegd),\\n  teVorderen: Math.max(0, -(btwHoog + btwLaag - btwVerlegd))\\n};\\n\\nreturn btwAangifte;"
      }
    },
    {
      "name": "Generate Grootboek",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300],
      "parameters": {
        "method": "GET",
        "url": "https://api.exact.nl/generalledger/export",
        "responseFormat": "file",
        "queryParameters": {
          "parameters": [
            {
              "name": "period",
              "value": "={{$today.minus({months:1}).toFormat('yyyy-MM')}}"
            },
            {
              "name": "format",
              "value": "xlsx"
            }
          ]
        }
      }
    },
    {
      "name": "Calculate KPIs",
      "type": "n8n-nodes-base.function",
      "position": [1050, 300],
      "parameters": {
        "functionCode": "const sales = $input.all()[0].json;\\nconst btw = $input.all()[1].json;\\n\\n// KPI Berekeningen\\nconst kpis = {\\n  omzet: {\\n    totaal: sales.turnoverTotal,\\n    groei: ((sales.turnoverTotal - sales.turnoverPrevious) / sales.turnoverPrevious * 100).toFixed(2),\\n    perKlant: (sales.turnoverTotal / sales.customerCount).toFixed(2)\\n  },\\n  marge: {\\n    bruto: sales.grossMargin,\\n    netto: sales.netMargin,\\n    percentage: (sales.netMargin / sales.turnoverTotal * 100).toFixed(2)\\n  },\\n  cashflow: {\\n    operationeel: sales.cashflowOperational,\\n    vrij: sales.cashflowFree,\\n    ratio: (sales.cashflowOperational / sales.turnoverTotal).toFixed(2)\\n  },\\n  debiteurenDagen: sales.daysOutstanding,\\n  crediteurenDagen: sales.daysPayable,\\n  voorraadRotatie: sales.inventoryTurnover\\n};\\n\\nreturn { kpis, btw, period: btw.periode };"
      }
    },
    {
      "name": "Generate PDF Report",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1250, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.documenten.nl/generate",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "template",
              "value": "financial-report-nl"
            },
            {
              "name": "data",
              "value": "={{$json}}"
            },
            {
              "name": "format",
              "value": "pdf"
            }
          ]
        }
      }
    },
    {
      "name": "Store in SharePoint",
      "type": "n8n-nodes-base.microsoftOneDrive",
      "position": [1450, 300],
      "parameters": {
        "operation": "upload",
        "fileName": "=Financieel_Rapport_{{$json.period}}.pdf",
        "folderId": "{{$credentials.reportsFolderId}}",
        "binaryData": true,
        "binaryPropertyName": "data"
      }
    },
    {
      "name": "Send to Management",
      "type": "n8n-nodes-base.emailSend",
      "position": [1650, 300],
      "parameters": {
        "fromEmail": "finance@company.nl",
        "toEmail": "management@company.nl,cfo@company.nl",
        "subject": "Maandelijkse Financiële Rapportage - {{$json.period}}",
        "html": "<h2>Financiële Rapportage {{$json.period}}</h2><h3>Highlights:</h3><ul><li>Omzet: €{{$json.kpis.omzet.totaal}} ({{$json.kpis.omzet.groei}}% groei)</li><li>Netto marge: {{$json.kpis.marge.percentage}}%</li><li>Operationele cashflow: €{{$json.kpis.cashflow.operationeel}}</li></ul><p>Het volledige rapport is bijgevoegd.</p>",
        "attachments": "={{$binary.data}}"
      }
    },
    {
      "name": "Update Dashboard",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1850, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.powerbi.com/datasets/{{$credentials.datasetId}}/rows",
        "authentication": "oAuth2",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "rows",
              "value": "={{[$json.kpis]}}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Monthly Schedule": {
      "main": [[
        {"node": "Collect Sales Data", "type": "main", "index": 0},
        {"node": "Collect Purchase Data", "type": "main", "index": 0}
      ]]
    },
    "Collect Sales Data": {
      "main": [[{"node": "Calculate BTW", "type": "main", "index": 0}]]
    },
    "Collect Purchase Data": {
      "main": [[{"node": "Calculate BTW", "type": "main", "index": 0}]]
    },
    "Calculate BTW": {
      "main": [[{"node": "Generate Grootboek", "type": "main", "index": 0}]]
    },
    "Generate Grootboek": {
      "main": [[{"node": "Calculate KPIs", "type": "main", "index": 0}]]
    },
    "Calculate KPIs": {
      "main": [[{"node": "Generate PDF Report", "type": "main", "index": 0}]]
    },
    "Generate PDF Report": {
      "main": [[{"node": "Store in SharePoint", "type": "main", "index": 0}]]
    },
    "Store in SharePoint": {
      "main": [[{"node": "Send to Management", "type": "main", "index": 0}]]
    },
    "Send to Management": {
      "main": [[{"node": "Update Dashboard", "type": "main", "index": 0}]]
    }
  }
}`
        }
      ]
    },
    {
      id: 'performance-optimization',
      title: 'Performance Optimalisatie',
      content: `
# Performance Tips voor Multi-step Workflows

## 1. Parallelle Executie
Gebruik Split In Batches nodes voor parallelle verwerking:
- Verdeel grote datasets in chunks
- Process chunks simultaan
- Merge resultaten aan het eind

## 2. Error Handling Strategie
\`\`\`javascript
// Retry configuratie
{
  "retry": {
    "retryOnStatusCode": "5XX,ETIMEDOUT",
    "maxTries": 3,
    "waitBetweenTries": 2000,
    "backoffMultiplier": 2
  }
}
\`\`\`

## 3. Memory Management
- Gebruik streaming voor grote files
- Clear variables na gebruik
- Limit webhook payload sizes

## 4. Monitoring Setup
- Execution time tracking per node
- Memory usage alerts
- Error rate dashboards
      `
    }
  ],
  exercises: [
    {
      id: 'build-order-workflow',
      title: 'Bouw Complete Order Workflow',
      description: 'Implementeer de e-commerce order processing workflow met alle 7 stappen',
      difficulty: 'expert',
      estimatedTime: '45 minuten',
      hints: [
        'Begin met webhook setup voor order ontvangst',
        'Test BTW berekeningen met verschillende product categorieën',
        'Implementeer fallback voor payment timeouts'
      ]
    },
    {
      id: 'optimize-performance',
      title: 'Optimaliseer Workflow Performance',
      description: 'Voeg parallelle processing en caching toe aan bestaande workflow',
      difficulty: 'intermediate',
      estimatedTime: '20 minuten'
    }
  ],
  resources: [
    {
      id: 'postnl-api-docs',
      title: 'PostNL API Documentatie',
      url: 'https://developer.postnl.nl',
      type: 'documentation'
    },
    {
      id: 'ideal-integration',
      title: 'iDEAL Payment Integration Guide',
      url: 'https://docs.mollie.com/payments/ideal',
      type: 'guide'
    },
    {
      id: 'btw-calculator',
      title: 'Nederlandse BTW Calculator',
      url: 'https://n8n.io/integrations/btw-netherlands',
      type: 'tool'
    }
  ]
}