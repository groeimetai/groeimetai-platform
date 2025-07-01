import type { Lesson } from '@/lib/data/courses';

export const lesson3_4: Lesson = {
  id: 'lesson-3-4',
  title: 'Invoice & Payment Automation',
  duration: '35 min',
  content: `
# Invoice & Payment Automation: Stripe → Accounting Software

## Overzicht
Automatiseer het complete facturatie- en betalingsproces van payment processing tot boekhouding updates.

## Business Value
- **Cash Flow**: 50% snellere betalingen
- **Accuracy**: 100% correcte boekingen
- **Tijdsbesparing**: 20+ uur per maand
- **ROI**: €4.000-€10.000 per maand

## N8N Workflow JSON

\`\`\`json
{
  "name": "Invoice Payment Automation",
  "nodes": [
    {
      "parameters": {
        "events": [
          "checkout.session.completed",
          "invoice.payment_succeeded",
          "payment_intent.succeeded"
        ]
      },
      "name": "Stripe Webhook",
      "type": "n8n-nodes-base.stripeTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "create",
        "organizationId": "={{$json.customer.metadata.company_id}}",
        "status": "sent",
        "invoiceNumber": "INV-{{$json.invoice}}",
        "invoiceDate": "={{$now.toISO()}}",
        "dueDate": "={{$now.plus(30, 'days').toISO()}}",
        "lineItems": [
          {
            "description": "={{$json.description}}",
            "quantity": "={{$json.quantity}}",
            "unitAmount": "={{$json.amount / 100}}",
            "taxRate": "21"
          }
        ]
      },
      "name": "Create Invoice in Moneybird",
      "type": "n8n-nodes-base.moneybird",
      "position": [450, 200]
    },
    {
      "parameters": {
        "resource": "invoice",
        "operation": "create",
        "customerName": "={{$json.customer.name}}",
        "customerEmail": "={{$json.customer.email}}",
        "items": "={{$json.line_items}}",
        "paymentMethod": "={{$json.payment_method_types[0]}}",
        "status": "paid",
        "paidAt": "={{$now.toISO()}}"
      },
      "name": "QuickBooks Invoice",
      "type": "n8n-nodes-base.quickbooks",
      "position": [450, 400]
    },
    {
      "parameters": {
        "fromEmail": "finance@company.com",
        "toEmail": "={{$json.customer.email}}",
        "subject": "Factuur {{$json.invoice}} - Bedankt voor uw betaling",
        "html": "Beste {{$json.customer.name}},<br><br>Bedankt voor uw betaling van €{{$json.amount / 100}}.<br><br>U vindt uw factuur in de bijlage.<br><br>Met vriendelijke groet,<br>Finance Team",
        "attachments": [
          {
            "filename": "factuur-{{$json.invoice}}.pdf",
            "content": "={{$json.invoice_pdf}}"
          }
        ]
      },
      "name": "Send Invoice Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [650, 300]
    },
    {
      "parameters": {
        "channel": "#finance",
        "text": "💰 Nieuwe betaling ontvangen!\\nKlant: {{$json.customer.name}}\\nBedrag: €{{$json.amount / 100}}\\nFactuur: {{$json.invoice}}"
      },
      "name": "Notify Finance Team",
      "type": "n8n-nodes-base.slack",
      "position": [850, 300]
    }
  ]
}
\`\`\`

## Make/Integromat Scenario

\`\`\`json
{
  "name": "Complete Payment Processing",
  "flow": [
    {
      "id": 1,
      "module": "stripe:watchEvents",
      "parameters": {
        "events": ["payment_intent.succeeded", "invoice.paid"]
      }
    },
    {
      "id": 2,
      "module": "tools:switch",
      "routes": [
        {
          "label": "One-time Payment",
          "condition": "{{1.object == 'payment_intent'}}",
          "flow": [
            {
              "module": "xero:createInvoice",
              "parameters": {
                "contact": "{{1.customer}}",
                "lineItems": [{
                  "description": "{{1.description}}",
                  "quantity": 1,
                  "unitAmount": "{{1.amount / 100}}"
                }],
                "status": "AUTHORISED"
              }
            }
          ]
        },
        {
          "label": "Subscription Payment",
          "condition": "{{1.object == 'invoice'}}",
          "flow": [
            {
              "module": "xero:createRepeatingInvoice",
              "parameters": {
                "schedule": {
                  "period": "{{1.billing_reason}}",
                  "nextRunDate": "{{1.period_end}}"
                }
              }
            }
          ]
        }
      ]
    },
    {
      "id": 3,
      "module": "pdf:generate",
      "parameters": {
        "template": "invoice-template",
        "data": {
          "invoiceNumber": "{{1.invoice}}",
          "date": "{{now}}",
          "customer": "{{1.customer}}",
          "items": "{{1.lines.data}}",
          "total": "{{1.amount_paid / 100}}"
        }
      }
    },
    {
      "id": 4,
      "module": "googledrive:uploadFile",
      "parameters": {
        "folder": "Invoices/{{formatDate(now, 'YYYY/MM')}}",
        "filename": "INV-{{1.invoice}}.pdf",
        "data": "{{3.pdf}}"
      }
    }
  ]
}
\`\`\`

## Stap-voor-stap Implementatie

### 1. Stripe Webhook Setup
1. Ga naar Stripe Dashboard → Webhooks
2. Maak endpoint voor je automation tool
3. Selecteer relevante events
4. Kopieer webhook secret

### 2. Accounting Software Integratie
\`\`\`javascript
// Map Stripe data to accounting format
function mapStripeToAccounting(stripeData) {
  const mapping = {
    customer: {
      name: stripeData.customer.name || stripeData.billing_details.name,
      email: stripeData.customer.email || stripeData.billing_details.email,
      vatNumber: stripeData.customer.metadata.vat_number,
      address: {
        line1: stripeData.billing_details.address.line1,
        line2: stripeData.billing_details.address.line2,
        city: stripeData.billing_details.address.city,
        postalCode: stripeData.billing_details.address.postal_code,
        country: stripeData.billing_details.address.country
      }
    },
    invoice: {
      number: generateInvoiceNumber(stripeData.created),
      date: new Date(stripeData.created * 1000),
      dueDate: calculateDueDate(stripeData.created),
      currency: stripeData.currency.toUpperCase(),
      items: mapLineItems(stripeData.line_items || [stripeData]),
      tax: calculateTax(stripeData),
      total: stripeData.amount / 100
    }
  };
  
  return mapping;
}

function generateInvoiceNumber(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sequence = getNextSequence(year, month);
  return \`\${year}\${month}-\${String(sequence).padStart(4, '0')}\`;
}
\`\`\`

### 3. Tax Compliance Automation
\`\`\`javascript
// EU VAT validation and calculation
async function handleEUVAT(customer, amount) {
  const vatRates = {
    'NL': 21, 'DE': 19, 'FR': 20, 'BE': 21,
    'IT': 22, 'ES': 21, 'PL': 23, 'AT': 20
  };
  
  // Validate VAT number
  if (customer.vatNumber) {
    const isValid = await validateVATNumber(customer.vatNumber);
    if (isValid && customer.country !== 'NL') {
      // Reverse charge - 0% VAT
      return { rate: 0, amount: 0, reverseCharge: true };
    }
  }
  
  // Apply local VAT rate
  const rate = vatRates[customer.country] || 21;
  const vatAmount = (amount * rate) / 100;
  
  return { rate, amount: vatAmount, reverseCharge: false };
}
\`\`\`

### 4. Reconciliation Automation
- Match payments met open invoices
- Automatische herinneringen
- Credit notes voor refunds
- Period closing procedures

## Customization Options

### Invoice Templates
\`\`\`html
<!-- Dynamic invoice template -->
<div class="invoice">
  <div class="header">
    <img src="{{company.logo}}" alt="Logo">
    <div class="invoice-details">
      <h1>FACTUUR</h1>
      <p>Nummer: {{invoice.number}}</p>
      <p>Datum: {{formatDate(invoice.date)}}</p>
    </div>
  </div>
  
  <div class="parties">
    <div class="from">
      <h3>Van:</h3>
      <p>{{company.name}}</p>
      <p>{{company.address}}</p>
      <p>BTW: {{company.vatNumber}}</p>
    </div>
    <div class="to">
      <h3>Aan:</h3>
      <p>{{customer.name}}</p>
      <p>{{customer.address}}</p>
      <p>BTW: {{customer.vatNumber}}</p>
    </div>
  </div>
  
  <table class="line-items">
    {{#each items}}
    <tr>
      <td>{{description}}</td>
      <td>{{quantity}}</td>
      <td>€{{unitPrice}}</td>
      <td>€{{total}}</td>
    </tr>
    {{/each}}
  </table>
</div>
\`\`\`

### Payment Methods
- **Credit Cards**: Direct processing
- **SEPA Direct Debit**: Batch processing
- **Bank Transfer**: QR codes
- **Crypto**: Multi-currency support

### Reporting & Analytics
\`\`\`javascript
// Generate financial reports
async function generateMonthlyReport(month, year) {
  const invoices = await getInvoices(month, year);
  const payments = await getPayments(month, year);
  
  const report = {
    period: \`\${month}/\${year}\`,
    revenue: {
      total: sum(invoices, 'total'),
      paid: sum(payments, 'amount'),
      outstanding: sum(invoices.filter(i => !i.paid), 'total'),
      overdue: sum(invoices.filter(i => i.overdue), 'total')
    },
    vat: {
      collected: sum(invoices, 'vat'),
      deductible: sum(expenses, 'vat'),
      payable: sum(invoices, 'vat') - sum(expenses, 'vat')
    },
    metrics: {
      averagePaymentTime: calculateAveragePaymentTime(invoices),
      collectionRate: (payments.length / invoices.length) * 100,
      overdueRate: (overdueInvoices.length / invoices.length) * 100
    }
  };
  
  return report;
}
\`\`\`

## ROI Berekening

### Directe Tijdsbesparing
- Invoice creation: 5 min → 0 min per factuur
- Payment matching: 3 min → 0 min per betaling
- Boekhouding update: 10 min → 0 min per dag
- **Totaal: 25 uur/maand bespaard**

### Cash Flow Verbetering
- Betaaltermijn: 45 dagen → 23 dagen
- Cash flow verbetering: €50.000 sneller binnen
- Rente besparing: €200/maand

### Foutreductie
- Handmatige fouten: 5% → 0%
- Compliance issues: 3 → 0 per jaar
- Boete besparing: €2.000/jaar

### Totale Impact
- Tijdsbesparing: €875/maand (25u x €35)
- Cash flow benefit: €200/maand
- Foutpreventie: €167/maand
- Efficiency winst: €500/maand
- **Totaal ROI: €1.742/maand**
  `,
  codeExamples: [
    {
      id: 'example-3-4-1',
      title: 'Smart Payment Matcher',
      language: 'javascript',
      code: `// Intelligent payment reconciliation
class PaymentReconciler {
  constructor() {
    this.matchingRules = [
      { field: 'invoiceNumber', weight: 1.0, exact: true },
      { field: 'amount', weight: 0.8, tolerance: 0.01 },
      { field: 'customerEmail', weight: 0.6, exact: true },
      { field: 'reference', weight: 0.7, fuzzy: true }
    ];
  }
  
  async matchPaymentToInvoice(payment) {
    const openInvoices = await this.getOpenInvoices();
    const matches = [];
    
    for (const invoice of openInvoices) {
      const score = this.calculateMatchScore(payment, invoice);
      if (score > 0.7) {
        matches.push({ invoice, score });
      }
    }
    
    // Sort by score and return best match
    matches.sort((a, b) => b.score - a.score);
    
    if (matches.length > 0 && matches[0].score > 0.85) {
      return {
        matched: true,
        invoice: matches[0].invoice,
        confidence: matches[0].score,
        action: 'auto-reconcile'
      };
    } else if (matches.length > 0) {
      return {
        matched: false,
        suggestions: matches.slice(0, 3),
        action: 'manual-review'
      };
    }
    
    return {
      matched: false,
      action: 'create-new-invoice'
    };
  }
  
  calculateMatchScore(payment, invoice) {
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const rule of this.matchingRules) {
      const paymentValue = payment[rule.field];
      const invoiceValue = invoice[rule.field];
      
      if (paymentValue && invoiceValue) {
        let score = 0;
        
        if (rule.exact) {
          score = paymentValue === invoiceValue ? 1 : 0;
        } else if (rule.tolerance) {
          const diff = Math.abs(paymentValue - invoiceValue);
          score = diff <= rule.tolerance ? 1 : 0;
        } else if (rule.fuzzy) {
          score = this.fuzzyMatch(paymentValue, invoiceValue);
        }
        
        totalScore += score * rule.weight;
        totalWeight += rule.weight;
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
}`
    }
  ],
  assignments: [
    {
      id: 'payment-automation-1',
      title: 'Implementeer een complete payment-to-accounting flow',
      description: 'Bouw een automation die payments verwerkt, facturen genereert en boekhouding update',
      difficulty: 'expert',
      type: 'project',
      initialCode: `// Payment processing automation
class PaymentProcessor {
  constructor() {
    this.stripe = null; // TODO: Initialize Stripe
    this.accounting = null; // TODO: Initialize accounting API
  }
  
  async processPayment(webhookData) {
    // TODO: Implementeer:
    // 1. Validate webhook signature
    // 2. Extract payment details
    // 3. Generate invoice
    // 4. Update accounting system
    // 5. Send confirmation email
    // 6. Handle errors gracefully
  }
  
  generateInvoiceNumber(date) {
    // TODO: Implement sequential invoice numbering
  }
  
  calculateTax(amount, country) {
    // TODO: Implement tax calculation per country
  }
}`,
      hints: [
        'Gebruik Stripe webhook signature verification',
        'Implementeer idempotency voor duplicate prevention',
        'Test met verschillende payment scenarios (success, failure, refund)'
      ]
    }
  ],
  resources: [
    {
      title: 'Stripe Webhooks Guide',
      url: 'https://stripe.com/docs/webhooks',
      type: 'docs'
    },
    {
      title: 'QuickBooks API Reference',
      url: 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice',
      type: 'docs'
    }
  ]
};