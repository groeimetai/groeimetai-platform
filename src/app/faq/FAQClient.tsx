'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  ChevronDown,
  HelpCircle,
  BookOpen,
  CreditCard,
  Award,
  Headphones,
  MessageCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Algemene vragen
  {
    category: 'Algemeen',
    question: 'Wat is GroeimetAI?',
    answer: 'GroeimetAI is het grootste AI-leerplatform van Nederland. We bieden praktische cursussen over kunstmatige intelligentie, machine learning, en AI-tools zoals ChatGPT, Claude, en meer. Onze missie is om AI-educatie toegankelijk te maken voor iedereen, van beginners tot gevorderden.'
  },
  {
    category: 'Algemeen',
    question: 'Voor wie zijn de cursussen bedoeld?',
    answer: 'Onze cursussen zijn geschikt voor iedereen die wil leren over AI - van complete beginners zonder technische achtergrond tot ervaren professionals die zich willen specialiseren. We hebben cursussen voor ondernemers, marketeers, developers, data scientists, en iedereen die AI wil toepassen in hun werk.'
  },
  {
    category: 'Algemeen',
    question: 'Heb ik programmeerervaring nodig?',
    answer: 'Nee, voor de meeste cursussen is geen programmeerervaring vereist. We hebben specifieke beginnerscursussen die je stap voor stap begeleiden. Voor technische cursussen geven we duidelijk aan welke voorkennis handig is, en bieden we vaak extra modules om die kennis op te bouwen.'
  },
  {
    category: 'Algemeen',
    question: 'Zijn de cursussen in het Nederlands?',
    answer: 'Ja, al onze cursussen zijn volledig in het Nederlands. We gebruiken wel internationale AI-termen waar nodig, maar deze worden altijd duidelijk uitgelegd. Onze instructeurs zijn Nederlandse AI-professionals die de content toegankelijk maken voor een Nederlands publiek.'
  },

  // Cursussen & Leren
  {
    category: 'Cursussen & Leren',
    question: 'Hoe lang heb ik toegang tot een cursus?',
    answer: 'Je krijgt levenslang toegang tot alle cursussen die je koopt. Dit betekent dat je altijd terug kunt keren om content opnieuw te bekijken, updates te ontvangen, en in je eigen tempo kunt leren zonder tijdsdruk.'
  },
  {
    category: 'Cursussen & Leren',
    question: 'Kan ik de cursussen op mijn telefoon volgen?',
    answer: 'Ja, ons platform is volledig responsive en werkt perfect op smartphones, tablets en computers. Je kunt overal en altijd leren, of je nu in de trein zit of thuis achter je bureau.'
  },
  {
    category: 'Cursussen & Leren',
    question: 'Hoe zijn de cursussen opgebouwd?',
    answer: 'Elke cursus bestaat uit modules met video-lessen, praktische opdrachten, quizzen en projecten. Je krijgt ook toegang tot downloadbare materialen, code voorbeelden (waar relevant), en een community forum voor vragen en discussies.'
  },
  {
    category: 'Cursussen & Leren',
    question: 'Worden de cursussen geüpdatet?',
    answer: 'Ja, we updaten onze cursussen regelmatig om de nieuwste AI-ontwikkelingen te reflecteren. Als je een cursus hebt gekocht, krijg je automatisch toegang tot alle toekomstige updates zonder extra kosten.'
  },
  {
    category: 'Cursussen & Leren',
    question: 'Kan ik vragen stellen tijdens de cursus?',
    answer: 'Absoluut! Elke cursus heeft een dedicated Q&A sectie waar je vragen kunt stellen. Onze instructeurs en community moderators reageren actief op vragen. Je hebt ook toegang tot onze Discord community voor real-time hulp.'
  },

  // Betalingen & Terugbetalingen
  {
    category: 'Betalingen & Terugbetalingen',
    question: 'Welke betaalmethoden accepteren jullie?',
    answer: 'We accepteren iDEAL, creditcards (Visa, Mastercard), PayPal, en SEPA bankoverschrijvingen. Voor zakelijke klanten bieden we ook factuurbetalingen aan met NET30 betalingstermijnen.'
  },
  {
    category: 'Betalingen & Terugbetalingen',
    question: 'Bieden jullie een geld-terug-garantie?',
    answer: 'Ja, we bieden een 30-dagen geld-terug-garantie op alle cursussen. Als je niet tevreden bent, kun je binnen 30 dagen na aankoop een volledige terugbetaling aanvragen, geen vragen gesteld.'
  },
  {
    category: 'Betalingen & Terugbetalingen',
    question: 'Zijn er kortingen voor studenten?',
    answer: 'Ja, we bieden 30% studentenkorting voor iedereen met een geldig studentenbewijs. Neem contact op met ons support team met je studentenbewijs voor je persoonlijke kortingscode.'
  },
  {
    category: 'Betalingen & Terugbetalingen',
    question: 'Kan ik een factuur krijgen voor mijn bedrijf?',
    answer: 'Natuurlijk! Na aankoop ontvang je automatisch een factuur per email. Voor zakelijke klanten kunnen we facturen opstellen op bedrijfsnaam met BTW-specificatie. Je kunt ook meerdere licenties tegelijk aanschaffen voor je team.'
  },
  {
    category: 'Betalingen & Terugbetalingen',
    question: 'Bieden jullie bundels of abonnementen aan?',
    answer: 'Ja, we hebben verschillende bundelpakketten waarmee je kunt besparen. Ook bieden we een All-Access abonnement aan waarmee je toegang krijgt tot alle huidige en toekomstige cursussen tegen een vast maandbedrag.'
  },

  // Certificaten
  {
    category: 'Certificaten',
    question: 'Krijg ik een certificaat na het voltooien van een cursus?',
    answer: 'Ja, na succesvolle afronding van een cursus ontvang je een officieel GroeimetAI certificaat. Dit certificaat is blockchain-geverifieerd en kan worden gedeeld op LinkedIn of toegevoegd aan je CV.'
  },
  {
    category: 'Certificaten',
    question: 'Zijn de certificaten erkend?',
    answer: 'Onze certificaten worden erkend door 500+ Nederlandse bedrijven en organisaties. Hoewel ze geen officiële accreditatie hebben, staan ze hoog aangeschreven in de Nederlandse tech-sector vanwege onze praktische focus en hoogwaardige content.'
  },
  {
    category: 'Certificaten',
    question: 'Hoe kan ik mijn certificaat verifiëren?',
    answer: 'Elk certificaat heeft een unieke verificatiecode en QR-code. Werkgevers kunnen deze gebruiken op onze verificatiepagina om de authenticiteit te controleren. Dankzij blockchain-technologie is fraude onmogelijk.'
  },
  {
    category: 'Certificaten',
    question: 'Moet ik een examen afleggen voor het certificaat?',
    answer: 'De meeste cursussen vereisen dat je alle modules voltooit en de eindopdracht succesvol afrondt. Sommige geavanceerde cursussen hebben ook een afsluitende toets. De exacte vereisten staan vermeld bij elke cursus.'
  },

  // Technische Ondersteuning
  {
    category: 'Technische Ondersteuning',
    question: 'Ik heb problemen met het afspelen van videos. Wat kan ik doen?',
    answer: 'Probeer eerst je browser te verversen of een andere browser te gebruiken (we raden Chrome, Firefox of Safari aan). Controleer ook je internetverbinding. Als het probleem aanhoudt, neem dan contact op met support@groeimetai.nl met je browser en systeeminformatie.'
  },
  {
    category: 'Technische Ondersteuning',
    question: 'Kan ik cursussen offline bekijken?',
    answer: 'Momenteel is offline viewing nog niet beschikbaar, maar we werken aan een mobiele app waarmee je content kunt downloaden. Voor nu kun je wel alle cursusmaterialen, slides en documenten downloaden voor offline gebruik.'
  },
  {
    category: 'Technische Ondersteuning',
    question: 'Hoe reset ik mijn wachtwoord?',
    answer: 'Klik op "Wachtwoord vergeten" op de loginpagina en voer je email in. Je ontvangt binnen enkele minuten een link om je wachtwoord te resetten. Check ook je spam folder als je de email niet ziet.'
  },
  {
    category: 'Technische Ondersteuning',
    question: 'Welke systeemvereisten zijn er?',
    answer: 'Je hebt alleen een moderne webbrowser nodig (Chrome, Firefox, Safari, Edge) en een stabiele internetverbinding. Voor sommige technische cursussen heb je mogelijk specifieke software nodig, maar dit wordt altijd vooraf aangegeven.'
  },
  {
    category: 'Technische Ondersteuning',
    question: 'Hoe kan ik contact opnemen met support?',
    answer: 'Je kunt ons bereiken via support@groeimetai.nl, via de live chat op onze website (ma-vr 9:00-17:00), of via onze Discord community voor snelle hulp van mede-studenten en moderators.'
  }
]

const categories = [
  { name: 'Alle Categorieën', icon: HelpCircle },
  { name: 'Algemeen', icon: HelpCircle },
  { name: 'Cursussen & Leren', icon: BookOpen },
  { name: 'Betalingen & Terugbetalingen', icon: CreditCard },
  { name: 'Certificaten', icon: Award },
  { name: 'Technische Ondersteuning', icon: Headphones }
]

function FAQItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="border mb-4 transition-all duration-200 hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      >
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 pr-4">{item.question}</h3>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </Card>
  )
}

export default function FAQClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Alle Categorieën')
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const filteredFAQs = useMemo(() => {
    return faqData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'Alle Categorieën' || 
        item.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
              <HelpCircle className="w-4 h-4" />
              <span>Veelgestelde Vragen</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Hoe kunnen we je helpen?
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Vind snel antwoorden op de meest gestelde vragen over GroeimetAI, 
              onze cursussen, en hoe je het meeste uit je leerervaring haalt.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 -mt-8">
        <div className="container-width section-padding">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Zoek in veelgestelde vragen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg shadow-lg border-0 focus:ring-4 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8">
        <div className="container-width section-padding">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-12">
        <div className="container-width section-padding">
          <div className="max-w-3xl mx-auto">
            {filteredFAQs.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-6">
                  {filteredFAQs.length} {filteredFAQs.length === 1 ? 'resultaat' : 'resultaten'} gevonden
                </p>
                {filteredFAQs.map((item, index) => (
                  <FAQItem
                    key={index}
                    item={item}
                    isOpen={openItems.has(index)}
                    onToggle={() => toggleItem(index)}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Geen resultaten gevonden
                  </h3>
                  <p className="text-gray-600">
                    Probeer andere zoektermen of bekijk alle categorieën
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-width section-padding">
          <Card className="max-w-2xl mx-auto text-center border-0 shadow-lg">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Nog steeds vragen?</CardTitle>
              <CardDescription className="text-lg mt-2">
                Ons support team staat klaar om je te helpen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Kon je geen antwoord vinden op je vraag? Geen probleem! 
                Ons vriendelijke support team helpt je graag verder met al je vragen over GroeimetAI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Button>
                <Button size="lg" variant="outline">
                  Email Support
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Gemiddelde reactietijd: &lt; 2 uur tijdens kantooruren
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-width section-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klaar om te beginnen met leren?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Ontdek onze cursussen en begin vandaag nog met het ontwikkelen van je AI-vaardigheden
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cursussen">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Bekijk Cursussen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Maak Gratis Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}