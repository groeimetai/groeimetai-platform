# 🔧 Quick Fix - Setup Hangt

## Stop het huidige script:
Druk **Ctrl+C** in je terminal

## Optie 1: Manual Setup (Snelste)

### 1. Check of je ingelogd bent:
```bash
gcloud auth list
```

Als je niet ingelogd bent:
```bash
gcloud auth login
```

### 2. Maak project handmatig:
```bash
# Gebruik het project ID dat je net had ingetypt
gcloud projects create groeimetai-platform --name="GroeimetAI Platform"
```

Als het project al bestaat, gebruik het gewoon:
```bash
gcloud config set project groeimetai-platform
```

### 3. Link billing account:
```bash
# List je billing accounts
gcloud billing accounts list

# Link billing (vervang BILLING_ACCOUNT_ID)
gcloud billing projects link groeimetai-platform --billing-account=BILLING_ACCOUNT_ID
```

### 4. Enable APIs handmatig:
```bash
# Enable alle benodigde APIs in één keer
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com
```

### 5. Maak secrets:
```bash
# Maak lege secrets die je later kunt vullen
echo "PLACEHOLDER" | gcloud secrets create openai-api-key --data-file=-
echo "PLACEHOLDER" | gcloud secrets create pinecone-api-key --data-file=-
echo "PLACEHOLDER" | gcloud secrets create nextauth-secret --data-file=-
echo "PLACEHOLDER" | gcloud secrets create database-url --data-file=-
```

## Optie 2: Debug het script

### Check wat er mis gaat:
```bash
# Run met debug mode
bash -x ./scripts/setup-gcp-project.sh
```

### Of test individuele commands:
```bash
# Test of gcloud werkt
gcloud version

# Test project list
gcloud projects list

# Test of je project bestaat
gcloud projects describe groeimetai-platform
```

## Optie 3: Skip setup, ga direct naar deployment

Als je al een Google Cloud project hebt:
```bash
# Set je project
gcloud config set project JOUW-PROJECT-ID

# Enable Cloud Run API (minimaal nodig)
gcloud services enable run.googleapis.com

# Deploy direct
gcloud run deploy groeimetai-platform \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated
```

## Meest voorkomende oorzaken:

1. **Geen billing account** - Je moet eerst billing setup doen
2. **Project bestaat al** - Gebruik het bestaande project
3. **Authenticatie issues** - Login opnieuw met `gcloud auth login`
4. **Netwerk problemen** - Check je internet connectie

Welke optie wil je proberen?