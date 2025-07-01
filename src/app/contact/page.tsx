import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from './ContactForm'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Building2,
  Globe
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact | GroeimetAI Cursus Platform',
  description: 'Neem contact op met GroeimetAI. Wij helpen je graag met al je vragen over AI-cursussen en trainingen.',
  openGraph: {
    title: 'Contact - GroeimetAI',
    description: 'Neem contact op met het GroeimetAI team voor vragen over onze AI-cursussen en trainingen.',
  },
}

const contactInfo = {
  email: 'info@groeimetai.nl',
  phone: '+31 20 123 4567',
  address: {
    street: 'Herengracht 540',
    postalCode: '1017 CG',
    city: 'Amsterdam',
    country: 'Nederland'
  },
  hours: {
    weekdays: '9:00 - 18:00',
    weekend: '10:00 - 16:00 (alleen email)'
  },
  responseTime: '24 uur'
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/groeimetai', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com/groeimetai', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/groeimetai', icon: Linkedin },
  { name: 'YouTube', href: 'https://youtube.com/@groeimetai', icon: Youtube },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Heb je vragen over onze AI-cursussen of wil je meer informatie? 
              We staan klaar om je te helpen!
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Company Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Bedrijfsinformatie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">E-mail</p>
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Telefoon</p>
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Adres</p>
                      <p className="text-gray-600">
                        {contactInfo.address.street}<br />
                        {contactInfo.address.postalCode} {contactInfo.address.city}<br />
                        {contactInfo.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">KvK-nummer</p>
                      <p className="text-gray-600">87654321</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Openingstijden & Responstijd
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Kantooruren</p>
                    <div className="space-y-1 text-gray-600">
                      <p>Ma-Vr: {contactInfo.hours.weekdays}</p>
                      <p>Za-Zo: {contactInfo.hours.weekend}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Verwachte responstijd</p>
                    <p className="text-gray-600">
                      We streven ernaar binnen {contactInfo.responseTime} te reageren op alle berichten.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Volg ons</CardTitle>
                  <CardDescription>
                    Blijf op de hoogte van het laatste AI-nieuws en updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {socialLinks.map((social) => {
                      const Icon = social.icon
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">{social.name}</span>
                        </a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Veelgestelde vragen</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hoe snel kan ik starten met een cursus?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Direct! Zodra je je hebt aangemeld en de betaling is verwerkt, krijg je meteen toegang tot alle cursusmateriaal.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bieden jullie ook maatwerk trainingen aan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ja, we bieden maatwerk AI-trainingen voor bedrijven. Neem contact op via het formulier en selecteer 'Zakelijke training' voor meer informatie.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kan ik een cursus eerst uitproberen?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bij veel cursussen bieden we gratis preview-lessen aan. Daarnaast hebben we een 14-dagen geld-terug-garantie.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}