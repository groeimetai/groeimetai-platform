# 🚀 Quick Deploy Guide - GroeimetAI naar Google Cloud

## Stap 1: Installeer gcloud CLI
Als je dit nog niet hebt:
```bash
# MacOS
brew install google-cloud-sdk

# Of download van:
# https://cloud.google.com/sdk/docs/install
```

## Stap 2: Setup GCP Project (Eenmalig)
```bash
# Maak het script uitvoerbaar (al gedaan)
chmod +x scripts/setup-gcp-project.sh

# Run het setup script
./scripts/setup-gcp-project.sh
```

Dit script doet alles voor je:
- ✅ Maakt een nieuw project (of gebruikt bestaande)
- ✅ Koppelt billing account
- ✅ Enabled alle benodigde APIs
- ✅ Maakt service accounts
- ✅ Configureert Secret Manager

## Stap 3: Voeg je API Keys toe
```bash
# OpenAI API Key
echo -n "sk-your-openai-key" | gcloud secrets versions add openai-api-key --data-file=-

# Pinecone API Key
echo -n "your-pinecone-key" | gcloud secrets versions add pinecone-api-key --data-file=-

# NextAuth Secret (genereer met: openssl rand -base64 32)
echo -n "your-nextauth-secret" | gcloud secrets versions add nextauth-secret --data-file=-

# Database URL (gebruik Firebase voor nu)
echo -n "firebase://your-project" | gcloud secrets versions add database-url --data-file=-
```

## Stap 4: Deploy!
```bash
# Run deployment script
./scripts/deploy-to-gcp.sh

# Kies optie 2 (Build locally and deploy) voor eerste keer
```

## Stap 5: Test je deployment
Na deployment krijg je een URL zoals:
```
https://groeimetai-platform-abc123-ew4.a.run.app
```

Open deze in je browser!

## 🎯 Snelle Deploy (Na eerste setup)
```bash
# Voor snelle updates
gcloud run deploy groeimetai-platform \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated
```

## 💰 Kosten inschatting
- **Minimaal gebruik**: €0-10/maand
- **Gemiddeld gebruik**: €20-30/maand
- **Cloud Run**: Betaal alleen voor requests

## 🔧 Troubleshooting

### "Permission denied" errors
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### "API not enabled" errors
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Build failures
Check logs:
```bash
gcloud builds list
gcloud builds log BUILD_ID
```

## 📝 Belangrijke URLs
- **Console**: https://console.cloud.google.com
- **Cloud Run**: https://console.cloud.google.com/run
- **Logs**: https://console.cloud.google.com/logs

## ✅ Deployment Checklist
- [ ] gcloud CLI geïnstalleerd
- [ ] GCP project aangemaakt
- [ ] Billing account gekoppeld
- [ ] APIs enabled
- [ ] Secrets toegevoegd
- [ ] Eerste deployment gedaan
- [ ] Site getest

## 🎉 Klaar!
Je GroeimetAI platform draait nu op Google Cloud! 

Voor custom domain setup, zie `GCP_DEPLOYMENT_GUIDE.md`.