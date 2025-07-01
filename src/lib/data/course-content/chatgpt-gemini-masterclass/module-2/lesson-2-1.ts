import type { Lesson } from '@/lib/data/courses'

export const lesson2_1: Lesson = {
  id: 'lesson-2-1',
  title: 'Introductie tot ChatGPT Advanced Data Analysis',
  duration: '45 minuten',
  content: `# Introductie tot ChatGPT Advanced Data Analysis

## Wat is Advanced Data Analysis?

Advanced Data Analysis (voorheen Code Interpreter) is een krachtige functie binnen ChatGPT Plus die het mogelijk maakt om:

- **Python code uit te voeren** in een sandbox omgeving
- **Bestanden te uploaden** zoals Excel, CSV, JSON, en meer
- **Visualisaties te creëren** met matplotlib, seaborn, en plotly
- **Complexe berekeningen** uit te voeren zonder zelf te programmeren

## Activeren van Advanced Data Analysis

### Stap 1: ChatGPT Plus Account
- Advanced Data Analysis is alleen beschikbaar voor ChatGPT Plus gebruikers
- Ga naar Settings → Beta features
- Schakel "Advanced data analysis" in

### Stap 2: Selecteer het juiste model
- Klik op het model dropdown menu
- Selecteer "GPT-4 with Advanced Data Analysis"
- Je ziet nu een paperclip icoon voor file uploads

## Mogelijkheden en Beperkingen

### Wat kun je ermee?
- **Data cleaning**: Ontbrekende waarden, duplicaten, formatting
- **Statistische analyses**: Gemiddelden, correlaties, regressies
- **Machine Learning**: Voorspellingen, clustering, classificatie
- **Visualisaties**: Grafieken, heatmaps, interactieve plots
- **File conversies**: Excel naar CSV, JSON naar Excel, etc.

### Beperkingen
- Geen internetverbinding tijdens analyse
- Sessie timeout na ~1 uur inactiviteit
- Maximum bestandsgrootte: 512MB
- Geen permanente opslag (download resultaten!)

## Je eerste data-analyse

### Voorbeeld prompt:
"Ik upload een Excel bestand met verkoopdata. Kun je:
1. Een overzicht geven van de data
2. De top 10 best verkopende producten tonen
3. Een grafiek maken van de maandelijkse omzet
4. Seizoenspatronen identificeren"

### Best practices:
- Wees specifiek in je vragen
- Vraag om stapsgewijze uitleg
- Laat ChatGPT de data eerst verkennen
- Vraag om verschillende visualisatie opties`,
  codeExamples: [
    {
      id: 'example-1',
      title: 'ChatGPT genereert: Data overzicht',
      language: 'python',
      code: `# ChatGPT zal automatisch code zoals deze genereren:
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Laad de data
df = pd.read_excel('verkoop_data.xlsx')

# Basis informatie
print("Dataset vorm:", df.shape)
print("\\nKolommen:", df.columns.tolist())
print("\\nData types:")
print(df.dtypes)

# Eerste 5 rijen
print("\\nEerste 5 rijen:")
print(df.head())

# Basis statistieken
print("\\nBasis statistieken:")
print(df.describe())

# Check voor ontbrekende waarden
print("\\nOntbrekende waarden per kolom:")
print(df.isnull().sum())`,
      explanation: 'ChatGPT genereert automatisch deze code om een eerste overzicht van je data te krijgen. Je hoeft geen Python te kennen!'
    }
  ],
  assignments: [
    {
      id: 'assignment-1',
      title: 'Eerste Data Upload',
      description: 'Upload een eenvoudig Excel of CSV bestand naar ChatGPT en vraag om een basis analyse',
      difficulty: 'easy',
      type: 'project',
      hints: [
        'Begin met een klein bestand (< 1000 rijen)',
        'Vraag eerst om een overzicht van de data',
        'Laat ChatGPT suggesties doen voor analyses'
      ]
    }
  ],
  resources: [
    {
      title: 'Sample Sales Dataset',
      url: 'https://www.kaggle.com/datasets/kyanyoga/sample-sales-data',
      type: 'dataset'
    },
    {
      title: 'ChatGPT Advanced Data Analysis Guide',
      url: 'https://help.openai.com/en/articles/8437071-advanced-data-analysis',
      type: 'documentation'
    }
  ]
};