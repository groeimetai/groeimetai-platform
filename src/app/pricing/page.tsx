import { courses } from '@/lib/data/courses'
import Link from 'next/link'
import { Check, CreditCard, Shield, Clock, Award, Users, ChevronRight, BadgePercent } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 py-20 lg:py-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Transparante Prijzen,
              <span className="block text-primary">Maximale Waarde</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              Investeer in jezelf met onze betaalbare AI-cursussen. 
              Eenmalige betaling, levenslang toegang, direct resultaat.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>30 dagen geld-terug-garantie</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Levenslang toegang</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>Certificaat inbegrepen</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
      </section>

      {/* Course Pricing Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Kies Je AI-Leerpad
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Van beginner tot expert, we hebben de perfecte cursus voor jou
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="group relative overflow-hidden transition-all hover:shadow-xl">
                {/* Popular badge for high-rated courses */}
                {course.rating && course.rating >= 4.8 && (
                  <div className="absolute right-4 top-4 z-10">
                    <Badge className="bg-orange-500 text-white">Populair</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2 text-xl">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.shortDescription || course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      €{course.price}
                    </span>
                    <span className="text-gray-500">eenmalig</span>
                  </div>

                  {/* Key features */}
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{course.duration} aan content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{course.modules?.length || 4} modules</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Praktijkopdrachten</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Certificaat bij afronding</span>
                    </li>
                  </ul>

                  {/* Student count and rating */}
                  <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
                    {course.studentsCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.studentsCount.toLocaleString('nl-NL')} studenten</span>
                      </div>
                    )}
                    {course.rating && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{course.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button asChild className="w-full group-hover:bg-primary/90">
                    <Link href={`/cursussen/${course.id}`}>
                      Meer info
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
              Speciale Aanbiedingen
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Money Back Guarantee */}
              <Card className="text-center">
                <CardHeader>
                  <Shield className="mx-auto h-12 w-12 text-green-600" />
                  <CardTitle>30 Dagen Garantie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Niet tevreden? Krijg je volledige investering terug binnen 30 dagen. 
                    Geen vragen, geen gedoe.
                  </p>
                </CardContent>
              </Card>

              {/* Bundle Deals */}
              <Card className="text-center">
                <CardHeader>
                  <BadgePercent className="mx-auto h-12 w-12 text-blue-600" />
                  <CardTitle>Bundel Korting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Combineer meerdere cursussen en bespaar tot 25%. 
                    Neem contact op voor je persoonlijke bundel.
                  </p>
                </CardContent>
              </Card>

              {/* Referral Program */}
              <Card className="text-center">
                <CardHeader>
                  <Users className="mx-auto h-12 w-12 text-purple-600" />
                  <CardTitle>Referral Programma</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Verdien 20% commissie voor elke vriend die je aanmeldt. 
                    <Link href="/referral" className="text-primary hover:underline"> Start hier</Link>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
              Veelgestelde Vragen over Prijzen
            </h2>

            <div className="space-y-8">
              {/* Payment Methods */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Welke betaalmethoden accepteren jullie?
                </h3>
                <p className="text-gray-600">
                  We accepteren alle gangbare betaalmethoden via Mollie: iDEAL, creditcard (Visa, Mastercard), 
                  PayPal, Bancontact, en SEPA-overschrijving. Betaal veilig en snel met jouw voorkeursmethode.
                </p>
              </div>

              {/* Refund Policy */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Shield className="h-5 w-5 text-primary" />
                  Hoe werkt jullie terugbetalingsbeleid?
                </h3>
                <p className="text-gray-600">
                  We bieden een 30-dagen geld-terug-garantie op al onze cursussen. 
                  Als je om welke reden dan ook niet tevreden bent, krijg je het volledige aankoopbedrag terug. 
                  Stuur simpelweg een e-mail naar support@groeimetai.nl binnen 30 dagen na aankoop.
                </p>
              </div>

              {/* Course Access */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5 text-primary" />
                  Hoe lang heb ik toegang tot de cursus?
                </h3>
                <p className="text-gray-600">
                  Je krijgt levenslang toegang tot alle cursussen die je aanschaft. 
                  Dit betekent dat je de content kunt bekijken wanneer je wilt, zo vaak als je wilt. 
                  Ook toekomstige updates van de cursus zijn inbegrepen zonder extra kosten.
                </p>
              </div>

              {/* Certificate */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Award className="h-5 w-5 text-primary" />
                  Is er een certificaat inbegrepen?
                </h3>
                <p className="text-gray-600">
                  Ja! Bij het succesvol afronden van elke cursus ontvang je automatisch een officieel GroeimetAI certificaat. 
                  Dit certificaat is blockchain-geverifieerd en kan worden gedeeld op LinkedIn of toegevoegd aan je CV. 
                  Het certificaat toont je naam, de cursustitel, en de datum van afronding.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <p className="mb-4 text-gray-600">
                Nog vragen over prijzen of betalingen?
              </p>
              <Button asChild size="lg">
                <Link href="/contact">
                  Neem contact op
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}