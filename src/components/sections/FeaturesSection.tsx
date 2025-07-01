import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Users, 
  Award, 
  Clock, 
  BookOpen, 
  Zap, 
  Shield, 
  TrendingUp 
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Expert Instructeurs',
    description: 'Leer van Nederlandse AI-professionals met jarenlange ervaring in machine learning, data science en AI-implementatie.',
    highlight: 'Praktische ervaring',
  },
  {
    icon: BookOpen,
    title: 'Praktische Cursussen',
    description: 'Hands-on training met echte use cases uit het Nederlandse bedrijfsleven. Geen theorie, maar directe toepassing.',
    highlight: 'Echte projecten',
  },
  {
    icon: Award,
    title: 'Erkende Certificaten',
    description: 'Ontvang internationaal erkende certificaten die je professionele waarde vergroten bij Nederlandse werkgevers.',
    highlight: 'Carrière boost',
  },
  {
    icon: Clock,
    title: 'Flexibel Leren',
    description: 'Leer in je eigen tempo met 24/7 toegang tot alle cursusmateriaal, video\'s en oefeningen.',
    highlight: 'Eigen tempo',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Word onderdeel van een actieve gemeenschap van Nederlandse AI-professionals en studenten.',
    highlight: 'Netwerken',
  },
  {
    icon: TrendingUp,
    title: 'Carrière Ondersteuning',
    description: 'Krijg persoonlijke begeleiding bij het vinden van AI-gerelateerde functies in Nederland.',
    highlight: 'Job matching',
  },
  {
    icon: Zap,
    title: 'Nieuwste Technologieën',
    description: 'Blijf voorop met cursussen over de laatste AI-tools zoals ChatGPT, Claude, Midjourney en meer.',
    highlight: 'Cutting-edge',
  },
  {
    icon: Shield,
    title: 'Veilig & Betrouwbaar',
    description: 'Leer over AI-ethiek, privacy en verantwoorde AI-implementatie volgens Nederlandse en EU-richtlijnen.',
    highlight: 'GDPR compliant',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-width section-padding">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>Waarom GroeimetAI</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Alles wat je nodig hebt voor
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-succes in Nederland
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Van beginners tot experts - onze platform biedt de tools, kennis en ondersteuning 
            die je nodig hebt om te excelleren in de AI-wereld.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Vertrouwd door professionals in heel Nederland
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">95%</div>
                <div className="text-blue-100 text-sm">Tevredenheidscore</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">500+</div>
                <div className="text-blue-100 text-sm">Bedrijven</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">24/7</div>
                <div className="text-blue-100 text-sm">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">100%</div>
                <div className="text-blue-100 text-sm">Geld-terug garantie</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}