import type { Lesson } from '@/lib/data/courses'
export const lesson2_2: Lesson = {
  id: 'lesson-2-2',
  title: 'Werken met Excel en CSV bestanden',
  duration: '60 minuten',
  content: `# Werken met Excel en CSV bestanden

## Bestanden uploaden en verwerken

### Ondersteunde bestandsformaten
- **Excel**: .xlsx, .xls
- **CSV**: .csv (verschillende delimiters)
- **JSON**: Gestructureerde data
- **Text**: .txt bestanden
- **Images**: Voor OCR en analyse

## Excel specifieke features

### Meerdere sheets verwerken
\`\`\`
"Mijn Excel bestand heeft 3 sheets: Verkoop2023, Verkoop2024, en Producten. 
Kun je:
1. Alle sheets inladen en tonen welke data ze bevatten
2. De verkoop van beide jaren combineren
3. De productinformatie koppelen aan de verkoop"
\`\`\`

### Complexe Excel structuren
ChatGPT kan omgaan met:
- Samengevoegde cellen
- Formules (worden als waarden ingelezen)
- Opmaak en styling (wordt genegeerd)
- Draaitabellen (als normale data)

## Data cleaning technieken

### Veelvoorkomende problemen oplossen

1. **Ontbrekende waarden**
   - "Vul ontbrekende prijzen in met het gemiddelde per categorie"
   - "Verwijder rijen waar kritieke velden leeg zijn"

2. **Duplicaten**
   - "Check voor duplicate klanten op basis van email"
   - "Behoud alleen de meest recente entry per klant"

3. **Data types**
   - "Converteer de datum kolom naar het juiste formaat"
   - "Maak van tekstuele getallen numerieke waarden"

4. **Inconsistente data**
   - "Standaardiseer productnamen (bijv. 'laptop' en 'Laptop')"
   - "Corrigeer spelfouten in categorieën"

## Geavanceerde Excel manipulaties

### Pivot tables recreëren
"Maak een draaitabel met:
- Rijen: Productcategorie
- Kolommen: Maanden
- Waarden: Som van omzet en aantal verkopen"

### VLOOKUP/INDEX-MATCH vervangen
"Ik heb twee bestanden:
1. orders.xlsx met klant_id
2. klanten.xlsx met klant_id en details
Combineer deze data op basis van klant_id"

### Conditionele berekeningen
"Bereken commissie volgens deze regels:
- Omzet < €1000: 5%
- Omzet €1000-5000: 7%  
- Omzet > €5000: 10%"

## Performance tips

### Grote bestanden
- Split bestanden > 50MB in kleinere delen
- Vraag om sampling voor eerste verkenning
- Gebruik filters voor specifieke analyses

### Geheugen optimalisatie
"Laad alleen deze kolommen: datum, product, omzet"
"Werk met een sample van 10% voor prototyping"`,
  codeExamples: [
    {
      id: 'example-2-1',
      title: 'ChatGPT genereert: Multi-sheet Excel verwerking',
      language: 'python',
      code: `# ChatGPT code voor multi-sheet Excel verwerking
import pandas as pd

# Lees alle sheets
excel_file = pd.ExcelFile('bedrijfsdata.xlsx')
print("Beschikbare sheets:", excel_file.sheet_names)

# Laad specifieke sheets
verkoop_2023 = pd.read_excel('bedrijfsdata.xlsx', sheet_name='Verkoop2023')
verkoop_2024 = pd.read_excel('bedrijfsdata.xlsx', sheet_name='Verkoop2024')
producten = pd.read_excel('bedrijfsdata.xlsx', sheet_name='Producten')

# Combineer verkoopdata
verkoop_2023['Jaar'] = 2023
verkoop_2024['Jaar'] = 2024
alle_verkoop = pd.concat([verkoop_2023, verkoop_2024], ignore_index=True)

# Koppel productinformatie
verkoop_compleet = alle_verkoop.merge(
    producten, 
    on='product_id', 
    how='left'
)

print(f"Gecombineerde dataset: {verkoop_compleet.shape[0]} rijen")`,
      explanation: 'ChatGPT handelt automatisch complexe Excel bestanden met meerdere sheets af'
    },
    {
      id: 'example-2-2',
      title: 'ChatGPT genereert: Data cleaning',
      language: 'python',
      code: `# Automatische data cleaning door ChatGPT
# Ontbrekende waarden behandelen
print("Ontbrekende waarden voor cleaning:")
print(df.isnull().sum())

# Vul numerieke kolommen met mediaan
numerieke_kolommen = df.select_dtypes(include=['float64', 'int64']).columns
for col in numerieke_kolommen:
    df[col].fillna(df[col].median(), inplace=True)

# Vul categorische kolommen met modus
categorische_kolommen = df.select_dtypes(include=['object']).columns
for col in categorische_kolommen:
    df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Onbekend', inplace=True)

# Verwijder duplicaten
duplicaten_voor = df.duplicated().sum()
df = df.drop_duplicates()
print(f"\\nVerwijderd: {duplicaten_voor} duplicaten")

# Standaardiseer tekst
df['Categorie'] = df['Categorie'].str.lower().str.strip()
df['Product'] = df['Product'].str.title()

# Datum parsing
df['Datum'] = pd.to_datetime(df['Datum'], errors='coerce')

print("\\nData cleaning compleet!")`,
      explanation: 'ChatGPT past automatisch best practices toe voor data cleaning'
    }
  ],
  assignments: [
    {
      id: 'assignment-2-1',
      title: 'Excel Data Cleaning Challenge',
      description: 'Download een "vuile" dataset en gebruik ChatGPT om deze schoon te maken. Focus op ontbrekende waarden, duplicaten, en inconsistente formatting.',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Vraag ChatGPT eerst om een data quality report',
        'Behandel één probleem tegelijk',
        'Vraag om before/after vergelijkingen',
        'Sla de cleaned data op in een nieuw bestand'
      ]
    },
    {
      id: 'assignment-2-2',
      title: 'Multi-source Data Combinatie',
      description: 'Combineer data uit 3 verschillende Excel bestanden tot één coherente dataset voor analyse',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Begin met het verkennen van elke dataset afzonderlijk',
        'Identificeer gemeenschappelijke sleutels voor joins',
        'Let op data type mismatches',
        'Valideer de gecombineerde data'
      ]
    }
  ],
  resources: [
    {
      title: 'Messy Data for Cleaning Practice',
      url: 'https://github.com/Kaggle/kaggle-api',
      type: 'dataset'
    },
    {
      title: 'Excel Best Practices for Data Analysis',
      url: 'https://support.microsoft.com/en-us/office/guidelines-for-organizing-data-on-a-worksheet',
      type: 'article'
    }
  ]
};