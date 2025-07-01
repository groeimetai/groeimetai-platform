import type { Lesson } from '@/lib/data/courses'

export const lesson5_3: Lesson = {
  id: 'lesson-5-3',
  title: 'Data Analysis Workflows',
  duration: '90 minuten',
  content: `# Data Analysis Workflows met ChatGPT

Leer hoe je ChatGPT kunt gebruiken voor geavanceerde data-analyse workflows, specifiek gericht op Nederlandse financiële data en rapportage.

## Onderwerpen
- Automated reporting met pandas integratie
- Nederlandse financiële data analyse (iDEAL, KvK data)
- CSV/Excel processing pipelines
- Visualisatie generatie
- Real-time data monitoring

## 1. Pandas Integratie Setup

### Python Code Generation voor Data Analysis
\`\`\`python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta

# Nederlandse locale voor currency formatting
import locale
locale.setlocale(locale.LC_ALL, 'nl_NL.UTF-8')

# ChatGPT prompt voor data analyse
prompt = """
Genereer Python code voor het analyseren van iDEAL transacties:
1. Laad CSV bestand met transactie data
2. Analyseer transactie patronen per dag/week/maand
3. Identificeer top merchants
4. Bereken conversie percentages
5. Maak visualisaties voor management rapportage
"""
\`\`\`

### iDEAL Transaction Analysis
\`\`\`python
# iDEAL transactie analyse framework
class iDEALAnalyzer:
    def __init__(self, csv_path):
        self.df = pd.read_csv(csv_path, parse_dates=['transaction_date'])
        self.df['amount_eur'] = self.df['amount'] / 100  # Cents naar euros
        
    def analyze_daily_patterns(self):
        """Analyseer dagelijkse transactie patronen"""
        daily = self.df.groupby(self.df['transaction_date'].dt.date).agg({
            'amount_eur': ['sum', 'mean', 'count'],
            'transaction_id': 'count'
        })
        
        # Nederlandse formatting
        daily.columns = ['Totaal_Omzet', 'Gemiddeld_Bedrag', 'Aantal_Transacties', 'Unieke_Transacties']
        return daily
        
    def top_merchants(self, n=10):
        """Identificeer top merchants op basis van omzet"""
        return self.df.groupby('merchant_name').agg({
            'amount_eur': 'sum',
            'transaction_id': 'count',
            'customer_id': 'nunique'
        }).sort_values('amount_eur', ascending=False).head(n)
        
    def conversion_analysis(self):
        """Bereken conversie percentages per merchant"""
        conversions = self.df.groupby('merchant_name').agg({
            'completed': 'sum',
            'transaction_id': 'count'
        })
        conversions['conversion_rate'] = (conversions['completed'] / conversions['transaction_id'] * 100)
        return conversions.sort_values('conversion_rate', ascending=False)
\`\`\`

## 2. KvK Data Processing

### Automated KvK Data Extraction
\`\`\`python
class KvKDataProcessor:
    def __init__(self):
        self.api_key = "YOUR_KVK_API_KEY"
        self.base_url = "https://api.kvk.nl/v1"
        
    def extract_company_data(self, kvk_numbers):
        """Extract bedrijfsgegevens voor lijst van KvK nummers"""
        companies = []
        
        for kvk in kvk_numbers:
            # ChatGPT prompt voor data structurering
            prompt = f"""
            Structureer de volgende KvK data in een pandas DataFrame:
            - KvK nummer: {kvk}
            - Bedrijfsnaam
            - Rechtsvorm
            - SBI codes
            - Vestigingsadres
            - Aantal werknemers
            - Oprichtingsdatum
            """
            
            company_data = self.fetch_kvk_data(kvk)
            companies.append(company_data)
            
        return pd.DataFrame(companies)
        
    def analyze_sectors(self, df):
        """Analyseer bedrijven per sector (SBI code)"""
        sector_analysis = df.groupby('sbi_code_primary').agg({
            'kvk_number': 'count',
            'employees': 'sum',
            'revenue': 'mean'
        })
        return sector_analysis
\`\`\`

## 3. Excel Processing Pipelines

### Automated Excel Report Generation
\`\`\`python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.chart import BarChart, Reference, LineChart

class DutchFinancialReporter:
    def __init__(self, data):
        self.data = data
        self.wb = Workbook()
        
    def create_monthly_report(self, month, year):
        """Genereer maandelijkse financiële rapportage"""
        ws = self.wb.active
        ws.title = f"Rapportage_{month}_{year}"
        
        # Header styling
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
        
        # Headers
        headers = ["Datum", "Omzet (€)", "Transacties", "Gem. Orderbedrag", "Conversie %"]
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")
            
        # Data vullen met Nederlandse formatting
        for row, record in enumerate(self.data.itertuples(), 2):
            ws.cell(row=row, column=1, value=record.date.strftime("%d-%m-%Y"))
            ws.cell(row=row, column=2, value=f"€ {record.revenue:,.2f}")
            ws.cell(row=row, column=3, value=record.transactions)
            ws.cell(row=row, column=4, value=f"€ {record.avg_order:,.2f}")
            ws.cell(row=row, column=5, value=f"{record.conversion:.1f}%")
            
        # Grafiek toevoegen
        self.add_revenue_chart(ws)
        self.add_conversion_chart(ws)
        
    def add_revenue_chart(self, ws):
        """Voeg omzet grafiek toe"""
        chart = LineChart()
        chart.title = "Omzet Trend"
        chart.y_axis.title = "Omzet (EUR)"
        chart.x_axis.title = "Datum"
        
        data = Reference(ws, min_col=2, min_row=1, max_row=ws.max_row)
        dates = Reference(ws, min_col=1, min_row=2, max_row=ws.max_row)
        
        chart.add_data(data, titles_from_data=True)
        chart.set_categories(dates)
        ws.add_chart(chart, "G2")
\`\`\`

## 4. Visualisatie Generatie

### Advanced Visualization met Nederlandse Context
\`\`\`python
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

class DutchDataVisualizer:
    def __init__(self):
        self.colors = {
            'primary': '#FF6900',    # ING Oranje
            'secondary': '#00539F',  # Rabobank Blauw
            'tertiary': '#00A6D6',   # ABN AMRO Turquoise
            'success': '#00C300',    # Groen
            'warning': '#FFB800'     # Geel
        }
        
    def create_payment_method_analysis(self, df):
        """Visualiseer betaalmethode verdeling"""
        payment_data = df.groupby('payment_method').agg({
            'amount': 'sum',
            'transaction_id': 'count'
        }).reset_index()
        
        fig = make_subplots(
            rows=1, cols=2,
            subplot_titles=("Omzet per Betaalmethode", "Aantal Transacties"),
            specs=[[{"type": "pie"}, {"type": "bar"}]]
        )
        
        # Pie chart voor omzet
        fig.add_trace(
            go.Pie(
                labels=payment_data['payment_method'],
                values=payment_data['amount'],
                hole=0.4,
                marker_colors=[self.colors['primary'], self.colors['secondary'], 
                              self.colors['tertiary'], self.colors['success']]
            ),
            row=1, col=1
        )
        
        # Bar chart voor aantal transacties
        fig.add_trace(
            go.Bar(
                x=payment_data['payment_method'],
                y=payment_data['transaction_id'],
                marker_color=self.colors['primary']
            ),
            row=1, col=2
        )
        
        fig.update_layout(
            title="Nederlandse Betaalmethode Analyse",
            showlegend=True
        )
        
        return fig
        
    def create_regional_heatmap(self, df):
        """Maak heatmap van transacties per provincie"""
        provinces = ['Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Noord-Brabant', 
                    'Gelderland', 'Limburg', 'Overijssel', 'Flevoland', 
                    'Groningen', 'Friesland', 'Drenthe', 'Zeeland']
        
        province_data = df.groupby('province').agg({
            'amount': 'sum',
            'transaction_id': 'count'
        }).reset_index()
        
        fig = go.Figure(data=go.Heatmap(
            z=province_data['amount'],
            x=province_data['province'],
            y=['Omzet'],
            colorscale='Blues',
            text=province_data['amount'].apply(lambda x: f'€{x:,.0f}'),
            texttemplate='%{text}',
            textfont={"size": 10}
        ))
        
        fig.update_layout(
            title="Omzet Heatmap per Nederlandse Provincie",
            xaxis_title="Provincie",
            yaxis_title=""
        )
        
        return fig
\`\`\`

## 5. Real-time Monitoring Dashboard

### Live Dashboard met ChatGPT Integration
\`\`\`python
import streamlit as st
import asyncio
from datetime import datetime

class RealTimeMonitor:
    def __init__(self, openai_client):
        self.client = openai_client
        self.alert_thresholds = {
            'transaction_failure_rate': 0.05,  # 5%
            'avg_response_time': 3.0,          # 3 seconden
            'hourly_transaction_min': 100      # Minimum 100 per uur
        }
        
    async def monitor_transactions(self):
        """Monitor real-time transacties met AI alerts"""
        while True:
            metrics = await self.fetch_current_metrics()
            
            # ChatGPT analyse voor anomalie detectie
            analysis_prompt = f"""
            Analyseer de volgende real-time metrics:
            - Failure rate: {metrics['failure_rate']:.2%}
            - Gemiddelde response tijd: {metrics['avg_response_time']:.2f}s
            - Transacties laatste uur: {metrics['hourly_transactions']}
            - Top foutmeldingen: {metrics['top_errors']}
            
            Identificeer:
            1. Potentiële problemen
            2. Afwijkingen van normale patronen
            3. Aanbevelingen voor actie
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": analysis_prompt}]
            )
            
            analysis = response.choices[0].message.content
            
            # Update dashboard
            await self.update_dashboard(metrics, analysis)
            await asyncio.sleep(60)  # Update elke minuut
            
    def create_dashboard(self):
        """Streamlit dashboard voor real-time monitoring"""
        st.title("🇳🇱 Nederlandse Payment Processing Monitor")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Transacties/Uur", "1,234", "+12%")
        with col2:
            st.metric("Success Rate", "97.3%", "-0.5%")
        with col3:
            st.metric("Gem. Bedrag", "€ 47.50", "+€2.30")
        with col4:
            st.metric("Response Tijd", "1.2s", "-0.1s")
            
        # Real-time grafiek
        st.subheader("Live Transactie Flow")
        chart_placeholder = st.empty()
        
        # AI Insights
        st.subheader("🤖 AI Insights")
        insights_placeholder = st.empty()
\`\`\`

## Praktische Opdrachten

### Opdracht 1: iDEAL Data Analysis Pipeline
Bouw een complete analyse pipeline voor iDEAL transacties die:
- CSV bestanden automatisch inleest
- Dagelijkse/wekelijkse/maandelijkse trends identificeert
- Top 10 merchants analyseert
- Conversie percentages berekent
- Management dashboard genereert

### Opdracht 2: KvK Sector Analysis
Ontwikkel een tool die:
- KvK data van 100+ bedrijven ophaalt
- Bedrijven categoriseert per sector
- Groei trends identificeert
- Investeringsmogelijkheden aanbeveelt

### Opdracht 3: Real-time Payment Monitor
Implementeer een monitoring systeem dat:
- Live transactie data analyseert
- Anomalieën detecteert met AI
- Automatische alerts verstuurt
- Performance metrics bijhoudt`,
  assignments: [
    {
      id: 'assignment-5-3-1',
      title: 'iDEAL Transaction Analyzer',
      description: 'Bouw een complete iDEAL transactie analyse tool met visualisaties',
      difficulty: 'intermediate',
      estimatedTime: '120 minuten',
      points: 25
    },
    {
      id: 'assignment-5-3-2',
      title: 'KvK Data Pipeline',
      description: 'Ontwikkel een automated pipeline voor KvK data analyse',
      difficulty: 'advanced',
      estimatedTime: '180 minuten',
      points: 30
    },
    {
      id: 'assignment-5-3-3',
      title: 'Real-time Dashboard',
      description: 'Implementeer een live monitoring dashboard met AI insights',
      difficulty: 'advanced',
      estimatedTime: '240 minuten',
      points: 35
    }
  ],
  resources: [
    {
      title: 'pandas Documentation',
      url: 'https://pandas.pydata.org/docs/',
      type: 'documentation'
    },
    {
      title: 'KvK API Documentatie',
      url: 'https://developers.kvk.nl/',
      type: 'api'
    },
    {
      title: 'Plotly Visualization Guide',
      url: 'https://plotly.com/python/',
      type: 'tutorial'
    }
  ]
}