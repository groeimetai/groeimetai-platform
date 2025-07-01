# 🚀 Google Cloud Platform Deployment Guide

## Deployment Strategy

Na analyse van jullie setup beveel ik **Google Cloud Run** aan omdat:
- ✅ Je hebt al een werkende Docker configuratie
- ✅ Automatisch schalen (scale to zero = kostenbesparend)
- ✅ Serverless (geen server management)
- ✅ Perfect voor Next.js applicaties
- ✅ Ingebouwde SSL/HTTPS
- ✅ Betaal alleen voor gebruik

## Voorbereidingen

### 1. GCP Project Setup
```bash
# Installeer gcloud CLI als je dat nog niet hebt
# Download van: https://cloud.google.com/sdk/docs/install

# Login en selecteer project
gcloud auth login
gcloud config set project groeimetai-platform

# Enable benodigde APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### 2. Environment Variables naar Secret Manager
```bash
# Maak secrets aan voor je API keys
gcloud secrets create openai-api-key --data-file=-
gcloud secrets create pinecone-api-key --data-file=-
gcloud secrets create nextauth-secret --data-file=-
```

## Deployment Opties

### Optie 1: Direct vanuit lokaal (Quick Start)
```bash
# Build en deploy direct naar Cloud Run
gcloud run deploy groeimetai-platform \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated \
  --port 3000
```

### Optie 2: Via Cloud Build (Aanbevolen voor productie)
We gaan een cloudbuild.yaml maken voor automatische builds.

### Optie 3: Gebruik bestaande Docker image
```bash
# Build Docker image lokaal
docker build -t gcr.io/groeimetai-platform/app:latest .

# Push naar Google Container Registry
docker push gcr.io/groeimetai-platform/app:latest

# Deploy naar Cloud Run
gcloud run deploy groeimetai-platform \
  --image gcr.io/groeimetai-platform/app:latest \
  --region europe-west4 \
  --allow-unauthenticated
```

## Services Architectuur

### 1. **Cloud Run** - Hoofdapplicatie
- Next.js applicatie
- Auto-scaling
- HTTPS endpoint

### 2. **Cloud SQL** - Database (Optioneel)
Als je van SQLite/lokale DB naar productie wilt:
```bash
gcloud sql instances create groeimetai-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=europe-west4
```

### 3. **Memorystore** - Redis (Optioneel)
Voor caching en sessions:
```bash
gcloud redis instances create groeimetai-cache \
  --size=1 \
  --region=europe-west4 \
  --redis-version=redis_6_x
```

### 4. **Firebase** - Blijf gebruiken
- Firestore voor data
- Authentication
- Cloud Functions

## Geschatte Kosten

### Minimale Setup (Cloud Run only)
- **Cloud Run**: ~€0-10/maand (bij weinig traffic)
- **Firebase**: Gratis tier waarschijnlijk voldoende
- **Totaal**: ~€10/maand

### Volledige Setup
- **Cloud Run**: ~€10-30/maand
- **Cloud SQL**: ~€10/maand (db-f1-micro)
- **Memorystore**: ~€35/maand (1GB)
- **Load Balancer**: ~€20/maand
- **Totaal**: ~€75-95/maand

## Volgende Stappen

1. **Kies deployment strategie**
2. **Maak GCP project aan**
3. **Configureer secrets**
4. **Deploy eerste versie**
5. **Test functionaliteit**
6. **Configureer custom domain**

Wil je dat ik begin met het maken van de deployment configuratie files?