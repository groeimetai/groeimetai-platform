import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const footerSections = {
  company: {
    title: 'GroeimetAI',
    links: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Cursussen', href: '/cursussen' },
      // Commented out until pages are created
      // { name: 'Over ons', href: '/about' },
      // { name: 'Contact', href: '/contact' },
      // { name: 'Carrière', href: '/careers' },
      // { name: 'Privacy', href: '/privacy' },
      // { name: 'Algemene Voorwaarden', href: '/terms' },
    ],
  },
  courses: {
    title: 'Populaire Cursussen',
    links: [
      { name: 'ChatGPT & Gemini Masterclass', href: '/cursussen/chatgpt-gemini-masterclass' },
      { name: 'AI Marketing Content', href: '/cursussen/ai-marketing-content' },
      { name: 'Blockchain Fundamentals', href: '/cursussen/blockchain-fundamentals' },
      { name: 'n8n & Make Basics', href: '/cursussen/n8n-make-basics' },
      { name: 'Alle cursussen', href: '/cursussen' },
    ],
  },
  support: {
    title: 'Account',
    links: [
      { name: 'Inloggen', href: '/login' },
      { name: 'Registreren', href: '/register' },
      { name: 'Blockchain Certificaten', href: '/blockchain' },
      // Commented out until pages are created
      // { name: 'Help Center', href: '/help' },
      // { name: 'Veelgestelde vragen', href: '/faq' },
      // { name: 'Community', href: '/community' },
      // { name: 'Technische ondersteuning', href: '/support' },
      // { name: 'Status', href: '/status' },
    ],
  },
};

// Social links commented out until actual profiles are available
const socialLinks = [
  // { name: 'Facebook', href: 'https://facebook.com/groeimetai', icon: Facebook },
  // { name: 'Twitter', href: 'https://twitter.com/groeimetai', icon: Twitter },
  // { name: 'LinkedIn', href: 'https://linkedin.com/company/groeimetai', icon: Linkedin },
  // { name: 'YouTube', href: 'https://youtube.com/@groeimetai', icon: Youtube },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-width section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo size="lg" variant="white" />
            </div>
            <p className="text-gray-300 mb-6 max-w-sm">
              De vooraanstaande online leerplatform voor AI-training in Nederland. 
              Groei mee met de AI-revolutie en versterk je professionele vaardigheden.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@groeimetai.io</span>
              </div>
              {/* Phone and address commented out until available */}
              {/* <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+31 20 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Amsterdam, Nederland</span>
              </div> */}
            </div>
          </div>

          {/* Footer Sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="max-w-md">
              <h3 className="font-semibold text-lg mb-2">Blijf op de hoogte</h3>
              <p className="text-gray-300 text-sm">
                Ontvang de nieuwste AI-trends, cursusaankondigingen en exclusieve content.
              </p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Je e-mailadres"
                className="flex-1 md:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
                Aanmelden
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} GroeimetAI. Alle rechten voorbehouden.
            </div>

            {/* Social Links - Hidden until social profiles are available */}
            {socialLinks.length > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm mr-2">Volg ons:</span>
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Language & Region */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>🇳🇱 Nederlands</span>
              <span>EUR (€)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}