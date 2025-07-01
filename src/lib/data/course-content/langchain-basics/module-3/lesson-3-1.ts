import { type Lesson } from '../../../types/lesson';

export const lesson31: Lesson = {
  id: 'langchain-3-1',
  title: 'ReAct Agents & Tool Creation',
  description: 'Master ReAct agents, custom tool creation for Dutch APIs, and multi-tool chains',
  duration: '75 min',
  learningObjectives: [
    'Implement ReAct agents with reasoning and action loops',
    'Create custom tools for Dutch APIs (KNMI, AEX, etc.)',
    'Build multi-tool chains for complex workflows',
    'Configure agent executors with persistent memory'
  ],
  content: `
# ReAct Agents & Tool Creation

ReAct (Reasoning and Acting) agents combine reasoning with actions to solve complex tasks. Let's build powerful agents with custom Dutch tools.

## Understanding ReAct Agents

ReAct agents follow a reasoning-action-observation loop:
1. **Reason** about the task and what action to take
2. **Act** by calling a tool or function
3. **Observe** the result and reason about next steps

## Basic ReAct Agent Implementation

\`\`\`typescript
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";

const model = new OpenAI({ 
  temperature: 0,
  modelName: "gpt-3.5-turbo" 
});

const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY),
  new Calculator(),
];

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  {
    agentType: "zero-shot-react-description",
    verbose: true,
  }
);

const result = await executor.call({
  input: "What's the weather in Amsterdam and how many degrees Celsius is that in Fahrenheit?"
});
\`\`\`

## Creating Custom Tools

Tools are the building blocks of agents. Let's create custom tools for Dutch services:

\`\`\`typescript
import { Tool } from "langchain/tools";

class KNMIWeatherTool extends Tool {
  name = "knmi-weather";
  description = "Get current weather data from KNMI (Royal Netherlands Meteorological Institute)";
  
  async _call(input: string): Promise<string> {
    try {
      // Parse location from input
      const location = this.parseLocation(input);
      
      // Call KNMI API (simplified example)
      const response = await fetch(
        \`https://api.knmi.nl/v1/weather/current?location=\${location}\`,
        {
          headers: {
            'Authorization': \`Bearer \${process.env.KNMI_API_KEY}\`
          }
        }
      );
      
      const data = await response.json();
      
      return JSON.stringify({
        location: data.location,
        temperature: data.temperature,
        description: data.weather_description,
        wind_speed: data.wind_speed,
        humidity: data.humidity
      });
    } catch (error) {
      return \`Error fetching weather: \${error.message}\`;
    }
  }
  
  private parseLocation(input: string): string {
    // Extract Dutch city names
    const cities = ['amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven'];
    const normalized = input.toLowerCase();
    
    for (const city of cities) {
      if (normalized.includes(city)) {
        return city;
      }
    }
    
    return 'amsterdam'; // Default
  }
}
\`\`\`

## Complete Example 1: Dutch Weather Agent

A comprehensive weather agent using KNMI data and Dutch location services:

\`\`\`typescript
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Tool } from "langchain/tools";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "langchain/prompts";

// Extended KNMI Weather Tool with more features
class DutchWeatherTool extends Tool {
  name = "dutch-weather";
  description = "Get detailed weather for Dutch cities including forecasts, alerts, and historical data";
  
  async _call(input: string): Promise<string> {
    const query = JSON.parse(input);
    const { city, type = "current" } = query;
    
    switch (type) {
      case "current":
        return await this.getCurrentWeather(city);
      case "forecast":
        return await this.getForecast(city);
      case "alerts":
        return await this.getWeatherAlerts(city);
      default:
        return "Invalid weather query type";
    }
  }
  
  private async getCurrentWeather(city: string): Promise<string> {
    // Simulated KNMI API response
    const weatherData = {
      amsterdam: {
        temp: 18,
        description: "Bewolkt met opklaringen",
        wind: "ZW 3 Bft",
        precipitation: "0.2 mm",
        visibility: "10 km"
      },
      rotterdam: {
        temp: 19,
        description: "Licht bewolkt",
        wind: "W 4 Bft",
        precipitation: "0.0 mm",
        visibility: "15 km"
      }
    };
    
    const data = weatherData[city.toLowerCase()] || weatherData.amsterdam;
    
    return \`Weer in \${city}:
- Temperatuur: \${data.temp}°C
- Beschrijving: \${data.description}
- Wind: \${data.wind}
- Neerslag: \${data.precipitation}
- Zicht: \${data.visibility}\`;
  }
  
  private async getForecast(city: string): Promise<string> {
    return \`5-daagse voorspelling voor \${city}:
Ma: 20°C, zonnig
Di: 18°C, bewolkt
Wo: 16°C, regen
Do: 17°C, opklaringen
Vr: 19°C, zonnig\`;
  }
  
  private async getWeatherAlerts(city: string): Promise<string> {
    return \`Geen actieve weerwaarschuwingen voor \${city}\`;
  }
}

// Dutch Province Info Tool
class ProvinceInfoTool extends Tool {
  name = "province-info";
  description = "Get information about Dutch provinces and their major cities";
  
  async _call(input: string): Promise<string> {
    const provinces = {
      "noord-holland": ["Amsterdam", "Haarlem", "Alkmaar"],
      "zuid-holland": ["Rotterdam", "Den Haag", "Leiden"],
      "utrecht": ["Utrecht", "Amersfoort", "Veenendaal"],
      "limburg": ["Maastricht", "Venlo", "Roermond"]
    };
    
    const provinceName = input.toLowerCase();
    const cities = provinces[provinceName];
    
    if (cities) {
      return \`Provincie \${input} heeft de volgende grote steden: \${cities.join(", ")}\`;
    }
    
    return "Provincie niet gevonden. Beschikbare provincies: " + Object.keys(provinces).join(", ");
  }
}

// Create the weather agent
const weatherModel = new ChatOpenAI({ 
  temperature: 0,
  modelName: "gpt-4"
});

const weatherTools = [
  new DutchWeatherTool(),
  new ProvinceInfoTool(),
  new Calculator() // For temperature conversions
];

const weatherPrompt = PromptTemplate.fromTemplate(\`
Je bent een Nederlandse weerassistent. Beantwoord vragen over het weer in Nederland.
Gebruik de beschikbare tools om actuele informatie te krijgen.

Available tools:
{tools}

Tool descriptions:
{tool_names}

Conversation history:
{chat_history}

Question: {input}

Gebruik dit formaat:
Thought: Ik moet nadenken over wat te doen
Action: tool_name
Action Input: {"key": "value"}
Observation: tool response
... (repeat Thought/Action/Action Input/Observation as needed)
Thought: Ik heb het definitieve antwoord
Final Answer: Het definitieve antwoord in het Nederlands

{agent_scratchpad}
\`);

const weatherMemory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true
});

const weatherAgent = await createReactAgent({
  llm: weatherModel,
  tools: weatherTools,
  prompt: weatherPrompt
});

const weatherExecutor = new AgentExecutor({
  agent: weatherAgent,
  tools: weatherTools,
  memory: weatherMemory,
  verbose: true
});

// Example usage
const weatherResult = await weatherExecutor.call({
  input: "Wat is het weer in Amsterdam en hoeveel graden is dat in Fahrenheit?"
});
\`\`\`

## Complete Example 2: AEX Financial Analysis Agent

An agent for analyzing Dutch stock market (AEX) data:

\`\`\`typescript
// AEX Stock Data Tool
class AEXStockTool extends Tool {
  name = "aex-stocks";
  description = "Get real-time AEX (Amsterdam Exchange Index) stock prices and analysis";
  
  async _call(input: string): Promise<string> {
    const query = JSON.parse(input);
    const { symbol, metric = "price" } = query;
    
    // Simulated AEX data
    const aexData = {
      "ASML": { price: 612.40, change: 2.3, volume: 1234567 },
      "SHELL": { price: 29.85, change: -0.5, volume: 5432109 },
      "UNILEVER": { price: 48.92, change: 1.2, volume: 2345678 },
      "ING": { price: 13.45, change: 0.8, volume: 8765432 },
      "PHILIPS": { price: 18.76, change: -1.5, volume: 3456789 }
    };
    
    const stock = aexData[symbol];
    if (!stock) {
      return \`Aandeel \${symbol} niet gevonden. Beschikbare AEX aandelen: \${Object.keys(aexData).join(", ")}\`;
    }
    
    switch (metric) {
      case "price":
        return \`\${symbol}: €\${stock.price} (\${stock.change > 0 ? '+' : ''}\${stock.change}%)\`;
      case "volume":
        return \`\${symbol} handelsvolume: \${stock.volume.toLocaleString('nl-NL')}\`;
      case "analysis":
        return this.analyzeStock(symbol, stock);
      default:
        return JSON.stringify(stock);
    }
  }
  
  private analyzeStock(symbol: string, data: any): string {
    const trend = data.change > 0 ? "stijgend" : "dalend";
    const strength = Math.abs(data.change) > 2 ? "sterk" : "licht";
    
    return \`Analyse \${symbol}:
- Huidige prijs: €\${data.price}
- Trend: \${strength} \${trend} (\${data.change}%)
- Handelsvolume: \${data.volume.toLocaleString('nl-NL')}
- Advies: \${data.change > 1 ? "Positief momentum" : data.change < -1 ? "Voorzichtigheid geboden" : "Neutraal"}\`;
  }
}

// Dutch Economic Indicators Tool
class DutchEconomyTool extends Tool {
  name = "dutch-economy";
  description = "Get Dutch economic indicators like GDP, inflation, unemployment";
  
  async _call(input: string): Promise<string> {
    const indicators = {
      gdp: { value: "912.2 miljard", growth: "4.3%", quarter: "Q2 2024" },
      inflation: { value: "2.8%", trend: "dalend", month: "Juni 2024" },
      unemployment: { value: "3.4%", change: "-0.2%", total: "334.000" },
      trade_balance: { value: "+€8.2 miljard", exports: "€62.3 miljard", imports: "€54.1 miljard" }
    };
    
    const indicator = input.toLowerCase();
    
    if (indicator === "all") {
      return \`Nederlandse Economische Indicatoren:
- BBP: \${indicators.gdp.value} (groei: \${indicators.gdp.growth})
- Inflatie: \${indicators.inflation.value} (\${indicators.inflation.trend})
- Werkloosheid: \${indicators.unemployment.value} (\${indicators.unemployment.total} personen)
- Handelsbalans: \${indicators.trade_balance.value}\`;
    }
    
    return JSON.stringify(indicators[indicator] || "Indicator niet gevonden");
  }
}

// Create financial analysis agent
const financeTools = [
  new AEXStockTool(),
  new DutchEconomyTool(),
  new Calculator(),
  new SerpAPI() // For news
];

const financePrompt = PromptTemplate.fromTemplate(\`
Je bent een Nederlandse financiële analist gespecialiseerd in de AEX en Nederlandse economie.
Geef gedetailleerde analyses en adviezen gebaseerd op actuele data.

Beschikbare tools: {tools}
Geschiedenis: {chat_history}

Vraag: {input}

Formaat:
Gedachte: Analyseer wat er nodig is
Actie: [tool naam]
Actie Input: {"parameter": "waarde"}
Observatie: [tool response]
Gedachte: Interpreteer de data
Definitief Antwoord: Gedetailleerde analyse in het Nederlands

{agent_scratchpad}
\`);

const financeExecutor = new AgentExecutor({
  agent: await createReactAgent({
    llm: new ChatOpenAI({ temperature: 0 }),
    tools: financeTools,
    prompt: financePrompt
  }),
  tools: financeTools,
  memory: new BufferMemory({ memoryKey: "chat_history" }),
  verbose: true
});

// Example: Complex financial query
await financeExecutor.call({
  input: "Vergelijk ASML met de gemiddelde AEX prestatie en geef een investeringsadvies"
});
\`\`\`

## Complete Example 3: Customer Support Agent

A multi-lingual support agent with knowledge base access:

\`\`\`typescript
// Knowledge Base Tool
class KnowledgeBaseTool extends Tool {
  name = "knowledge-base";
  description = "Search company knowledge base for product info, policies, and FAQs";
  
  private kb = {
    "retourbeleid": \`Retourbeleid:
- 30 dagen retourrecht
- Product moet ongebruikt zijn
- Originele verpakking vereist
- Verzendkosten worden vergoed bij defecten\`,
    
    "verzending": \`Verzendopties:
- Standaard: 2-3 werkdagen (€4,95)
- Express: Volgende werkdag (€9,95)
- Gratis verzending vanaf €50\`,
    
    "garantie": \`Garantievoorwaarden:
- 2 jaar fabrieksgarantie
- Extra garantie mogelijk tot 5 jaar
- Schade door eigen schuld uitgesloten\`
  };
  
  async _call(input: string): Promise<string> {
    const query = input.toLowerCase();
    
    for (const [key, value] of Object.entries(this.kb)) {
      if (query.includes(key)) {
        return value;
      }
    }
    
    return "Geen informatie gevonden. Probeer: retourbeleid, verzending, garantie";
  }
}

// Order Status Tool
class OrderStatusTool extends Tool {
  name = "order-status";
  description = "Check order status and tracking information";
  
  async _call(input: string): Promise<string> {
    const orderNumber = input.match(/\\d{6,}/)?.[0];
    
    if (!orderNumber) {
      return "Geef een geldig ordernummer (minimaal 6 cijfers)";
    }
    
    // Simulated order data
    return \`Order #\${orderNumber}:
- Status: Onderweg
- Verwachte levering: Morgen tussen 14:00-18:00
- Track & Trace: NL\${orderNumber}POSTNL
- Laatste update: Sorteercentrum Utrecht\`;
  }
}

// Ticket Creation Tool
class TicketTool extends Tool {
  name = "create-ticket";
  description = "Create support ticket for complex issues";
  
  async _call(input: string): Promise<string> {
    const { priority, category, description } = JSON.parse(input);
    
    const ticketId = \`NL\${Date.now().toString().slice(-6)}\`;
    
    return \`Support ticket aangemaakt:
- Ticket ID: \${ticketId}
- Prioriteit: \${priority}
- Categorie: \${category}
- Status: Open
- Verwachte responstijd: \${priority === 'hoog' ? '2 uur' : '24 uur'}
Een specialist neemt contact met u op.\`;
  }
}

// Create the support agent with personality
const supportTools = [
  new KnowledgeBaseTool(),
  new OrderStatusTool(),
  new TicketTool()
];

const supportPrompt = PromptTemplate.fromTemplate(\`
Je bent een vriendelijke Nederlandse klantenservice medewerker.
Je helpt klanten met vragen over bestellingen, producten en beleid.
Wees behulpzaam, empathisch en professioneel.

Tools: {tools}
Geschiedenis: {chat_history}

Klant: {input}

Instructies:
1. Begroet nieuwe klanten vriendelijk
2. Gebruik de tools om accurate informatie te geven
3. Escaleer naar een ticket bij complexe problemen
4. Bedank de klant altijd voor hun geduld

Formaat voor tool gebruik:
Gedachte: Wat moet ik opzoeken
Actie: [tool naam]
Actie Input: relevante informatie
Observatie: [resultaat]
Definitief Antwoord: Vriendelijk en volledig antwoord

{agent_scratchpad}
\`);

// Configure with conversation memory
const supportMemory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
  inputKey: "input",
  outputKey: "output"
});

const supportAgent = await createReactAgent({
  llm: new ChatOpenAI({ 
    temperature: 0.3,
    modelName: "gpt-4"
  }),
  tools: supportTools,
  prompt: supportPrompt
});

const supportExecutor = new AgentExecutor({
  agent: supportAgent,
  tools: supportTools,
  memory: supportMemory,
  verbose: true,
  maxIterations: 5
});

// Example conversation
const conversation = [
  "Ik heb een probleem met mijn bestelling",
  "Het ordernummer is 987654",
  "Kan ik het nog retourneren?"
];

for (const message of conversation) {
  const response = await supportExecutor.call({ input: message });
  console.log(\`Klant: \${message}\`);
  console.log(\`Agent: \${response.output}\\n\`);
}
\`\`\`

## Advanced Agent Features

### Custom Output Parsers

\`\`\`typescript
import { AgentActionOutputParser } from "langchain/agents";

class DutchAgentOutputParser extends AgentActionOutputParser {
  async parse(text: string) {
    // Handle Dutch action format
    const actionMatch = text.match(/Actie: (.+)\\nActie Input: (.+)/);
    
    if (actionMatch) {
      return {
        tool: actionMatch[1],
        toolInput: actionMatch[2],
        log: text
      };
    }
    
    const finalAnswerMatch = text.match(/Definitief Antwoord: (.+)/s);
    if (finalAnswerMatch) {
      return {
        returnValues: { output: finalAnswerMatch[1] },
        log: text
      };
    }
    
    throw new Error("Could not parse agent output");
  }
}
\`\`\`

### Agent Middleware

\`\`\`typescript
class AgentMiddleware {
  async beforeAction(action: any) {
    console.log(\`[Agent] Executing: \${action.tool}\`);
    // Add logging, rate limiting, etc.
  }
  
  async afterAction(result: any) {
    console.log(\`[Agent] Result received\`);
    // Process or transform results
  }
}
\`\`\`

## Best Practices

1. **Tool Design**: Keep tools focused and single-purpose
2. **Error Handling**: Always handle API failures gracefully
3. **Memory Usage**: Use appropriate memory types for your use case
4. **Prompt Engineering**: Provide clear instructions in your language
5. **Rate Limiting**: Implement rate limiting for external APIs
  `,
  codeExamples: [
    {
      title: 'Complete Weather Agent System',
      language: 'typescript',
      code: `
// Full implementation of a production-ready Dutch weather agent
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Tool } from "langchain/tools";
import { BufferWindowMemory } from "langchain/memory";
import { PromptTemplate } from "langchain/prompts";

// Advanced KNMI Weather Tool with caching
class KNMIWeatherService extends Tool {
  name = "knmi-weather-service";
  description = "Professional weather service using KNMI data with caching and alerts";
  
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheDuration = 10 * 60 * 1000; // 10 minutes
  
  async _call(input: string): Promise<string> {
    try {
      const query = JSON.parse(input);
      const { location, type = "current", details = false } = query;
      
      // Check cache
      const cacheKey = \`\${location}-\${type}\`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
        return JSON.stringify(cached.data);
      }
      
      // Fetch fresh data
      let result;
      switch (type) {
        case "current":
          result = await this.getCurrentWeather(location, details);
          break;
        case "forecast":
          result = await this.getExtendedForecast(location);
          break;
        case "alerts":
          result = await this.getWeatherAlerts(location);
          break;
        case "historical":
          result = await this.getHistoricalData(location);
          break;
        default:
          throw new Error(\`Unknown weather type: \${type}\`);
      }
      
      // Cache result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: true,
        message: error.message
      });
    }
  }
  
  private async getCurrentWeather(location: string, details: boolean) {
    // Simulated comprehensive weather data
    const weatherData = {
      location,
      timestamp: new Date().toISOString(),
      current: {
        temperature: 18.5,
        feels_like: 16.2,
        description: "Bewolkt met opklaringen",
        detailed_description: "Overwegend bewolkt met af en toe zon",
        wind: {
          speed: 15,
          direction: "ZW",
          beaufort: 3,
          gust: 22
        },
        precipitation: {
          amount: 0.2,
          probability: 20,
          type: "regen"
        },
        humidity: 72,
        pressure: 1015,
        visibility: 10000,
        uv_index: 3,
        cloud_cover: 65
      }
    };
    
    if (!details) {
      return {
        location: weatherData.location,
        temp: weatherData.current.temperature,
        description: weatherData.current.description,
        wind: \`\${weatherData.current.wind.direction} \${weatherData.current.wind.beaufort} Bft\`
      };
    }
    
    return weatherData;
  }
  
  private async getExtendedForecast(location: string) {
    const forecast = [];
    const days = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
    
    for (let i = 0; i < 7; i++) {
      forecast.push({
        day: days[i],
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
        max_temp: Math.round(15 + Math.random() * 10),
        min_temp: Math.round(8 + Math.random() * 7),
        description: ["Zonnig", "Bewolkt", "Regen", "Wisselvallig"][Math.floor(Math.random() * 4)],
        precipitation_chance: Math.round(Math.random() * 100),
        wind_force: Math.round(2 + Math.random() * 4)
      });
    }
    
    return {
      location,
      forecast,
      summary: "Wisselvallig weer met temperaturen rond normaal voor de tijd van het jaar"
    };
  }
  
  private async getWeatherAlerts(location: string) {
    // Check for active weather warnings
    const alerts = [];
    
    // Simulate checking for alerts
    if (Math.random() > 0.7) {
      alerts.push({
        type: "wind",
        level: "geel",
        message: "Waarschuwing voor zware windstoten tot 75 km/u",
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return {
      location,
      active_alerts: alerts.length,
      alerts
    };
  }
  
  private async getHistoricalData(location: string) {
    return {
      location,
      historical: {
        average_temp_this_month: 16.3,
        average_temp_normal: 15.8,
        rainfall_this_month: 45.2,
        rainfall_normal: 62.0,
        sunshine_hours_this_month: 156,
        records: {
          highest_temp: { value: 28.3, date: "15-06-2022" },
          lowest_temp: { value: -2.1, date: "08-01-2023" },
          most_rainfall: { value: 42.3, date: "23-07-2021" }
        }
      }
    };
  }
}

// Weather Analysis Tool
class WeatherAnalysisTool extends Tool {
  name = "weather-analysis";
  description = "Analyze weather patterns and provide recommendations";
  
  async _call(input: string): Promise<string> {
    const { data, query } = JSON.parse(input);
    
    if (query === "clothing") {
      return this.getClothingAdvice(data);
    } else if (query === "activities") {
      return this.getActivitySuggestions(data);
    } else if (query === "travel") {
      return this.getTravelAdvice(data);
    }
    
    return "Specificeer het type analyse: clothing, activities, of travel";
  }
  
  private getClothingAdvice(weather: any): string {
    const temp = weather.current?.temperature || weather.temp;
    const wind = weather.current?.wind?.beaufort || 3;
    const rain = weather.current?.precipitation?.probability || 0;
    
    let advice = "Kledingadvies:\\n";
    
    if (temp < 10) {
      advice += "- Warme jas aanbevolen\\n";
      advice += "- Sjaal en handschoenen meenemen\\n";
    } else if (temp < 18) {
      advice += "- Lichte jas of vest\\n";
      advice += "- Lange broek aanbevolen\\n";
    } else {
      advice += "- T-shirt weer\\n";
      advice += "- Zonnebril meenemen\\n";
    }
    
    if (rain > 40) {
      advice += "- Paraplu of regenjas meenemen\\n";
    }
    
    if (wind > 4) {
      advice += "- Windbestendige kleding aanbevolen\\n";
    }
    
    return advice;
  }
  
  private getActivitySuggestions(weather: any): string {
    const temp = weather.current?.temperature || weather.temp;
    const rain = weather.current?.precipitation?.probability || 0;
    
    let suggestions = "Activiteiten suggesties:\\n";
    
    if (rain < 30 && temp > 15) {
      suggestions += "- Fietsen: Uitstekende omstandigheden\\n";
      suggestions += "- Wandelen: Zeer geschikt\\n";
      suggestions += "- Terras: Perfect terras weer\\n";
    } else if (rain > 60) {
      suggestions += "- Museum bezoek aanbevolen\\n";
      suggestions += "- Bioscoop of theater\\n";
      suggestions += "- Indoor activiteiten\\n";
    } else {
      suggestions += "- Korte wandeling mogelijk\\n";
      suggestions += "- Sport met regenplan\\n";
    }
    
    return suggestions;
  }
  
  private getTravelAdvice(weather: any): string {
    const wind = weather.current?.wind?.beaufort || 3;
    const visibility = weather.current?.visibility || 10000;
    
    let advice = "Reisadvies:\\n";
    
    if (wind > 5) {
      advice += "- Let op: Harde wind kan het verkeer beïnvloeden\\n";
      advice += "- Extra voorzichtig met hoge voertuigen\\n";
    }
    
    if (visibility < 1000) {
      advice += "- Waarschuwing: Beperkt zicht\\n";
      advice += "- Rijd met mistlampen\\n";
    }
    
    advice += "- Actuele verkeersinformatie raadplegen\\n";
    
    return advice;
  }
}

// Create comprehensive weather assistant
const weatherAssistant = async () => {
  const model = new ChatOpenAI({
    temperature: 0.1,
    modelName: "gpt-4",
    streaming: true
  });
  
  const tools = [
    new KNMIWeatherService(),
    new WeatherAnalysisTool(),
    new Calculator() // For temperature conversions
  ];
  
  const prompt = PromptTemplate.fromTemplate(\`
Je bent een professionele Nederlandse weerexpert die werkt met KNMI data.
Je geeft nauwkeurige weerinformatie en praktische adviezen.

Beschikbare tools:
{tools}

Conversatie geschiedenis:
{chat_history}

Gebruiker: {input}

Instructies:
1. Gebruik altijd de KNMI weather service voor actuele data
2. Geef praktische adviezen gebaseerd op het weer
3. Wees specifiek over locaties in Nederland
4. Gebruik Nederlandse weertermen
5. Waarschuw voor extreme weersomstandigheden

Gebruik dit formaat:
Gedachte: Analyseer wat de gebruiker vraagt
Actie: [tool naam]
Actie Input: {"parameter": "waarde"}
Observatie: [tool resultaat]
... (herhaal indien nodig)
Gedachte: Ik heb alle benodigde informatie
Definitief Antwoord: [Uitgebreid antwoord met alle relevante informatie]

{agent_scratchpad}
\`);
  
  const memory = new BufferWindowMemory({
    memoryKey: "chat_history",
    k: 5, // Remember last 5 exchanges
    returnMessages: true
  });
  
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt
  });
  
  const executor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: true,
    maxIterations: 6,
    handleParsingErrors: true
  });
  
  return executor;
};

// Usage examples
const weatherBot = await weatherAssistant();

// Example 1: Current weather with advice
const result1 = await weatherBot.call({
  input: "Wat is het weer in Amsterdam en wat moet ik aantrekken?"
});

// Example 2: Weekend planning
const result2 = await weatherBot.call({
  input: "Ik wil dit weekend naar Texel. Is dat een goed idee qua weer?"
});

// Example 3: Weather alerts
const result3 = await weatherBot.call({
  input: "Zijn er weerwaarschuwingen actief voor Zuid-Holland?"
});
      `,
      platform: 'codesandbox',
      dependencies: {
        'langchain': '^0.0.150',
        '@langchain/openai': '^0.0.25',
        '@langchain/community': '^0.0.30'
      }
    }
  ],
  exercises: [
    {
      id: 'ex3-1-1',
      title: 'Build a Multi-Tool Travel Agent',
      description: 'Create an agent that combines weather, transport, and tourism tools',
      difficulty: 'intermediate',
      estimatedTime: '30 min',
      topics: ['agents', 'tools', 'dutch-apis']
    },
    {
      id: 'ex3-1-2',
      title: 'Implement Agent Error Recovery',
      description: 'Add robust error handling and fallback strategies to agents',
      difficulty: 'advanced',
      estimatedTime: '25 min',
      topics: ['error-handling', 'resilience']
    }
  ],
  quiz: {
    questions: [
      {
        id: 'q1',
        question: 'What does ReAct stand for in the context of LangChain agents?',
        options: [
          'Reactive Actions',
          'Reasoning and Acting',
          'Response and Action',
          'Recursive Actions'
        ],
        correctAnswer: 1,
        explanation: 'ReAct combines Reasoning (thinking about what to do) with Acting (executing tools) in an iterative loop.'
      },
      {
        id: 'q2',
        question: 'Which memory type is best for maintaining conversation context in agents?',
        options: [
          'BufferMemory',
          'SummaryMemory',
          'BufferWindowMemory',
          'VectorStoreMemory'
        ],
        correctAnswer: 2,
        explanation: 'BufferWindowMemory maintains a sliding window of recent conversations, perfect for maintaining context without unlimited memory growth.'
      }
    ]
  }
};