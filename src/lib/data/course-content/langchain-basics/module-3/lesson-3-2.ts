import { Lesson } from '$lib/types/lesson';

export const lesson3_2: Lesson = {
  id: 'langchain-3-2',
  moduleId: 'langchain-module-3',
  title: 'Custom Tools Development',
  objectives: [
    'Leer hoe je custom tools voor LangChain agents ontwikkelt',
    'Begrijp verschillende tool creation patterns',
    'Integreer Nederlandse APIs als agent tools',
    'Implementeer robuuste error handling in tools'
  ],
  content: `
# Custom Tools Development voor LangChain Agents

Custom tools stellen agents in staat om specifieke taken uit te voeren die niet door standaard tools worden gedekt. In deze les leren we hoe we krachtige, herbruikbare tools ontwikkelen voor Nederlandse use cases.

## Tool Creation Patterns

### Basic Tool Structure

Een LangChain tool heeft minimaal een naam, beschrijving en functie nodig:

\`\`\`typescript
import { DynamicTool } from '@langchain/core/tools';

// Simpele tool voor Nederlandse postcode validatie
const dutchPostcodeValidator = new DynamicTool({
  name: "dutch_postcode_validator",
  description: "Validates Dutch postcodes (format: 1234 AB)",
  func: async (postcode: string) => {
    const regex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/;
    
    if (!postcode) {
      return "Geen postcode opgegeven";
    }
    
    const cleaned = postcode.toUpperCase().replace(/\s+/g, ' ').trim();
    
    if (regex.test(cleaned)) {
      return \`✓ \${cleaned} is een geldige Nederlandse postcode\`;
    } else {
      return \`✗ \${postcode} is geen geldige Nederlandse postcode (formaat: 1234 AB)\`;
    }
  }
});
\`\`\`

### Structured Tool met Zod Schema

Voor complexere inputs gebruik je Zod schema's:

\`\`\`typescript
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';

// BTW Calculator Tool
const btwCalculatorTool = new DynamicStructuredTool({
  name: "btw_calculator",
  description: "Berekent BTW bedragen voor Nederlandse tarieven (21%, 9%, 0%)",
  schema: z.object({
    amount: z.number().describe("Bedrag exclusief BTW"),
    rate: z.enum(["21", "9", "0"]).describe("BTW tarief: 21% (standaard), 9% (verlaagd), 0% (vrijgesteld)"),
    includesBtw: z.boolean().optional().describe("Of het bedrag al BTW bevat")
  }),
  func: async ({ amount, rate, includesBtw = false }) => {
    const rateNum = parseInt(rate) / 100;
    
    let exclBtw: number;
    let btw: number;
    let inclBtw: number;
    
    if (includesBtw) {
      // Bedrag is inclusief BTW
      inclBtw = amount;
      exclBtw = amount / (1 + rateNum);
      btw = inclBtw - exclBtw;
    } else {
      // Bedrag is exclusief BTW
      exclBtw = amount;
      btw = amount * rateNum;
      inclBtw = exclBtw + btw;
    }
    
    return {
      bedragExclusiefBtw: exclBtw.toFixed(2),
      btwBedrag: btw.toFixed(2),
      bedragInclusiefBtw: inclBtw.toFixed(2),
      btwTarief: \`\${rate}%\`,
      berekening: includesBtw 
        ? \`€\${amount} / 1.\${rate} = €\${exclBtw.toFixed(2)} (excl. BTW)\`
        : \`€\${amount} × \${rateNum} = €\${btw.toFixed(2)} (BTW)\`
    };
  }
});
\`\`\`

## Dutch API Integrations

### Kvk Handelsregister API Tool

\`\`\`typescript
import axios from 'axios';

const kvkSearchTool = new DynamicStructuredTool({
  name: "kvk_search",
  description: "Zoekt bedrijfsinformatie op in het KvK Handelsregister",
  schema: z.object({
    query: z.string().describe("Bedrijfsnaam of KvK-nummer"),
    type: z.enum(["naam", "kvk"]).describe("Type zoekopdracht")
  }),
  func: async ({ query, type }) => {
    try {
      // In productie: gebruik echte KvK API met authenticatie
      const mockData = {
        "12345678": {
          naam: "Voorbeeld B.V.",
          kvkNummer: "12345678",
          vestigingsadres: {
            straat: "Damrak 1",
            postcode: "1012 LG",
            plaats: "Amsterdam"
          },
          hoofdActiviteit: "Softwareontwikkeling",
          werknemers: "10-50",
          opgericht: "2015-03-15"
        }
      };
      
      if (type === "kvk" && mockData[query]) {
        const bedrijf = mockData[query];
        return \`
Bedrijfsgegevens:
- Naam: \${bedrijf.naam}
- KvK-nummer: \${bedrijf.kvkNummer}
- Adres: \${bedrijf.vestigingsadres.straat}, \${bedrijf.vestigingsadres.postcode} \${bedrijf.vestigingsadres.plaats}
- Hoofdactiviteit: \${bedrijf.hoofdActiviteit}
- Werknemers: \${bedrijf.werknemers}
- Opgericht: \${new Date(bedrijf.opgericht).toLocaleDateString('nl-NL')}
        \`;
      }
      
      return "Geen resultaten gevonden voor deze zoekopdracht";
      
    } catch (error) {
      return \`Fout bij ophalen KvK gegevens: \${error.message}\`;
    }
  }
});
\`\`\`

### Nederlandse Weer API Tool

\`\`\`typescript
const dutchWeatherTool = new DynamicStructuredTool({
  name: "dutch_weather",
  description: "Haalt actuele weersinformatie op voor Nederlandse steden",
  schema: z.object({
    city: z.string().describe("Nederlandse stad"),
    includeForecast: z.boolean().optional().describe("Inclusief 3-daagse voorspelling")
  }),
  func: async ({ city, includeForecast = false }) => {
    try {
      // Mock weather data - vervang met echte API zoals OpenWeatherMap
      const weatherData = {
        amsterdam: {
          current: {
            temp: 18,
            description: "Bewolkt",
            humidity: 75,
            wind: { speed: 15, direction: "ZW" }
          },
          forecast: [
            { day: "Morgen", temp: 20, description: "Zonnig" },
            { day: "Overmorgen", temp: 19, description: "Halfbewolkt" },
            { day: "Za", temp: 17, description: "Regen" }
          ]
        },
        rotterdam: {
          current: {
            temp: 19,
            description: "Zonnig",
            humidity: 70,
            wind: { speed: 20, direction: "W" }
          },
          forecast: [
            { day: "Morgen", temp: 21, description: "Zonnig" },
            { day: "Overmorgen", temp: 18, description: "Bewolkt" },
            { day: "Za", temp: 16, description: "Regen" }
          ]
        }
      };
      
      const cityLower = city.toLowerCase();
      const data = weatherData[cityLower];
      
      if (!data) {
        return \`Geen weergegevens beschikbaar voor \${city}\`;
      }
      
      let result = \`
Weer in \${city}:
🌡️ Temperatuur: \${data.current.temp}°C
☁️ Omstandigheden: \${data.current.description}
💧 Luchtvochtigheid: \${data.current.humidity}%
💨 Wind: \${data.current.wind.speed} km/u uit het \${data.current.wind.direction}
      \`;
      
      if (includeForecast) {
        result += "\\n\\nVoorspelling:";
        data.forecast.forEach(day => {
          result += \`\\n- \${day.day}: \${day.temp}°C, \${day.description}\`;
        });
      }
      
      return result.trim();
      
    } catch (error) {
      return \`Fout bij ophalen weergegevens: \${error.message}\`;
    }
  }
});
\`\`\`

## Error Handling Patterns

### Comprehensive Error Handling Tool

\`\`\`typescript
class RobustDutchBankingTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "dutch_banking_iban_validator",
      description: "Valideert Nederlandse IBAN nummers met uitgebreide foutafhandeling",
      schema: z.object({
        iban: z.string().describe("IBAN nummer om te valideren"),
        checkBank: z.boolean().optional().describe("Controleer ook de bank")
      }),
      func: async ({ iban, checkBank = false }) => {
        return this.validateIban(iban, checkBank);
      }
    });
  }
  
  private async validateIban(iban: string, checkBank: boolean): Promise<string> {
    try {
      // Input validatie
      if (!iban) {
        throw new Error("IBAN is verplicht");
      }
      
      // Cleanup
      const cleanIban = iban.replace(/\\s/g, '').toUpperCase();
      
      // Nederlandse IBAN check
      if (!cleanIban.startsWith('NL')) {
        return this.formatError("Alleen Nederlandse IBANs worden ondersteund", "INVALID_COUNTRY");
      }
      
      // Length check
      if (cleanIban.length !== 18) {
        return this.formatError(
          \`Nederlandse IBAN moet 18 karakters zijn (gevonden: \${cleanIban.length})\`,
          "INVALID_LENGTH"
        );
      }
      
      // Format check
      const ibanRegex = /^NL[0-9]{2}[A-Z]{4}[0-9]{10}$/;
      if (!ibanRegex.test(cleanIban)) {
        return this.formatError(
          "Ongeldig IBAN formaat. Verwacht: NL00BANK0000000000",
          "INVALID_FORMAT"
        );
      }
      
      // Modulo 97 check
      if (!this.validateModulo97(cleanIban)) {
        return this.formatError(
          "IBAN controle cijfers zijn onjuist",
          "INVALID_CHECKSUM"
        );
      }
      
      // Bank check
      if (checkBank) {
        const bankInfo = await this.getBankInfo(cleanIban.substring(4, 8));
        return \`
✅ Geldig Nederlands IBAN: \${this.formatIban(cleanIban)}
🏦 Bank: \${bankInfo.name}
📍 BIC: \${bankInfo.bic}
        \`;
      }
      
      return \`✅ Geldig Nederlands IBAN: \${this.formatIban(cleanIban)}\`;
      
    } catch (error) {
      // Log error voor debugging
      console.error('IBAN validation error:', error);
      
      // User-friendly error
      if (error.message.includes('network')) {
        return this.formatError(
          "Kan geen verbinding maken met de bank service",
          "NETWORK_ERROR"
        );
      }
      
      return this.formatError(
        error.message || "Onbekende fout bij IBAN validatie",
        "UNKNOWN_ERROR"
      );
    }
  }
  
  private validateModulo97(iban: string): boolean {
    // Move first 4 chars to end
    const rearranged = iban.substring(4) + iban.substring(0, 4);
    
    // Convert to numbers (A=10, B=11, etc)
    const numeric = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );
    
    // Calculate mod 97
    let remainder = 0;
    for (const digit of numeric) {
      remainder = (remainder * 10 + parseInt(digit)) % 97;
    }
    
    return remainder === 1;
  }
  
  private async getBankInfo(bankCode: string): Promise<{name: string, bic: string}> {
    const banks = {
      "ABNA": { name: "ABN AMRO", bic: "ABNANL2A" },
      "RABO": { name: "Rabobank", bic: "RABONL2U" },
      "INGB": { name: "ING", bic: "INGBNL2A" },
      "SNSB": { name: "SNS Bank", bic: "SNSBNL2A" },
      "TRIO": { name: "Triodos Bank", bic: "TRIONL2U" }
    };
    
    return banks[bankCode] || { name: "Onbekende bank", bic: "UNKNOWN" };
  }
  
  private formatIban(iban: string): string {
    return iban.match(/.{1,4}/g)?.join(' ') || iban;
  }
  
  private formatError(message: string, code: string): string {
    return \`❌ Fout: \${message}\\n📋 Code: \${code}\\n💡 Tip: Controleer het IBAN nummer en probeer opnieuw\`;
  }
}

// Gebruik de tool
const bankingTool = new RobustDutchBankingTool();
\`\`\`

## Tool Testing en Debugging

\`\`\`typescript
// Test harness voor tools
async function testTool(tool: DynamicTool | DynamicStructuredTool, testCases: any[]) {
  console.log(\`Testing tool: \${tool.name}\\n\`);
  
  for (const testCase of testCases) {
    try {
      console.log(\`Test: \${JSON.stringify(testCase.input)}\`);
      const result = await tool.func(testCase.input);
      console.log(\`Result: \${result}\`);
      console.log(\`Expected: \${testCase.expected ? '✓' : '✗'}\\n\`);
    } catch (error) {
      console.error(\`Error: \${error.message}\\n\`);
    }
  }
}

// Test cases voor IBAN validator
const ibanTestCases = [
  {
    input: { iban: "NL91ABNA0417164300", checkBank: true },
    expected: true,
    description: "Valid ABN AMRO IBAN"
  },
  {
    input: { iban: "NL91ABNA0417164301", checkBank: false },
    expected: false,
    description: "Invalid checksum"
  },
  {
    input: { iban: "DE89370400440532013000", checkBank: false },
    expected: false,
    description: "German IBAN"
  }
];
\`\`\`

Deze patterns zorgen voor betrouwbare, herbruikbare tools die goed integreren met LangChain agents en robuust omgaan met fouten.
`,
  exercises: [
    {
      id: 'langchain-3-2-ex-1',
      title: 'Bouw een Nederlandse Adres Validator Tool',
      description: 'Ontwikkel een tool die Nederlandse adressen valideert en verrijkt met gemeente/provincie informatie',
      difficulty: 'intermediate',
      starterCode: `// Ontwikkel een adres validator tool
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// TODO: Implementeer de DutchAddressValidator tool
// - Valideer postcode formaat
// - Controleer huisnummer
// - Voeg gemeente/provincie toe
// - Handel fouten netjes af`,
      solution: `import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

const dutchAddressValidator = new DynamicStructuredTool({
  name: "dutch_address_validator",
  description: "Valideert en verrijkt Nederlandse adressen",
  schema: z.object({
    street: z.string().describe("Straatnaam"),
    houseNumber: z.string().describe("Huisnummer (inclusief toevoeging)"),
    postcode: z.string().describe("Postcode"),
    city: z.string().optional().describe("Plaatsnaam")
  }),
  func: async ({ street, houseNumber, postcode, city }) => {
    try {
      // Valideer postcode
      const postcodeRegex = /^[1-9][0-9]{3}\\s?[A-Z]{2}$/;
      const cleanPostcode = postcode.toUpperCase().replace(/\\s+/g, ' ').trim();
      
      if (!postcodeRegex.test(cleanPostcode)) {
        throw new Error(\`Ongeldige postcode: \${postcode}\`);
      }
      
      // Parse huisnummer
      const houseNumberMatch = houseNumber.match(/^(\\d+)(.*)$/);
      if (!houseNumberMatch) {
        throw new Error(\`Ongeldig huisnummer: \${houseNumber}\`);
      }
      
      const [, number, addition] = houseNumberMatch;
      
      // Mock postcode database
      const postcodeData = {
        "1012 LG": { city: "Amsterdam", province: "Noord-Holland", municipality: "Amsterdam" },
        "3011 EA": { city: "Rotterdam", province: "Zuid-Holland", municipality: "Rotterdam" },
        "3511 LX": { city: "Utrecht", province: "Utrecht", municipality: "Utrecht" }
      };
      
      const locationData = postcodeData[cleanPostcode] || {
        city: city || "Onbekend",
        province: "Onbekend",
        municipality: "Onbekend"
      };
      
      // Format address
      const formattedAddress = {
        volledigAdres: \`\${street} \${number}\${addition?.trim() || ''}, \${cleanPostcode} \${locationData.city}\`,
        straat: street,
        huisnummer: parseInt(number),
        toevoeging: addition?.trim() || null,
        postcode: cleanPostcode,
        plaats: locationData.city,
        gemeente: locationData.municipality,
        provincie: locationData.province,
        valid: true
      };
      
      return \`
✅ Adres gevalideerd:

📍 Volledig adres: \${formattedAddress.volledigAdres}
🏘️ Gemeente: \${formattedAddress.gemeente}
🗺️ Provincie: \${formattedAddress.provincie}

Details:
- Straat: \${formattedAddress.straat}
- Nummer: \${formattedAddress.huisnummer}\${formattedAddress.toevoeging ? ' ' + formattedAddress.toevoeging : ''}
- Postcode: \${formattedAddress.postcode}
- Plaats: \${formattedAddress.plaats}
      \`;
      
    } catch (error) {
      return \`❌ Validatie fout: \${error.message}\\n\\n💡 Tip: Controleer of het adres volledig en correct is ingevuld.\`;
    }
  }
});

// Test de tool
const testAddress = {
  street: "Damrak",
  houseNumber: "75-A",
  postcode: "1012LG",
  city: "Amsterdam"
};

const result = await dutchAddressValidator.func(testAddress);
console.log(result);`,
      hint: 'Splits het huisnummer in nummer en toevoeging, valideer de postcode met regex, en gebruik een mock database voor gemeente/provincie data'
    }
  ],
  quiz: [
    {
      id: 'langchain-3-2-q-1',
      question: 'Wat is het belangrijkste verschil tussen DynamicTool en DynamicStructuredTool?',
      options: [
        'DynamicTool is sneller',
        'DynamicStructuredTool gebruikt Zod schema voor gestructureerde input',
        'DynamicTool kan geen async functies aan',
        'Er is geen verschil'
      ],
      correctAnswer: 1,
      explanation: 'DynamicStructuredTool gebruikt Zod schemas voor type-safe, gestructureerde input validatie, terwijl DynamicTool alleen strings accepteert.'
    },
    {
      id: 'langchain-3-2-q-2',
      question: 'Welke best practice is essentieel voor tool error handling?',
      options: [
        'Gooi altijd exceptions',
        'Return altijd null bij fouten',
        'Geef duidelijke, actionable foutmeldingen terug',
        'Log fouten alleen naar console'
      ],
      correctAnswer: 2,
      explanation: 'Tools moeten duidelijke, bruikbare foutmeldingen teruggeven zodat de agent kan beslissen hoe verder te gaan.'
    }
  ]
};