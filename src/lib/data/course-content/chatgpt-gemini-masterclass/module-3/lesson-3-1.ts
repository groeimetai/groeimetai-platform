import type { Lesson } from '@/lib/data/courses'

export const lesson3_1: Lesson = {
  id: 'lesson-3-1',
  title: 'Geavanceerde Prompting Technieken',
  duration: '60 minuten',
  content: `
## Geavanceerde Prompting Technieken: De Kunst van Effectieve AI-Communicatie

### Inleiding

In deze les duiken we diep in de wereld van geavanceerde prompting technieken. Je leert hoe je ChatGPT en andere Large Language Models (LLMs) optimaal kunt benutten door het toepassen van bewezen methodologieën zoals chain-of-thought prompting, few-shot learning, en role-based prompting. Deze technieken vormen de basis voor het creëren van consistente, hoogwaardige AI-output die aansluit bij jouw specifieke behoeften.

### Chain-of-Thought Prompting: Stap voor Stap Redeneren

Chain-of-thought (CoT) prompting is een krachtige techniek waarbij je de AI vraagt om zijn denkproces expliciet uit te werken voordat het tot een conclusie komt. Dit resulteert in meer accurate en doordachte antwoorden, vooral bij complexe problemen.

#### De Basis van Chain-of-Thought

\`\`\`
Standaard prompt:
"Los op: Als een trein 150 km aflegt in 2,5 uur, wat is dan de gemiddelde snelheid?"

Chain-of-thought prompt:
"Laten we dit stap voor stap oplossen:
1. Eerst analyseren we welke informatie we hebben:
   - Afstand: 150 km
   - Tijd: 2,5 uur
2. Vervolgens bepalen we de formule:
   - Snelheid = Afstand / Tijd
3. Nu passen we de formule toe:
   - Snelheid = 150 km / 2,5 uur = 60 km/uur
4. Tot slot controleren we:
   - 60 km/uur × 2,5 uur = 150 km ✓"
\`\`\`

#### Het Krachtige "Laten We Dit Stap Voor Stap Oplossen" Framework

**Voorbeeld: ROI Berekening voor Software Investering**
\`\`\`
"Laten we dit stap voor stap oplossen:

1. Eerst analyseren we de investeringskosten:
   - Licentiekosten: €50.000/jaar
   - Implementatie: €25.000 eenmalig
   - Training: €10.000
   - Totaal jaar 1: €85.000

2. Vervolgens berekenen we de verwachte besparingen:
   - Tijdsbesparing: 20 uur/week × 50 weken × €75/uur = €75.000/jaar
   - Reductie fouten: €30.000/jaar
   - Totaal: €105.000/jaar

3. Nu berekenen we de ROI:
   - Jaar 1: (€105.000 - €85.000) / €85.000 = 23.5%
   - Jaar 2+: (€105.000 - €50.000) / €50.000 = 110%

4. Tot slot de conclusie:
   - Break-even in maand 10
   - 3-jaar ROI: 245%
   - Advies: Sterke business case voor investering"
\`\`\`

#### Concrete Voorbeelden van Chain-of-Thought

**Voorbeeld 1: Bedrijfsstrategie Analyse**
\`\`\`
"Analyseer of ons bedrijf moet investeren in AI-technologie. Doorloop systematisch:

1. Huidige situatie analyse:
   - Wat zijn onze huidige technologische capaciteiten?
   - Welke processen kunnen geautomatiseerd worden?
   - Wat doen onze concurrenten?

2. Kosten-baten analyse:
   - Initiële investeringskosten
   - Verwachte ROI over 1, 3, en 5 jaar
   - Opportuniteitskosten van niet investeren

3. Risico evaluatie:
   - Technologische risico's
   - Implementatie uitdagingen
   - Change management aspecten

4. Conclusie en aanbeveling:
   - Weeg alle factoren
   - Geef concrete aanbeveling met tijdlijn"
\`\`\`

**Voorbeeld 2: Juridische Contract Review**
\`\`\`
"Review dit arbeidscontract stap voor stap. Volg deze analyse structuur:

[Contract tekst]

Analyseer systematisch:
1. Identificeer alle key clausules (salaris, vakantie, opzegtermijn, etc.)
2. Controleer of elke clausule voldoet aan Nederlandse arbeidswetgeving
3. Markeer potentiële red flags of ongebruikelijke voorwaarden
4. Vergelijk met standaard CAO voorwaarden in deze sector
5. Geef per clausule specifiek advies voor onderhandeling
6. Formuleer een samenvattend advies met prioriteiten"
\`\`\`

**Voorbeeld 3: Marketing Campagne Ontwikkeling**
\`\`\`
"Ontwikkel een social media campagne voor [product]. Werk systematisch:

Stap 1: Doelgroep analyse
- Wie is de primaire doelgroep? (demografisch + psychografisch)
- Wat zijn hun pijnpunten en behoeften?
- Op welke platforms zijn ze actief?

Stap 2: Concurrentie analyse
- Welke soortgelijke campagnes zijn recent gelanceerd?
- Wat werkte wel/niet bij concurrenten?
- Hoe kunnen we ons onderscheiden?

Stap 3: Creatieve conceptontwikkeling
- Brainstorm 3 verschillende creatieve richtingen
- Voor elke richting: kernboodschap + visuele stijl
- Selecteer beste concept met onderbouwing

Stap 4: Tactische uitwerking
- Content kalender voor 30 dagen
- Platform-specifieke aanpassingen
- KPIs en meetmethoden

Stap 5: Budget en ROI projectie
- Gedetailleerde kostenraming
- Verwachte resultaten per KPI
- Break-even analyse"
\`\`\`

**Voorbeeld 4: Technische Probleemoplossing**
\`\`\`
"Debug dit Python script systematisch:

[Code met error]

Volg deze debugging strategie:
1. Identificeer de exacte error message en regel
2. Analyseer wat de code probeert te bereiken
3. Trace de data flow van input naar error punt
4. Identificeer mogelijke oorzaken (top 3)
5. Test elke hypothese met specifieke checks
6. Implementeer de fix met uitleg waarom dit werkt
7. Suggereer preventieve maatregelen voor de toekomst"
\`\`\`

**Voorbeeld 5: Medische Symptoom Analyse (Educational)**
\`\`\`
"Analyseer deze symptomen systematisch (voor educatieve doeleinden):

Patiënt presenteert: hoofdpijn, vermoeidheid, lichte koorts

Doorloop diagnostisch proces:
1. Categoriseer symptomen (acuut vs chronisch, lokaal vs systemisch)
2. Genereer differentiaal diagnose lijst (meest naar minst waarschijnlijk)
3. Voor elke mogelijke diagnose:
   - Ondersteunende symptomen
   - Tegenstrijdige factoren
   - Benodigde tests ter bevestiging
4. Identificeer red flags die urgente zorg vereisen
5. Formuleer advies voor vervolgstappen

Disclaimer: Dit is puur educatief, geen medisch advies"
\`\`\`

### Few-Shot Learning: Van Nul naar Expert

Few-shot learning is een techniek waarbij je de AI voorbeelden geeft van het gewenste outputformaat voordat je je eigenlijke vraag stelt. Dit is vooral krachtig voor het creëren van consistente output in een specifiek format.

#### Nederlandse Business Context Templates

**Template 1: Kwartaalrapportage**
\`\`\`
"Schrijf een management update volgens deze voorbeelden:

Voorbeeld 1 - Q1 2023:
"Het eerste kwartaal van 2023 toont solide resultaten ondanks marktuitdagingen. Omzet steeg met 12% naar €4.5M, gedreven door sterke prestaties in de Benelux. EBITDA-marge verbeterde naar 18.5%. Belangrijkste risico: supply chain verstoringen in Q2."

Voorbeeld 2 - Q4 2022:
"Q4 2022 sloten we af met recordresultaten. Omzet €5.2M (+23% YoY), met name door succesvolle productlancering in oktober. EBITDA €1.1M. Aandachtspunt: verhoogde personeelskosten door krappe arbeidsmarkt."

Voorbeeld 3 - Q3 2022:
"Q3 prestaties in lijn met forecast. Omzet €3.9M (+8% YoY), waarbij digitale kanalen 45% bijdragen. Cost-control maatregelen resulteerden in EBITDA verbetering van 2pp. Focus Q4: seizoensgebonden verkopen maximaliseren."

Schrijf nu een update voor: Q2 2023 met omzet €4.8M en supply chain uitdagingen"
\`\`\`

**Template 2: Nederlandse B2B Sales Email**
\`\`\`
"Schrijf een B2B sales email volgens deze voorbeelden:

Voorbeeld 1 - IT Services:
"Beste [Naam],

Vorige week sprak ik de CFO van Randstad over hun ERP-migratie. Hij noemde 3 uitdagingen die u waarschijnlijk herkent:
• Data-integriteit tijdens migratie
• Minimale business disruption
• Budget overschrijdingen

Wij hebben deze exact dezelfde uitdagingen opgelost voor 15+ Nederlandse enterprises. Bijvoorbeeld: bij Ahold Delhaize reduceerden we de migratietijd met 40%.

Heeft u volgende week 30 minuten voor een kort gesprek?

Met vriendelijke groet,
[Naam]"

Voorbeeld 2 - SaaS Platform:
"Beste [Naam],

Uw concurrent bol.com verhoogde hun conversie met 23% door onze checkout-optimalisatie. 

Ik analyseerde uw webshop en zag 3 quick wins:
1. One-click checkout voor terugkerende klanten
2. Dynamic pricing in winkelwagen
3. AI-gedreven product suggesties

Potentiële impact voor [Bedrijf]: €2.3M extra omzet per jaar.

Zullen we dinsdag of donderdag kort bellen?

Groet,
[Naam]"

Voorbeeld 3 - Consultancy:
"Beste [Naam],

De nieuwe EU AI Act heeft grote impact op Nederlandse fintech bedrijven. Ik zie dat [Bedrijf] actief is in automated lending - dit valt onder high-risk AI.

Wij begeleidden recent ING en Rabobank bij hun AI Act compliance traject. Key learning: start nu met impact assessment voorkomt €1M+ aan retrofitting kosten.

Ik heb volgende week vrijdag een AI Act workshop in Amsterdam. Laatste 2 plekken beschikbaar - mag ik u uitnodigen?

Met vriendelijke groet,
[Naam]"

Schrijf nu een B2B email voor: HR Software aan Nederlandse scale-up"
\`\`\`

**Template 3: Stakeholder Communicatie**
\`\`\`
"Communiceer project updates volgens deze voorbeelden:

Voorbeeld 1 - Vertraging:
"Beste stakeholders,

Project Phoenix Update - Week 23:
• Milestone 3 afgerond (2 dagen vertraging)
• Budget: €127K van €150K (85%)
• Risico: Leverancier levertijd +1 week

Mitigatie: Parallel werken aan Milestone 4 om einddeadline te halen.
Volgende update: Vrijdag 16 juni"

Voorbeeld 2 - On Track:
"Project Summit - Week 15 Status:
✓ Development fase completed
✓ Testing: 78% complete
✓ Budget: On track (72% gebruikt)

Focus komende week: User Acceptance Testing met pilot groep
Geen blockers | Go-live datum 1 juli unchanged"

Voorbeeld 3 - Escalatie:
"URGENT - Project Titan Escalatie:

⚠️ Kritieke resource uitval (lead developer)
⚠️ Impact: 3 weken vertraging zonder actie

Voorgestelde oplossing:
1. Inhuur senior developer (€25K extra)
2. Scope reductie fase 1 (-20%)

Beslissing nodig voor maandag 12:00
Meeting ingepland: Maandag 09:00"

Schrijf nu update voor: Budget overschrijding door scope creep"
\`\`\`

#### Zero-Shot vs One-Shot vs Few-Shot

**Zero-Shot (geen voorbeelden):**
\`\`\`
"Schrijf een productbeschrijving voor een smartwatch."
\`\`\`

**One-Shot (één voorbeeld):**
\`\`\`
"Schrijf een productbeschrijving in deze stijl:

Voorbeeld:
Product: Noise-cancelling koptelefoon
Beschrijving: "Duik in je eigen wereld met de UltraSound Pro. Deze premium koptelefoon combineert geavanceerde noise-cancelling technologie met kristalhelder geluid. Of je nu in een druk café werkt of op reis bent - geniet van absolute rust en superieure audiokwaliteit. Met 30 uur batterijduur en comfortabele memory foam oorkussens is dit je ideale metgezel voor lange werkdagen."

Nu schrijf een soortgelijke beschrijving voor:
Product: Smartwatch met health tracking"
\`\`\`

**Few-Shot (meerdere voorbeelden):**
\`\`\`
"Genereer klantservice responses volgens deze voorbeelden:

Voorbeeld 1:
Klacht: "Mijn bestelling is te laat"
Response: "Wat vervelend dat uw bestelling vertraging heeft opgelopen! Ik begrijp volledig uw frustratie. Laat me direct de status voor u checken. [Check details] Ik zie dat uw pakket momenteel onderweg is en morgen voor 17:00 wordt bezorgd. Als compensatie stuur ik u een kortingscode van 15% voor uw volgende bestelling. Kan ik verder nog iets voor u betekenen?"

Voorbeeld 2:
Klacht: "Product is beschadigd aangekomen"
Response: "Wat naar om te horen dat uw product beschadigd is aangekomen! Dit had natuurlijk niet mogen gebeuren. Ik regel direct een oplossing voor u. U heeft twee opties: 1) Gratis vervanging binnen 2 werkdagen, of 2) Volledige terugbetaling. Welke optie heeft uw voorkeur? Zodra u kiest, stuur ik u een retourlabel zodat u het beschadigde item kosteloos kunt terugsturen."

Voorbeeld 3:
Klacht: "Ik snap de gebruiksaanwijzing niet"
Response: "Ik help u graag met de gebruiksaanwijzing! Ik begrijp dat het soms lastig kan zijn. Kunt u me vertellen bij welke stap u vastloopt? Dan kan ik u stap-voor-stap begeleiden. Ondertussen stuur ik u ook een link naar onze video tutorials - vaak helpt het om het visueel te zien. Weet dat ons support team altijd voor u klaarstaat!"

Nu genereer een response voor:
Klacht: "De app crasht steeds op mijn telefoon""
\`\`\`

#### Few-Shot Learning in Verschillende Sectoren

**Marketing & Copywriting:**
\`\`\`
"Schrijf Facebook advertenties volgens deze high-converting voorbeelden:

Voorbeeld 1 (SaaS product):
"⚡ Besteed je 5+ uur per week aan planning?
ProjectFlow automatiseert 80% van je project management taken.
✅ Automatische taak toewijzing
✅ Real-time voortgang tracking  
✅ Slimme deadline voorspelling
Probeer 14 dagen gratis → [link]"

Voorbeeld 2 (E-commerce):
"🎁 Laatste kans: -40% op onze bestseller!
De AirComfort matras waar 10.000+ klanten beter door slapen.
⭐⭐⭐⭐⭐ "Beste investering in mijn gezondheid" - Maria K.
Voorraad bijna op. Bestel nu met gratis bezorging → [link]"

Voorbeeld 3 (Online cursus):
"🚀 Van Excel beginner naar data wizard in 30 dagen?
1.247 professionals gingen je voor met onze Excel Masterclass.
Week 1: Fundamentele formules
Week 2: Pivot tables & visualisaties
Week 3: Macro's & automatisering
Week 4: Real-world projecten
Start vandaag voor €47 (was €197) → [link]"

Schrijf nu een Facebook ad voor: [Yoga studio met nieuwe locatie]"
\`\`\`

**Financiële Analyse:**
\`\`\`
"Analyseer bedrijfsprestaties volgens dit format:

Voorbeeld Q1 2023 - TechCorp:
"TechCorp toont solide groei in Q1 2023 met een omzetstijging van 23% YoY naar €45M. De brutomarge verbeterde met 2.3 procentpunten naar 67.8%, gedreven door efficiëntere operations. EBITDA steeg naar €12M (+31% YoY). Aandachtspunt: Customer acquisition cost steeg met 15%, wat de winstgevendheid op termijn kan drukken. Advies: HOLD met prijsdoel €125."

Voorbeeld Q4 2022 - RetailPlus:
"RetailPlus kampte met tegenwind in Q4 2022. Omzet daalde 8% YoY naar €230M door verminderde consumentenbestedingen. Positief: online kanaal groeide +45% en compenseert nu 35% van totale omzet. Brutomarge onder druk (-4.1pp) door promoties. Management guidance voor 2023 conservatief maar realistisch. Advies: BUY op huidige niveaus met 18 maanden horizon."

Analyseer nu: [Q2 2023 resultaten van GreenEnergy Corp]"
\`\`\`

### Role-Based Prompting: De Kracht van Perspectief

Role-based prompting betekent dat je de AI vraagt om een specifieke rol of persona aan te nemen. Dit resulteert in output die beter aansluit bij de verwachtingen en expertise van die rol.

#### Effectieve Rol-Definities

**De Marketing Director:**
\`\`\`
"Je bent een ervaren Marketing Director met 15 jaar ervaring in B2B SaaS. 
Je specialiteiten zijn: demand generation, content strategy, en marketing automation.
Je bent data-gedreven maar verliest creativiteit niet uit het oog.
Je communiceert in heldere, actiegerichte taal met focus op ROI.

Taak: Review ons nieuwe content marketing plan en geef concrete verbeterpunten."
\`\`\`

**De Agile Coach:**
\`\`\`
"Neem de rol aan van een gecertificeerde Agile Coach met expertise in:
- Scrum en Kanban implementaties
- Team dynamics en conflict resolution
- Change management in enterprise omgevingen
- DevOps integratie

Je bent pragmatisch, focust op continuous improvement, en gebruikt 
real-world voorbeelden. Je vermijdt jargon en legt complexe concepten 
simpel uit.

Vraag: Ons development team worstelt met sprint planning. Hoe pakken we dit aan?"
\`\`\`

**De Financial Controller:**
\`\`\`
"Je bent een Financial Controller voor een scale-up (50-200 FTE).
Expertise gebieden:
- Financial planning & analysis
- Cash flow management
- Investor reporting
- Risk management
- ERP implementaties

Je bent detail-georiënteerd maar houdt strategisch overzicht.
Je communiceert financiële complexiteit in begrijpelijke business termen.

Opdracht: Ontwikkel een 13-week cash flow forecast template met early warning indicators."
\`\`\`

### Temperature en Top-p Settings: Fine-tuning van Creativiteit

Temperature en top-p zijn parameters die bepalen hoe "creatief" of "conservatief" de AI-output is. Het begrijpen en correct toepassen van deze settings is cruciaal voor optimale resultaten.

#### Temperature Settings Uitgelegd

**Temperature = 0.1-0.3 (Zeer conservatief):**
- Gebruik voor: Feitelijke informatie, technische documentatie, juridische teksten
- Output: Zeer consistent, voorspelbaar, minimal variatie

\`\`\`
Temperature: 0.2
"Genereer technische specificaties voor een REST API endpoint"
Output: Gestructureerd, precies, zonder creativiteit
\`\`\`

**Temperature = 0.4-0.6 (Gebalanceerd):**
- Gebruik voor: Business documenten, educatief materiaal, standaard content
- Output: Goede balans tussen consistentie en variatie

\`\`\`
Temperature: 0.5
"Schrijf een introductieparagraaf voor ons jaarverslag"
Output: Professioneel met enige variatie in woordkeuze
\`\`\`

**Temperature = 0.7-0.9 (Creatief):**
- Gebruik voor: Marketing copy, storytelling, brainstorming
- Output: Meer variatie, creatieve woordkeuzes, unieke angles

\`\`\`
Temperature: 0.8
"Brainstorm slogans voor ons nieuwe eco-friendly product"
Output: Diverse, creatieve opties met onverwachte invalshoeken
\`\`\`

**Temperature = 1.0+ (Zeer creatief/experimenteel):**
- Gebruik voor: Fictie, poëzie, out-of-the-box ideation
- Output: Maximale creativiteit, soms onvoorspelbaar

#### Top-p (Nucleus Sampling) in de Praktijk

Top-p bepaalt hoeveel van de meest waarschijnlijke woorden worden overwogen:
- Top-p = 0.1: Alleen top 10% meest waarschijnlijke woorden
- Top-p = 0.9: Top 90% van waarschijnlijke woorden

**Praktische Combinaties:**
\`\`\`
Juridisch document:
Temperature: 0.2, Top-p: 0.1
"Genereer een standaard geheimhoudingsverklaring"

Marketing campagne:
Temperature: 0.8, Top-p: 0.9
"Creëer een viral social media concept"

Technische handleiding:
Temperature: 0.3, Top-p: 0.3
"Schrijf installatie-instructies voor software"

Creatief verhaal:
Temperature: 0.9, Top-p: 0.95
"Begin een spannend science fiction verhaal"
\`\`\`

### Prompt Chaining: Complexe Taken Opdelen

Prompt chaining is het opdelen van complexe taken in meerdere, sequentiële prompts waarbij de output van de ene prompt input wordt voor de volgende.

#### Voorbeeld 1: Complete Product Launch

**Chain Stap 1: Marktonderzoek**
\`\`\`
"Analyseer de markt voor slimme home security systemen:
1. Belangrijkste spelers en marktaandeel
2. Pricing strategieën 
3. Unieke selling points per concurrent
4. Gaps in de markt
Output: Gestructureerd marktrapport"
\`\`\`

**Chain Stap 2: Product Positionering**
\`\`\`
"Gebaseerd op dit marktonderzoek: [output stap 1]

Ontwikkel product positionering voor ons nieuwe security systeem:
1. Unique Value Proposition
2. Target audience personas (3)
3. Key differentiators
4. Pricing strategie
Output: Positioning statement en strategie"
\`\`\`

**Chain Stap 3: Go-to-Market Plan**
\`\`\`
"Met deze positionering: [output stap 2]

Creëer een 90-dagen go-to-market plan:
1. Pre-launch activiteiten (30 dagen)
2. Launch week tactiek
3. Post-launch momentum (60 dagen)
4. KPIs en success metrics
Output: Gedetailleerd actieplan met timeline"
\`\`\`

**Chain Stap 4: Content Kalender**
\`\`\`
"Voor dit go-to-market plan: [output stap 3]

Ontwikkel een content kalender:
1. Blog posts (titels + key points)
2. Social media posts (platform-specifiek)
3. Email campagne flow
4. PR/media angles
Output: 90-dagen content kalender"
\`\`\`

#### Voorbeeld 2: Data Analyse Pipeline

**Stap 1: Data Cleaning**
\`\`\`
"Analyseer deze ruwe dataset en identificeer:
[dataset]
1. Missing values en voorgestelde behandeling
2. Outliers en anomalieën  
3. Data type inconsistenties
4. Voorgestelde transformaties"
\`\`\`

**Stap 2: Exploratory Analysis**
\`\`\`
"Met de gecleande data aannames: [output stap 1]

Voer exploratory data analysis uit:
1. Key statistieken per variabele
2. Interessante correlaties
3. Initiële patronen/trends
4. Hypotheses voor verder onderzoek"
\`\`\`

**Stap 3: Model Selectie**
\`\`\`
"Gebaseerd op EDA resultaten: [output stap 2]

Adviseer machine learning aanpak:
1. Probleem type classificatie
2. Top 3 geschikte modellen met voor/nadelen
3. Feature engineering suggesties
4. Evaluation metrics keuze"
\`\`\`

### Specifieke Praktijkvoorbeelden voor Dagelijks Gebruik

#### 1. Data Analyse Prompts

**Customer Churn Analyse:**
\`\`\`
"Laten we deze customer churn data stap voor stap analyseren:

1. Eerst verkennen we de dataset:
   - Hoeveel klanten totaal?
   - Churn rate per segment?
   - Missende data identificeren

2. Vervolgens analyseren we patronen:
   - Correlatie tussen features en churn
   - Tijdspatronen (seizoen, maand, week)
   - Customer lifecycle patterns

3. Dan bouwen we predictive insights:
   - Top 5 churn indicators
   - Risk scores per klant
   - Early warning signals

4. Tot slot actionable recommendations:
   - Retention strategies per segment
   - Prioriteit interventies
   - Expected impact per maatregel

Data: [voeg hier je CSV data in]"
\`\`\`

**Sales Performance Dashboard:**
\`\`\`
"Creëer een sales analyse volgens dit framework:

1. Performance Metrics:
   - Revenue YTD vs Target (per regio, product, rep)
   - Conversion rates per funnel stage
   - Average deal size trends

2. Predictive Analytics:
   - Q4 forecast op basis van pipeline
   - Win probability per deal
   - Resource allocation advies

3. Actionable Insights:
   - Top 3 bottlenecks in sales process
   - Quick wins voor Q4
   - Training needs per team

Output format: Executive dashboard met visualisatie suggesties"
\`\`\`

#### 2. Content Creatie Prompts

**LinkedIn Thought Leadership Post:**
\`\`\`
"Schrijf een LinkedIn post volgens deze high-engagement structuur:

Hook (eerste 2 regels - moet stoppen met scrollen):
[Controversiële stelling of fascinerende statistiek]

Story (persoonlijke anekdote):
- Setting: Waar/wanneer
- Conflict: Welk probleem
- Resolution: Hoe opgelost
- Lesson: Wat geleerd

Value (3-5 bullet points):
• Praktisch inzicht 1
• Praktisch inzicht 2
• Praktisch inzicht 3

CTA (engagement driver):
"Wat is jouw ervaring met [topic]? Share in comments 👇"

Topic: [AI in recruitment]
Tone: Professioneel maar persoonlijk
Lengte: 1300 karakters max"
\`\`\`

**Email Newsletter Template:**
\`\`\`
"Genereer een email newsletter met deze elementen:

1. Subject line (A/B test versies):
   - Curiosity gap versie
   - Value proposition versie
   - Urgency versie

2. Preview text:
   - Complementeert subject
   - Max 90 karakters

3. Body structuur:
   - Personal opener (1-2 zinnen)
   - Value sectie 1: Industry insight
   - Value sectie 2: Practical tip
   - Value sectie 3: Resource share
   - CTA: Een specifieke actie

4. PS sectie:
   - Bonus tip of exclusive offer

Doelgroep: Nederlandse marketing managers
Tone: Informeel professioneel"
\`\`\`

#### 3. Code Debug Prompts

**Python Debug Assistant:**
\`\`\`
"Debug deze Python code systematisch:

[code met error]

Debug proces:
1. Error Identificatie:
   - Exacte error message
   - Stack trace analyse
   - Error type classificatie

2. Root Cause Analysis:
   - Variable state checking
   - Logic flow tracing
   - Edge case identification

3. Solution Development:
   - Primary fix met uitleg
   - Alternative approaches
   - Prevention strategies

4. Code Quality Check:
   - Performance implications
   - Security considerations
   - Best practices alignment

Output: Gefixte code + uitleg + unit test suggestie"
\`\`\`

**JavaScript/React Debug:**
\`\`\`
"Analyseer dit React component issue:

[component code]

Probleem: [beschrijving]

Debug strategie:
1. Component Lifecycle Analysis:
   - Render cycles tracking
   - State updates flow
   - Props drilling issues

2. Common React Pitfalls Check:
   - Infinite loops
   - Memory leaks
   - Improper hooks usage

3. Performance Analysis:
   - Unnecessary re-renders
   - Heavy computations
   - Bundle size impact

4. Fix Implementation:
   - Minimal code changes
   - Backward compatibility
   - Test cases

Geef ook tips voor React DevTools debugging"
\`\`\`

#### 4. Customer Service Prompts

**Empathische Klacht Afhandeling:**
\`\`\`
"Reageer op deze klacht met empathie en oplossing:

Klacht: [klant beschrijving]

Response structuur:
1. Empathie & Erkenning (2-3 zinnen)
   - Gevoel valideren
   - Excuses waar gepast
   - Persoonlijke touch

2. Oplossing Aanbieden (bullet points)
   • Directe oplossing
   • Alternatief indien nodig
   • Compensatie (indien van toepassing)

3. Preventie & Follow-up
   - Hoe voorkomen we dit?
   - Concrete follow-up actie
   - Tijdlijn communiceren

4. Relationship Repair
   - Waardering uitspreken
   - Toekomst perspectief
   - Persoonlijke afsluiting

Tone: Warm, professioneel, oplossings-gericht"
\`\`\`

**Proactieve Service Recovery:**
\`\`\`
"Ontwikkel service recovery strategie:

Situatie: [service failure beschrijving]

Recovery Plan:
1. Immediate Response (binnen 1 uur):
   - Acknowledgment template
   - Internal escalatie
   - Customer update

2. Resolution Phase (binnen 24 uur):
   - Root cause communication
   - Solution opties (min. 3)
   - Compensation matrix

3. Follow-up Protocol:
   - 48 uur check-in
   - 1 week satisfaction survey
   - Preventie update

4. Relationship Building:
   - Loyalty program upgrade
   - Exclusive preview/benefit
   - Personal account manager

Output: Complete email/call scripts + internal process"
\`\`\`

### Praktijkvoorbeelden uit Verschillende Sectoren

#### 5. Healthcare: Patiënt Intake Optimalisatie
\`\`\`
"Als healthcare operations consultant, optimaliseer dit intake proces:

Huidige situatie: Patiënten wachten gemiddeld 45 minuten, 
papieren formulieren, handmatige data entry

Gebruik deze aanpak:
1. Map current state process (alle stappen)
2. Identificeer bottlenecks met data
3. Ontwerp future state met digitale tools
4. Bereken ROI van voorgestelde veranderingen
5. Creëer implementatie roadmap met quick wins

Specifieke focus: patient experience + staff efficiency"
\`\`\`

#### 2. E-commerce: Conversion Rate Optimalisatie
\`\`\`
"Analyseer deze e-commerce checkout flow data:
[Conversion funnel data]

Pas deze CRO methodologie toe:
1. Identificeer grootste drop-off punten
2. Hypotheses voor elke drop-off (min 3 per stap)
3. Prioriteer met ICE framework (Impact, Confidence, Ease)
4. Design A/B test plan voor top 5 hypotheses
5. Projecteer uplift bij succesvolle tests

Output: CRO roadmap met projected revenue impact"
\`\`\`

#### 3. Manufacturing: Quality Control Verbetering
\`\`\`
"Als Lean Six Sigma Black Belt, analyseer dit quality issue:

Product: Automotive sensors
Defect rate: 3.2% (target <0.5%)
Data: [productie data laatste 6 maanden]

Volg DMAIC:
1. Define: Probleem statement en project scope
2. Measure: Current state metrics en variation
3. Analyze: Root cause analyse (Ishikawa + 5 Why's)
4. Improve: Solutions met implementation plan
5. Control: Monitoring plan om improvements vast te houden"
\`\`\`

#### 4. Education: Curriculum Development
\`\`\`
"Ontwikkel een modern data science curriculum voor HBO:

Gebruik backward design:
1. Learning outcomes definiëren (Bloom's taxonomy)
2. Assessment strategie per outcome
3. Learning activiteiten die leiden tot outcomes
4. Week-voor-week planning (14 weken)
5. Integratie met industry trends en tools

Context: 60% theory, 40% praktijk, focus op employability"
\`\`\`

#### 5. Legal: Contract Risk Assessment
\`\`\`
"Review dit software licentiecontract op risico's:
[Contract tekst]

Systematische analyse:
1. Liability clausules - exposure kwantificeren
2. IP ownership - rechten en beperkingen
3. Termination conditions - exit strategieën  
4. Payment terms - cash flow impact
5. Compliance requirements - operational impact

Per risico: severity (1-5), likelihood (1-5), mitigation strategie
Output: Risk matrix met executive summary"
\`\`\`

#### 6. Hospitality: Guest Experience Enhancement
\`\`\`
"Als hospitality consultant voor boutique hotels:

Analyseer guest journey en verbeter experience:
1. Map alle touchpoints (pre-arrival tot post-stay)
2. Identificeer 'moments of truth'
3. Benchmark tegen luxury standards
4. Design signature experiences per touchpoint
5. Technology integratie mogelijkheden
6. Staff training requirements
7. ROI calculatie per verbetering

Focus: Personalisatie + operational efficiency"
\`\`\`

#### 7. Financial Services: Fraud Detection System
\`\`\`
"Design een fraud detection framework voor online banking:

Requirements: Real-time, <0.1% false positive, scalable

Aanpak:
1. Categoriseer fraud types met risk levels
2. Definieer detection rules per type
3. ML model architectuur suggestie
4. Data requirements en sources
5. Alert workflow design
6. Performance monitoring KPIs
7. Compliance check (PSD2, GDPR)

Deliverable: Technical design + implementation roadmap"
\`\`\`

#### 8. Retail: Omnichannel Strategy
\`\`\`
"Ontwikkel omnichannel strategie voor fashion retailer:

Current state: 70% physical stores, 30% online, siloed operations

Transformatie plan:
1. Customer journey mapping across channels
2. Inventory optimization model
3. Unified customer data platform design
4. Channel-specific value propositions
5. Technology stack recommendations
6. Organizational changes needed
7. 3-year rollout plan met milestones

Success metrics: Customer lifetime value, channel profitability"
\`\`\`

#### 9. Agriculture: Precision Farming Implementation
\`\`\`
"Als AgTech consultant, design precision farming systeem:

Farm: 500 hectare mixed crops
Goal: 20% yield increase, 30% resource reduction

Systematische aanpak:
1. Soil analysis requirements en zones
2. Sensor network design (types, plaatsing, data freq)
3. Data platform architectuur
4. ML modellen voor predictions
5. Automation opportunities (irrigation, fertilizer)
6. ROI model met assumptions
7. Farmer training program

Output: Implementation blueprint met budget"
\`\`\`

#### 10. Energy: Sustainability Roadmap
\`\`\`
"Creëer net-zero roadmap voor manufacturing bedrijf:

Baseline: 50,000 ton CO2/jaar
Target: Net-zero by 2040

Structured approach:
1. Emissions audit per source (Scope 1,2,3)
2. Reduction opportunities ranking (cost/ton CO2)
3. Technology roadmap (solar, wind, storage, etc)
4. Investment schedule met NPV analyse
5. Interim targets en milestones
6. Risk assessment (technology, regulatory, market)
7. Stakeholder communication plan

Deliverable: Board-ready presentation met scenario's"
\`\`\`

### Interactieve Oefeningen en Quizzen

#### Quiz 1: Chain-of-Thought Mastery
\`\`\`javascript
{
  questions: [
    {
      question: "Welke van deze prompts gebruikt effectief chain-of-thought reasoning?",
      options: [
        "Bereken de ROI van een CRM systeem",
        "Wat is de ROI van een CRM systeem dat €50k kost?",
        "Laten we stap voor stap de ROI berekenen: 1) Identificeer kosten 2) Kwantificeer baten 3) Bereken ROI over 3 jaar",
        "Geef me een schatting van CRM ROI"
      ],
      correct: 2,
      explanation: "Optie 3 gebruikt expliciet stapsgewijze instructies die de AI helpen een gestructureerd denkproces te volgen."
    },
    {
      question: "Wat is het belangrijkste voordeel van 'Laten we dit stap voor stap oplossen' in prompts?",
      options: [
        "Het maakt de prompt langer",
        "Het forceert gestructureerd denken en voorkomt het overslaan van belangrijke stappen",
        "Het is een beleefdheidsvorm",
        "Het werkt alleen bij wiskundige problemen"
      ],
      correct: 1,
      explanation: "Deze aanpak zorgt ervoor dat de AI systematisch alle aspecten van een probleem analyseert voordat het tot een conclusie komt."
    }
  ]
}
\`\`\`

#### Quiz 2: Few-Shot Learning Excellence
\`\`\`javascript
{
  questions: [
    {
      question: "Hoeveel voorbeelden zijn optimaal voor few-shot learning in de meeste business contexten?",
      options: [
        "1 voorbeeld is genoeg",
        "2-3 voorbeelden voor goede pattern recognition",
        "Minimaal 10 voorbeelden",
        "Hoe meer hoe beter, altijd 20+"
      ],
      correct: 1,
      explanation: "2-3 goede voorbeelden zijn meestal optimaal - genoeg voor pattern recognition zonder de prompt te overladen."
    },
    {
      question: "Bij few-shot learning voor Nederlandse business emails, wat is het belangrijkste?",
      options: [
        "Perfecte grammatica in voorbeelden",
        "Consistente tone of voice en structuur across voorbeelden",
        "Verschillende industrieën in voorbeelden",
        "Engelse voorbeelden vertalen"
      ],
      correct: 1,
      explanation: "Consistentie in tone en structuur helpt de AI het gewenste patroon te herkennen en repliceren."
    }
  ]
}
\`\`\`

#### Praktijk Challenge: Prompt Battle
\`\`\`javascript
{
  challenge: {
    title: "Prompt Engineering Battle",
    description: "Verbeter deze basis prompt met geavanceerde technieken",
    
    basicPrompt: "Schrijf een email naar een klant over een prijsverhoging",
    
    requirements: [
      "Voeg role-based context toe",
      "Implementeer chain-of-thought structuur",
      "Geef 2 few-shot voorbeelden",
      "Specificeer output format",
      "Voeg temperature advies toe"
    ],
    
    scoringCriteria: {
      roleDefinition: 20,
      chainOfThought: 20,
      fewShotExamples: 20,
      outputFormat: 20,
      temperatureAdvice: 20
    },
    
    expertExample: "Je bent een Customer Success Manager met 10 jaar ervaring in B2B SaaS.\\nJe bent empathisch, data-gedreven, en focust op lange-termijn relaties.\\n\\nSchrijf een prijsverhoging email volgens deze structuur:\\n\\nVoorbeeld 1:\\nBeste [Klant],\\n\\nAllereerst willen we u bedanken voor uw vertrouwen in [Product] de afgelopen [periode].\\nUw groei van [metric] met [percentage] is inspirerend om te zien.\\n\\nOm onze service te blijven verbeteren investeren we in [specifieke verbeteringen].\\nDit resulteert in een prijsaanpassing van [X]% per [datum].\\n\\nUw nieuwe investering van €[bedrag] levert u:\\n• [Benefit 1 gekwantificeerd]\\n• [Benefit 2 gekwantificeerd]\\n• [Benefit 3 gekwantificeerd]\\n\\nGraag bespreken we de impact persoonlijk. Wanneer schikt u deze week?\\n\\n[Tweede voorbeeld...]\\n\\nLaten we nu stap voor stap de email componeren:\\n1. Analyseer klantrelatie en usage data\\n2. Bepaal juiste timing en tone\\n3. Kwantificeer value proposition\\n4. Formuleer win-win narrative\\n5. Include clear next steps\\n\\nTemperature: 0.3 (zakelijk maar warm)"
  }
}
\`\`\`

#### Interactieve Prompt Builder Tool
\`\`\`javascript
{
  tool: {
    name: "AI Prompt Builder",
    description: "Bouw stap voor stap je perfecte prompt",
    
    steps: [
      {
        step: 1,
        title: "Selecteer je use case",
        options: ["Data Analyse", "Content Creatie", "Code Debug", "Customer Service", "Strategic Planning"]
      },
      {
        step: 2,
        title: "Definieer de AI rol",
        template: "Je bent een [expertise] met [jaren] ervaring in [industrie]..."
      },
      {
        step: 3,
        title: "Voeg chain-of-thought structuur toe",
        template: "Laten we dit stap voor stap aanpakken:\n1. Eerst...\n2. Vervolgens...\n3. Dan..."
      },
      {
        step: 4,
        title: "Few-shot voorbeelden toevoegen",
        action: "Voeg 2-3 relevante voorbeelden toe"
      },
      {
        step: 5,
        title: "Output specificaties",
        checklist: ["Format", "Lengte", "Tone", "Structuur", "Taal"]
      }
    ],
    
    output: "Complete, geoptimaliseerde prompt ready to use"
  }
}
\`\`\`

### Hands-on Opdrachten

#### Opdracht 1: Chain-of-Thought Mastery

**Opgave:** Ontwikkel een complete beslisboom voor een belangrijke bedrijfsbeslissing

\`\`\`
Gebruik deze template:

"Analyseer of [jouw bedrijf] moet [specifieke beslissing].

Fase 1: Situatie Analyse
- Interne factoren (sterktes/zwaktes)
- Externe factoren (kansen/bedreigingen)
- Stakeholder perspectives

Fase 2: Opties Generatie
- Optie A: [beschrijving] 
  - Pros (kwantificeer waar mogelijk)
  - Cons (kwantificeer waar mogelijk)
  - Risico's en mitigatie
- Optie B: [beschrijving]
  [zelfde structuur]
- Optie C: Status quo
  [zelfde structuur]

Fase 3: Decision Criteria
- Criterium 1: [bv. ROI] - weging: X%
- Criterium 2: [bv. Risk] - weging: Y%
- Criterium 3: [bv. Strategic fit] - weging: Z%

Fase 4: Scoring en Conclusie
- Score elke optie per criterium (1-10)
- Gewogen totaalscore berekening
- Gevoeligheidsanalyse
- Finale aanbeveling met rationale"
\`\`\`

**Expected Output:** Een gestructureerde analyse van minimaal 1000 woorden met duidelijke conclusie en next steps.

#### Opdracht 2: Few-Shot Template Library

**Opgave:** Creëer een herbruikbare few-shot template library voor jouw sector

Ontwikkel templates voor:
1. Klantcommunicatie (3 voorbeelden per type)
2. Interne rapportage (3 voorbeelden)
3. Stakeholder updates (3 voorbeelden)
4. Probleem escalaties (3 voorbeelden)

Per template:
- Context beschrijving
- 3-5 concrete voorbeelden
- Variabelen duidelijk gemarkeerd
- Tone of voice guidelines
- Do's and don'ts

**Expected Output:** Een complete template bibliotheek (2000+ woorden) die direct implementeerbaar is in jouw organisatie.

#### Opdracht 3: Prompt Engineering Audit

**Opgave:** Audit en optimaliseer 10 van je meest gebruikte prompts

Voor elke prompt:
1. Originele prompt
2. Analyse van zwakke punten
3. Geoptimaliseerde versie met:
   - Role definition
   - Chain-of-thought elementen
   - Output format specificaties
   - Temperature/top-p advies
4. A/B test resultaten (kwalitatief)
5. Lessons learned

**Expected Output:** Een gedetailleerd audit rapport met before/after vergelijkingen en meetbare verbeteringen in output kwaliteit.

### Best Practices & Pro Tips

#### De CLEAR Framework voor Prompts

**C** - Context: Geef voldoende achtergrond
**L** - Language: Specificeer tone en stijl
**E** - Examples: Gebruik few-shot waar nuttig
**A** - Action: Wees expliciet over gewenste actie
**R** - Restrictions: Geef duidelijke beperkingen

#### Veelgemaakte Valkuilen

1. **Te vage instructies**
   - Fout: "Schrijf iets over marketing"
   - Goed: "Schrijf een 500-woorden artikel over content marketing voor B2B SaaS startups, focus op SEO en thought leadership"

2. **Geen output format specificatie**
   - Fout: "Geef me ideeën"
   - Goed: "Genereer 10 product innovatie ideeën in dit format: [Naam] - [One-liner beschrijving] - [Target audience] - [Unieke waarde]"

3. **Rol zonder context**
   - Fout: "Je bent een expert"
   - Goed: "Je bent een supply chain expert met 20 jaar ervaring in automotive, gespecialiseerd in JIT manufacturing en supplier relationship management"

#### Advanced Techniques Checklist

- [ ] Gebruik altijd role-based prompting voor specialistische taken
- [ ] Pas temperature aan op basis van gewenste creativiteit
- [ ] Deel complexe taken op in prompt chains
- [ ] Bouw een persoonlijke few-shot template library
- [ ] Test prompts systematisch en itereer
- [ ] Documenteer succesvolle prompt patterns
- [ ] Combineer technieken voor maximaal effect

### Conclusie

Het beheersen van geavanceerde prompting technieken is een iteratief proces dat oefening en experimentatie vereist. De technieken in deze les - chain-of-thought, few-shot learning, role-based prompting, temperature tuning, en prompt chaining - vormen je gereedschapskist voor het consistent genereren van hoogwaardige AI-output.

Begin met het toepassen van één techniek tegelijk, bouw geleidelijk je expertise op, en creëer je eigen library van bewezen prompts. Met deze foundation ben je klaar om AI effectief in te zetten voor complexe professionele taken.

In de volgende les duiken we diep in context management en memory - essentiële vaardigheden voor het voeren van lange, coherente conversaties met AI-systemen.
  `,
  resources: [
    {
      title: 'Geavanceerde Prompt Engineering Guide',
      url: 'https://example.com/advanced-prompting',
      type: 'guide'
    },
    {
      title: 'Chain-of-Thought Prompt Templates',
      url: 'https://example.com/cot-templates',
      type: 'template'
    },
    {
      title: 'Few-Shot Learning Voorbeelden Database',
      url: 'https://example.com/few-shot-examples',
      type: 'reference'
    },
    {
      title: 'Interactieve Prompt Builder Tool',
      url: 'https://example.com/prompt-builder',
      type: 'tool'
    },
    {
      title: 'Nederlandse Business Prompt Templates',
      url: 'https://example.com/nl-business-prompts',
      type: 'template'
    }
  ],
  assignments: [
    {
      id: 'chain-of-thought-mastery',
      title: 'Chain-of-Thought Beslisboom Project',
      description: 'Ontwikkel een complete beslisboom voor een belangrijke bedrijfsbeslissing met minimaal 1000 woorden gestructureerde analyse.',
      difficulty: 'hard',
      type: 'project'
    },
    {
      id: 'few-shot-library',
      title: 'Few-Shot Template Bibliotheek',
      description: 'Creëer een herbruikbare few-shot template library voor jouw sector met minimaal 12 templates verdeeld over 4 categorieën.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'prompt-audit',
      title: 'Prompt Engineering Audit',
      description: 'Audit en optimaliseer 10 van je meest gebruikte prompts met before/after analyse en meetbare verbeteringen.',
      difficulty: 'medium',
      type: 'analysis'
    },
    {
      id: 'prompt-battle-challenge',
      title: 'Prompt Engineering Battle Challenge',
      description: 'Verbeter basis prompts met alle geavanceerde technieken: role-based context, chain-of-thought, few-shot examples, output format en temperature settings.',
      difficulty: 'hard',
      type: 'challenge'
    },
    {
      id: 'interactive-quiz-cot',
      title: 'Chain-of-Thought Mastery Quiz',
      description: 'Test je kennis van chain-of-thought prompting technieken met interactieve vragen en directe feedback.',
      difficulty: 'easy',
      type: 'quiz'
    },
    {
      id: 'interactive-quiz-fewshot',
      title: 'Few-Shot Learning Excellence Quiz',
      description: 'Toets je begrip van few-shot learning principes en best practices voor Nederlandse business contexten.',
      difficulty: 'easy',
      type: 'quiz'
    }
  ]
};