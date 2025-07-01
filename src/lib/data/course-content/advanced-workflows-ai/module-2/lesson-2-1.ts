import { Lesson } from '@/lib/data/courses';

export const lesson2_1: Lesson = {
  id: 'lesson-2-1',
  title: 'Geavanceerde transformatiefuncties',
  duration: '30 min',
  content: `
# Geavanceerde transformatiefuncties

## Introductie

Data transformatie is het hart van elke workflow automatisering. In deze les duiken we diep in de geavanceerde transformatiefuncties die beschikbaar zijn in N8N en Make.com. Je leert hoe je complexe data manipulaties uitvoert, van string parsing tot date/time conversies, en hoe je deze effectief inzet in real-world scenario's.

## Overview van transformatiefuncties

### N8N Expression Language

N8N gebruikt een krachtige expression language gebaseerd op JavaScript:

\`\`\`javascript
// Basis syntax
{{\$json.fieldName}}

// Met transformaties
{{\$json.email.toLowerCase()}}

// Complexe expressies
{{\$json.price * 1.21}} // BTW toevoegen
{{new Date(\$json.date).toISOString()}}
\`\`\`

### Make.com Functions

Make.com biedt een uitgebreide set ingebouwde functies:

\`\`\`
// Text functies
upper(text)
lower(text)
capitalize(text)
trim(text)

// Numerieke functies
round(number, decimals)
floor(number)
ceil(number)
formatNumber(number, decimalPOints, decimalSeparator, thousandsSeparator)

// Date functies
formatDate(date; format; timezone)
addDays(date; days)
parseDate(text; format)
\`\`\`

## String manipulaties

### Regex patterns

Regular expressions zijn essentieel voor complexe text parsing:

\`\`\`javascript
// N8N: Extract email domain
{{\$json.email.match(/@(.+)/)[1]}}

// Extract phone number from text
const text = \$json.description;
const phoneRegex = /\+?[\d\s()-]+\d/g;
const phones = text.match(phoneRegex) || [];

// Clean and format phone numbers
const cleanedPhones = phones.map(phone => 
  phone.replace(/[\s()-]/g, '')
);
\`\`\`

### Text parsing techniques

\`\`\`javascript
// Parse structured data from unstructured text
function parseCustomerInfo(text) {
  const info = {};
  
  // Extract name (assuming format "Name: John Doe")
  const nameMatch = text.match(/Name:\s*([^\n]+)/i);
  if (nameMatch) info.name = nameMatch[1].trim();
  
  // Extract order number (format: #12345)
  const orderMatch = text.match(/#(\d+)/);
  if (orderMatch) info.orderNumber = orderMatch[1];
  
  // Extract amount (format: €123.45 or $123.45)
  const amountMatch = text.match(/[€$]\s*(\d+\.?\d*)/);
  if (amountMatch) {
    info.amount = parseFloat(amountMatch[1]);
    info.currency = amountMatch[0][0];
  }
  
  return info;
}

// Usage in N8N
const parsed = parseCustomerInfo(\$json.emailBody);
return {
  json: parsed
};
\`\`\`

### String formatting

\`\`\`javascript
// Advanced string templating
function formatCustomerMessage(customer) {
  const template = \`
Beste {{salutation}} {{lastName}},

Uw bestelling #{{orderNumber}} van {{orderDate}} is {{status}}.

{{#if tracking}}
Track uw pakket: {{trackingUrl}}
{{/if}}

Met vriendelijke groet,
{{companyName}}
\`.trim();

  // Simple template engine
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    return customer[key] || '';
  });
}

// Format currency
function formatCurrency(amount, currency = 'EUR') {
  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency
  });
  return formatter.format(amount);
}

// Format names
function formatName(firstName, lastName, format = 'full') {
  switch(format) {
    case 'full': return \`\${firstName} \${lastName}\`;
    case 'formal': return \`\${lastName}, \${firstName}\`;
    case 'initials': return \`\${firstName[0]}. \${lastName}\`;
    default: return \`\${firstName} \${lastName}\`;
  }
}
\`\`\`

## Number operations

### Calculations en conversions

\`\`\`javascript
// Financial calculations
const calculations = {
  // BTW berekeningen
  addVAT: (price, rate = 0.21) => price * (1 + rate),
  extractVAT: (priceIncVAT, rate = 0.21) => priceIncVAT - (priceIncVAT / (1 + rate)),
  
  // Percentage calculations
  percentageChange: (oldVal, newVal) => ((newVal - oldVal) / oldVal) * 100,
  percentageOf: (part, whole) => (part / whole) * 100,
  
  // Discount calculations
  applyDiscount: (price, discountPercent) => price * (1 - discountPercent / 100),
  calculateDiscount: (original, discounted) => ((original - discounted) / original) * 100,
  
  // Compound interest
  compoundInterest: (principal, rate, time, n = 12) => 
    principal * Math.pow(1 + rate / n, n * time)
};

// Unit conversions
const conversions = {
  // Currency (rates would normally come from API)
  currency: {
    EURtoUSD: (eur) => eur * 1.08,
    USDtoEUR: (usd) => usd / 1.08
  },
  
  // Weight
  weight: {
    kgToLbs: (kg) => kg * 2.20462,
    lbsToKg: (lbs) => lbs / 2.20462
  },
  
  // Temperature
  temperature: {
    celsiusToFahrenheit: (c) => (c * 9/5) + 32,
    fahrenheitToCelsius: (f) => (f - 32) * 5/9
  }
};
\`\`\`

### Rounding strategies

\`\`\`javascript
// Different rounding methods for different use cases
const roundingStrategies = {
  // Standard rounding
  standard: (num, decimals = 2) => 
    Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
  
  // Always round up (ceiling)
  up: (num, decimals = 2) => 
    Math.ceil(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
  
  // Always round down (floor)
  down: (num, decimals = 2) => 
    Math.floor(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
  
  // Banker's rounding (round half to even)
  bankers: (num, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    const tmp = num * factor;
    const integer = Math.floor(tmp);
    const decimal = tmp - integer;
    
    if (decimal === 0.5) {
      return integer % 2 === 0 ? integer / factor : (integer + 1) / factor;
    }
    return Math.round(tmp) / factor;
  },
  
  // Price rounding (e.g., to nearest 0.05)
  price: (num, increment = 0.05) => 
    Math.round(num / increment) * increment
};

// Example usage
const price = 12.3456;
console.log(roundingStrategies.standard(price)); // 12.35
console.log(roundingStrategies.up(price)); // 12.35
console.log(roundingStrategies.price(price, 0.05)); // 12.35
console.log(roundingStrategies.price(12.37, 0.05)); // 12.35
\`\`\`

## Date/time transformaties

### Parsing en formatting

\`\`\`javascript
// Advanced date parsing
function parseFlexibleDate(dateString) {
  // Try multiple date formats
  const formats = [
    // ISO formats
    { regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, parser: (s) => new Date(s) },
    // European format
    { regex: /^\d{2}-\d{2}-\d{4}/, parser: (s) => {
      const [d, m, y] = s.split('-');
      return new Date(y, m-1, d);
    }},
    // US format
    { regex: /^\d{2}\/\d{2}\/\d{4}/, parser: (s) => {
      const [m, d, y] = s.split('/');
      return new Date(y, m-1, d);
    }},
    // Natural language
    { regex: /today/i, parser: () => new Date() },
    { regex: /yesterday/i, parser: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }},
    { regex: /tomorrow/i, parser: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    }}
  ];
  
  for (const format of formats) {
    if (format.regex.test(dateString)) {
      return format.parser(dateString);
    }
  }
  
  // Fallback to Date constructor
  return new Date(dateString);
}

// Date formatting utilities
const dateFormatters = {
  // Dutch formats
  dutchShort: (date) => 
    new Intl.DateTimeFormat('nl-NL').format(date),
  
  dutchLong: (date) => 
    new Intl.DateTimeFormat('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date),
  
  // Relative time
  relative: (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return \`\${days} dag(en) geleden\`;
    if (hours > 0) return \`\${hours} uur geleden\`;
    if (minutes > 0) return \`\${minutes} minuten geleden\`;
    return 'Zojuist';
  },
  
  // ISO format for APIs
  iso: (date) => date.toISOString(),
  
  // Custom format
  custom: (date, format) => {
    const map = {
      'YYYY': date.getFullYear(),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'DD': String(date.getDate()).padStart(2, '0'),
      'HH': String(date.getHours()).padStart(2, '0'),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'ss': String(date.getSeconds()).padStart(2, '0')
    };
    
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => map[match]);
  }
};
\`\`\`

### Timezone handling

\`\`\`javascript
// Timezone conversions
class TimezoneConverter {
  constructor(sourceTimezone = 'UTC') {
    this.sourceTimezone = sourceTimezone;
  }
  
  // Convert to target timezone
  convertTo(date, targetTimezone) {
    const options = {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    
    const values = {};
    parts.forEach(part => {
      if (part.type !== 'literal') {
        values[part.type] = part.value;
      }
    });
    
    return new Date(
      \`\${values.year}-\${values.month}-\${values.day}T\${values.hour}:\${values.minute}:\${values.second}\`
    );
  }
  
  // Get offset between timezones
  getOffset(date, timezone) {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate - utcDate) / (1000 * 60); // Offset in minutes
  }
  
  // Business hours check
  isBusinessHours(date, timezone, startHour = 9, endHour = 17) {
    const localDate = this.convertTo(date, timezone);
    const hour = localDate.getHours();
    const day = localDate.getDay();
    
    // Check if weekend
    if (day === 0 || day === 6) return false;
    
    // Check if within business hours
    return hour >= startHour && hour < endHour;
  }
}

// Date calculations
const dateCalculations = {
  // Add business days
  addBusinessDays: (date, days) => {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return result;
  },
  
  // Calculate age
  calculateAge: (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },
  
  // Days between dates
  daysBetween: (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }
};
\`\`\`

## Praktische voorbeelden met klantdata

### Customer data enrichment

\`\`\`javascript
// Complete customer data transformation pipeline
class CustomerDataTransformer {
  constructor() {
    this.transformations = {
      // Name transformations
      name: {
        format: (first, last) => ({
          full: \`\${first} \${last}\`,
          formal: \`\${last}, \${first}\`,
          initials: \`\${first[0]}.\${last[0]}.\`,
          display: \`\${first} \${last[0]}.\`
        }),
        
        parseFullName: (fullName) => {
          const parts = fullName.trim().split(/\s+/);
          if (parts.length === 1) return { first: parts[0], last: '' };
          return {
            first: parts[0],
            middle: parts.slice(1, -1).join(' '),
            last: parts[parts.length - 1]
          };
        }
      },
      
      // Email transformations
      email: {
        validate: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        
        getDomain: (email) => email.split('@')[1],
        
        maskEmail: (email) => {
          const [local, domain] = email.split('@');
          const masked = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
          return \`\${masked}@\${domain}\`;
        },
        
        suggestUsername: (email) => email.split('@')[0].toLowerCase()
      },
      
      // Phone transformations
      phone: {
        format: (phone, country = 'NL') => {
          const cleaned = phone.replace(/\D/g, '');
          
          if (country === 'NL') {
            // Dutch phone formatting
            if (cleaned.startsWith('31')) {
              const number = cleaned.substring(2);
              return \`+31 \${number.substring(0, 2)} \${number.substring(2, 5)} \${number.substring(5)}\`;
            } else if (cleaned.startsWith('0')) {
              return \`\${cleaned.substring(0, 3)} \${cleaned.substring(3, 6)} \${cleaned.substring(6)}\`;
            }
          }
          
          return phone; // Return original if no formatting rules apply
        },
        
        validate: (phone, country = 'NL') => {
          const patterns = {
            NL: /^(\+31|0)[1-9]\d{8}$/,
            US: /^(\+1)?[2-9]\d{9}$/,
            UK: /^(\+44|0)[1-9]\d{9,10}$/
          };
          
          const cleaned = phone.replace(/\D/g, '');
          return patterns[country]?.test(cleaned) || false;
        }
      },
      
      // Address transformations
      address: {
        parseStreet: (streetAddress) => {
          const match = streetAddress.match(/^(.+?)\s+(\d+\w*)$/);
          if (match) {
            return {
              street: match[1],
              number: match[2]
            };
          }
          return { street: streetAddress, number: '' };
        },
        
        formatPostcode: (postcode, country = 'NL') => {
          if (country === 'NL') {
            const cleaned = postcode.replace(/\s/g, '').toUpperCase();
            if (cleaned.length === 6) {
              return \`\${cleaned.substring(0, 4)} \${cleaned.substring(4)}\`;
            }
          }
          return postcode;
        }
      }
    };
  }
  
  // Transform complete customer record
  transformCustomer(rawCustomer) {
    const transformed = {
      // Basic info
      id: rawCustomer.id || this.generateId(),
      
      // Name processing
      name: this.transformations.name.format(
        rawCustomer.firstName?.trim(), 
        rawCustomer.lastName?.trim()
      ),
      
      // Contact info
      email: {
        address: rawCustomer.email?.toLowerCase(),
        valid: this.transformations.email.validate(rawCustomer.email),
        domain: this.transformations.email.getDomain(rawCustomer.email),
        username: this.transformations.email.suggestUsername(rawCustomer.email)
      },
      
      phone: {
        number: rawCustomer.phone,
        formatted: this.transformations.phone.format(rawCustomer.phone),
        valid: this.transformations.phone.validate(rawCustomer.phone)
      },
      
      // Address
      address: {
        ...this.transformations.address.parseStreet(rawCustomer.street || ''),
        postcode: this.transformations.address.formatPostcode(rawCustomer.postcode || ''),
        city: rawCustomer.city?.trim(),
        country: rawCustomer.country || 'NL'
      },
      
      // Metadata
      metadata: {
        source: rawCustomer.source || 'manual',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        dataQuality: this.assessDataQuality(rawCustomer)
      }
    };
    
    return transformed;
  }
  
  assessDataQuality(customer) {
    let score = 0;
    const checks = {
      hasFirstName: !!customer.firstName,
      hasLastName: !!customer.lastName,
      hasValidEmail: this.transformations.email.validate(customer.email || ''),
      hasValidPhone: this.transformations.phone.validate(customer.phone || ''),
      hasCompleteAddress: !!(customer.street && customer.postcode && customer.city)
    };
    
    Object.values(checks).forEach(check => {
      if (check) score += 20;
    });
    
    return {
      score,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      issues: Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check, _]) => check)
    };
  }
  
  generateId() {
    return 'CUS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Usage example in N8N
const transformer = new CustomerDataTransformer();
const customers = \$input.all();

return customers.map(item => ({
  json: transformer.transformCustomer(item.json)
}));
\`\`\`

### Order data processing

\`\`\`javascript
// Order data transformation pipeline
const orderTransformations = {
  // Calculate order metrics
  calculateMetrics: (order) => {
    const items = order.items || [];
    
    const subtotal = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    const discountAmount = order.discountPercent 
      ? subtotal * (order.discountPercent / 100) 
      : 0;
    
    const taxRate = order.taxRate || 0.21;
    const taxAmount = (subtotal - discountAmount) * taxRate;
    
    const shippingCost = calculateShipping(order);
    
    const total = subtotal - discountAmount + taxAmount + shippingCost;
    
    return {
      subtotal: roundingStrategies.standard(subtotal),
      discountAmount: roundingStrategies.standard(discountAmount),
      taxAmount: roundingStrategies.standard(taxAmount),
      shippingCost: roundingStrategies.standard(shippingCost),
      total: roundingStrategies.standard(total),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueItems: items.length
    };
  },
  
  // Format order for different channels
  formatForChannel: (order, channel) => {
    const base = {
      orderId: order.id,
      customerName: order.customer.name,
      orderDate: dateFormatters.iso(new Date(order.createdAt)),
      status: order.status
    };
    
    switch(channel) {
      case 'email':
        return {
          ...base,
          formattedDate: dateFormatters.dutchLong(new Date(order.createdAt)),
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: formatCurrency(item.price),
            total: formatCurrency(item.price * item.quantity)
          })),
          totals: {
            subtotal: formatCurrency(order.metrics.subtotal),
            discount: formatCurrency(order.metrics.discountAmount),
            tax: formatCurrency(order.metrics.taxAmount),
            shipping: formatCurrency(order.metrics.shippingCost),
            total: formatCurrency(order.metrics.total)
          }
        };
        
      case 'api':
        return {
          ...base,
          timestamp: new Date(order.createdAt).getTime(),
          items: order.items,
          metrics: order.metrics,
          shipping: order.shipping,
          payment: order.payment
        };
        
      case 'accounting':
        return {
          ...base,
          invoiceNumber: generateInvoiceNumber(order),
          fiscalYear: new Date(order.createdAt).getFullYear(),
          fiscalQuarter: Math.ceil((new Date(order.createdAt).getMonth() + 1) / 3),
          vatBreakdown: {
            base: order.metrics.subtotal - order.metrics.discountAmount,
            vatRate: order.taxRate * 100,
            vatAmount: order.metrics.taxAmount
          },
          ledgerEntries: generateLedgerEntries(order)
        };
        
      default:
        return base;
    }
  }
};

// Helper functions
function calculateShipping(order) {
  const weight = order.items.reduce((sum, item) => 
    sum + (item.weight || 0) * item.quantity, 0
  );
  
  if (order.shippingMethod === 'express') {
    return weight * 2.5 + 10;
  } else if (order.shippingMethod === 'standard') {
    return weight * 1.5 + 5;
  }
  
  return 0; // Free shipping
}

function generateInvoiceNumber(order) {
  const date = new Date(order.createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const sequence = String(order.dailySequence || 1).padStart(4, '0');
  
  return \`INV-\${year}\${month}-\${sequence}\`;
}

function generateLedgerEntries(order) {
  return [
    {
      account: '1300', // Accounts Receivable
      debit: order.metrics.total,
      credit: 0,
      description: \`Invoice \${order.id}\`
    },
    {
      account: '4000', // Sales Revenue
      debit: 0,
      credit: order.metrics.subtotal - order.metrics.discountAmount,
      description: \`Sales revenue \${order.id}\`
    },
    {
      account: '2200', // VAT Payable
      debit: 0,
      credit: order.metrics.taxAmount,
      description: \`VAT \${order.id}\`
    }
  ];
}
\`\`\`

## Best practices

1. **Data validation**: Altijd input valideren voor transformatie
2. **Error handling**: Graceful omgaan met ongeldige data
3. **Performance**: Gebruik efficiente algoritmes voor bulk operaties
4. **Locale awareness**: Houd rekening met regionale verschillen
5. **Type safety**: Controleer data types voor berekeningen
6. **Logging**: Log transformatie stappen voor debugging
7. **Reusability**: Maak herbruikbare transformatie functies

## Veelvoorkomende valkuilen

1. **Timezone confusion**: Altijd expliciet zijn over timezones
2. **Number precision**: Let op floating point precisie issues
3. **Locale formats**: Test met verschillende regionale settings
4. **Memory usage**: Wees voorzichtig met grote datasets
5. **Regex performance**: Complex regex kan traag zijn
  `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'N8N Complete data transformation workflow',
      language: 'javascript',
      code: `// N8N Function node for comprehensive data transformation
const items = \$input.all();

// Initialize transformer utilities
const transformers = {
  // String transformations
  string: {
    titleCase: (str) => str.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    ),
    
    slugify: (str) => str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim(),
    
    truncate: (str, length = 100) => 
      str.length > length ? str.substring(0, length) + '...' : str,
    
    extractUrls: (text) => {
      const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      return text.match(urlRegex) || [];
    }
  },
  
  // Number transformations
  number: {
    percentage: (value, total) => ((value / total) * 100).toFixed(2) + '%',
    
    formatBytes: (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      if (bytes === 0) return '0 Bytes';
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    formatDuration: (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      const parts = [];
      if (hours > 0) parts.push(\`\${hours}h\`);
      if (minutes > 0) parts.push(\`\${minutes}m\`);
      if (secs > 0) parts.push(\`\${secs}s\`);
      
      return parts.join(' ') || '0s';
    }
  },
  
  // Date transformations
  date: {
    startOfDay: (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    },
    
    endOfDay: (date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    },
    
    weekNumber: (date) => {
      const d = new Date(date);
      const oneJan = new Date(d.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
      return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
    },
    
    quarter: (date) => {
      const d = new Date(date);
      return Math.floor((d.getMonth() + 3) / 3);
    }
  },
  
  // Array transformations
  array: {
    unique: (arr) => [...new Set(arr)],
    
    groupBy: (arr, key) => arr.reduce((acc, item) => {
      const group = item[key];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {}),
    
    sortBy: (arr, key, desc = false) => 
      arr.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (desc) return bVal > aVal ? 1 : -1;
        return aVal > bVal ? 1 : -1;
      }),
    
    chunk: (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    }
  }
};

// Process each item
return items.map(item => {
  const data = item.json;
  
  // Transform based on data type
  const transformed = {
    // Original data
    original: data,
    
    // String transformations
    formatted: {
      name: data.name ? transformers.string.titleCase(data.name) : '',
      slug: data.title ? transformers.string.slugify(data.title) : '',
      summary: data.description ? transformers.string.truncate(data.description, 150) : '',
      urls: data.content ? transformers.string.extractUrls(data.content) : []
    },
    
    // Number transformations
    calculations: {
      completionRate: data.completed && data.total ? 
        transformers.number.percentage(data.completed, data.total) : '0%',
      fileSize: data.bytes ? transformers.number.formatBytes(data.bytes) : '',
      duration: data.seconds ? transformers.number.formatDuration(data.seconds) : ''
    },
    
    // Date transformations
    dates: {
      dayStart: data.date ? transformers.date.startOfDay(data.date).toISOString() : null,
      dayEnd: data.date ? transformers.date.endOfDay(data.date).toISOString() : null,
      week: data.date ? transformers.date.weekNumber(data.date) : null,
      quarter: data.date ? transformers.date.quarter(data.date) : null
    },
    
    // Metadata
    _meta: {
      transformedAt: new Date().toISOString(),
      transformationVersion: '1.0'
    }
  };
  
  return { json: transformed };
});`
    },
    {
      id: 'example-2',
      title: 'Make.com Advanced mapping template',
      language: 'json',
      code: `// Make.com mapping with built-in functions
{
  "customer": {
    // Text transformations
    "fullName": "{{capitalize(1.firstName)}} {{upper(substring(1.lastName; 0; 1))}}{{lower(substring(1.lastName; 1))}}",
    "email": "{{lower(trim(1.email))}}",
    "phone": "{{replace(replace(1.phone; \"-\"; \"\"); \" \"; \"\")}}",
    
    // Date calculations
    "accountAge": "{{floor(dateDifference(now; parseDate(1.createdDate; \"YYYY-MM-DD\"); \"days\"))}}",
    "nextBirthday": "{{if(formatDate(parseDate(1.birthDate; \"YYYY-MM-DD\"); \"MM-DD\") > formatDate(now; \"MM-DD\"); 
      formatDate(setYear(parseDate(1.birthDate; \"YYYY-MM-DD\"); year(now)); \"YYYY-MM-DD\");
      formatDate(setYear(parseDate(1.birthDate; \"YYYY-MM-DD\"); year(now) + 1); \"YYYY-MM-DD\"))}}",
    
    // Number formatting
    "totalSpent": "{{formatNumber(sum(map(1.orders; \"amount\")); 2; \",\"; \".\")}}",
    "averageOrderValue": "{{formatNumber(avg(map(1.orders; \"amount\")); 2; \",\"; \".\")}}",
    
    // Conditional transformations
    "customerTier": "{{if(sum(map(1.orders; \"amount\")) > 10000; \"Platinum\";
      if(sum(map(1.orders; \"amount\")) > 5000; \"Gold\";
      if(sum(map(1.orders; \"amount\")) > 1000; \"Silver\"; \"Bronze\")))}}",
    
    // Array operations
    "uniqueCategories": "{{distinct(flatten(map(1.orders; \"items.category\")))}}",
    "mostRecentOrder": "{{first(sort(1.orders; \"date\"; true))}}",
    
    // Complex calculations
    "lifetimeValue": "{{
      round(
        sum(map(1.orders; \"amount\")) * 
        if(length(1.orders) > 10; 1.2; 1) * 
        if(contains(1.tags; \"vip\"); 1.5; 1);
      2)
    }}"
  },
  
  // Metadata
  "_processed": {
    "timestamp": "{{formatDate(now; \"YYYY-MM-DD HH:mm:ss\")}}",
    "version": "2.0",
    "source": "{{1._source}}"
  }
}`
    },
    {
      id: 'example-3',
      title: 'Data quality assessment function',
      language: 'javascript',
      code: `// Comprehensive data quality checker
function assessDataQuality(record) {
  const qualityChecks = {
    completeness: {
      weight: 0.3,
      checks: {
        hasRequiredFields: () => {
          const required = ['name', 'email', 'phone'];
          return required.every(field => record[field] && record[field].trim());
        },
        hasOptionalFields: () => {
          const optional = ['address', 'company', 'notes'];
          const filled = optional.filter(field => record[field] && record[field].trim());
          return filled.length / optional.length;
        }
      }
    },
    
    validity: {
      weight: 0.3,
      checks: {
        validEmail: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email || ''),
        validPhone: () => /^[\d\s\+\-\(\)]+$/.test(record.phone || ''),
        validDate: () => {
          if (!record.birthDate) return true;
          const date = new Date(record.birthDate);
          return date instanceof Date && !isNaN(date);
        }
      }
    },
    
    consistency: {
      weight: 0.2,
      checks: {
        nameFormat: () => {
          const name = record.name || '';
          return name === name.trim() && !name.includes('  ');
        },
        caseConsistency: () => {
          const email = record.email || '';
          return email === email.toLowerCase();
        }
      }
    },
    
    accuracy: {
      weight: 0.2,
      checks: {
        plausibleAge: () => {
          if (!record.birthDate) return true;
          const age = new Date().getFullYear() - new Date(record.birthDate).getFullYear();
          return age >= 0 && age <= 120;
        },
        reasonableValues: () => {
          if (record.income) {
            return record.income > 0 && record.income < 10000000;
          }
          return true;
        }
      }
    }
  };
  
  // Calculate scores
  const scores = {};
  let totalScore = 0;
  
  for (const [category, config] of Object.entries(qualityChecks)) {
    const checkResults = {};
    let categoryScore = 0;
    
    for (const [checkName, checkFn] of Object.entries(config.checks)) {
      try {
        const result = checkFn();
        checkResults[checkName] = typeof result === 'boolean' ? (result ? 1 : 0) : result;
        categoryScore += checkResults[checkName];
      } catch (error) {
        checkResults[checkName] = 0;
      }
    }
    
    categoryScore = (categoryScore / Object.keys(config.checks).length) * 100;
    scores[category] = {
      score: categoryScore,
      weight: config.weight,
      checks: checkResults
    };
    
    totalScore += categoryScore * config.weight;
  }
  
  return {
    overallScore: Math.round(totalScore),
    grade: totalScore >= 90 ? 'A' : 
           totalScore >= 80 ? 'B' : 
           totalScore >= 70 ? 'C' : 
           totalScore >= 60 ? 'D' : 'F',
    categories: scores,
    recommendations: generateRecommendations(scores)
  };
}

function generateRecommendations(scores) {
  const recommendations = [];
  
  for (const [category, data] of Object.entries(scores)) {
    if (data.score < 80) {
      for (const [check, result] of Object.entries(data.checks)) {
        if (result < 1) {
          recommendations.push({
            category,
            issue: check,
            severity: result === 0 ? 'high' : 'medium',
            suggestion: getImprovementSuggestion(check)
          });
        }
      }
    }
  }
  
  return recommendations.sort((a, b) => 
    a.severity === 'high' && b.severity !== 'high' ? -1 : 1
  );
}

function getImprovementSuggestion(check) {
  const suggestions = {
    hasRequiredFields: 'Ensure all required fields are filled',
    validEmail: 'Verify email format is correct',
    validPhone: 'Check phone number contains only valid characters',
    nameFormat: 'Remove extra spaces and trim whitespace',
    caseConsistency: 'Standardize text casing (e.g., lowercase emails)'
  };
  
  return suggestions[check] || 'Review and correct this field';
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-2-1-1',
      title: 'Build een customer data enrichment workflow',
      description: 'Creëer een workflow die ruwe klantdata uit verschillende bronnen (CSV, API, forms) verzamelt en transformeert naar een uniform format. Implementeer validatie, data cleaning, en enrichment met externe data.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'assignment-2-1-2',
      title: 'Ontwikkel een financial reporting transformer',
      description: 'Bouw een systeem dat financiële transacties transformeert voor verschillende doeleinden: accounting (met BTW berekeningen), management rapportage (met KPIs), en customer invoices (met formatting).',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'assignment-2-1-3',
      title: 'Implementeer een multi-timezone event processor',
      description: 'Maak een workflow die events verwerkt voor een globaal bedrijf. Handle timezone conversies, business hours checks, en locale-specific formatting voor verschillende regio\'s.',
      difficulty: 'hard',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'N8N Expression documentation',
      url: 'https://docs.n8n.io/code/expressions/',
      type: 'documentation'
    },
    {
      title: 'Make.com Functions reference',
      url: 'https://www.make.com/en/help/functions',
      type: 'documentation'
    },
    {
      title: 'JavaScript Date and Time guide',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date',
      type: 'guide'
    },
    {
      title: 'Regex101 - Regular Expression tester',
      url: 'https://regex101.com/',
      type: 'tool'
    }
  ]
};