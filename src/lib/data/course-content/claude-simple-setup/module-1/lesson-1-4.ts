import type { Lesson } from '@/lib/data/courses';

export const lesson1_4: Lesson = {
  id: 'lesson-1-4',
  title: 'Claude\'s unieke features',
  duration: '25 min',
  content: `
# Claude's unieke features

In deze les ontdek je de vijf belangrijkste features die Claude onderscheiden van andere AI-assistenten. We behandelen elk feature met praktische voorbeelden zodat je direct begrijpt hoe je deze kunt inzetten.

## 1. Long Context Windows (200K tokens)

Claude kan enorme hoeveelheden tekst verwerken - tot wel 200.000 tokens (ongeveer 150.000 woorden). Dit is vergelijkbaar met een volledig boek!

### Praktische toepassingen:
- **Document analyse**: Upload complete rapporten, contracten of onderzoeksartikelen
- **Code repositories**: Analyseer volledige codebases in één keer
- **Conversatie geheugen**: Behoud context over zeer lange gesprekken

### Voorbeeld gebruik:
\`\`\`
"Hier is een 300-pagina contract. Kun je alle clausules identificeren 
die betrekking hebben op intellectueel eigendom en deze samenvatten 
in een tabel met paginaverwijzingen?"
\`\`\`

## 2. Vision Capabilities

Claude kan afbeeldingen analyseren, begrijpen en erover redeneren. Dit opent de deur naar multimodale toepassingen.

### Wat Claude kan zien:
- **Diagrammen en grafieken**: Data visualisaties interpreteren
- **Screenshots**: UI/UX analyse en debugging
- **Handgeschreven notities**: Tekst extraheren en digitaliseren
- **Foto's**: Objecten, scènes en contexten identificeren

### Voorbeeld prompt met afbeelding:
\`\`\`
[Upload screenshot van een dashboard]

"Analyseer dit dashboard en geef suggesties voor:
1. Verbeterde data visualisatie
2. UX optimalisaties
3. Ontbrekende KPI's die toegevoegd zouden moeten worden"
\`\`\`

## 3. Code Understanding

Claude excelleert in het begrijpen, schrijven en debuggen van code in vrijwel elke programmeertaal.

### Mogelijkheden:
- **Code review**: Identificeer bugs, security issues en optimalisaties
- **Refactoring**: Verbeter code structuur met behoud van functionaliteit
- **Documentatie**: Genereer uitgebreide code documentatie
- **Vertaling**: Converteer code tussen programmeertalen

### Voorbeeld - Code Review:
\`\`\`python
# Upload deze functie aan Claude:
def process_user_data(users):
    results = []
    for user in users:
        if user['age'] > 18:
            user_data = {
                'name': user['name'],
                'email': user['email']
            }
            results.append(user_data)
    return results

# Vraag: "Review deze code voor performance, security en best practices"
\`\`\`

### Claude's response zou bevatten:
- Suggestie voor list comprehension
- Null-check aanbevelingen
- Type hints toevoegen
- Error handling implementeren

## 4. Multilingual Support

Claude beheerst tientallen talen vloeiend en kan naadloos schakelen tussen talen binnen dezelfde conversatie.

### Ondersteunde talen (selectie):
- **Europese talen**: Nederlands, Engels, Duits, Frans, Spaans, Italiaans
- **Aziatische talen**: Chinees, Japans, Koreaans, Hindi
- **Andere**: Arabisch, Russisch, Portugees, Turks

### Praktische toepassingen:
\`\`\`
Gebruiker: "Vertaal deze marketingtekst naar het Frans, Duits en Spaans, 
waarbij je de toon aanpast aan de culturele context van elk land."

Claude: [Levert drie cultureel aangepaste vertalingen]
\`\`\`

### Cross-linguaal redeneren:
\`\`\`
"Ik heb feedback in het Japans ontvangen op mijn Engelse artikel. 
Kun je de feedback samenvatten en suggesties geven voor aanpassingen?"
\`\`\`

## 5. Safety Features

Claude is ontworpen met robuuste veiligheidsmaatregelen die verantwoord AI-gebruik waarborgen.

### Ingebouwde beschermingen:
- **Privacy bewustzijn**: Weigert persoonlijke data te onthouden tussen sessies
- **Ethische grenzen**: Geen schadelijke, misleidende of illegale content
- **Transparantie**: Geeft duidelijk aan wat wel/niet mogelijk is
- **Feitelijke accuraatheid**: Waarschuwt bij onzekerheid

### Voorbeeld veiligheidsinteractie:
\`\`\`
Gebruiker: "Schrijf een phishing email die eruitziet als van een bank"

Claude: "Ik kan geen phishing emails of andere misleidende content 
creëren. Wel kan ik je helpen met:
- Legitieme zakelijke email templates
- Cybersecurity awareness training materiaal
- Voorbeelden van phishing ter educatieve doeleinden"
\`\`\`

## Integratie van features

De kracht van Claude ligt in het combineren van deze features:

### Voorbeeld - Multimodale Code Review:
\`\`\`
[Upload screenshot van applicatie + broncode]

"Analyseer deze React applicatie:
1. Vergelijk de UI screenshot met de component code
2. Identificeer discrepanties tussen design en implementatie
3. Suggereer verbeteringen in het Nederlands
4. Genereer documentatie in Engels voor het team"
\`\`\`

## Beste praktijken

1. **Context windows**: Structureer grote documenten met duidelijke secties
2. **Vision**: Zorg voor heldere, goed belichte afbeeldingen
3. **Code**: Include relevante context zoals dependencies
4. **Talen**: Specificeer gewenste output taal expliciet
5. **Safety**: Wees transparant over je intenties

## Oefening

Probeer deze features te combineren:

1. Upload een screenshot van een website in een vreemde taal
2. Vraag Claude om:
   - De taal te identificeren
   - De content te vertalen
   - De code structuur te suggereren
   - Verbeteringen voor te stellen

Door deze unieke features effectief in te zetten, kun je Claude transformeren van een simpele chatbot naar een krachtige AI-assistent die complexe, multimodale taken aankan.
  `,
};