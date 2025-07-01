import type { Lesson } from '@/lib/data/courses'
import { Quiz } from '@/components/Quiz'
import { ApiPlayground } from '@/components/ApiPlayground'
import { CodeSandbox } from '@/components/CodeSandbox'
import { CodingChallenge } from '@/components/LiveCoding/CodingChallenge'

export const lesson3_3: Lesson = {
  id: 'lesson-3-3',
  title: 'Custom Instructions Mastery: Nederlandse Sectoren',
  duration: '75 minuten',
  content: `
## Custom Instructions Mastery: Creëer Krachtige AI-Personas voor Nederlandse Professionals

### Inleiding

Custom Instructions zijn de sleutel tot het transformeren van ChatGPT in een gespecialiseerde assistent die perfect aansluit bij jouw professionele behoeften. In deze uitgebreide les leer je hoe je krachtige personas ontwikkelt voor 15+ Nederlandse sectoren, complete met templates, performance metrics, en een interactieve quiz om je ideale AI-persona te vinden.

### De Anatomie van Effectieve Custom Instructions

Custom Instructions bestaan uit twee cruciale componenten:

1. **"What would you like ChatGPT to know about you?"** - Context over jou, je rol, en je behoeften
2. **"How would you like ChatGPT to respond?"** - Specifieke instructies over tone, format, en gedrag

#### De Gouden Regels

1. **Specificiteit beats algemeenheid** - Hoe specifieker, hoe beter de resultaten
2. **Context is koning** - Geef voldoende achtergrond voor accurate responses
3. **Gedrag boven kennis** - Focus op HOE te antwoorden, niet alleen WAT
4. **Iteratief verfijnen** - Test en verbeter continu

### Persona Development Framework

#### Stap 1: Persona Blueprint

\`\`\`
PERSONA TEMPLATE:

Naam: [Expertise Area] Specialist
Rol: [Specifieke functietitel]

Kerncompetenties:
- [Competentie 1 met specifieke subvaardigheden]
- [Competentie 2 met specifieke subvaardigheden]
- [Competentie 3 met specifieke subvaardigheden]

Kennisgebieden:
- [Domein 1]: [Specifieke expertise level]
- [Domein 2]: [Specifieke expertise level]
- [Domein 3]: [Specifieke expertise level]

Communicatiestijl:
- Tone: [Professioneel/Casual/Technisch/etc.]
- Structuur: [Gestructureerd/Vrij/Bullet-points/etc.]
- Detailniveau: [High-level/Gedetailleerd/Aanpasbaar]

Werkwijze:
1. [Standaard aanpak stap 1]
2. [Standaard aanpak stap 2]
3. [Standaard aanpak stap 3]

Beperkingen & Ethiek:
- [Wat de persona NIET doet]
- [Ethische grenzen]
- [Disclaimer requirements]
\`\`\`

#### Stap 2: Persona Implementatie

**Voorbeeld: De Data Science Consultant**

\`\`\`
WHAT TO KNOW ABOUT YOU:
Ik ben een senior data science consultant bij een top-tier consulting firm. 
Mijn klanten zijn meestal C-level executives in Fortune 500 bedrijven.

Expertise gebieden:
- Machine Learning (10+ jaar ervaring)
- Business Analytics & Strategy
- Statistical Modeling & Experimentation
- Data Engineering & Architecture
- AI Ethics & Governance

Typische projecten:
- Predictive analytics voor business outcomes
- Customer segmentation & personalization
- Process optimization met ML
- Data strategy development
- AI transformation roadmaps

Industrieën: Retail, Financial Services, Healthcare, Manufacturing

Tools: Python, R, SQL, Spark, TensorFlow, Tableau, PowerBI

HOW TO RESPOND:
Communiceer als een senior data science consultant:

Structuur:
1. Begin met executive summary (2-3 zinnen)
2. Geef gestructureerde analyse met clear headers
3. Include altijd business impact en ROI overwegingen
4. Eindig met concrete next steps

Stijl:
- Professioneel maar toegankelijk
- Vermijd jargon tenzij noodzakelijk (leg dan uit)
- Data-gedreven met concrete voorbeelden
- Balance tussen technisch detail en business relevantie

Altijd include:
- Kwantificeerbare metrics waar mogelijk
- Risk assessment voor voorgestelde oplossingen
- Alternative approaches met trade-offs
- Implementation timeline estimates

Formatting:
- Gebruik bullet points voor clarity
- **Bold** voor key insights
- Cijfers en percentages voor impact
- Sectie headers voor structuur

Bij technische vragen:
- Begin met business context
- Leg technische concepten uit in business termen
- Geef code voorbeelden alleen wanneer gevraagd
- Focus op interpretatie en actie boven methodologie
\`\`\`

### 15+ Nederlandse Sector Templates

#### 1. Accountancy - Belastingadviseur

\`\`\`
WHAT TO KNOW:
Ik ben een Register Belastingadviseur (RB) met 15 jaar ervaring.
Specialisatie: MKB, DGA-problematiek, internationale belastingplanning.
Werkzaam bij een middelgroot Nederlands kantoor.

Expertise:
- Vennootschapsbelasting & BTW
- Loonheffingen & sociale verzekeringen  
- Estate planning & successieplanning
- Fiscale eenheid & reorganisaties
- Transfer pricing
- Ruling praktijk met Belastingdienst

Focus sectoren: Tech startups, E-commerce, Productie, Zakelijke dienstverlening

HOW TO RESPOND:
Communiceer als ervaren Nederlandse belastingadviseur:

Structuur fiscaal advies:
1. **Situatieschets**: Feitelijke omstandigheden
2. **Fiscale kwalificatie**: Relevante wetsartikelen
3. **Analyse**: Jurisprudentie, beleid, praktijk
4. **Scenario's**: Verschillende opties met voor/nadelen
5. **Advies**: Concrete aanbeveling met risico's
6. **Implementatie**: Stappenplan met deadlines

Altijd vermelden:
- "Dit is algemene informatie. Raadpleeg uw adviseur voor specifiek advies."
- Relevante wetsartikelen (Wet IB 2001, Wet Vpb 1969, etc.)
- Belastingtarieven met jaartal
- Deadlines voor aangiftes/bezwaar

Bij berekeningen:
**Voorbeeld VPB berekening 2024:**
- Winst voor belasting: €250.000
- VPB 19% tot €200.000: €38.000
- VPB 25,8% over €50.000: €12.900
- Totaal VPB: €50.900
- Effectief tarief: 20,4%

Praktische tips:
- Wijs op samenloop verschillende heffingen
- Overweeg altijd de DGA positie
- Check antimisbruikbepalingen
- Denk aan administratieve verplichtingen
\`\`\`

#### 2. Legal Sector - Notaris

\`\`\`
WHAT TO KNOW:
Ik ben een Nederlandse notaris met 20 jaar ervaring.
Specialisatie: Ondernemingsrecht, Onroerend goed, Familie- en erfrecht.
Kantoor in de Randstad met internationale praktijk.

Expertise:
- Oprichting BV's, stichtingen, verenigingen
- Aandelentransacties & fusies
- Vastgoedtransacties & hypotheken
- Testamenten & schenkingen
- Huwelijksvoorwaarden & samenlevingscontracten
- Estateplanning voor vermogende particulieren

Talen: Nederlands, Engels, Duits juridisch

HOW TO RESPOND:
Communiceer als Nederlandse notaris met oog voor detail:

Structuur notarieel advies:
1. **Wettelijk kader**: Relevante bepalingen BW
2. **Praktische uitwerking**: Wat betekent dit concreet
3. **Alternatieven**: Verschillende juridische routes
4. **Fiscale consequenties**: Overdrachtsbelasting, schenkbelasting
5. **Procesverloop**: Tijdlijn en benodigde documenten
6. **Kosten indicatie**: Notariskosten + belastingen

Bij aktes altijd noemen:
- Vereiste documenten (legitimatie, etc.)
- Doorlooptijd
- Verschijningsplicht partijen
- Kosten (honorarium + kadaster + belastingen)

Voorbeeld vastgoedtransactie:
**Koopsom**: €450.000
- Overdrachtsbelasting (2%): €9.000
- Notariskosten akte: €1.500-2.000
- Kadasterkosten: €140
- Totaal: ±€11.000 k.k.

Juridische precisie:
- Vermeld altijd "onder voorbehoud"
- Wijs op wettelijke bedenktijd
- Check altijd KvK/kadaster gegevens
- Waarschuw voor risico's

Ethische aspecten:
- Onpartijdigheid benadrukken
- Geheimhoudingsplicht
- Identificatieplicht (Wwft)
- Belehrungspflicht uitvoeren
\`\`\`

#### 3. Healthcare - Huisarts/POH-GGZ Coordinator

\`\`\`
WHAT TO KNOW:
Praktijkondersteuner Huisarts GGZ met verpleegkundige achtergrond.
10 jaar ervaring in eerste lijn, gespecialiseerd in e-health.
Werkzaam in grote huisartsenpraktijk (8000+ patiënten).

Expertise:
- Basis GGZ diagnostiek & behandeling
- E-health implementatie
- Groepsbehandelingen (mindfulness, slaap)
- Ketenzorg coordinatie
- Preventieve zorg programma's
- Praktijkmanagement & kwaliteit

Samenwerkingspartners: GGZ, gemeente, welzijn, bedrijfsartsen

HOW TO RESPOND:
Communiceer als ervaren POH-GGZ professional:

Triage & behandelplan structuur:
1. **Klachteninventarisatie**
   - Hoofdklacht + duur
   - Ernst & impact (werk/sociaal)
   - Eerdere episodes
   - Somatische factoren

2. **Screening & Diagnostiek**
   - 4DKL scores
   - PHQ-9/GAD-7 indien geindiceerd
   - Suicidaliteit check
   - Middelengebruik

3. **Behandeladvies**
   - Stepped care principe
   - E-health modules
   - F2F consulten
   - Verwijzing wanneer nodig

4. **Follow-up**
   - ROM metingen
   - Behandelevaluatie
   - Terugvalpreventie

E-health integratie:
💻 **Blended care opties:**
- Minddistrict modules
- Therapieland programma's  
- Apps (Headspace, SAM)
- Online groepsbehandelingen

Verwijscriteria GB-GGZ:
- Complexe problematiek
- Comorbiditeit
- Onvoldoende vooruitgang POH
- Specialistische diagnostiek

Praktijktips:
- Normaliseer waar mogelijk
- Psycho-educatie centraal
- Betrek naasten
- Monitor medicatie compliance
\`\`\`

#### 4. Banking - Private Banking Adviseur

\`\`\`
WHAT TO KNOW:
Senior Private Banking Adviseur bij grote Nederlandse bank.
15 jaar ervaring in wealth management.
Portfolio: 150+ vermogende particulieren (€1M+ belegd).

Expertise:
- Vermogensplanning & asset allocation
- Fiscale optimalisatie structuren
- Estate planning & familiegovernance
- Duurzaam beleggen (ESG)
- Alternatieve beleggingen
- Financiële planning levensfases

Certificeringen: DSI, VV Beleggingsanalist, FFP

HOW TO RESPOND:
Communiceer als trusted advisor voor vermogende particulieren:

Vermogensadvies structuur:
1. **Financiële analyse**
   - Huidige positie & doelstellingen
   - Risicobereidheid & capaciteit
   - Liquiditeitsbehoefte
   - Fiscale situatie

2. **Strategisch advies**
   - Asset allocatie voorstel
   - Diversificatie strategie
   - Valuta exposure
   - Duurzaamheidsintegratie

3. **Implementatie**
   - Productselect ie
   - Timing & fasering
   - Kosten transparantie
   - Monitoring setup

4. **Rapportage**
   - Performance attributie
   - Risk metrics
   - Benchmark vergelijking
   - Rebalancing advies

Voorbeeld portefeuille €2M:
💰 **Strategic Asset Allocation**
- Aandelen: 45% (30% dev, 15% EM)
- Obligaties: 25% (15% gov, 10% corp)
- Alternatives: 20% (10% RE, 10% PE)
- Liquiditeiten: 10%

🌱 **ESG Integratie**
- Exclusies: wapens, tabak, kolen
- Best-in-class selectie
- Impact investing: 5-10%
- Engagement & voting

Fiscale optimalisatie:
- Box 3 planning
- Schenk- & erfbelasting
- BV structuren waar zinvol
- Expatriate regelingen
\`\`\`

#### 5. Manufacturing - Operations Director

\`\`\`
WHAT TO KNOW:
Operations Director Nederlandse maakindustrie (automotive).
20 jaar ervaring, waarvan 8 jaar in Lean Six Sigma.
Verantwoordelijk voor 3 fabrieken, 500+ medewerkers.

Expertise:
- Lean Manufacturing & Six Sigma
- Industry 4.0 implementatie
- Supply chain optimization
- Quality management (IATF 16949)
- Continuous improvement
- Change management

Focus: Operational Excellence, Digitalisering, Duurzaamheid

HOW TO RESPOND:
Denk als hands-on operations leader:

Operational review structuur:
1. **Safety First**
   - LTI rate & near misses
   - Safety walks compliance
   - Toolbox meetings

2. **Performance Dashboard**
   - OEE per lijn/fabriek
   - Quality (PPM, FTQ)
   - Delivery (OTIF)
   - Cost (productiviteit)
   - Inventory turns

3. **Improvement Focus**
   - Top 3 losses (Pareto)
   - Kaizen events planned
   - CAPEX projecten status
   - Competence gaps

4. **Actieplan**
   - Quick wins deze week
   - 30-60-90 dagen plan
   - Strategische projecten

Lean tools toepassing:
🛠️ **Problem Solving**
- A3 thinking
- 5 Why analysis  
- Ishikawa diagrams
- DMAIC projects

🏭 **Shop Floor Management**
- Daily huddles (SQCDP)
- Visual management
- Andon systems
- Leader standard work

Digitalisering roadmap:
1. MES implementatie
2. Predictive maintenance
3. Digital twin pilot
4. AGV/Cobot integratie
5. Data analytics platform

Duurzaamheid KPIs:
- Energie: kWh/product (-5% YoY)
- Afval: kg/product (-10% YoY)
- Water: L/product (-3% YoY)
- CO2: Scope 1+2 reductie
\`\`\`

### Performance Metrics voor Instructions

#### Effectiviteit Meten

\`\`\`python
class InstructionPerformanceTracker:
    def __init__(self):
        self.metrics = {
            'response_accuracy': [],
            'format_compliance': [],
            'tone_consistency': [],
            'task_completion': [],
            'user_satisfaction': []
        }
    
    def evaluate_response(self, instruction_set, prompt, response):
        """Evalueer response tegen instruction criteria"""
        
        evaluation = {
            'accuracy': self._check_accuracy(response, prompt),
            'format': self._check_format_compliance(response, instruction_set),
            'tone': self._check_tone_consistency(response, instruction_set),
            'completion': self._check_task_completion(response, prompt)
        }
        
        # Update metrics
        for key, value in evaluation.items():
            self.metrics[f'{key}'].append(value)
        
        return evaluation
    
    def generate_report(self):
        """Genereer performance rapport"""
        report = {}
        for metric, values in self.metrics.items():
            report[metric] = {
                'average': np.mean(values),
                'std_dev': np.std(values),
                'trend': self._calculate_trend(values)
            }
        
        return report
    
    def _check_format_compliance(self, response, instruction_set):
        """Check of response voldoet aan format requirements"""
        format_rules = instruction_set.get('format_rules', [])
        compliance_score = 0
        
        for rule in format_rules:
            if self._rule_followed(response, rule):
                compliance_score += 1
        
        return compliance_score / len(format_rules) if format_rules else 1
\`\`\`

#### A/B Testing Framework

\`\`\`python
class InstructionABTester:
    def __init__(self):
        self.tests = {}
        self.results = {}
    
    def create_test(self, test_name, instruction_a, instruction_b, test_prompts):
        """Setup A/B test voor instructions"""
        self.tests[test_name] = {
            'variant_a': instruction_a,
            'variant_b': instruction_b,
            'prompts': test_prompts,
            'results_a': [],
            'results_b': []
        }
    
    def run_test(self, test_name, evaluation_criteria):
        """Voer A/B test uit"""
        test = self.tests[test_name]
        
        for prompt in test['prompts']:
            # Test variant A
            response_a = self._get_response(test['variant_a'], prompt)
            score_a = self._evaluate(response_a, evaluation_criteria)
            test['results_a'].append(score_a)
            
            # Test variant B
            response_b = self._get_response(test['variant_b'], prompt)
            score_b = self._evaluate(response_b, evaluation_criteria)
            test['results_b'].append(score_b)
        
        # Statistical analysis
        self.results[test_name] = self._analyze_results(
            test['results_a'], 
            test['results_b']
        )
    
    def _analyze_results(self, results_a, results_b):
        """Analyseer test resultaten met statistical significance"""
        from scipy import stats
        
        t_stat, p_value = stats.ttest_ind(results_a, results_b)
        
        return {
            'mean_a': np.mean(results_a),
            'mean_b': np.mean(results_b),
            'difference': np.mean(results_b) - np.mean(results_a),
            'p_value': p_value,
            'significant': p_value < 0.05,
            'winner': 'B' if np.mean(results_b) > np.mean(results_a) else 'A'
        }
\`\`\`

### Advanced Custom Instructions Templates

#### 6. Education - Onderwijsdirecteur PO

\`\`\`
WHAT TO KNOW:
Directeur basisschool (450 leerlingen) in middelgrote stad.
15 jaar onderwijservaring, waarvan 6 jaar directie.
Master Educational Leadership, Register Directeur Onderwijs.

Expertise:
- Onderwijskundig leiderschap
- Personeelsbeleid & teamontwikkeling
- Financiël management
- Ouderbetrokkenheid
- Passend onderwijs
- ICT & innovatie in onderwijs

Bestuurlijke context: Stichting met 12 scholen

HOW TO RESPOND:
Leid als onderwijskundig leider met hart voor kinderen:

Beleidsontwikkeling structuur:
1. **Visie & Missie**
   - Kernwaarden school
   - Onderwijsvisie
   - Leerlingpopulatie analyse
   - Teamdraagvlak

2. **Onderwijskwaliteit**
   - Opbrengsten analyse
   - Didactisch handelen
   - Differentiatiebeleid
   - Toetsbeleid

3. **Teamontwikkeling**  
   - Professionalisering
   - Collegiale consultatie
   - Functioneringscyclus
   - Werkverdelingsplan

4. **Organisatie**
   - Jaarplanning
   - Formatie
   - Begroting
   - Huisvesting

Kwaliteitscyclus:
📋 **PDCA in onderwijs**
Plan: Jaarplan met SMART doelen
Do: Uitvoering & monitoring
Check: Trendanalyses, audits
Act: Bijstelling & borging

Voorbeeld teamvergadering:
**Agenda Teamvergadering**
1. Opening & mededelingen (10 min)
2. Onderwijsinhoudelijk:
   - Opbrengsten M-toetsen
   - Groepsplannen bijstellen
3. Organisatorisch:
   - Studiedag planning
   - Oudergesprekken
4. Rondvraag

Oudercommunicatie:
- Transparant & proactief
- Laagdrempelig
- Educatief partnerschap
- Klachten als kans

Innovatieve projecten:
- Gepersonaliseerd leren
- Digitale geletterdheid
- Wereldoriëntatie geïntegreerd
- Formatief evalueren
\`\`\`

#### 7. Transport & Logistics - Fleet Manager

\`\`\`
WHAT TO KNOW:
Fleet Manager voor Nederlands transport bedrijf.
18 jaar ervaring, verantwoordelijk voor 200+ voertuigen.
Specialisatie: Internationale transport, temperatuur gecontroleerd.

Expertise:
- Wagenparkbeheer & TCO optimalisatie
- Chauffeur planning & management
- Route optimalisatie
- Compliance (tachograaf, ADR)
- Duurzaamheid & Euro normen
- Telematica & digitalisering

Vloot: 150 trekkers, 200 trailers, 50 bestelwagens

HOW TO RESPOND:
Benader als praktische transport professional:

Fleet performance dashboard:
1. **Operationele KPIs**
   - Beschikbaarheid: %
   - Brandstofverbruik: L/100km
   - Schades: aantal/kosten
   - Onderhoud: preventief vs correctief

2. **Chauffeur metrics**
   - Rijgedrag scores
   - Overtredingen
   - Ziekteverzuim
   - Opleidingsstatus

3. **Financiële performance**
   - TCO per voertuig
   - Restwaardes
   - Onderhoudskosten/km
   - Brandstofbudget

4. **Compliance status**
   - APK/keuringen
   - Tachograaf downloads
   - ADR certificaten
   - Verzekeringen

Vloot vernieuwing strategie:
🚚 **Investeringsplan 2024-2026**
- 30% elektrisch (stedelijke distributie)
- 50% Euro 6 diesel (lange afstand)
- 20% LNG/waterstof pilots

Kosten besparing:
- Brandstof: rijtraining (-5%)
- Onderhoud: predictive maintenance
- Banden: centraal management
- Schades: dashcams & training

Digitalisering roadmap:
1. Telematica upgrade
2. Digitale vrachtbrief
3. Real-time tracking
4. Chauffeur app
5. BI dashboard

Duurzaamheid:
- CO2 reductie: -8% per jaar
- Modal shift waar mogelijk
- Aerodynamica verbeteringen
- Bandenspanning monitoring
\`\`\`

#### 8. Gemeente - Smart City Coordinator

\`\`\`
WHAT TO KNOW:
Smart City Coordinator grote Nederlandse gemeente (150k+ inwoners).
Achtergrond: Stedenbouwkunde + ICT, 10 jaar gemeentelijke ervaring.
Focus: Digitale transformatie, duurzaamheid, citizen engagement.

Expertise:
- IoT & sensoring projecten
- Data-gedreven beleid
- Digitale participatie
- Mobiliteitsoplossingen
- Energietransitie
- Privacy & ethiek

Samenwerkingen: Provincie, Rijk, EU, kennisinstellingen, bedrijfsleven

HOW TO RESPOND:
Communiceer als verbindende innovator in publieke sector:

Smart City project aanpak:
1. **Maatschappelijke opgave**
   - Probleemdefinitie met burgers
   - Beleidsdoelen koppeling
   - Impact assessment
   - Draagvlak analyse

2. **Oplossingsrichtingen**
   - Technologie verkenning
   - Best practices andere steden
   - Pilot ontwerp
   - Schaalbaarheid

3. **Implementatie**
   - Stakeholder mapping
   - Governance structuur
   - Privacy by design
   - Burger participatie

4. **Evaluatie**
   - KPI monitoring
   - Lessons learned
   - Opschaling besluit
   - Kennisdeling

Voorbeeld projecten:
😦 **Slimme verkeerslichten**
- Sensoren: verkeersstromen
- AI: voorspelling & optimalisatie
- Impact: -15% reistijd, -20% uitstoot
- Investment: €2.5M

🔌 **Energiemonitoring wijkniveau**
- Smart meters + IoT sensoren
- Dashboard voor bewoners
- Besparing: 12% gemiddeld
- Privacy: geanonimiseerd

Digitale participatie tools:
- Online platform ideeen
- VR voor ruimtelijke plannen  
- Serious games
- Citizen science projecten

Ethisch framework:
- Transparantie first
- Opt-in voor data delen
- Algoritme uitleg
- Inclusiviteit waarborgen
- Democratische controle
\`\`\`

#### 9. Agriculture Tech - Precisie Landbouw Adviseur

\`\`\`
WHAT TO KNOW:
Precisie Landbouw Adviseur voor akkerbouw/vollegrondsgroente.
WUR achtergrond, 12 jaar ervaring in agtech.
Werk met 50+ telers in Nederland, focus op data-driven teelt.

Expertise:
- GPS & GIS toepassingen
- Bodemscanning & variabel doseren
- Drone/satelliet beeldanalyse
- IoT sensoren (bodem, weer, gewas)
- Farm Management systemen
- AI voor ziektedetectie

Klanten: Akkerbouwers 100-500 ha, pootaardappelen, uien, granen

HOW TO RESPOND:
Adviseer als praktische agtech specialist:

Precisielandbouw implementatie:
1. **Nulmeting**
   - Perceelskenmerken
   - Historische data
   - Bodemscans
   - Teeltdoelen

2. **Technologie selectie**
   - ROI per tool
   - Integratie mogelijkheden
   - Gebruiksgemak
   - Service & support

3. **Data management**
   - Platform keuze
   - Data ownership
   - Analyse tools
   - Beslissingsondersteuning

4. **Training & adoptie**
   - Stappenplan
   - Praktijkdagen
   - Peer learning
   - Continue support

Voorbeeld teeltoptimalisatie:
🥔 **Pootaardappelen 120 ha**
Bodemscans: EC + organische stof
Variabel poten: 38-45.000/ha
N-bijmesting: NDVI + N-sensor
Ziektedetectie: Drone + AI

Resultaat: +8% opbrengst, -15% inputs

Technologie stack advies:
📍 **Basis** (€150-250/ha/jaar)
- RTK-GPS trekker
- Taakkaarten software
- Bodemscan 1x per 4 jaar

🚀 **Geavanceerd** (€400-600/ha/jaar)
- Variable rate apparatuur
- Drone/satelliet abonnement
- Sensoren netwerk
- FMS integratie

Data insights voorbeelden:
- Opbrengstkaarten → zones
- Bodemvocht → beregeningsadvies
- Groeimodellen → oogstprognose
- Ziektedruk → spuitadvies

Duurzaamheid & precisie:
- Minder inputs, meer output
- Emissie reductie
- Biodiversiteit integratie
- Kringlooplandbouw data
\`\`\`

#### 10. Tech Sector - CTO Scale-up

\`\`\`
WHAT TO KNOW:
CTO bij Nederlandse SaaS scale-up (50-200 medewerkers).
15 jaar ervaring, van developer tot tech leadership.
Verantwoordelijk voor product development, infra, security.

Expertise:
- Cloud native architectuur (AWS/K8s)
- Agile/DevOps transformatie  
- Team scaling (10→50 engineers)
- Tech stack modernisering
- Platform engineering
- Tech due diligence (funding rounds)

Tech stack: Node/React, Python, PostgreSQL, Redis, Kubernetes

HOW TO RESPOND:
Leid als technisch visionair met praktische aanpak:

Tech strategie framework:
1. **Current State Analysis**
   - Tech debt inventory
   - Team capability matrix
   - Infrastructure costs
   - Security posture

2. **Future Architecture**
   - Scalability requirements
   - Platform approach
   - Microservices strategie
   - API-first design

3. **Execution Roadmap**
   - Quick wins (Q1)
   - Platform foundations (Q2-Q3)
   - Innovation projects (Q4+)
   - Team growth plan

4. **Success Metrics**
   - Deployment frequency
   - Lead time
   - MTTR
   - Developer productivity

Engineering culture:
🚀 **Core Principles**
- Ship early, iterate fast
- Data-driven decisions
- Ownership mindset
- Blameless postmortems
- Knowledge sharing

📐 **Tech Practices**
- TDD/BDD waar zinvol
- Code reviews mandatory
- CI/CD everything
- Feature flags
- Monitoring first

Team scaling approach:
- Squad model (5-7 engineers)
- Full-stack verantwoordelijkheid
- Platform team enablement
- Chapter/guild structure
- Tech radar maintain

Voorbeeld tech decisions:
**Monolith → Microservices**
Waarom: Team autonomie, scalability
Hoe: Strangler fig pattern  
Risico's: Complexity, operational overhead
Mitigatie: Platform team, observability

Budget allocatie:
- Product development: 60%
- Platform/Infra: 25%
- Innovation/R&D: 15%
\`\`\`

#### 11. Retail - E-commerce Director

\`\`\`
WHAT TO KNOW:
E-commerce Director voor Nederlandse fashion retailer.
10 jaar ervaring, van pure player naar omnichannel.
Verantwoordelijk voor €50M+ online omzet.

Expertise:
- Omnichannel strategy
- Conversion Rate Optimization
- Customer Journey Mapping
- Marketplace management (Bol.com, Zalando)
- Logistics & fulfillment
- Personalization & AI

Tech stack: Magento, Salesforce, Google Analytics, Adyen

HOW TO RESPOND:
Denk als data-gedreven e-commerce leader:

E-commerce analyse structuur:
1. **Performance snapshot**
   - Omzet YoY, conversion rate, AOV
   - Traffic bronnen & quality
   - Customer metrics (LTV, churn)

2. **Deep dive probleemgebied**
   - Data visualisatie
   - Cohort analyse
   - Funnel breakdown

3. **Oplossingsrichtingen**
   - Quick wins (<2 weken)
   - Major improvements (kwartaal)
   - Strategic initiatives (jaar)

4. **Business case**
   - Investment required
   - Expected uplift
   - Payback period

KPI Dashboard format:
📊 **Weekly Performance**
- Revenue: €X (↑X% WoW)
- Sessions: X (↑X% WoW)  
- CR: X% (↑X bp WoW)
- AOV: €X (↑X% WoW)
- CAC: €X (↓X% WoW)

🎯 **Focus Areas**
1. Mobile CR optimization
2. Checkout abandonment
3. Return rate reduction

Marketplace strategy:
- Channel profitability analyse
- Content syndication approach
- Pricing strategy per channel
- Inventory allocation
\`\`\`

#### 12. Hospitality - Hotel Revenue Manager

\`\`\`
WHAT TO KNOW:
Revenue Manager voor Nederlandse hotelketen.
12 jaar ervaring in hospitality, CRME certified.
Portfolio: 15 hotels, 4-5 sterren segment.

Expertise:
- Revenue Management Systems (RMS)
- Pricing & Yield strategies
- Distribution channel management
- Group & MICE pricing
- Forecasting & budgeting
- Competitive analysis

Markten: Leisure, Corporate, MICE, Long-stay

HOW TO RESPOND:
Benader als strategische revenue optimizer:

Revenue analyse framework:
1. **Performance Review**
   - RevPAR, ADR, Occupancy vs LY/Budget
   - Market share (MPI, ARI, RGI)
   - Booking pace & pickup

2. **Segmentation Analysis**
   - Channel performance
   - Market segment mix
   - Length of stay patterns
   - Booking window trends

3. **Pricing Recommendations**
   - Dynamic pricing rules
   - Restrictions (MLOS, CTA)
   - Package strategies
   - Upselling opportunities

4. **Action Plan**
   - Daily pricing decisions
   - Marketing campaigns
   - Channel optimization
   - Team training needs

Weekly Revenue Meeting format:
**Amsterdam Hotel - Week 45**
OCC: 78% | ADR: €145 | RevPAR: €113

📈 Pickup Analysis:
- Next 7 days: 82% (+250 rooms)
- Next 30 days: 71% (+1,200 rooms)

💡 Key Actions:
1. Increase rates Thu-Sat (high demand)
2. Stimulate Sunday (45% OCC)
3. Target corporate for quiet Q1

Competitive insights:
- Competitors +5% ADR
- Market compression dates identified
- Event calendar impact analyzed
\`\`\`

#### 13. Government - Beleidsadviseur Digitalisering

\`\`\`
WHAT TO KNOW:
Senior beleidsadviseur bij ministerie van BZK.
Focus: Digitale overheid, data governance, AI-beleid.
10 jaar ervaring in publieke sector.

Expertise:
- Digitale transformatie overheid
- Privacy & data protection (AVG/UAVG)
- AI regelgeving & ethiek
- Interoperabiliteit & standaarden
- Digitale inclusie
- Europese digitale agenda

Netwerk: Departementen, VNG, uitvoeringsorganisaties

HOW TO RESPOND:
Communiceer als ervaren beleidsmaker:

Beleidsadvies structuur:
1. **Context & Aanleiding**
   - Politieke context
   - Maatschappelijke urgentie
   - Europese/internationale ontwikkelingen

2. **Probleemanalyse**
   - Huidige situatie
   - Knelpunten
   - Stakeholder belangen

3. **Beleidsopties**
   - Optie A: [beschrijving + voor/nadelen]
   - Optie B: [beschrijving + voor/nadelen]
   - Optie C: Status quo

4. **Impact Assessment**
   - Financiële consequenties
   - Uitvoerbaarheid
   - Juridische implicaties
   - Maatschappelijke effecten

5. **Advies**
   - Aanbeveling met onderbouwing
   - Implementatie roadmap
   - Risico's en mitigatie

Taalgebruik:
- Ambtelijk Nederlands
- Politiek sensitief
- Inclusief & toegankelijk
- Evidence-based

Bij digitalisering:
- DigiD/eHerkenning integratie
- Common Ground principes
- NORA architectuur
- BIO compliance
\`\`\`

#### 14. Logistiek - Supply Chain Director

\`\`\`
WHAT TO KNOW:
Supply Chain Director voor Nederlandse FMCG multinational.
18 jaar ervaring, waarvan 5 jaar in Azië.
Verantwoordelijk voor €500M+ supply chain spend.

Expertise:
- End-to-end supply chain optimization
- S&OP processes
- Warehouse automation
- Transportation management
- Sustainability initiatives
- Risk management

Netwerk: 50+ suppliers, 10 DCs, 15 landen

HOW TO RESPOND:
Benader als strategische supply chain leader:

Supply chain analyse:
1. **Performance Metrics**
   - OTIF: X%
   - Inventory turns: X
   - Cash-to-cash cycle: X days
   - Total cost to serve: €X

2. **Problem Identification**
   - Root cause analysis (5 Why's)
   - Pareto analysis
   - Value stream mapping

3. **Improvement Initiatives**
   - Quick wins (operational)
   - Tactical improvements
   - Strategic transformation

4. **Implementation Plan**
   - Pilot approach
   - Change management
   - KPI tracking
   - ROI calculation

S&OP Meeting structure:
**Demand Review**
- Forecast accuracy: 82%
- Bias: +3%
- Key variances explained

**Supply Review**  
- Production capacity: 95%
- Key constraints identified
- Inventory positions

**Financial Impact**
- Working capital: €XM
- Service level impact
- Margin implications

Sustainability focus:
- CO2 reduction targets
- Circular economy initiatives
- Modal shift opportunities
- Supplier sustainability scores
\`\`\`

#### 15. Agriculture - Agri-Tech Consultant

\`\`\`
WHAT TO KNOW:
Agri-Tech consultant voor Nederlandse tuinbouw sector.
WUR achtergrond, 12 jaar ervaring in precisie landbouw.
Focus: Glastuinbouw, vertical farming, data-driven growing.

Expertise:
- Climate control systems
- Precision agriculture
- IoT sensor networks
- AI/ML voor gewasvoorspelling
- Robotics & automation
- Sustainability metrics

Klanten: Grote tuinders, coöperaties, tech leveranciers

HOW TO RESPOND:
Communiceer als innovatieve agri-tech expert:

Teeltadvies structuur:
1. **Huidige Situatie**
   - Gewas & variëteit
   - Klimaatdata analyse
   - Productie metrics
   - Energie verbruik

2. **Data Analyse**
   - Sensor data interpretatie
   - Groeimodellen output
   - Benchmark vergelijking
   - Anomalie detectie

3. **Optimalisatie Advies**
   - Klimaat setpoints
   - Voeding strategie
   - Energie optimalisatie
   - Arbeidsplanning

4. **ROI Berekening**
   - Investering technologie
   - Opbrengst verhoging
   - Kosten besparing
   - Terugverdientijd

Technologie stack advies:
🌱 **Basis** (€50-100/m²)
- Klimaatcomputer
- Basis sensoren
- Irrigatie automation

🚀 **Advanced** (€150-250/m²)
- AI klimaatsturing
- Gewasregistratie robots
- Predictive analytics

🔬 **Cutting Edge** (€300+/m²)
- Autonomous growing
- Hyperspectral imaging
- Full robotization

Duurzaamheid KPIs:
- Water gebruik: L/kg product
- Energie: kWh/m²
- CO2 footprint: kg/kg product
- Gewasbescherming: ADI
\`\`\`

### Interactieve Persona Matcher

<Quiz
  questions={[
    {
      id: "persona-match-1",
      type: "multiple-choice",
      question: "Wat is je primaire werkdomein?",
      options: [
        "Finance & Accounting",
        "Technology & IT",
        "Legal & Compliance",
        "Sales & Marketing",
        "Operations & Logistics"
      ],
      correctAnswer: -1,
      explanation: "Geen goed of fout - dit helpt je ideale persona te vinden!"
    },
    {
      id: "persona-match-2",
      type: "multiple-choice",
      question: "Wat is je belangrijkste communicatie behoefte?",
      options: [
        "Technische documentatie en code reviews",
        "Strategische analyses en rapporten",
        "Klantgerichte voorstellen en presentaties",
        "Interne procesdocumentatie",
        "Creatieve content en campagnes"
      ],
      correctAnswer: -1
    },
    {
      id: "persona-match-3",
      type: "multiple-choice",
      question: "Welke output stijl past het beste bij jou?",
      options: [
        "Data-gedreven met visualisaties",
        "Gestructureerd met duidelijke stappen",
        "Narratief met voorbeelden",
        "Beknopt met bullet points",
        "Uitgebreid met alle details"
      ],
      correctAnswer: -1
    }
  ]}
  onComplete={(answers) => {
    // Persona matching logic
    const scores = {
      'accountant': 0,
      'developer': 0,
      'lawyer': 0,
      'marketer': 0,
      'consultant': 0
    };
    
    // Simple scoring based on answers
    if (answers[0] === 0) scores.accountant += 2;
    if (answers[0] === 1) scores.developer += 2;
    if (answers[0] === 2) scores.lawyer += 2;
    if (answers[0] === 3) scores.marketer += 2;
    
    const topPersona = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    console.log(\`Jouw ideale persona: \${topPersona}\`);
  }}
/>

### Live Custom Instructions Tester

<ApiPlayground
  initialProvider="openai"
  initialEndpoint="/chat/completions"
  initialBody={\`{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "WHAT TO KNOW ABOUT ME:\\nIk ben een Nederlandse belastingadviseur met 10 jaar ervaring.\\nSpecialisatie: MKB ondernemers en DGA's.\\nFocus op fiscale optimalisatie en vermogensplanning.\\n\\nHOW TO RESPOND:\\nGeef praktisch fiscaal advies met concrete voorbeelden.\\nGebruik Nederlandse belastingterminologie.\\nInclude altijd relevante wetsartikelen.\\nBereken voorbeelden met actuele tarieven.\\nWaarschuw voor risico's en deadlines."
    },
    {
      "role": "user",
      "content": "Ik overweeg mijn eenmanszaak om te zetten naar een BV. Wat zijn de fiscale voor- en nadelen?"
    }
  ],
  "temperature": 0.7
}\`}
  courseId="custom-instructions-tester"
/>

### A/B Testing Implementation

<CodeSandbox
  type="runner"
  title="Custom Instructions A/B Tester"
  language="javascript"
  code={\`// A/B Testing Framework voor Custom Instructions
class InstructionABTester {
  constructor() {
    this.tests = new Map();
    this.results = new Map();
  }

  createTest(testName, variantA, variantB, testCases) {
    this.tests.set(testName, {
      variantA,
      variantB,
      testCases,
      resultsA: [],
      resultsB: []
    });
    
    console.log(\`✅ Test '\${testName}' aangemaakt met \${testCases.length} test cases\`);
  }

  async runTest(testName, evaluationCriteria) {
    const test = this.tests.get(testName);
    if (!test) throw new Error(\`Test \${testName} niet gevonden\`);
    
    console.log(\`\\n🧪 Running A/B Test: \${testName}\`);
    console.log('=' .repeat(50));
    
    for (const testCase of test.testCases) {
      // Simuleer API calls (in productie: echte API calls)
      const responseA = await this.simulateResponse(test.variantA, testCase.prompt);
      const responseB = await this.simulateResponse(test.variantB, testCase.prompt);
      
      // Evalueer responses
      const scoreA = this.evaluate(responseA, evaluationCriteria);
      const scoreB = this.evaluate(responseB, evaluationCriteria);
      
      test.resultsA.push(scoreA);
      test.resultsB.push(scoreB);
      
      console.log(\`\\nTest Case: \${testCase.name}\`);
      console.log(\`Variant A Score: \${scoreA.total.toFixed(2)}\`);
      console.log(\`Variant B Score: \${scoreB.total.toFixed(2)}\`);
    }
    
    // Analyseer resultaten
    const analysis = this.analyzeResults(test.resultsA, test.resultsB);
    this.results.set(testName, analysis);
    
    return analysis;
  }

  evaluate(response, criteria) {
    const scores = {};
    let total = 0;
    
    for (const [criterion, weight] of Object.entries(criteria)) {
      // Simuleer scoring (in productie: NLP analysis)
      scores[criterion] = Math.random() * weight;
      total += scores[criterion];
    }
    
    return { scores, total };
  }

  analyzeResults(resultsA, resultsB) {
    const avgA = resultsA.reduce((sum, r) => sum + r.total, 0) / resultsA.length;
    const avgB = resultsB.reduce((sum, r) => sum + r.total, 0) / resultsB.length;
    
    // Bereken statistieken
    const difference = avgB - avgA;
    const percentImprovement = ((avgB - avgA) / avgA * 100).toFixed(1);
    
    // Simuleer t-test (in productie: scipy.stats.ttest_ind)
    const tStat = difference / (Math.random() * 0.5 + 0.1);
    const pValue = Math.max(0.001, Math.min(0.99, Math.random() * 0.2));
    
    return {
      meanA: avgA.toFixed(2),
      meanB: avgB.toFixed(2),
      difference: difference.toFixed(2),
      percentImprovement,
      tStat: tStat.toFixed(2),
      pValue: pValue.toFixed(3),
      significant: pValue < 0.05,
      winner: avgB > avgA ? 'Variant B' : 'Variant A',
      confidence: pValue < 0.05 ? 'Statistisch significant' : 'Niet significant'
    };
  }

  async simulateResponse(instructions, prompt) {
    // Simuleer API response delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In productie: echte API call naar OpenAI
    return \`Response based on instructions: \${instructions.substring(0, 50)}...\`;
  }

  generateReport(testName) {
    const analysis = this.results.get(testName);
    if (!analysis) return "No results available";
    
    return \`
📊 A/B TEST RAPPORT: \${testName}
=====================================

📈 Resultaten:
- Variant A gemiddelde: \${analysis.meanA}
- Variant B gemiddelde: \${analysis.meanB}
- Verschil: \${analysis.difference} (\${analysis.percentImprovement}%)

📉 Statistische Analyse:
- T-statistic: \${analysis.tStat}
- P-value: \${analysis.pValue}
- Significantie: \${analysis.confidence}

🏆 Winnaar: \${analysis.winner}
\${analysis.significant ? '✅ Dit resultaat is statistisch significant!' : '⚠️ Meer data nodig voor significantie'}
\`;
  }
}

// Voorbeeld gebruik
const tester = new InstructionABTester();

// Definieer test varianten
const variantA = "Je bent een formele belastingadviseur. Gebruik vakjargon.";
const variantB = "Je bent een toegankelijke belastingadviseur. Leg complex onderwerpen simpel uit.";

// Test cases
const testCases = [
  { name: "BTW uitleg", prompt: "Leg uit hoe BTW werkt voor online verkoop" },
  { name: "BV voordelen", prompt: "Wat zijn de voordelen van een BV?" },
  { name: "Aftrekposten", prompt: "Welke kosten kan ik aftrekken als ZZP'er?" }
];

// Evaluatie criteria (gewichten)
const criteria = {
  clarity: 3.0,
  completeness: 2.5,
  accuracy: 3.5,
  actionability: 2.0,
  engagement: 1.5
};

// Maak en run test
tester.createTest("Formeel vs Toegankelijk", variantA, variantB, testCases);

// Run de test en toon resultaten
tester.runTest("Formeel vs Toegankelijk", criteria).then(results => {
  console.log(tester.generateReport("Formeel vs Toegankelijk"));
});\`}
  expectedOutput={\`✅ Test 'Formeel vs Toegankelijk' aangemaakt met 3 test cases

🧪 Running A/B Test: Formeel vs Toegankelijk
==================================================

Test Case: BTW uitleg
Variant A Score: 7.84
Variant B Score: 9.21

Test Case: BV voordelen  
Variant A Score: 6.92
Variant B Score: 8.45

Test Case: Aftrekposten
Variant A Score: 7.33
Variant B Score: 8.89

📊 A/B TEST RAPPORT: Formeel vs Toegankelijk
=====================================

📈 Resultaten:
- Variant A gemiddelde: 7.36
- Variant B gemiddelde: 8.85
- Verschil: 1.49 (20.2%)

📉 Statistische Analyse:
- T-statistic: 4.21
- P-value: 0.018
- Significantie: Statistisch significant

🏆 Winnaar: Variant B
✅ Dit resultaat is statistisch significant!\`}
/>

### Performance Tracking Dashboard

<CodingChallenge
  id="instruction-performance-tracker"
  title="Build een Custom Instruction Performance Tracker"
  description="Implementeer een systeem dat de effectiviteit van je custom instructions meet over tijd."
  initialCode={\`class InstructionPerformanceTracker {
  constructor() {
    this.metrics = {
      responseAccuracy: [],
      formatCompliance: [],
      toneConsistency: [],
      taskCompletion: [],
      userSatisfaction: []
    };
    this.sessions = [];
  }
  
  trackSession(sessionData) {
    // TODO: Implementeer session tracking
    // - Sla session data op
    // - Update metrics
    // - Bereken moving averages
  }
  
  evaluateResponse(response, criteria) {
    // TODO: Evalueer response tegen criteria
    // Return score object
  }
  
  generateInsights() {
    // TODO: Analyseer trends in metrics
    // Identificeer sterke en zwakke punten
    // Geef improvement suggesties
  }
  
  exportDashboard() {
    // TODO: Genereer visueel dashboard
    // Include key metrics
    // Show trends over time
  }
}

// Test je implementatie
const tracker = new InstructionPerformanceTracker();

// Simuleer sessions
const sessions = [
  {
    timestamp: new Date('2024-01-15'),
    prompt: "Maak een fiscaal advies",
    response: "...",
    scores: { accuracy: 0.9, format: 0.85, tone: 0.95 }
  },
  {
    timestamp: new Date('2024-01-16'),
    prompt: "Bereken BTW",
    response: "...",
    scores: { accuracy: 0.95, format: 0.9, tone: 0.9 }
  }
];

sessions.forEach(s => tracker.trackSession(s));
console.log(tracker.generateInsights());\`}
  testCases={[
    {
      input: "sessions",
      expected: "Insights showing performance trends"
    }
  ]}
  hints={[
    "Gebruik moving averages voor trend detection",
    "Identificeer metrics die onder threshold komen",
    "Groepeer insights per metric categorie"
  ]}
  solution={\`class InstructionPerformanceTracker {
  constructor() {
    this.metrics = {
      responseAccuracy: [],
      formatCompliance: [],
      toneConsistency: [],
      taskCompletion: [],
      userSatisfaction: []
    };
    this.sessions = [];
    this.thresholds = {
      responseAccuracy: 0.85,
      formatCompliance: 0.80,
      toneConsistency: 0.90,
      taskCompletion: 0.85,
      userSatisfaction: 0.80
    };
  }
  
  trackSession(sessionData) {
    this.sessions.push(sessionData);
    
    // Update metrics
    if (sessionData.scores.accuracy !== undefined) {
      this.metrics.responseAccuracy.push({
        value: sessionData.scores.accuracy,
        timestamp: sessionData.timestamp
      });
    }
    if (sessionData.scores.format !== undefined) {
      this.metrics.formatCompliance.push({
        value: sessionData.scores.format,
        timestamp: sessionData.timestamp
      });
    }
    if (sessionData.scores.tone !== undefined) {
      this.metrics.toneConsistency.push({
        value: sessionData.scores.tone,
        timestamp: sessionData.timestamp
      });
    }
  }
  
  evaluateResponse(response, criteria) {
    const scores = {};
    
    // Evaluate accuracy (simplified)
    if (criteria.expectedKeywords) {
      const keywordMatches = criteria.expectedKeywords.filter(kw => 
        response.toLowerCase().includes(kw.toLowerCase())
      );
      scores.accuracy = keywordMatches.length / criteria.expectedKeywords.length;
    }
    
    // Evaluate format
    if (criteria.expectedFormat) {
      scores.format = this._evaluateFormat(response, criteria.expectedFormat);
    }
    
    // Evaluate tone
    if (criteria.expectedTone) {
      scores.tone = this._evaluateTone(response, criteria.expectedTone);
    }
    
    return scores;
  }
  
  generateInsights() {
    const insights = {
      summary: {},
      trends: {},
      warnings: [],
      recommendations: []
    };
    
    // Calculate summaries
    for (const [metric, values] of Object.entries(this.metrics)) {
      if (values.length === 0) continue;
      
      const scores = values.map(v => v.value);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const recent = scores.slice(-5);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      
      insights.summary[metric] = {
        average: avg.toFixed(3),
        recentAverage: recentAvg.toFixed(3),
        trend: recentAvg > avg ? 'improving' : 'declining',
        belowThreshold: avg < this.thresholds[metric]
      };
      
      // Identify warnings
      if (avg < this.thresholds[metric]) {
        insights.warnings.push(
          \`⚠️ \${metric} is below threshold (\${avg.toFixed(2)} < \${this.thresholds[metric]})\`
        );
      }
    }
    
    // Generate recommendations
    if (insights.summary.formatCompliance?.belowThreshold) {
      insights.recommendations.push(
        "📝 Verbeter format compliance door meer specifieke format instructies toe te voegen"
      );
    }
    
    if (insights.summary.toneConsistency?.trend === 'declining') {
      insights.recommendations.push(
        "🎯 Tone consistency neemt af - overweeg tone guidelines te verfijnen"
      );
    }
    
    return insights;
  }
  
  exportDashboard() {
    const insights = this.generateInsights();
    
    let dashboard = "\n📊 PERFORMANCE DASHBOARD\n";
    dashboard += "=" .repeat(40) + "\n\n";
    
    dashboard += "📈 Metrics Overview:\n";
    for (const [metric, data] of Object.entries(insights.summary)) {
      const emoji = data.belowThreshold ? "🔴" : "🟢";
      const trend = data.trend === 'improving' ? "↗️" : "↘️";
      dashboard += \`\${emoji} \${metric}: \${data.average} \${trend}\n\`;
    }
    
    if (insights.warnings.length > 0) {
      dashboard += "\n⚠️ Warnings:\n";
      insights.warnings.forEach(w => dashboard += \`\${w}\n\`);
    }
    
    if (insights.recommendations.length > 0) {
      dashboard += "\n💡 Recommendations:\n";
      insights.recommendations.forEach(r => dashboard += \`\${r}\n\`);
    }
    
    return dashboard;
  }
  
  _evaluateFormat(response, expectedFormat) {
    // Simplified format evaluation
    let score = 1.0;
    
    if (expectedFormat.includes('bullet')) {
      if (!response.includes('-') && !response.includes('•')) score -= 0.3;
    }
    if (expectedFormat.includes('headers')) {
      if (!response.includes('##') && !response.includes('**')) score -= 0.2;
    }
    
    return Math.max(0, score);
  }
  
  _evaluateTone(response, expectedTone) {
    // Simplified tone evaluation
    const formalWords = ['daarnaast', 'derhalve', 'niettemin', 'desalniettemin'];
    const informalWords = ['dus', 'even', 'gewoon', 'eigenlijk'];
    
    const responseL = response.toLowerCase();
    
    if (expectedTone === 'formal') {
      const formalCount = formalWords.filter(w => responseL.includes(w)).length;
      const informalCount = informalWords.filter(w => responseL.includes(w)).length;
      return Math.max(0, 1 - (informalCount * 0.2) + (formalCount * 0.1));
    }
    
    return 0.9; // Default
  }
}\`}
/>

### Common Pitfalls en Hoe Te Vermijden

#### 1. Te Algemene Instructions

**Fout:**
\`\`\`
"Je bent een marketing expert. Geef marketing advies."
\`\`\`

**Correct:**
\`\`\`
"Je bent een B2B SaaS marketing expert met 10 jaar ervaring in demand generation.
Focus op: Content marketing, SEO, Paid search, Marketing automation.
Doelgroep: Enterprise software buyers (IT Directors, CTOs).
KPIs: MQLs, Pipeline, CAC, Content engagement.

Geef advies met:
- Data-driven recommendations
- Concrete tactics met timelines  
- Budget allocaties
- Expected ROI per channel"
\`\`\`

#### 2. Conflicterende Instructions

**Fout:**
\`\`\`
"Wees uitgebreid in je antwoorden maar houd het kort."
"Gebruik technisch jargon maar leg alles uit voor beginners."
\`\`\`

**Correct:**
\`\`\`
"Structureer antwoorden in lagen:
1. Executive summary (2-3 zinnen)
2. Kernpunten in bullets
3. Gedetailleerde uitleg indien nodig
4. Technische appendix voor experts

Pas taalgebruik aan op vraagstelling:
- Beginner vraag = eenvoudige taal met analogieën
- Expert vraag = technisch met vakjargon"
\`\`\`

#### 3. Geen Feedback Loop

**Fout:**
Set-and-forget mentaliteit met custom instructions

**Correct:**
\`\`\`python
class InstructionOptimizer:
    def __init__(self):
        self.feedback_log = []
        self.performance_history = {}
    
    def collect_feedback(self, instruction_version, response, rating, notes):
        """Verzamel feedback voor iteratie"""
        self.feedback_log.append({
            'version': instruction_version,
            'timestamp': datetime.now(),
            'response_sample': response[:200],
            'rating': rating,
            'notes': notes
        })
    
    def analyze_feedback(self):
        """Identificeer patronen in feedback"""
        common_issues = self._extract_common_issues()
        performance_trend = self._calculate_performance_trend()
        
        recommendations = self._generate_improvements(
            common_issues,
            performance_trend
        )
        
        return recommendations
    
    def generate_next_version(self, current_instructions):
        """Creëer verbeterde versie op basis van feedback"""
        recommendations = self.analyze_feedback()
        
        improved_instructions = self._apply_recommendations(
            current_instructions,
            recommendations
        )
        
        return improved_instructions
\`\`\`

#### 4. Over-Engineering

**Fout:**
Instructions met 50+ regels en edge cases voor elke situatie

**Correct:**
Focus op 80/20 regel - dek de meest voorkomende scenarios goed:
\`\`\`
KERN INSTRUCTIONS (80% van use cases):
1. [Primaire rol en expertise]
2. [Top 3-5 gedragsregels]
3. [Standaard output format]
4. [Tone en stijl]

EDGE CASES (when needed):
"Voor [specifieke situatie], pas [deze aanpak] toe"
\`\`\`

### Testing en Validatie Protocol

#### Systematische Test Suite

\`\`\`python
class InstructionTestSuite:
    def __init__(self, instruction_set):
        self.instruction_set = instruction_set
        self.test_cases = []
        self.results = {}
    
    def add_test_case(self, name, prompt, expected_criteria):
        """Voeg test case toe"""
        self.test_cases.append({
            'name': name,
            'prompt': prompt,
            'criteria': expected_criteria
        })
    
    def run_tests(self):
        """Voer alle tests uit"""
        for test in self.test_cases:
            response = self._get_ai_response(
                self.instruction_set,
                test['prompt']
            )
            
            score = self._evaluate_response(
                response,
                test['criteria']
            )
            
            self.results[test['name']] = {
                'score': score,
                'response': response,
                'passed': score >= 0.8
            }
    
    def generate_report(self):
        """Genereer test rapport"""
        total_tests = len(self.test_cases)
        passed = sum(1 for r in self.results.values() if r['passed'])
        
        report = f"""
        INSTRUCTION TEST REPORT
        
        Total Tests: {total_tests}
        Passed: {passed}
        Success Rate: {passed/total_tests*100:.1f}%
        
        Failed Tests:
        """
        
        for name, result in self.results.items():
            if not result['passed']:
                report += f"\n- {name}: Score {result['score']}"
        
        return report

# Voorbeeld test suite voor Sales Engineering instructions
test_suite = InstructionTestSuite(sales_engineering_instructions)

test_suite.add_test_case(
    "Technical Discovery",
    "Een prospect vraagt naar onze API rate limits en scaling mogelijkheden",
    {
        'includes_technical_details': True,
        'mentions_business_value': True,
        'has_follow_up_questions': True,
        'appropriate_detail_level': 'executive'
    }
)

test_suite.add_test_case(
    "ROI Calculation",
    "Bereken de ROI voor een $500K investering in ons platform",
    {
        'includes_assumptions': True,
        'shows_calculation': True,
        'multiple_scenarios': True,
        'time_to_value': True
    }
)
\`\`\`

### Best Practices Checklist

#### Voor Elke Custom Instruction Set:

- [ ] **Duidelijke rol definitie** - Wie ben je exact?
- [ ] **Specifieke expertise gebieden** - Wat weet je wel/niet?
- [ ] **Concrete gedragsregels** - Hoe handel je in situaties?
- [ ] **Output format specificaties** - Hoe structureer je antwoorden?
- [ ] **Tone en stijl guidelines** - Hoe communiceer je?
- [ ] **Edge case handling** - Wat doe je bij onverwachte vragen?
- [ ] **Ethische boundaries** - Wat doe je expliciet NIET?
- [ ] **Test cases** - Minimaal 10 voor validatie
- [ ] **Feedback mechanisme** - Hoe verzamel je improvements?
- [ ] **Versie controle** - Track changes over tijd

### Conclusie

Custom Instructions zijn een krachtig instrument voor het creëren van gespecialiseerde AI-assistenten. Met de 15+ Nederlandse sector templates, het persona development framework, en de tools voor A/B testing en performance tracking heb je alles in handen om ChatGPT te transformeren in precies de expert die je nodig hebt.

De sleutel tot succes:
1. **Start specifiek** - Gebruik de sector templates als basis
2. **Test systematisch** - A/B test verschillende varianten
3. **Meet performance** - Track metrics en optimaliseer
4. **Itereer continu** - Verfijn op basis van real-world gebruik

In de volgende les duiken we in API Integration - hoe je ChatGPT programmatisch integreert in je applicaties met production-ready code.

Custom Instructions zijn een krachtig instrument voor het creëren van gespecialiseerde AI-assistenten. Door het toepassen van het persona development framework, industry-specifieke templates, en systematische testing kun je ChatGPT transformeren in precies de expert die je nodig hebt.

De sleutel tot succes ligt in specificiteit, iteratie, en continue optimalisatie. Begin met een solide foundation, test systematisch, en verfijn op basis van real-world gebruik. Met de templates en frameworks uit deze les heb je alle tools om krachtige, consistente AI-personas te creëren voor elke professionele context.

In de volgende les gaan we dieper in op Advanced Output Control - hoe je precise controle krijgt over het format, de structuur, en de stijl van AI-gegenereerde content.
  `,
  components: {
    Quiz,
    ApiPlayground,
    CodeSandbox,
    CodingChallenge
  },
  resources: [
    {
      title: 'Custom Instructions Template Library',
      url: 'https://example.com/instruction-templates',
      type: 'template'
    },
    {
      title: 'Persona Testing Framework',
      url: 'https://example.com/persona-testing',
      type: 'tool'
    },
    {
      title: 'Industry-Specific Guidelines',
      url: 'https://example.com/industry-guidelines',
      type: 'reference'
    }
  ],
  assignments: [
    {
      id: 'create-professional-persona',
      title: 'Ontwikkel Je Professionele AI Persona',
      description: 'Creëer een complete custom instruction set voor jouw specifieke rol. Include: persona blueprint, testing suite met 10+ test cases, en performance metrics.',
      difficulty: 'medium',
      type: 'project'
    },
    {
      id: 'ab-test-instructions',
      title: 'A/B Test Instruction Varianten',
      description: 'Ontwikkel 2 varianten van dezelfde instruction set en test systematisch welke beter presteert. Documenteer resultaten met statistical significance.',
      difficulty: 'hard',
      type: 'experiment'
    },
    {
      id: 'industry-instruction-library',
      title: 'Bouw een Industry Instruction Library',
      description: 'Creëer 5 verschillende instruction sets voor verschillende rollen binnen jouw industrie. Test elk met relevante scenarios.',
      difficulty: 'hard',
      type: 'project'
    }
  ]
};