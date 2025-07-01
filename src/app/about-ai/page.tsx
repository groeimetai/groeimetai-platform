import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Brain,
  Cpu,
  Network,
  Sparkles,
  TrendingUp,
  Users,
  Briefcase,
  Globe,
  Lightbulb,
  Rocket,
  Shield,
  Heart,
  Building,
  GraduationCap,
  ChevronRight,
  Bot,
  Database,
  LineChart,
  Zap
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Over AI | GroeimetAI - Alles over Artificial Intelligence',
  description: 'Ontdek wat AI is, verschillende soorten AI, Machine Learning, LLMs en waarom het belangrijk is om AI te leren. De toekomst van AI in Nederland en Europa.',
  openGraph: {
    title: 'Over AI - GroeimetAI',
    description: 'Leer alles over Artificial Intelligence, Machine Learning en de toekomst van AI in Nederland.',
  },
}

const aiTypes = [
  {
    icon: Brain,
    title: 'Artificial Narrow Intelligence (ANI)',
    description: 'Ook wel "Weak AI" genoemd. Dit is AI die gespecialiseerd is in één specifieke taak, zoals schaakcomputers of spraakherkenning.',
    examples: ['Siri & Alexa', 'Netflix aanbevelingen', 'Spam filters', 'Gezichtsherkenning']
  },
  {
    icon: Network,
    title: 'Machine Learning (ML)',
    description: 'Een subset van AI waarbij computers leren van data zonder expliciet geprogrammeerd te worden.',
    examples: ['Voorspellende analyses', 'Patroonherkenning', 'Fraude detectie', 'Medische diagnoses']
  },
  {
    icon: Bot,
    title: 'Large Language Models (LLMs)',
    description: 'Geavanceerde AI-modellen die menselijke taal kunnen begrijpen en genereren, zoals ChatGPT en Claude.',
    examples: ['ChatGPT', 'Claude', 'Gemini', 'LLaMA']
  },
  {
    icon: Cpu,
    title: 'Deep Learning',
    description: 'Een geavanceerde vorm van ML die neurale netwerken gebruikt om complexe patronen te herkennen.',
    examples: ['Autonome voertuigen', 'Medische beeldanalyse', 'Natuurlijke taalverwerking', 'Computer vision']
  }
]

const benefits = [
  {
    icon: TrendingUp,
    title: 'Carrièrekansen',
    description: 'AI-vaardigheden zijn de meest gevraagde skills op de arbeidsmarkt met salarisverhogingen tot 40%.'
  },
  {
    icon: Lightbulb,
    title: 'Innovatie',
    description: 'Creëer innovatieve oplossingen en verbeter bestaande processen in elk vakgebied.'
  },
  {
    icon: Zap,
    title: 'Productiviteit',
    description: 'Automatiseer repetitieve taken en focus op creatief en strategisch werk.'
  },
  {
    icon: Users,
    title: 'Toekomstbestendig',
    description: 'Bereid jezelf voor op een wereld waar AI een integraal onderdeel is van elk beroep.'
  }
]

const aiApplications = [
  {
    sector: 'Gezondheidszorg',
    icon: Heart,
    applications: ['Diagnostiek', 'Medicijnontwikkeling', 'Gepersonaliseerde behandelingen', 'Chirurgische robots']
  },
  {
    sector: 'Financiën',
    icon: LineChart,
    applications: ['Fraude detectie', 'Algorithmic trading', 'Risico-analyse', 'Klantenservice']
  },
  {
    sector: 'Onderwijs',
    icon: GraduationCap,
    applications: ['Gepersonaliseerd leren', 'Automatische beoordeling', 'Virtuele assistenten', 'Curriculum optimalisatie']
  },
  {
    sector: 'Bedrijfsleven',
    icon: Building,
    applications: ['Process automation', 'Predictive maintenance', 'Supply chain optimization', 'Customer insights']
  }
]

const futureInsights = [
  {
    title: 'AI Supermacht Europa',
    description: 'De EU investeert €20 miljard in AI tot 2030, met focus op ethische AI en digitale soevereiniteit.',
    stat: '€20 miljard'
  },
  {
    title: 'Nederlandse AI Coalitie',
    description: 'Nederland streeft ernaar een AI-hub van Europa te worden met sterke publiek-private samenwerkingen.',
    stat: '400+ bedrijven'
  },
  {
    title: 'Banen van de Toekomst',
    description: '85% van de banen in 2030 bestaan nu nog niet, waarvan de meeste AI-vaardigheden vereisen.',
    stat: '85% nieuwe banen'
  },
  {
    title: 'Economische Impact',
    description: 'AI zal €13 biljoen toevoegen aan de wereldeconomie tegen 2030, waarvan €2.7 biljoen in Europa.',
    stat: '€2.7 biljoen'
  }
]

const timeline = [
  {
    year: '2023-2025',
    title: 'AI Adoptie',
    description: 'Massale adoptie van AI-tools zoals ChatGPT in bedrijven en onderwijs.'
  },
  {
    year: '2025-2027',
    title: 'AI Integratie',
    description: 'AI wordt geïntegreerd in alle software en bedrijfsprocessen.'
  },
  {
    year: '2027-2030',
    title: 'AI Transformatie',
    description: 'Complete transformatie van industrieën door geavanceerde AI-systemen.'
  },
  {
    year: '2030+',
    title: 'AI Samenleving',
    description: 'AI als fundamenteel onderdeel van de samenleving met nieuwe ethische kaders.'
  }
]

export default function AboutAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Wat is Artificial Intelligence?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ontdek de fascinerende wereld van AI, van Machine Learning tot Large Language Models, 
              en waarom het cruciaal is voor jouw toekomst.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  <span className="font-semibold text-2xl text-blue-600">Artificial Intelligence (AI)</span> is 
                  technologie die machines in staat stelt om taken uit te voeren die normaal menselijke 
                  intelligentie vereisen. Van het herkennen van spraak tot het nemen van complexe beslissingen, 
                  AI transformeert de manier waarop we leven en werken.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In essentie leert AI van data, herkent patronen, en past deze kennis toe om problemen op te 
                  lossen of voorspellingen te doen. Het is geen science fiction meer - het is de realiteit die 
                  onze wereld vormgeeft.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Types of AI Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Soorten AI</h2>
            <p className="text-xl text-gray-600">
              Van simpele chatbots tot complexe neurale netwerken
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{type.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{type.description}</p>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-gray-700">Voorbeelden:</p>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Waarom AI leren?
            </h2>
            <p className="text-xl text-gray-600">
              De voordelen van AI-kennis in de moderne wereld
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* AI Applications Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI in de Praktijk
            </h2>
            <p className="text-xl text-gray-600">
              Hoe AI verschillende sectoren transformeert
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiApplications.map((sector, index) => {
              const Icon = sector.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle>{sector.sector}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {sector.applications.map((app, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{app}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Future of AI Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              De Toekomst van AI in Nederland & Europa
            </h2>
            <p className="text-xl text-gray-600">
              Hoe AI onze regio zal transformeren
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {futureInsights.map((insight, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold">{insight.title}</h3>
                    <span className="text-2xl font-bold text-blue-600">{insight.stat}</span>
                  </div>
                  <p className="text-gray-600">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timeline */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">AI Ontwikkeling Timeline</h3>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <Card className="inline-block">
                        <CardContent className="p-4">
                          <div className="text-blue-600 font-bold mb-1">{item.year}</div>
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-500 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Begin Jouw AI-reis Vandaag</h2>
          <p className="text-xl mb-8 opacity-90">
            Of je nu een beginner bent of al ervaring hebt, wij hebben de perfecte cursus voor jou. 
            Start met het bouwen van de toekomst.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cursussen">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <GraduationCap className="w-5 h-5 mr-2" />
                Bekijk AI Cursussen
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white/20">
                <Rocket className="w-5 h-5 mr-2" />
                Start Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">97%</div>
              <p className="text-gray-300">van bedrijven gebruikt AI</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">3.5M</div>
              <p className="text-gray-300">AI-banen in Europa 2025</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">45%</div>
              <p className="text-gray-300">productiviteitsgroei met AI</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">€380B</div>
              <p className="text-gray-300">AI-markt in 2025</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}