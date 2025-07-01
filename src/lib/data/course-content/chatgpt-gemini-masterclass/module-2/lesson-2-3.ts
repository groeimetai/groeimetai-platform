import type { Lesson } from '@/lib/data/courses'
export const lesson2_3: Lesson = {
  id: 'lesson-2-3',
  title: 'Visualisaties en grafieken maken',
  duration: '75 minuten',
  content: `# Visualisaties en grafieken maken met ChatGPT

## De kracht van visuele data representatie

ChatGPT Advanced Data Analysis gebruikt voornamelijk Python bibliotheken voor visualisaties:
- **Matplotlib**: Basis plots en aanpassingen
- **Seaborn**: Statistische visualisaties
- **Plotly**: Interactieve grafieken

## Basis visualisatie types

### 1. Lijngrafieken (Trends over tijd)
\`\`\`
"Maak een lijngrafiek van de maandelijkse omzet voor 2023 en 2024.
- Gebruik verschillende kleuren per jaar
- Voeg een trendlijn toe
- Markeer de hoogste en laagste punten"
\`\`\`

### 2. Staafdiagrammen (Categorische vergelijkingen)
\`\`\`
"Toon de top 10 producten op basis van omzet in een horizontaal staafdiagram.
- Sorteer van hoog naar laag
- Voeg de exacte waarden toe aan de staven
- Gebruik een kleurgradiënt"
\`\`\`

### 3. Scatter plots (Correlaties)
\`\`\`
"Maak een scatter plot van prijs vs. verkoopaantallen.
- Kleur de punten op basis van productcategorie
- Voeg een regressielijn toe
- Maak de puntgrootte afhankelijk van de winstmarge"
\`\`\`

### 4. Heatmaps (Patroon identificatie)
\`\`\`
"Creëer een heatmap van verkopen per dag van de week en uur van de dag.
- Gebruik een warme kleurenschaal
- Voeg de exacte aantallen toe in elke cel
- Highlight de piekuren"
\`\`\`

## Geavanceerde visualisatie technieken

### Dashboard-style visualisaties
\`\`\`
"Maak een dashboard met 4 subplots:
1. Omzet trend per maand (lijngrafiek)
2. Top 5 categorieën (taartdiagram)
3. Geografische verdeling (staafdiagram)
4. Conversie funnel (trechterdiagram)"
\`\`\`

### Statistische visualisaties
- **Box plots**: "Toon de prijsverdeling per productcategorie met outliers"
- **Violin plots**: "Vergelijk de verkoopverdeling tussen weekdagen en weekend"
- **Pair plots**: "Maak een correlatiematrix van alle numerieke variabelen"

### Time series decomposition
\`\`\`
"Analyseer de verkoopdata voor seizoenspatronen:
- Decomponeer in trend, seizoen, en residual
- Maak een forecast voor de komende 3 maanden
- Visualiseer de confidence intervals"
\`\`\`

## Styling en customization

### Professional styling tips
1. **Kleuren kiezen**
   - "Gebruik het kleurenpalet van ons bedrijf: #1E88E5, #FFC107, #43A047"
   - "Maak het kleurenblind-vriendelijk"

2. **Annotaties toevoegen**
   - "Voeg pijlen toe naar belangrijke datapunten"
   - "Plaats tekstuele uitleg bij uitzonderlijke waarden"

3. **Layout optimalisatie**
   - "Maak de grafiek 16:9 voor presentaties"
   - "Vergroot de font sizes voor leesbaarheid"
   - "Voeg een watermerk toe met ons logo"

## Interactieve visualisaties met Plotly

\`\`\`
"Maak een interactieve lijngrafiek met Plotly waar gebruikers:
- Kunnen inzoomen op specifieke periodes
- Data points kunnen hoveren voor details
- Specifieke lijnen kunnen aan/uitzetten"
\`\`\`

## Export opties

### Verschillende formaten
- **PNG**: Hoge resolutie voor rapporten (300 DPI)
- **SVG**: Vector formaat voor schaalbaarheid
- **HTML**: Interactieve Plotly grafieken
- **PDF**: Voor professionele documentatie

### Bulk visualisatie generatie
\`\`\`
"Genereer automatisch een rapport met:
- Een overzichtsgrafiek per productcategorie
- Sla elke grafiek op als aparte PNG
- Maak een PDF met alle grafieken"
\`\`\``,
  codeExamples: [
    {
      id: 'example-3-1',
      title: 'ChatGPT genereert: Multi-panel dashboard',
      language: 'python',
      code: `# ChatGPT creëert automatisch dashboard visualisaties
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import numpy as np

# Maak een figure met 4 subplots
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('Verkoop Dashboard - Q4 2024', fontsize=16)

# 1. Omzet trend (Lijngrafiek)
maandelijkse_omzet = df.groupby(df['Datum'].dt.to_period('M'))['Omzet'].sum()
ax1.plot(maandelijkse_omzet.index.astype(str), maandelijkse_omzet.values, 
         marker='o', linewidth=2, markersize=8)
ax1.set_title('Maandelijkse Omzet Trend')
ax1.set_xlabel('Maand')
ax1.set_ylabel('Omzet (€)')
ax1.grid(True, alpha=0.3)
# Voeg trendlijn toe
z = np.polyfit(range(len(maandelijkse_omzet)), maandelijkse_omzet.values, 1)
p = np.poly1d(z)
ax1.plot(range(len(maandelijkse_omzet)), p(range(len(maandelijkse_omzet))), 
         "--", alpha=0.8, color='red', label='Trend')

# 2. Top 5 Categorieën (Taartdiagram)
top_categories = df.groupby('Categorie')['Omzet'].sum().nlargest(5)
colors = plt.cm.Set3(range(len(top_categories)))
wedges, texts, autotexts = ax2.pie(top_categories.values, 
                                    labels=top_categories.index,
                                    autopct='%1.1f%%',
                                    colors=colors,
                                    startangle=90)
ax2.set_title('Top 5 Categorieën op Omzet')

# 3. Verkoop per Regio (Staafdiagram)
regio_verkoop = df.groupby('Regio')['Aantal'].sum().sort_values(ascending=True)
bars = ax3.barh(regio_verkoop.index, regio_verkoop.values)
# Kleur gradiënt toepassen
colors = plt.cm.Blues(np.linspace(0.4, 1, len(bars)))
for bar, color in zip(bars, colors):
    bar.set_color(color)
ax3.set_xlabel('Aantal Verkopen')
ax3.set_title('Verkopen per Regio')
# Voeg waarden toe aan bars
for i, v in enumerate(regio_verkoop.values):
    ax3.text(v + 10, i, str(v), va='center')

# 4. Heatmap weekdag vs uur
pivot_table = df.pivot_table(
    values='Aantal', 
    index=df['Datum'].dt.hour,
    columns=df['Datum'].dt.day_name(),
    aggfunc='sum'
)
# Herorden dagen
dagen_volgorde = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
pivot_table = pivot_table[dagen_volgorde]
sns.heatmap(pivot_table, cmap='YlOrRd', annot=True, fmt='g', ax=ax4)
ax4.set_title('Verkoop Heatmap: Uur vs Weekdag')
ax4.set_xlabel('Dag van de Week')
ax4.set_ylabel('Uur van de Dag')

plt.tight_layout()
plt.savefig('verkoop_dashboard.png', dpi=300, bbox_inches='tight')
plt.show()`,
      explanation: 'ChatGPT creëert automatisch professionele multi-panel dashboards met verschillende visualisatie types'
    },
    {
      id: 'example-3-2',
      title: 'ChatGPT genereert: Interactieve Plotly visualisatie',
      language: 'python',
      code: `# ChatGPT maakt interactieve grafieken met Plotly
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Bereid data voor
daily_sales = df.groupby('Datum').agg({
    'Omzet': 'sum',
    'Aantal': 'sum',
    'Winst': 'sum'
}).reset_index()

# Maak interactieve figure met secondary y-axis
fig = make_subplots(
    rows=2, cols=1,
    shared_xaxes=True,
    vertical_spacing=0.1,
    subplot_titles=('Omzet & Aantal Verkopen', 'Winstmarge %'),
    specs=[[{"secondary_y": True}], [{"secondary_y": False}]]
)

# Voeg omzet lijn toe
fig.add_trace(
    go.Scatter(
        x=daily_sales['Datum'],
        y=daily_sales['Omzet'],
        mode='lines+markers',
        name='Omzet (€)',
        line=dict(color='blue', width=2),
        marker=dict(size=6)
    ),
    row=1, col=1, secondary_y=False
)

# Voeg aantal verkopen toe op secondary axis
fig.add_trace(
    go.Bar(
        x=daily_sales['Datum'],
        y=daily_sales['Aantal'],
        name='Aantal Verkopen',
        marker_color='lightblue',
        opacity=0.6
    ),
    row=1, col=1, secondary_y=True
)

# Bereken en voeg winstmarge toe
daily_sales['Winstmarge_%'] = (daily_sales['Winst'] / daily_sales['Omzet']) * 100
fig.add_trace(
    go.Scatter(
        x=daily_sales['Datum'],
        y=daily_sales['Winstmarge_%'],
        mode='lines+markers',
        name='Winstmarge %',
        line=dict(color='green', width=2),
        fill='tozeroy',
        fillcolor='rgba(0,255,0,0.1)'
    ),
    row=2, col=1
)

# Update layout
fig.update_xaxes(title_text="Datum", row=2, col=1)
fig.update_yaxes(title_text="Omzet (€)", secondary_y=False, row=1, col=1)
fig.update_yaxes(title_text="Aantal", secondary_y=True, row=1, col=1)
fig.update_yaxes(title_text="Winstmarge %", row=2, col=1)

fig.update_layout(
    title="Interactief Verkoop Dashboard",
    height=800,
    hovermode='x unified',
    showlegend=True
)

# Voeg range selector toe
fig.update_xaxes(
    rangeslider_visible=False,
    rangeselector=dict(
        buttons=list([
            dict(count=7, label="1w", step="day", stepmode="backward"),
            dict(count=1, label="1m", step="month", stepmode="backward"),
            dict(count=3, label="3m", step="month", stepmode="backward"),
            dict(step="all")
        ])
    )
)

fig.show()
# Sla op als HTML voor delen
fig.write_html("interactief_dashboard.html")`,
      explanation: 'Plotly maakt het mogelijk om interactieve dashboards te creëren die gebruikers kunnen verkennen'
    }
  ],
  assignments: [
    {
      id: 'assignment-3-1',
      title: 'Maak een Executive Dashboard',
      description: 'Creëer een one-page visual summary van bedrijfsperformance met minimaal 6 verschillende visualisaties',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Focus op KPIs die executives interessant vinden',
        'Gebruik consistente kleuren en styling',
        'Voeg vergelijkingen met vorige periode toe',
        'Maak het printbaar op A4 formaat'
      ]
    },
    {
      id: 'assignment-3-2',
      title: 'Interactieve Sales Explorer',
      description: 'Bouw een interactieve Plotly applicatie waarmee gebruikers sales data kunnen filteren en analyseren',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Implementeer dropdown filters voor categorieën',
        'Voeg date range selectors toe',
        'Maak hover tooltips informatief',
        'Export functionaliteit voor geselecteerde data'
      ]
    }
  ],
  resources: [
    {
      title: 'Financial Times Visual Vocabulary',
      url: 'https://github.com/ft-interactive/chart-doctor/tree/master/visual-vocabulary',
      type: 'guide'
    },
    {
      title: 'Plotly Python Documentation',
      url: 'https://plotly.com/python/',
      type: 'documentation'
    },
    {
      title: 'Seaborn Gallery',
      url: 'https://seaborn.pydata.org/examples/index.html',
      type: 'examples'
    }
  ]
};