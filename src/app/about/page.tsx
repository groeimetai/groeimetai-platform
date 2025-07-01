import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Target, 
  Users, 
  Sparkles, 
  Trophy,
  Rocket,
  Heart,
  Building,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Over Ons - GroeimetAI',
  description: 'Ontdek het verhaal achter GroeimetAI, hét AI-leerplatform van Nederland. Leer meer over onze missie, visie en het team dat AI-educatie toegankelijk maakt voor iedereen.',
}

const values = [
  {
    icon: Brain,
    title: 'Innovatie Voorop',
    description: 'We blijven aan de voorhoede van AI-ontwikkelingen en brengen de nieuwste technologieën naar onze studenten.'
  },
  {
    icon: Users,
    title: 'Toegankelijkheid',
    description: 'AI-educatie moet voor iedereen beschikbaar zijn, ongeacht achtergrond of technische kennis.'
  },
  {
    icon: Target,
    title: 'Praktische Focus',
    description: 'Geen droge theorie, maar hands-on ervaring met echte projecten uit het Nederlandse bedrijfsleven.'
  },
  {
    icon: Heart,
    title: 'Community First',
    description: 'We bouwen aan een hechte gemeenschap waar kennis delen en samenwerken centraal staat.'
  }
]

const achievements = [
  { number: '5000+', label: 'Actieve Studenten' },
  { number: '50+', label: 'AI Cursussen' },
  { number: '95%', label: 'Tevredenheid' },
  { number: '500+', label: 'Partner Bedrijven' }
]

const teamMembers = [
  {
    name: 'Dr. Emma van der Berg',
    role: 'CEO & Co-founder',
    description: 'AI-onderzoeker met 15+ jaar ervaring in machine learning en natuurlijke taalverwerking.',
    expertise: 'Machine Learning, NLP'
  },
  {
    name: 'Mark de Vries',
    role: 'CTO & Co-founder',
    description: 'Tech-entrepreneur en voormalig Google engineer met passie voor AI-democratisering.',
    expertise: 'Software Engineering, Cloud AI'
  },
  {
    name: 'Lisa Chen',
    role: 'Head of Education',
    description: 'Onderwijskundige expert die complexe AI-concepten toegankelijk maakt voor iedereen.',
    expertise: 'Curriculum Design, EdTech'
  },
  {
    name: 'Ahmed El-Hassan',
    role: 'Lead AI Instructor',
    description: 'Data scientist met ervaring bij top Nederlandse tech-bedrijven en AI-consultancy.',
    expertise: 'Deep Learning, Computer Vision'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Over GroeimetAI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              We maken AI-educatie toegankelijk voor heel Nederland
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              GroeimetAI is opgericht met één doel: ervoor zorgen dat niemand de AI-revolutie mist. 
              We geloven dat iedereen de kans verdient om te groeien met kunstmatige intelligentie.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ons Verhaal
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-6">
                In 2022 zagen we een groeiende kloof tussen de snelle ontwikkeling van AI-technologie 
                en de mogelijkheden voor Nederlandse professionals om deze te leren en toepassen. 
                Terwijl AI de wereld transformeerde, bleef hoogwaardige, praktische AI-educatie in 
                het Nederlands schaars.
              </p>
              <p className="mb-6">
                GroeimetAI werd geboren uit de overtuiging dat Nederland een leidende rol kan spelen 
                in de AI-revolutie, maar alleen als we onze professionals de juiste tools en kennis geven. 
                We begonnen met een handvol cursussen en een droom om AI-educatie te democratiseren.
              </p>
              <p>
                Vandaag zijn we uitgegroeid tot het grootste AI-leerplatform van Nederland, met 
                duizenden studenten die dagelijks nieuwe vaardigheden opdoen. Van MKB-ondernemers die 
                hun bedrijf willen automatiseren tot data scientists die zich willen specialiseren in 
                deep learning - wij zijn er voor iedereen die wil groeien met AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container-width section-padding">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Onze Missie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  We maken cutting-edge AI-kennis en -vaardigheden toegankelijk voor elke Nederlandse 
                  professional, ongeacht hun technische achtergrond. Door praktische, hands-on educatie 
                  te bieden, stellen we mensen in staat om de kracht van AI te benutten voor hun 
                  carrière en bedrijf.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Onze Visie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Een Nederland waar elke professional de tools en kennis heeft om succesvol te zijn 
                  in het AI-tijdperk. We zien een toekomst waarin Nederlandse bedrijven wereldwijd 
                  vooroplopen in AI-innovatie, aangedreven door een goed opgeleide workforce die 
                  klaar is voor de uitdagingen van morgen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container-width section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Onze Kernwaarden
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deze waarden sturen alles wat we doen bij GroeimetAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-width section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ontmoet Ons Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gedreven professionals die gepassioneerd zijn over AI-educatie
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{member.description}</p>
                  <p className="text-xs text-gray-500 font-medium">{member.expertise}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-width section-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Onze Impact in Cijfers
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              We zijn trots op wat we samen met onze community hebben bereikt
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  {achievement.number}
                </div>
                <div className="text-blue-100">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Waarom Kiezen Voor GroeimetAI?
              </h2>
            </div>

            <div className="space-y-4">
              {[
                'Nederlandse cursussen door Nederlandse AI-experts',
                'Praktische projecten uit het echte bedrijfsleven',
                'Levenslang toegang tot alle cursusmateriaal',
                'Actieve community van gelijkgestemde professionals',
                'Erkende certificaten die je CV versterken',
                '30-dagen geld-terug-garantie op alle cursussen',
                'Persoonlijke begeleiding en carrière advies',
                'Altijd up-to-date met de nieuwste AI-ontwikkelingen'
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-width section-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om te Groeien met AI?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Begin vandaag nog je AI-reis en ontdek wat kunstmatige intelligentie voor jou kan betekenen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cursussen">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Bekijk Onze Cursussen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Start Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}