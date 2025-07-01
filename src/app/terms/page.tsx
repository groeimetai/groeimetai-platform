import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { ChevronRight, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = '29 juni 2025';

  const sections = [
    { id: 'acceptance', title: 'Acceptatie van de voorwaarden' },
    { id: 'definitions', title: 'Definities' },
    { id: 'account', title: 'Account registratie' },
    { id: 'platform-use', title: 'Gebruik van het platform' },
    { id: 'courses', title: 'Cursussen en content' },
    { id: 'payment', title: 'Betalingen en prijzen' },
    { id: 'refund', title: 'Annulering en terugbetaling' },
    { id: 'intellectual-property', title: 'Intellectueel eigendom' },
    { id: 'user-content', title: 'Gebruikerscontent' },
    { id: 'prohibited', title: 'Verboden gebruik' },
    { id: 'disclaimer', title: 'Disclaimer' },
    { id: 'liability', title: 'Aansprakelijkheid' },
    { id: 'changes', title: 'Wijzigingen' },
    { id: 'termination', title: 'Beëindiging' },
    { id: 'law', title: 'Toepasselijk recht' },
    { id: 'contact', title: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Algemene Voorwaarden
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
                  {/* Acceptatie van de voorwaarden */}
                  <section id="acceptance" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptatie van de voorwaarden</h2>
                    <p className="mb-4">
                      Door toegang te krijgen tot en gebruik te maken van het GroeimetAI leerplatform ("Platform"), 
                      ga je akkoord met deze Algemene Voorwaarden ("Voorwaarden"). Als je niet akkoord gaat met deze 
                      Voorwaarden, gebruik het Platform dan niet.
                    </p>
                    <p className="mb-4">
                      Deze Voorwaarden vormen een juridisch bindende overeenkomst tussen jou en GroeimetAI B.V. 
                      ("GroeimetAI", "wij", "ons" of "onze"), gevestigd te Amsterdam, Nederland.
                    </p>
                  </section>

                  {/* Definities */}
                  <section id="definitions" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definities</h2>
                    <ul className="list-disc pl-6 mb-4">
                      <li><strong>"Platform":</strong> Het GroeimetAI online leerplatform en alle bijbehorende diensten</li>
                      <li><strong>"Gebruiker":</strong> Iedereen die het Platform bezoekt of gebruikt</li>
                      <li><strong>"Student":</strong> Een Gebruiker die zich heeft ingeschreven voor een of meer Cursussen</li>
                      <li><strong>"Instructeur":</strong> Een Gebruiker die Cursussen aanbiedt op het Platform</li>
                      <li><strong>"Cursus":</strong> Educatieve content aangeboden via het Platform</li>
                      <li><strong>"Content":</strong> Alle materialen, inclusief tekst, video's, afbeeldingen, en documenten</li>
                    </ul>
                  </section>

                  {/* Account registratie */}
                  <section id="account" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account registratie</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">3.1 Accountvereisten</h3>
                    <p className="mb-4">
                      Om bepaalde functies van het Platform te gebruiken, moet je een account aanmaken. Bij registratie verklaar je dat:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Je minstens 16 jaar oud bent of de wettelijke leeftijd hebt bereikt in jouw jurisdictie</li>
                      <li>Je accurate, actuele en volledige informatie verstrekt</li>
                      <li>Je je accountgegevens bijwerkt wanneer nodig</li>
                      <li>Je verantwoordelijk bent voor alle activiteiten onder jouw account</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3">3.2 Accountbeveiliging</h3>
                    <p className="mb-4">
                      Je bent verantwoordelijk voor het beveiligen van je accountgegevens. GroeimetAI is niet aansprakelijk 
                      voor verlies of schade als gevolg van ongeautoriseerde toegang tot je account.
                    </p>
                  </section>

                  {/* Gebruik van het platform */}
                  <section id="platform-use" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Gebruik van het platform</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">4.1 Toegestaan gebruik</h3>
                    <p className="mb-4">Je mag het Platform gebruiken voor:</p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Het volgen van cursussen voor persoonlijke of professionele ontwikkeling</li>
                      <li>Het communiceren met instructeurs en andere studenten</li>
                      <li>Het delen van feedback en beoordelingen</li>
                      <li>Andere activiteiten die we expliciet toestaan</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3">4.2 Licentie</h3>
                    <p className="mb-4">
                      GroeimetAI verleent je een beperkte, niet-exclusieve, niet-overdraagbare licentie om toegang 
                      te krijgen tot en gebruik te maken van het Platform en de Content voor persoonlijk, 
                      niet-commercieel gebruik.
                    </p>
                  </section>

                  {/* Cursussen en content */}
                  <section id="courses" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cursussen en content</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">5.1 Cursusinschrijving</h3>
                    <p className="mb-4">
                      Wanneer je je inschrijft voor een cursus, krijg je levenslange toegang tot de cursusinhoud, 
                      tenzij anders vermeld. Dit omvat:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Alle huidige cursusmateriaal</li>
                      <li>Toekomstige updates van de cursus</li>
                      <li>Certificaat van voltooiing (indien van toepassing)</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3">5.2 Contentgebruik</h3>
                    <p className="mb-4">
                      Je mag cursusmateriaal alleen voor persoonlijk gebruik bekijken en downloaden. 
                      Het is niet toegestaan om content te delen, door te verkopen, of commercieel te gebruiken 
                      zonder schriftelijke toestemming.
                    </p>
                  </section>

                  {/* Betalingen en prijzen */}
                  <section id="payment" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Betalingen en prijzen</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">6.1 Prijzen</h3>
                    <p className="mb-4">
                      Alle prijzen op het Platform zijn in Euro's (EUR) en inclusief BTW, tenzij anders aangegeven. 
                      We behouden ons het recht voor om prijzen te wijzigen, maar dit heeft geen invloed op reeds 
                      gekochte cursussen.
                    </p>

                    <h3 className="text-xl font-semibold mb-3">6.2 Betalingsmethoden</h3>
                    <p className="mb-4">
                      We accepteren betalingen via Mollie, inclusief:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>iDEAL</li>
                      <li>Creditcard (Visa, Mastercard)</li>
                      <li>PayPal</li>
                      <li>Bancontact</li>
                      <li>SEPA-overschrijving</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3">6.3 Facturering</h3>
                    <p className="mb-4">
                      Na succesvolle betaling ontvang je automatisch een factuur per e-mail. 
                      Facturen zijn ook beschikbaar in je accountdashboard.
                    </p>
                  </section>

                  {/* Annulering en terugbetaling */}
                  <section id="refund" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Annulering en terugbetaling</h2>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            30-dagen geld-terug-garantie
                          </h3>
                          <p className="text-blue-800">
                            We bieden een 30-dagen geld-terug-garantie op alle cursussen. Als je niet tevreden bent, 
                            kun je binnen 30 dagen na aankoop een volledige terugbetaling aanvragen.
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-3">7.1 Voorwaarden voor terugbetaling</h3>
                    <p className="mb-4">Je komt in aanmerking voor terugbetaling als:</p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Je de terugbetaling aanvraagt binnen 30 dagen na aankoop</li>
                      <li>Je minder dan 50% van de cursus hebt voltooid</li>
                      <li>Je geen certificaat voor de cursus hebt ontvangen</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3">7.2 Uitgesloten van terugbetaling</h3>
                    <p className="mb-4">De volgende situaties komen niet in aanmerking voor terugbetaling:</p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Aanvragen na de 30-dagen periode</li>
                      <li>Cursussen die voor meer dan 50% zijn voltooid</li>
                      <li>Cursussen waarvoor al een certificaat is uitgegeven</li>
                      <li>Bundels of abonnementen (pro rata terugbetaling mogelijk)</li>
                      <li>Misbruik van het terugbetalingsbeleid</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3">7.3 Terugbetalingsproces</h3>
                    <p className="mb-4">
                      Om een terugbetaling aan te vragen, neem contact op met ons supportteam via support@groeimetai.nl. 
                      Terugbetalingen worden binnen 5-10 werkdagen verwerkt via de oorspronkelijke betaalmethode.
                    </p>
                  </section>

                  {/* Intellectueel eigendom */}
                  <section id="intellectual-property" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectueel eigendom</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">8.1 Platform eigendom</h3>
                    <p className="mb-4">
                      Alle rechten, titels en belangen in het Platform, inclusief alle content, functies, 
                      en functionaliteit, zijn eigendom van GroeimetAI of haar licentiegevers en worden 
                      beschermd door internationale auteursrechten, handelsmerken, en andere intellectuele eigendomsrechten.
                    </p>

                    <h3 className="text-xl font-semibold mb-3">8.2 Cursuscontent</h3>
                    <p className="mb-4">
                      Instructeurs behouden het auteursrecht op hun cursuscontent. Door content op het Platform 
                      te plaatsen, verlenen instructeurs GroeimetAI een wereldwijde, royalty-vrije licentie om 
                      deze content te gebruiken, reproduceren, en distribueren via het Platform.
                    </p>
                  </section>

                  {/* Gebruikerscontent */}
                  <section id="user-content" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Gebruikerscontent</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">9.1 Verantwoordelijkheid</h3>
                    <p className="mb-4">
                      Je bent volledig verantwoordelijk voor alle content die je upload, post, of deelt op het Platform, 
                      inclusief beoordelingen, commentaren, en forumberichten.
                    </p>

                    <h3 className="text-xl font-semibold mb-3">9.2 Licentie aan GroeimetAI</h3>
                    <p className="mb-4">
                      Door content te plaatsen, verleen je GroeimetAI een niet-exclusieve, wereldwijde, royalty-vrije 
                      licentie om jouw content te gebruiken, kopiëren, reproduceren, verwerken, aanpassen, publiceren, 
                      en distribueren.
                    </p>
                  </section>

                  {/* Verboden gebruik */}
                  <section id="prohibited" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Verboden gebruik</h2>
                    <p className="mb-4">Het is niet toegestaan om:</p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Het Platform te gebruiken voor illegale doeleinden</li>
                      <li>Inbreuk te maken op intellectuele eigendomsrechten</li>
                      <li>Virussen of schadelijke code te uploaden</li>
                      <li>Het Platform te hacken of beveiligingsmaatregelen te omzeilen</li>
                      <li>Spam te versturen of anderen lastig te vallen</li>
                      <li>Valse of misleidende informatie te verstrekken</li>
                      <li>Cursuscontent te kopiëren, distribueren, of door te verkopen</li>
                      <li>Geautomatiseerde systemen te gebruiken om toegang te krijgen tot het Platform</li>
                    </ul>
                  </section>

                  {/* Disclaimer */}
                  <section id="disclaimer" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disclaimer</h2>
                    <p className="mb-4">
                      Het Platform en alle Content worden aangeboden "zoals ze zijn" en "zoals beschikbaar" zonder 
                      enige garantie van welke aard dan ook, expliciet of impliciet.
                    </p>
                    <p className="mb-4">
                      GroeimetAI garandeert niet dat:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li>Het Platform ononderbroken of foutloos zal functioneren</li>
                      <li>De Content accuraat, volledig, of up-to-date is</li>
                      <li>De cursussen aan je specifieke behoeften zullen voldoen</li>
                      <li>Je specifieke resultaten zult behalen door het volgen van cursussen</li>
                    </ul>
                  </section>

                  {/* Aansprakelijkheid */}
                  <section id="liability" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Aansprakelijkheid</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">12.1 Beperking van aansprakelijkheid</h3>
                    <p className="mb-4">
                      Voor zover wettelijk toegestaan, zijn GroeimetAI en haar medewerkers, directeuren, en partners 
                      niet aansprakelijk voor indirecte, incidentele, speciale, gevolg- of punitieve schade.
                    </p>

                    <h3 className="text-xl font-semibold mb-3">12.2 Maximum aansprakelijkheid</h3>
                    <p className="mb-4">
                      De totale aansprakelijkheid van GroeimetAI zal in geen geval het bedrag overschrijden dat je 
                      in de 12 maanden voorafgaand aan het incident aan ons hebt betaald.
                    </p>

                    <h3 className="text-xl font-semibold mb-3">12.3 Vrijwaring</h3>
                    <p className="mb-4">
                      Je stemt ermee in GroeimetAI te vrijwaren van alle claims, verliezen, en kosten die voortvloeien 
                      uit jouw schending van deze Voorwaarden of jouw gebruik van het Platform.
                    </p>
                  </section>

                  {/* Wijzigingen */}
                  <section id="changes" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Wijzigingen</h2>
                    <p className="mb-4">
                      We behouden ons het recht voor deze Voorwaarden op elk moment te wijzigen. Bij materiële 
                      wijzigingen zullen we je hiervan op de hoogte stellen via e-mail of een melding op het Platform.
                    </p>
                    <p className="mb-4">
                      Door het Platform te blijven gebruiken na wijzigingen, accepteer je de herziene Voorwaarden.
                    </p>
                  </section>

                  {/* Beëindiging */}
                  <section id="termination" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Beëindiging</h2>
                    
                    <h3 className="text-xl font-semibold mb-3">14.1 Door jou</h3>
                    <p className="mb-4">
                      Je kunt je account op elk moment beëindigen door contact op te nemen met ons supportteam. 
                      Dit heeft geen invloed op je toegang tot reeds gekochte cursussen.
                    </p>

                    <h3 className="text-xl font-semibold mb-3">14.2 Door GroeimetAI</h3>
                    <p className="mb-4">
                      We kunnen je account beëindigen of opschorten als we geloven dat je deze Voorwaarden hebt geschonden. 
                      In geval van ernstige schendingen kunnen we je toegang tot gekochte cursussen intrekken zonder terugbetaling.
                    </p>
                  </section>

                  {/* Toepasselijk recht */}
                  <section id="law" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Toepasselijk recht</h2>
                    <p className="mb-4">
                      Deze Voorwaarden worden beheerst door Nederlands recht. Alle geschillen die voortvloeien uit 
                      of verband houden met deze Voorwaarden zullen exclusief worden voorgelegd aan de bevoegde 
                      rechtbank in Amsterdam, Nederland.
                    </p>
                  </section>

                  {/* Contact */}
                  <section id="contact" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact</h2>
                    <p className="mb-4">
                      Voor vragen over deze Algemene Voorwaarden kun je contact met ons opnemen:
                    </p>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="font-semibold mb-2">GroeimetAI B.V.</p>
                      <p className="mb-1">E-mail: <a href="mailto:support@groeimetai.nl" className="text-blue-600 hover:underline">support@groeimetai.nl</a></p>
                      <p className="mb-1">Telefoon: +31 20 123 4567</p>
                      <p className="mb-1">Adres: Herengracht 100, 1015 BS Amsterdam</p>
                      <p className="mb-1">KvK-nummer: 12345678</p>
                      <p className="mb-1">BTW-nummer: NL123456789B01</p>
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