import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle, Gift } from 'lucide-react';

const benefits = [
  'Directe toegang tot alle cursussen',
  '30 dagen geld-terug garantie',
  'Levenslange updates',
  'Persoonlijke begeleiding',
  'Certificaten erkend in Nederland',
  'Exclusieve community toegang',
];

const offers = [
  {
    title: 'Vroege Vogel Korting',
    description: '20% korting op je eerste cursus',
    code: 'VROEG20',
    expires: '31 December 2024',
  },
  {
    title: 'Gratis Proefles',
    description: 'Probeer onze ChatGPT introductie gratis',
    code: 'GRATIS',
    expires: 'Altijd beschikbaar',
  },
];

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
      
      <div className="container-width section-padding relative">
        <div className="text-center space-y-8 text-white">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Start vandaag nog</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Klaar om je AI-journey te beginnen?
            </h2>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Sluit je aan bij duizenden Nederlandse professionals die hun carrière een boost gaven met AI-vaardigheden. 
              Begin vandaag nog en zie resultaten binnen een week.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Special Offers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {offers.map((offer, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                    <p className="text-blue-100 text-sm mb-2">{offer.description}</p>
                    <div className="space-y-1">
                      <div className="bg-white/20 rounded-lg px-3 py-1 inline-block">
                        <span className="text-xs font-mono">Code: {offer.code}</span>
                      </div>
                      <div className="text-xs text-blue-200">
                        Geldig tot: {offer.expires}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold" asChild>
              <Link href="/cursussen" className="flex items-center space-x-2">
                <span>Bekijk alle cursussen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600 transition-all" asChild>
              <Link href="/referral" className="flex items-center space-x-2">
                <span>Gratis proefles</span>
                <Sparkles className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold mb-1">5,000+</div>
                <div className="text-sm text-blue-200">Tevreden studenten</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">98%</div>
                <div className="text-sm text-blue-200">Succesvol afgerond</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">4.9/5</div>
                <div className="text-sm text-blue-200">Gemiddelde beoordeling</div>
              </div>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-md mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold">30 Dagen Geld-Terug Garantie</h3>
              <p className="text-sm text-blue-100">
                Niet tevreden? Krijg je geld volledig terug. Geen vragen gesteld.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}