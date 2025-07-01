import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = '29 juni 2025';

  const sections = [
    { id: 'intro', title: 'Introductie' },
    { id: 'data-collection', title: 'Welke gegevens verzamelen we' },
    { id: 'data-usage', title: 'Hoe gebruiken we je gegevens' },
    { id: 'data-sharing', title: 'Delen van gegevens' },
    { id: 'cookies', title: 'Cookies en tracking' },
    { id: 'rights', title: 'Jouw rechten' },
    { id: 'retention', title: 'Gegevensbewaartermijnen' },
    { id: 'security', title: 'Beveiliging' },
    { id: 'changes', title: 'Wijzigingen in het privacybeleid' },
    { id: 'contact', title: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacyverklaring
            </h1>
            <p className="text-lg text-gray-600">
              Laatst bijgewerkt: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <Card className="lg:col-span-1 h-fit sticky top-6">
            <div className="p-6">
              <h2 className="font-semibold text-lg mb-4">Inhoudsopgave</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                  >
                    <ChevronRight className="w-4 h-4 mr-1" />
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <ScrollArea className="h-full">
                <div className="p-8 prose prose-gray max-w-none">
                  {/* Introductie */}
                  <section id="intro" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Introductie</h2>
                    <p className="mb-4">
                      Welkom bij GroeimetAI ("wij", "ons" of "onze"). We zijn toegewijd aan het beschermen van je persoonlijke gegevens en je privacy. 
                      Deze privacyverklaring legt uit hoe we je informatie verzamelen, gebruiken, beschermen en delen wanneer je onze website 
                      en diensten gebruikt.
                    </p>
                    <p className="mb-4">
                      Door gebruik te maken van onze diensten, stem je in met de verzameling en het gebruik van informatie 
                      in overeenstemming met dit beleid. Deze privacyverklaring is opgesteld in overeenstemming met de 
                      Algemene Verordening Gegevensbescherming (AVG/GDPR).
                    </p>
                  </section>

                  {/* Welke gegevens verzamelen we */}
                  <section id="data-collection" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welke gegevens verzamelen we</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">Persoonlijke gegevens die je aan ons verstrekt</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Accountgegevens:</strong> naam, e-mailadres, wachtwoord (versleuteld opgeslagen)</li>
                      <li><strong>Profielinformatie:</strong> profielfoto, biografie, professionele achtergrond</li>
                      <li><strong>Betalingsgegevens:</strong> factuuradres, betalingsmethode (creditcardgegevens worden verwerkt door onze betalingsprovider Mollie)</li>
                      <li><strong>Communicatiegegevens:</strong> berichten die je ons stuurt, feedback, cursusbeoordelingen</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3">Automatisch verzamelde gegevens</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Gebruiksgegevens:</strong> cursusvoortgang, bekeken video's, voltooide lessen</li>
                      <li><strong>Apparaatgegevens:</strong> IP-adres, browsertype, besturingssysteem, apparaat-ID</li>
                      <li><strong>Loggegevens:</strong> toegangstijden, bekeken pagina's, klikgedrag</li>
                      <li><strong>Cookies:</strong> zie onze Cookie Policy hieronder</li>
                    </ul>
                  </section>

                  {/* Hoe gebruiken we je gegevens */}
                  <section id="data-usage" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Hoe gebruiken we je gegevens</h2>
                    <p className="mb-4">We gebruiken de verzamelde gegevens voor verschillende doeleinden:</p>
                    
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Dienstverlening:</strong> om je toegang te geven tot onze cursussen en leerplatform</li>
                      <li><strong>Personalisatie:</strong> om je leerervaring te personaliseren en relevante cursussen aan te bevelen</li>
                      <li><strong>Communicatie:</strong> om je updates te sturen over je cursussen, nieuwe content, en servicemeldingen</li>
                      <li><strong>Betalingsverwerking:</strong> om betalingen te verwerken en facturen te versturen</li>
                      <li><strong>Verbetering:</strong> om onze diensten te analyseren en verbeteren</li>
                      <li><strong>Juridische verplichtingen:</strong> om te voldoen aan wettelijke verplichtingen</li>
                      <li><strong>Marketing:</strong> om je, met jouw toestemming, marketingcommunicatie te sturen</li>
                    </ul>
                  </section>

                  {/* Delen van gegevens */}
                  <section id="data-sharing" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Delen van gegevens</h2>
                    <p className="mb-4">
                      We verkopen je persoonlijke gegevens nooit. We delen je gegevens alleen in de volgende gevallen:
                    </p>
                    
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Dienstverleners:</strong> Met vertrouwde partners die ons helpen bij het leveren van onze diensten (bijvoorbeeld hosting providers, e-mailservices)</li>
                      <li><strong>Instructeurs:</strong> Beperkte informatie met cursusinstructeurs voor onderwijsdoeleinden</li>
                      <li><strong>Betalingsverwerkers:</strong> Met Mollie voor veilige betalingsverwerking</li>
                      <li><strong>Wettelijke vereisten:</strong> Wanneer vereist door wet of gerechtelijk bevel</li>
                      <li><strong>Bedrijfsoverdracht:</strong> Bij een fusie, overname of verkoop van activa</li>
                      <li><strong>Met jouw toestemming:</strong> Voor andere doeleinden waarvoor je expliciete toestemming hebt gegeven</li>
                    </ul>
                  </section>

                  {/* Cookies en tracking */}
                  <section id="cookies" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies en tracking</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">Wat zijn cookies?</h3>
                    <p className="mb-4">
                      Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je onze website bezoekt. 
                      Ze helpen ons om je voorkeuren te onthouden en je gebruikservaring te verbeteren.
                    </p>

                    <h3 className="text-xl font-semibold mb-3">Soorten cookies die we gebruiken</h3>
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Essentiële cookies:</strong> Noodzakelijk voor het functioneren van de website</li>
                      <li><strong>Functionele cookies:</strong> Onthouden je voorkeuren en instellingen</li>
                      <li><strong>Analytische cookies:</strong> Helpen ons begrijpen hoe bezoekers onze website gebruiken</li>
                      <li><strong>Marketing cookies:</strong> Gebruikt voor het tonen van relevante advertenties (alleen met jouw toestemming)</li>
                    </ul>

                    <p className="mb-4">
                      Je kunt cookies beheren via je browserinstellingen. Het uitschakelen van bepaalde cookies kan 
                      de functionaliteit van onze website beperken.
                    </p>
                  </section>

                  {/* Jouw rechten */}
                  <section id="rights" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Jouw rechten</h2>
                    <p className="mb-4">
                      Onder de AVG heb je de volgende rechten met betrekking tot je persoonlijke gegevens:
                    </p>
                    
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Recht op inzage:</strong> Je hebt het recht om te weten welke gegevens we van je hebben</li>
                      <li><strong>Recht op rectificatie:</strong> Je kunt onjuiste of onvolledige gegevens laten corrigeren</li>
                      <li><strong>Recht op vergetelheid:</strong> Je kunt verzoeken om je gegevens te laten verwijderen</li>
                      <li><strong>Recht op beperking:</strong> Je kunt de verwerking van je gegevens laten beperken</li>
                      <li><strong>Recht op dataportabiliteit:</strong> Je kunt je gegevens in een gestructureerd formaat ontvangen</li>
                      <li><strong>Recht van bezwaar:</strong> Je kunt bezwaar maken tegen bepaalde verwerkingen</li>
                      <li><strong>Recht om toestemming in te trekken:</strong> Je kunt eerder gegeven toestemming op elk moment intrekken</li>
                    </ul>

                    <p className="mb-4">
                      Om deze rechten uit te oefenen, neem contact met ons op via privacy@groeimetai.nl. 
                      We zullen binnen 30 dagen op je verzoek reageren.
                    </p>
                  </section>

                  {/* Gegevensbewaartermijnen */}
                  <section id="retention" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Gegevensbewaartermijnen</h2>
                    <p className="mb-4">
                      We bewaren je persoonlijke gegevens alleen zolang als nodig is voor de doeleinden waarvoor ze zijn verzameld:
                    </p>
                    
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>Accountgegevens:</strong> Zolang je account actief is, plus 2 jaar na verwijdering voor juridische doeleinden</li>
                      <li><strong>Cursusvoortgang:</strong> Permanent bewaard om je certificaten te kunnen verifiëren</li>
                      <li><strong>Betalingsgegevens:</strong> 7 jaar conform wettelijke bewaarplicht</li>
                      <li><strong>Communicatiegegevens:</strong> 2 jaar na laatste contact</li>
                      <li><strong>Loggegevens:</strong> Maximaal 1 jaar</li>
                    </ul>
                  </section>

                  {/* Beveiliging */}
                  <section id="security" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Beveiliging</h2>
                    <p className="mb-4">
                      We nemen de beveiliging van je gegevens zeer serieus en hebben passende technische en organisatorische 
                      maatregelen getroffen om je gegevens te beschermen tegen ongeoorloofde toegang, gebruik, wijziging of openbaarmaking.
                    </p>
                    
                    <p className="mb-4">Onze beveiligingsmaatregelen omvatten:</p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>SSL-encryptie voor alle dataoverdracht</li>
                      <li>Versleutelde opslag van wachtwoorden</li>
                      <li>Regelmatige beveiligingsaudits</li>
                      <li>Beperkte toegang tot persoonlijke gegevens</li>
                      <li>Training van medewerkers in gegevensbescherming</li>
                    </ul>

                    <p className="mb-4">
                      Ondanks onze inspanningen kan geen enkele methode van elektronische opslag 100% veilig zijn. 
                      Als je vermoedt dat je account is gecompromitteerd, neem dan onmiddellijk contact met ons op.
                    </p>
                  </section>

                  {/* Wijzigingen in het privacybeleid */}
                  <section id="changes" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Wijzigingen in het privacybeleid</h2>
                    <p className="mb-4">
                      We kunnen dit privacybeleid van tijd tot tijd bijwerken om wijzigingen in onze praktijken of 
                      om andere operationele, juridische of regelgevende redenen weer te geven.
                    </p>
                    <p className="mb-4">
                      Bij belangrijke wijzigingen zullen we je op de hoogte stellen via e-mail of een prominente 
                      melding op onze website voordat de wijziging van kracht wordt.
                    </p>
                  </section>

                  {/* Contact */}
                  <section id="contact" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                    <p className="mb-4">
                      Als je vragen hebt over dit privacybeleid of over hoe we met je gegevens omgaan, 
                      neem dan contact met ons op:
                    </p>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="font-semibold mb-2">GroeimetAI B.V.</p>
                      <p className="mb-1">Functionaris Gegevensbescherming</p>
                      <p className="mb-1">E-mail: <a href="mailto:privacy@groeimetai.nl" className="text-blue-600 hover:underline">privacy@groeimetai.nl</a></p>
                      <p className="mb-1">Telefoon: +31 20 123 4567</p>
                      <p className="mb-1">Adres: Herengracht 100, 1015 BS Amsterdam</p>
                      <p className="mb-4">KvK-nummer: 12345678</p>
                      
                      <p className="text-sm text-gray-600">
                        Je hebt ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens 
                        als je van mening bent dat we je rechten hebben geschonden.
                      </p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}