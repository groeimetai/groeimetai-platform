import type { Lesson } from '@/lib/data/courses'
export const lesson2_4: Lesson = {
  id: 'lesson-2-4',
  title: 'Statistische analyse en machine learning',
  duration: '90 minuten',
  content: `# Statistische analyse en Machine Learning met ChatGPT

## Van beschrijvende naar voorspellende analyse

ChatGPT Advanced Data Analysis kan complexe statistische analyses en machine learning modellen uitvoeren zonder dat je zelf hoeft te programmeren.

## Statistische analyses

### 1. Beschrijvende statistiek
\`\`\`
"Geef me een volledig statistisch overzicht van mijn verkoopdata:
- Centrale tendensen (gemiddelde, mediaan, modus)
- Spreiding (standaarddeviatie, range, kwartielen)
- Scheefheid en kurtosis
- Identificeer en analyseer outliers"
\`\`\`

### 2. Hypothesis testing
\`\`\`
"Test of er een significant verschil is in verkopen tussen:
- Weekdagen vs weekend
- Voor en na de marketingcampagne
- Tussen verschillende regio's
Gebruik een 95% betrouwbaarheidsinterval"
\`\`\`

### 3. Correlatie analyse
\`\`\`
"Analyseer correlaties tussen alle variabelen:
- Maak een correlatiematrix
- Identificeer sterke correlaties (>0.7)
- Test op multicollineariteit
- Visualiseer met een heatmap"
\`\`\`

### 4. Regressie analyse
\`\`\`
"Bouw een regressiemodel om omzet te voorspellen:
- Gebruik prijs, marketing budget, en seizoen als predictors
- Toon R-squared en significantie van elke variabele
- Check assumpties (normaliteit, homoscedasticiteit)
- Maak residual plots"
\`\`\`

## Time Series analyse

### Trend en seizoensanalyse
\`\`\`
"Analyseer de verkoop tijdreeks:
1. Decomponeer in trend, seizoen, en random componenten
2. Identificeer seizoenspatronen (maandelijks, kwartaal)
3. Test voor stationariteit
4. Maak een forecast voor de komende 6 maanden"
\`\`\`

### Geavanceerde time series modellen
- **ARIMA**: "Pas ARIMA toe en selecteer automatisch de beste parameters"
- **Prophet**: "Gebruik Facebook Prophet voor forecasting met holidays"
- **Exponential Smoothing**: "Vergelijk verschillende smoothing methodes"

## Machine Learning toepassingen

### 1. Classificatie
\`\`\`
"Voorspel of een klant zal churnen:
- Gebruik klantgedrag data van de afgelopen 12 maanden
- Train verschillende modellen (logistic regression, decision tree, random forest)
- Vergelijk performance met confusion matrix
- Identificeer belangrijkste features"
\`\`\`

### 2. Clustering
\`\`\`
"Segmenteer klanten in groepen:
- Gebruik K-means clustering
- Bepaal optimaal aantal clusters met elbow method
- Karakteriseer elke cluster
- Visualiseer met PCA"
\`\`\`

### 3. Anomalie detectie
\`\`\`
"Identificeer abnormale transacties:
- Train een isolation forest model
- Markeer transacties met anomalie scores
- Analyseer gemeenschappelijke kenmerken van anomalieën
- Maak een alert systeem"
\`\`\`

## Predictive modeling workflow

### Complete ML pipeline
\`\`\`
"Bouw een volledig voorspellingsmodel voor verkoop:

1. Data voorbereiding
   - Handle missing values
   - Feature engineering (lag features, rolling averages)
   - Encode categorische variabelen
   
2. Model training
   - Split data 80/20
   - Train meerdere modellen
   - Cross-validation
   
3. Model evaluatie
   - Compare metrics (RMSE, MAE, R²)
   - Feature importance
   - Learning curves
   
4. Predictions
   - Voorspel komende maand
   - Confidence intervals
   - Scenario analyse"
\`\`\`

## A/B Testing analyse

### Experiment evaluatie
\`\`\`
"Analyseer A/B test resultaten:
- Test: nieuwe homepage vs oude homepage
- Metrics: conversie rate, average order value
- Bepaal statistische significantie
- Bereken confidence intervals
- Aanbeveling: welke versie winnen?"
\`\`\`

## Business Intelligence toepassingen

### Customer Lifetime Value
\`\`\`
"Bereken CLV voor verschillende klantsegmenten:
- Gebruik historische aankoopdata
- Voorspel toekomstige aankopen
- Segment op basis van CLV
- Identificeer high-value klanten"
\`\`\`

### Churn prediction
\`\`\`
"Bouw een churn prediction model:
- Features: gebruiksfrequentie, laatste activiteit, support tickets
- Train classificatiemodel
- Genereer churn probability scores
- Stel retention acties voor"
\`\`\``,
  codeExamples: [
    {
      id: 'example-4-1',
      title: 'ChatGPT genereert: Complete statistische analyse',
      language: 'python',
      code: `# ChatGPT voert automatisch statistische analyses uit
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler

# Beschrijvende statistieken
def comprehensive_stats(df, target_col):
    """Genereer uitgebreide statistische analyse"""
    
    print("=== BESCHRIJVENDE STATISTIEKEN ===")
    print(f"\\nBasis statistieken voor {target_col}:")
    print(df[target_col].describe())
    
    # Extra statistieken
    print(f"\\nSkewness: {df[target_col].skew():.3f}")
    print(f"Kurtosis: {df[target_col].kurtosis():.3f}")
    print(f"Variatiecoëfficiënt: {df[target_col].std() / df[target_col].mean():.3f}")
    
    # Outlier detectie met IQR methode
    Q1 = df[target_col].quantile(0.25)
    Q3 = df[target_col].quantile(0.75)
    IQR = Q3 - Q1
    outliers = df[(df[target_col] < Q1 - 1.5*IQR) | (df[target_col] > Q3 + 1.5*IQR)]
    print(f"\\nAantal outliers: {len(outliers)} ({len(outliers)/len(df)*100:.1f}%)")
    
    # Normaliteit test
    stat, p_value = stats.shapiro(df[target_col].dropna())
    print(f"\\nShapiro-Wilk test voor normaliteit:")
    print(f"Statistic: {stat:.4f}, p-value: {p_value:.4f}")
    if p_value > 0.05:
        print("Data lijkt normaal verdeeld (p > 0.05)")
    else:
        print("Data is niet normaal verdeeld (p < 0.05)")
    
    # Visualisaties
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    # Histogram met normale verdeling overlay
    axes[0,0].hist(df[target_col], bins=30, density=True, alpha=0.7, edgecolor='black')
    xmin, xmax = axes[0,0].get_xlim()
    x = np.linspace(xmin, xmax, 100)
    p = stats.norm.pdf(x, df[target_col].mean(), df[target_col].std())
    axes[0,0].plot(x, p, 'r-', linewidth=2, label='Normale verdeling')
    axes[0,0].set_title(f'Histogram van {target_col}')
    axes[0,0].legend()
    
    # Box plot
    axes[0,1].boxplot(df[target_col].dropna())
    axes[0,1].set_title(f'Box Plot van {target_col}')
    
    # Q-Q plot
    stats.probplot(df[target_col].dropna(), dist="norm", plot=axes[1,0])
    axes[1,0].set_title('Q-Q Plot')
    
    # Violin plot met kwartiel lijnen
    parts = axes[1,1].violinplot(df[target_col].dropna(), showmeans=True, showmedians=True)
    axes[1,1].set_title(f'Violin Plot van {target_col}')
    
    plt.tight_layout()
    return fig

# Uitvoeren van de analyse
stats_fig = comprehensive_stats(df, 'Omzet')
plt.show()

# Hypothese testing
print("\\n=== HYPOTHESE TESTING ===")

# T-test voor twee groepen
groep1 = df[df['Regio'] == 'Noord']['Omzet']
groep2 = df[df['Regio'] == 'Zuid']['Omzet']

# Check voor gelijke varianties
stat, p_value = stats.levene(groep1, groep2)
print(f"\\nLevene's test voor gelijke varianties: p={p_value:.4f}")

# Kies juiste t-test
if p_value > 0.05:
    stat, p_value = stats.ttest_ind(groep1, groep2)
    test_type = "Student's t-test"
else:
    stat, p_value = stats.ttest_ind(groep1, groep2, equal_var=False)
    test_type = "Welch's t-test"

print(f"\\n{test_type} resultaten:")
print(f"t-statistic: {stat:.4f}, p-value: {p_value:.4f}")
print(f"Gemiddelde Noord: €{groep1.mean():.2f}")
print(f"Gemiddelde Zuid: €{groep2.mean():.2f}")

if p_value < 0.05:
    print("Significant verschil gevonden tussen regio's (p < 0.05)")
else:
    print("Geen significant verschil tussen regio's (p > 0.05)")`,
      explanation: 'ChatGPT voert automatisch uitgebreide statistische analyses uit inclusief normaliteitstests en visualisaties'
    },
    {
      id: 'example-4-2',
      title: 'ChatGPT genereert: Machine Learning pipeline',
      language: 'python',
      code: `# ChatGPT bouwt complete ML pipeline automatisch
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

# 1. Data Voorbereiding
print("=== DATA VOORBEREIDING ===")

# Feature engineering
df['Maand'] = df['Datum'].dt.month
df['Kwartaal'] = df['Datum'].dt.quarter
df['DagVanWeek'] = df['Datum'].dt.dayofweek
df['IsWeekend'] = (df['DagVanWeek'] >= 5).astype(int)

# Lag features voor time series
df['Omzet_Lag1'] = df['Omzet'].shift(1)
df['Omzet_Lag7'] = df['Omzet'].shift(7)
df['Omzet_RollingMean7'] = df['Omzet'].rolling(window=7).mean()

# Verwijder NaN waarden door lag features
df = df.dropna()

# Selecteer features en target
feature_columns = ['Prijs', 'Marketing_Budget', 'Maand', 'Kwartaal', 
                  'DagVanWeek', 'IsWeekend', 'Omzet_Lag1', 'Omzet_Lag7', 
                  'Omzet_RollingMean7']
X = df[feature_columns]
y = df['Omzet']

print(f"Features: {feature_columns}")
print(f"Dataset grootte: {X.shape}")

# 2. Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=False  # shuffle=False voor time series
)

# Schaal features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Model Training
print("\\n=== MODEL TRAINING ===")

models = {
    'Linear Regression': LinearRegression(),
    'Ridge Regression': Ridge(alpha=1.0),
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
}

results = {}

for name, model in models.items():
    # Train model
    model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = model.predict(X_test_scaled)
    
    # Metrics
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, 
                               scoring='neg_mean_squared_error')
    cv_rmse = np.sqrt(-cv_scores.mean())
    
    results[name] = {
        'RMSE': rmse,
        'MAE': mae,
        'R²': r2,
        'CV_RMSE': cv_rmse,
        'Model': model
    }
    
    print(f"\\n{name}:")
    print(f"  RMSE: €{rmse:,.2f}")
    print(f"  MAE: €{mae:,.2f}")
    print(f"  R²: {r2:.4f}")
    print(f"  CV RMSE: €{cv_rmse:,.2f}")

# 4. Best Model Selection
best_model_name = min(results, key=lambda x: results[x]['RMSE'])
best_model = results[best_model_name]['Model']
print(f"\\n*** Beste model: {best_model_name} ***")

# 5. Feature Importance (voor tree-based models)
if hasattr(best_model, 'feature_importances_'):
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    plt.figure(figsize=(10, 6))
    plt.barh(feature_importance['feature'], feature_importance['importance'])
    plt.xlabel('Importance')
    plt.title(f'Feature Importance - {best_model_name}')
    plt.tight_layout()
    plt.show()
    
    print("\\nTop 5 belangrijkste features:")
    print(feature_importance.head())

# 6. Voorspellingen visualiseren
plt.figure(figsize=(12, 6))
plt.plot(y_test.index, y_test.values, label='Werkelijke Omzet', linewidth=2)
plt.plot(y_test.index, results[best_model_name]['Model'].predict(X_test_scaled), 
         label=f'Voorspeld ({best_model_name})', linewidth=2, linestyle='--')
plt.xlabel('Datum')
plt.ylabel('Omzet (€)')
plt.title('Werkelijke vs Voorspelde Omzet')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# 7. Residual Analysis
residuals = y_test - results[best_model_name]['Model'].predict(X_test_scaled)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Residual plot
axes[0].scatter(results[best_model_name]['Model'].predict(X_test_scaled), residuals, alpha=0.6)
axes[0].axhline(y=0, color='r', linestyle='--')
axes[0].set_xlabel('Voorspelde Waarden')
axes[0].set_ylabel('Residuals')
axes[0].set_title('Residual Plot')

# Residual distribution
axes[1].hist(residuals, bins=30, edgecolor='black')
axes[1].set_xlabel('Residuals')
axes[1].set_ylabel('Frequentie')
axes[1].set_title('Residual Distribution')

plt.tight_layout()
plt.show()`,
      explanation: 'ChatGPT bouwt automatisch een complete machine learning pipeline met feature engineering, model selectie, en evaluatie'
    }
  ],
  assignments: [
    {
      id: 'assignment-4-1',
      title: 'Sales Forecasting Model',
      description: 'Bouw een voorspellingsmodel voor de komende 3 maanden verkoop met seizoenspatronen en externe factoren',
      difficulty: 'hard',
      type: 'project',
      hints: [
        'Gebruik time series decomposition eerst',
        'Voeg externe features toe zoals feestdagen',
        'Test verschillende modellen (ARIMA, Prophet, ML)',
        'Maak confidence intervals voor je voorspellingen'
      ]
    },
    {
      id: 'assignment-4-2',
      title: 'Customer Segmentation Analysis',
      description: 'Gebruik clustering om klanten te segmenteren en karakteriseer elke groep voor targeted marketing',
      difficulty: 'medium',
      type: 'project',
      hints: [
        'Begin met RFM (Recency, Frequency, Monetary) analyse',
        'Probeer verschillende clustering algoritmes',
        'Valideer het optimale aantal clusters',
        'Maak actionable insights per segment'
      ]
    }
  ],
  resources: [
    {
      title: 'Introduction to Statistical Learning',
      url: 'https://www.statlearning.com/',
      type: 'book'
    },
    {
      title: 'Google Colab - Free Python Environment',
      url: 'https://colab.research.google.com/',
      type: 'tool'
    },
    {
      title: 'Towards Data Science - ML Tutorials',
      url: 'https://towardsdatascience.com/',
      type: 'tutorials'
    }
  ]
};