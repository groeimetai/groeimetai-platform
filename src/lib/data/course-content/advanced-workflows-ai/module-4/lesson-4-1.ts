import { Lesson } from '@/lib/data/courses';

export const lesson4_1: Lesson = {
  id: 'lesson-4-1',
  title: 'Geavanceerde scheduling patronen',
  duration: '35 min',
  content: `
# Geavanceerde scheduling patronen

## Introductie

Scheduling is cruciaal voor geautomatiseerde workflows. Of je nu dagelijkse rapporten wilt genereren, wekelijkse backups wilt maken, of complexe business processen op specifieke tijden wilt uitvoeren - effectieve scheduling maakt het verschil tussen een betrouwbaar systeem en chaos. In deze les duiken we diep in geavanceerde scheduling patronen, van cron expressions tot dynamische scheduling op basis van business rules.

## Cron expressions explained

Cron expressions zijn de standaard voor tijdgebaseerde scheduling. Ze bestaan uit vijf of zes velden die specifieke tijdmomenten definiëren:

\`\`\`
┌───────────── minuut (0 - 59)
│ ┌───────────── uur (0 - 23)
│ │ ┌───────────── dag van de maand (1 - 31)
│ │ │ ┌───────────── maand (1 - 12)
│ │ │ │ ┌───────────── dag van de week (0 - 6) (Zondag = 0)
│ │ │ │ │
* * * * *
\`\`\`

### Belangrijke operators

- **\*** - Elke waarde
- **,** - Waarde lijst separator
- **-** - Bereik van waarden
- **/** - Stap waarden
- **?** - Geen specifieke waarde (alleen voor dag)
- **L** - Laatste dag van maand/week
- **W** - Dichtstbijzijnde weekdag
- **#** - Nth voorkomen van weekdag

### Praktische voorbeelden

\`\`\`bash
# Elke dag om 9:00
0 9 * * *

# Elke werkdag om 8:30
30 8 * * 1-5

# Elk kwartier tijdens kantooruren
*/15 9-17 * * 1-5

# Eerste maandag van elke maand om 10:00
0 10 ? * 1#1

# Laatste vrijdag van de maand om 17:00
0 17 ? * 5L

# Elke 2 uur tussen 8:00 en 18:00
0 8-18/2 * * *
\`\`\`

## Dynamic scheduling based on conditions

Statische cron schedules zijn niet altijd voldoende. Soms moet je scheduling aanpassen op basis van real-time condities.

### N8N implementatie

\`\`\`javascript
// Dynamic Schedule node setup
{
  "nodes": [
    {
      "name": "Check Business Rules",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "functionCode": \`
// Bepaal schedule op basis van business rules
const currentDate = new Date();
const dayOfWeek = currentDate.getDay();
const hour = currentDate.getHours();

// High-traffic periods krijgen frequentere runs
if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdagen
  if (hour >= 9 && hour <= 11) {
    // Ochtend piek - elke 5 minuten
    \$json.cronExpression = "*/5 9-11 * * 1-5";
    \$json.scheduleType = "peak";
  } else if (hour >= 14 && hour <= 16) {
    // Middag piek - elke 10 minuten
    \$json.cronExpression = "*/10 14-16 * * 1-5";
    \$json.scheduleType = "moderate";
  } else {
    // Off-peak - elk uur
    \$json.cronExpression = "0 * * * 1-5";
    \$json.scheduleType = "off-peak";
  }
} else {
  // Weekend - minimale frequentie
  \$json.cronExpression = "0 */4 * * 0,6";
  \$json.scheduleType = "weekend";
}

// Voeg metadata toe
\$json.nextRun = calculateNextRun(\$json.cronExpression);
\$json.adjustedAt = new Date().toISOString();

return items;
        \`
      }
    },
    {
      "name": "Update Schedule",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [450, 300],
      "parameters": {
        "cronExpression": "={{\$json.cronExpression}}"
      }
    }
  ]
}
\`\`\`

### Make.com implementatie

\`\`\`javascript
// Dynamic Scheduler scenario
{
  "scenario": {
    "name": "Dynamic Business Hours Scheduler",
    "modules": [
      {
        "id": 1,
        "type": "tools:basic:scheduler",
        "name": "Master Scheduler",
        "schedule": "0 * * * *", // Elk uur evalueren
      },
      {
        "id": 2,
        "type": "tools:basic:router",
        "name": "Schedule Router",
        "routes": [
          {
            "name": "Peak Hours",
            "filter": {
              "condition": "AND",
              "rules": [
                {
                  "field": "{{now}}",
                  "operator": "time:between",
                  "value": ["09:00", "11:00"]
                },
                {
                  "field": "{{formatDate(now; 'E')}}",
                  "operator": "text:notcontains",
                  "value": "Sat,Sun"
                }
              ]
            }
          },
          {
            "name": "Business Hours",
            "filter": {
              "condition": "AND",
              "rules": [
                {
                  "field": "{{now}}",
                  "operator": "time:between",
                  "value": ["08:00", "18:00"]
                },
                {
                  "field": "{{formatDate(now; 'E')}}",
                  "operator": "text:notcontains",
                  "value": "Sat,Sun"
                }
              ]
            }
          },
          {
            "name": "Off Hours",
            "filter": {
              "default": true
            }
          }
        ]
      }
    ]
  }
}
\`\`\`

## Time zone handling

Time zone management is essentieel voor globale workflows. Verkeerde timezone handling kan leiden tot gemiste deadlines of workflows die op verkeerde tijden draaien.

### Best practices voor timezone handling

\`\`\`javascript
// N8N Timezone Converter
const { DateTime } = require('luxon');

// Converteer UTC naar lokale timezone
function convertToLocalTime(utcTime, targetTimezone) {
  return DateTime.fromISO(utcTime, { zone: 'UTC' })
    .setZone(targetTimezone)
    .toISO();
}

// Schedule in specifieke timezone
function scheduleInTimezone(cronExpression, timezone) {
  // Parse cron expression
  const parts = cronExpression.split(' ');
  const hour = parseInt(parts[1]);
  
  // Bereken UTC offset
  const now = DateTime.now().setZone(timezone);
  const offset = now.offset / 60;
  
  // Pas uur aan voor UTC
  const utcHour = (hour - offset + 24) % 24;
  parts[1] = utcHour.toString();
  
  return {
    originalExpression: cronExpression,
    utcExpression: parts.join(' '),
    timezone: timezone,
    offset: offset
  };
}

// Gebruik in workflow
const scheduleConfig = scheduleInTimezone('0 9 * * 1-5', 'Europe/Amsterdam');
\$json.cronExpression = scheduleConfig.utcExpression;
\$json.metadata = {
  localTime: '9:00 AM',
  timezone: scheduleConfig.timezone,
  utcTime: scheduleConfig.utcExpression
};
\`\`\`

### Make.com timezone scenario

\`\`\`javascript
// Multi-timezone scheduler
{
  "modules": [
    {
      "name": "Timezone Calculator",
      "type": "tools:basic:customjs",
      "code": \`
        // Definieer office schedules per regio
        const officeSchedules = {
          'US/Eastern': { start: 9, end: 17 },
          'Europe/London': { start: 9, end: 17 },
          'Asia/Tokyo': { start: 9, end: 17 },
          'Australia/Sydney': { start: 9, end: 17 }
        };
        
        // Check welke offices open zijn
        const openOffices = [];
        const now = new Date();
        
        for (const [timezone, hours] of Object.entries(officeSchedules)) {
          const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
          const localHour = localTime.getHours();
          
          if (localHour >= hours.start && localHour < hours.end) {
            openOffices.push({
              timezone: timezone,
              localTime: localTime.toISOString(),
              isOpen: true
            });
          }
        }
        
        return { openOffices, totalOpen: openOffices.length };
      \`
    }
  ]
}
\`\`\`

## Business hours scheduling

Business hours scheduling gaat verder dan simpele tijd-gebaseerde triggers. Het houdt rekening met werkdagen, vakanties, en specifieke business rules.

### Geavanceerd business hours systeem

\`\`\`javascript
// N8N Business Hours Engine
class BusinessHoursScheduler {
  constructor(config) {
    this.config = {
      timezone: config.timezone || 'Europe/Amsterdam',
      businessHours: config.businessHours || {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '16:00' },
        saturday: null,
        sunday: null
      },
      holidays: config.holidays || [],
      exceptions: config.exceptions || {}
    };
  }
  
  isBusinessHour(datetime = new Date()) {
    const localTime = new Date(datetime.toLocaleString('en-US', { 
      timeZone: this.config.timezone 
    }));
    
    // Check if holiday
    if (this.isHoliday(localTime)) {
      return false;
    }
    
    // Check day of week
    const dayName = localTime.toLocaleDateString('en-US', { 
      weekday: 'long' 
    }).toLowerCase();
    
    const dayConfig = this.config.businessHours[dayName];
    if (!dayConfig) return false;
    
    // Check time
    const currentTime = localTime.toTimeString().substring(0, 5);
    return currentTime >= dayConfig.start && currentTime < dayConfig.end;
  }
  
  isHoliday(date) {
    const dateString = date.toISOString().split('T')[0];
    return this.config.holidays.includes(dateString);
  }
  
  nextBusinessHour(fromDate = new Date()) {
    let checkDate = new Date(fromDate);
    
    while (!this.isBusinessHour(checkDate)) {
      checkDate.setMinutes(checkDate.getMinutes() + 15);
      
      // Safety check - max 7 dagen vooruit
      if (checkDate - fromDate > 7 * 24 * 60 * 60 * 1000) {
        throw new Error('No business hours found in next 7 days');
      }
    }
    
    return checkDate;
  }
  
  generateCronForBusinessHours() {
    // Genereer cron expression voor business hours
    const days = [];
    const hours = { min: 23, max: 0 };
    
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach((day, index) => {
      const dayConfig = this.config.businessHours[day];
      if (dayConfig) {
        days.push(index + 1);
        const startHour = parseInt(dayConfig.start.split(':')[0]);
        const endHour = parseInt(dayConfig.end.split(':')[0]);
        hours.min = Math.min(hours.min, startHour);
        hours.max = Math.max(hours.max, endHour - 1);
      }
    });
    
    return \`0 \${hours.min}-\${hours.max} * * \${days.join(',')}\`;
  }
}

// Gebruik in N8N
const scheduler = new BusinessHoursScheduler({
  timezone: 'Europe/Amsterdam',
  holidays: [
    '2024-12-25', // Kerstmis
    '2024-12-26', // Tweede kerstdag
    '2024-01-01', // Nieuwjaar
    '2024-04-27'  // Koningsdag
  ]
});

\$json.isBusinessHour = scheduler.isBusinessHour();
\$json.nextRun = scheduler.nextBusinessHour();
\$json.businessCron = scheduler.generateCronForBusinessHours();
\`\`\`

## Holiday calendars

Holiday calendar integratie zorgt ervoor dat workflows rekening houden met nationale en bedrijfsspecifieke vrije dagen.

### Holiday Calendar API integratie

\`\`\`javascript
// N8N Holiday Calendar Integration
{
  "nodes": [
    {
      "name": "Fetch Holiday Calendar",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://date.nager.at/api/v3/publicholidays/2024/NL",
        "method": "GET",
        "responseFormat": "json"
      }
    },
    {
      "name": "Process Holidays",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": \`
// Verwerk holiday data
const holidays = items[0].json;
const holidayMap = {};

holidays.forEach(holiday => {
  holidayMap[holiday.date] = {
    name: holiday.localName,
    nameEN: holiday.name,
    isNationwide: holiday.nationwide,
    types: holiday.types
  };
});

// Check of vandaag een holiday is
const today = new Date().toISOString().split('T')[0];
const isHoliday = holidayMap.hasOwnProperty(today);

// Vind volgende werkdag
let nextWorkday = new Date();
nextWorkday.setDate(nextWorkday.getDate() + 1);

while (true) {
  const checkDate = nextWorkday.toISOString().split('T')[0];
  const dayOfWeek = nextWorkday.getDay();
  
  // Skip weekenden en holidays
  if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayMap[checkDate]) {
    break;
  }
  
  nextWorkday.setDate(nextWorkday.getDate() + 1);
}

return [{
  json: {
    isHolidayToday: isHoliday,
    currentHoliday: isHoliday ? holidayMap[today] : null,
    nextWorkday: nextWorkday.toISOString(),
    upcomingHolidays: Object.entries(holidayMap)
      .filter(([date]) => date > today)
      .slice(0, 5)
      .map(([date, info]) => ({ date, ...info }))
  }
}];
        \`
      }
    }
  ]
}
\`\`\`

### Make.com Holiday Calendar module

\`\`\`javascript
// Advanced Holiday Management
{
  "scenario": {
    "modules": [
      {
        "name": "Holiday Calendar Manager",
        "type": "tools:basic:customjs",
        "code": \`
          // Combineer meerdere holiday calendars
          const calendars = {
            national: await fetchNationalHolidays('NL'),
            company: await fetchCompanyHolidays(),
            regional: await fetchRegionalHolidays('Noord-Holland')
          };
          
          // Merge alle calendars
          const allHolidays = new Set();
          
          Object.values(calendars).forEach(calendar => {
            calendar.forEach(holiday => allHolidays.add(holiday.date));
          });
          
          // Business logic voor scheduling
          function shouldRunToday() {
            const today = new Date().toISOString().split('T')[0];
            const dayOfWeek = new Date().getDay();
            
            // Basis checks
            if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Weekend
            if (allHolidays.has(today)) return false; // Holiday
            
            // Speciale business rules
            const date = new Date();
            const month = date.getMonth();
            const dayOfMonth = date.getDate();
            
            // Geen runs op laatste vrijdag van december (eindejaarsborrel)
            if (month === 11 && dayOfWeek === 5 && dayOfMonth > 24) {
              return false;
            }
            
            // Half days op vrijdag voor lange weekenden
            if (dayOfWeek === 5) {
              const tomorrow = new Date(date);
              tomorrow.setDate(tomorrow.getDate() + 3);
              const monday = tomorrow.toISOString().split('T')[0];
              
              if (allHolidays.has(monday)) {
                // Vrijdag voor lang weekend - alleen ochtend
                return date.getHours() < 12;
              }
            }
            
            return true;
          }
          
          // Genereer optimale schedule
          function generateOptimalSchedule() {
            const schedule = {
              regular: '0 9-17 * * 1-5',
              holidays: Array.from(allHolidays),
              exceptions: [],
              nextRuns: []
            };
            
            // Bereken volgende 10 runs
            let checkDate = new Date();
            let runsFound = 0;
            
            while (runsFound < 10) {
              if (shouldRunOnDate(checkDate)) {
                schedule.nextRuns.push(checkDate.toISOString());
                runsFound++;
              }
              checkDate.setDate(checkDate.getDate() + 1);
            }
            
            return schedule;
          }
          
          return {
            shouldRunToday: shouldRunToday(),
            schedule: generateOptimalSchedule(),
            holidayCount: allHolidays.size
          };
        \`
      }
    ]
  }
}
\`\`\`

## Best practices voor production scheduling

### 1. Redundantie en failover

\`\`\`javascript
// Primary/Secondary scheduling pattern
const schedulingConfig = {
  primary: {
    cron: '0 9 * * 1-5',
    timezone: 'Europe/Amsterdam',
    maxRetries: 3
  },
  secondary: {
    cron: '15 9 * * 1-5',  // 15 min later als backup
    timezone: 'Europe/Amsterdam',
    condition: 'primary_failed'
  },
  monitoring: {
    alertAfterMissed: 2,
    notificationChannels: ['email', 'slack']
  }
};
\`\`\`

### 2. Schedule overlap prevention

\`\`\`javascript
// Voorkom dat schedules overlappen
class ScheduleManager {
  constructor() {
    this.runningJobs = new Map();
  }
  
  async executeIfNotRunning(jobId, executeFn) {
    if (this.runningJobs.has(jobId)) {
      console.log(\`Job \${jobId} is already running, skipping...\`);
      return { skipped: true, reason: 'already_running' };
    }
    
    this.runningJobs.set(jobId, new Date());
    
    try {
      const result = await executeFn();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      this.runningJobs.delete(jobId);
    }
  }
}
\`\`\`

### 3. Schedule monitoring en alerting

\`\`\`javascript
// Schedule health monitoring
const scheduleMonitor = {
  checkScheduleHealth: function(scheduleId) {
    const metrics = {
      lastRun: getLastRunTime(scheduleId),
      nextRun: getNextRunTime(scheduleId),
      missedRuns: getMissedRuns(scheduleId),
      averageRuntime: getAverageRuntime(scheduleId),
      successRate: getSuccessRate(scheduleId)
    };
    
    // Alert conditions
    if (metrics.missedRuns > 2) {
      sendAlert('critical', \`Schedule \${scheduleId} missed \${metrics.missedRuns} runs\`);
    }
    
    if (metrics.successRate < 0.95) {
      sendAlert('warning', \`Schedule \${scheduleId} success rate below 95%\`);
    }
    
    return metrics;
  }
};
\`\`\`

## Oefeningen

1. **Cron Expression Builder**: Bouw een interactieve tool die natuurlijke taal omzet naar cron expressions
2. **Holiday Calendar Integration**: Implementeer een workflow die automatisch pauzeert tijdens holidays
3. **Dynamic Load Scheduler**: Creëer een scheduler die frequentie aanpast op basis van system load
4. **Multi-timezone Dashboard**: Bouw een dashboard dat shows wanneer verschillende offices open zijn
  `,
  codeExamples: [
    {
      id: 'example-1',
      title: 'N8N - Advanced Cron Scheduler met Business Logic',
      language: 'javascript',
      code: `// Complete N8N workflow voor advanced scheduling
{
  "name": "Advanced Business Hours Scheduler",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "minutes",
              "minutesInterval": 30
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": \`
// Business hours en holiday check
const BusinessScheduler = {
  config: {
    timezone: 'Europe/Amsterdam',
    businessHours: {
      start: 9,
      end: 17,
      days: [1, 2, 3, 4, 5] // Ma-Vr
    },
    holidays: [
      '2024-01-01', '2024-04-27', '2024-12-25', '2024-12-26'
    ]
  },
  
  isBusinessTime: function() {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { 
      timeZone: this.config.timezone 
    }));
    
    // Check holiday
    const dateStr = localTime.toISOString().split('T')[0];
    if (this.config.holidays.includes(dateStr)) {
      return { 
        isBusinessTime: false, 
        reason: 'holiday',
        nextRun: this.getNextBusinessTime()
      };
    }
    
    // Check day
    const day = localTime.getDay();
    if (!this.config.businessHours.days.includes(day)) {
      return { 
        isBusinessTime: false, 
        reason: 'weekend',
        nextRun: this.getNextBusinessTime()
      };
    }
    
    // Check hour
    const hour = localTime.getHours();
    if (hour < this.config.businessHours.start || 
        hour >= this.config.businessHours.end) {
      return { 
        isBusinessTime: false, 
        reason: 'outside_hours',
        nextRun: this.getNextBusinessTime()
      };
    }
    
    return { 
      isBusinessTime: true, 
      currentTime: localTime.toISOString() 
    };
  },
  
  getNextBusinessTime: function() {
    let checkTime = new Date();
    checkTime.setMinutes(checkTime.getMinutes() + 30);
    
    while (true) {
      const result = this.isBusinessTimeForDate(checkTime);
      if (result.isBusinessTime) {
        return checkTime.toISOString();
      }
      checkTime.setMinutes(checkTime.getMinutes() + 30);
    }
  },
  
  isBusinessTimeForDate: function(date) {
    // Similar logic as isBusinessTime but for specific date
    // Implementation here...
    return { isBusinessTime: true };
  }
};

const check = BusinessScheduler.isBusinessTime();
return [{
  json: {
    shouldRun: check.isBusinessTime,
    ...check,
    timestamp: new Date().toISOString()
  }
}];
        \`
      },
      "name": "Business Hours Check",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{\$json[\\"shouldRun\\"]}}",
              "value2": true
            }
          ]
        }
      },
      "name": "IF Business Hours",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "functionCode": \`
// Execute business logic
console.log('Executing scheduled task during business hours');

// Your business logic here
const tasks = [
  'Process pending orders',
  'Generate reports',
  'Send notifications',
  'Update dashboards'
];

const results = [];
for (const task of tasks) {
  results.push({
    task: task,
    status: 'completed',
    timestamp: new Date().toISOString()
  });
}

return [{
  json: {
    executed: true,
    tasks: results,
    executionTime: new Date().toISOString()
  }
}];
        \`
      },
      "name": "Execute Business Logic",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [850, 250]
    },
    {
      "parameters": {
        "dataPropertyName": "skipReason",
        "value": "={{\$json}}"
      },
      "name": "Log Skip Reason",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [850, 350]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Business Hours Check",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Business Hours Check": {
      "main": [
        [
          {
            "node": "IF Business Hours",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "IF Business Hours": {
      "main": [
        [
          {
            "node": "Execute Business Logic",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Log Skip Reason",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}`
    },
    {
      id: 'example-2',
      title: 'Make.com - Multi-timezone Holiday-aware Scheduler',
      language: 'javascript',
      code: `// Make.com scenario voor multi-timezone scheduling met holiday support
{
  "name": "Global Office Scheduler with Holidays",
  "flow": [
    {
      "id": 1,
      "module": "gateway:CustomWebHook",
      "data": {
        "name": "Schedule Evaluator",
        "method": "POST"
      }
    },
    {
      "id": 2,
      "module": "util:SetMultipleVariables",
      "data": {
        "variables": [
          {
            "name": "offices",
            "value": {
              "amsterdam": {
                "timezone": "Europe/Amsterdam",
                "hours": { "start": "09:00", "end": "17:00" },
                "holidays": "NL"
              },
              "newYork": {
                "timezone": "America/New_York", 
                "hours": { "start": "09:00", "end": "17:00" },
                "holidays": "US"
              },
              "tokyo": {
                "timezone": "Asia/Tokyo",
                "hours": { "start": "09:00", "end": "18:00" },
                "holidays": "JP"
              },
              "sydney": {
                "timezone": "Australia/Sydney",
                "hours": { "start": "08:00", "end": "16:00" },
                "holidays": "AU"
              }
            }
          }
        ]
      }
    },
    {
      "id": 3,
      "module": "http:ActionSendData",
      "data": {
        "url": "https://date.nager.at/api/v3/NextPublicHolidaysWorldwide",
        "method": "GET",
        "headers": {
          "Accept": "application/json"
        }
      }
    },
    {
      "id": 4,
      "module": "util:JavaScriptCodeRunner",
      "data": {
        "code": \`
// Process holiday data and check office availability
const holidays = input.holidays;
const offices = input.offices;
const results = {};

// Create holiday lookup
const holidayLookup = {};
holidays.forEach(holiday => {
  if (!holidayLookup[holiday.countryCode]) {
    holidayLookup[holiday.countryCode] = [];
  }
  holidayLookup[holiday.countryCode].push(holiday.date);
});

// Check each office
for (const [officeName, config] of Object.entries(offices)) {
  const now = new Date();
  const officeTime = new Date(now.toLocaleString('en-US', { 
    timeZone: config.timezone 
  }));
  
  // Format time as HH:MM
  const currentTime = officeTime.toTimeString().substring(0, 5);
  const currentDate = officeTime.toISOString().split('T')[0];
  const dayOfWeek = officeTime.getDay();
  
  // Check if office is open
  let isOpen = true;
  let reason = 'open';
  
  // Weekend check
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    isOpen = false;
    reason = 'weekend';
  }
  
  // Holiday check
  else if (holidayLookup[config.holidays]?.includes(currentDate)) {
    isOpen = false;
    reason = 'holiday';
  }
  
  // Business hours check
  else if (currentTime < config.hours.start || currentTime >= config.hours.end) {
    isOpen = false;
    reason = 'outside_hours';
  }
  
  // Calculate next open time
  let nextOpen = new Date(officeTime);
  if (!isOpen) {
    // Simple logic - next business day at start time
    do {
      nextOpen.setDate(nextOpen.getDate() + 1);
      nextOpen.setHours(parseInt(config.hours.start.split(':')[0]));
      nextOpen.setMinutes(parseInt(config.hours.start.split(':')[1]));
    } while (
      nextOpen.getDay() === 0 || 
      nextOpen.getDay() === 6 ||
      holidayLookup[config.holidays]?.includes(
        nextOpen.toISOString().split('T')[0]
      )
    );
  }
  
  results[officeName] = {
    isOpen,
    reason,
    currentTime: officeTime.toISOString(),
    localTime: currentTime,
    nextOpen: nextOpen.toISOString(),
    timezone: config.timezone
  };
}

// Determine optimal execution time
const openOffices = Object.entries(results)
  .filter(([_, status]) => status.isOpen)
  .map(([name, _]) => name);

const executionRecommendation = {
  shouldExecute: openOffices.length > 0,
  openOffices,
  totalOffices: Object.keys(offices).length,
  percentageOpen: (openOffices.length / Object.keys(offices).length) * 100
};

output = {
  officeStatuses: results,
  recommendation: executionRecommendation,
  timestamp: new Date().toISOString()
};
        \`,
        "input": {
          "holidays": "{{3.data}}",
          "offices": "{{2.offices}}"
        }
      }
    },
    {
      "id": 5,
      "module": "gateway:RouterModule",
      "data": {
        "routes": [
          {
            "name": "Execute Now",
            "condition": {
              "field": "{{4.recommendation.shouldExecute}}",
              "operator": "equal",
              "value": true
            }
          },
          {
            "name": "Schedule for Later",
            "condition": {
              "field": "{{4.recommendation.shouldExecute}}",
              "operator": "equal", 
              "value": false
            }
          }
        ]
      }
    },
    {
      "id": 6,
      "module": "util:JavaScriptCodeRunner",
      "data": {
        "code": \`
// Calculate optimal retry time
const statuses = input.officeStatuses;
let earliestOpen = null;

for (const [office, status] of Object.entries(statuses)) {
  if (!status.isOpen) {
    const nextOpen = new Date(status.nextOpen);
    if (!earliestOpen || nextOpen < earliestOpen) {
      earliestOpen = nextOpen;
    }
  }
}

// Schedule retry 15 minutes after earliest office opens
const retryTime = new Date(earliestOpen);
retryTime.setMinutes(retryTime.getMinutes() + 15);

output = {
  retryAt: retryTime.toISOString(),
  waitMinutes: Math.round((retryTime - new Date()) / 60000)
};
        \`,
        "input": {
          "officeStatuses": "{{4.officeStatuses}}"
        }
      }
    }
  ]
}`
    }
  ],
  assignments: [
    {
      id: 'assignment-4-1-1',
      title: 'Bouw een Smart Schedule Manager',
      description: 'Creëer een complete scheduling oplossing die: cron expressions kan genereren uit natuurlijke taal input ("elke werkdag om 9 uur"), automatisch rekening houdt met holidays uit meerdere landen, timezone conversie ondersteunt voor globale teams, en een visuele timeline genereert van geplande runs voor de komende week. Implementeer ook conflict detection tussen overlappende schedules.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'assignment-4-1-2',
      title: 'Implementeer een Business Hours Engine',
      description: 'Ontwikkel een robuuste business hours engine die: configureerbare business hours per kantoor/afdeling ondersteunt, automatisch aanpast voor zomer/wintertijd, speciale uren voor feestdagen kan definiëren (bijv. vroeg sluiten op kerstavond), en een API biedt om te checken of een specifiek moment binnen business hours valt. Include ook "rush hour" detection voor piekmomenten.',
      difficulty: 'expert',
      type: 'project'
    },
    {
      id: 'assignment-4-1-3',
      title: 'Design een Holiday-Aware Workflow System',
      description: 'Bouw een systeem dat workflows automatisch aanpast voor holidays: integreer meerdere holiday APIs (nationaal, regionaal, bedrijf), implementeer "bridge day" logica (automatisch vrije dagen tussen holiday en weekend), creëer substitute scheduling (taken verschuiven naar eerstvolgende werkdag), en bouw een dashboard dat upcoming holidays en hun impact op scheduled workflows toont.',
      difficulty: 'expert',
      type: 'project'
    }
  ],
  resources: [
    {
      title: 'Cron Expression Generator',
      url: 'https://crontab.guru/',
      type: 'tool'
    },
    {
      title: 'N8N Schedule Trigger Documentation',
      url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/',
      type: 'documentation'
    },
    {
      title: 'Make.com Schedule Module Guide',
      url: 'https://www.make.com/en/help/modules/schedule',
      type: 'guide'
    },
    {
      title: 'Luxon - Modern DateTime Library',
      url: 'https://moment.github.io/luxon/',
      type: 'documentation'
    },
    {
      title: 'Public Holiday API Documentation',
      url: 'https://date.nager.at/swagger/index.html',
      type: 'documentation'
    },
    {
      title: 'IANA Time Zone Database',
      url: 'https://www.iana.org/time-zones',
      type: 'documentation'
    }
  ]
};