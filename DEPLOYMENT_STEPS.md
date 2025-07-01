# 🚀 Complete Deployment Guide - Stap voor Stap

## Voorbereiding

### 1. Open Terminal
Open een terminal in je project directory:
```bash
cd /Users/nielsvanderwerf/Projects/groeimetai-cursus-platform
```

### 2. Installeer gcloud CLI (als je dit nog niet hebt)
```bash
# Voor macOS met Homebrew:
brew install google-cloud-sdk

# Of download van:
# https://cloud.google.com/sdk/docs/install
```

## Stap 1: Setup GCP Project (Eenmalig)

### Run het setup script:
```bash
# Maak script uitvoerbaar (als dat nog niet is)
chmod +x scripts/setup-gcp-project.sh

# Run het script
./scripts/setup-gcp-project.sh
```

### Wat gebeurt er:
1. Je wordt gevraagd om in te loggen bij Google
2. Maak een nieuw project of gebruik bestaande
3. Script enabled alle benodigde APIs automatisch
4. Maakt placeholder secrets aan

### Mogelijke vragen:
- **"Enter your GCP Project ID"**: Kies een unieke naam zoals `groeimetai-platform-2024`
- **"Select billing account"**: Kies je billing account (nodig voor Cloud Run)

## Stap 2: Voeg je API Keys toe

### OpenAI API Key:
```bash
# Vervang sk-... met je echte OpenAI key
echo -n "sk-jouw-echte-openai-key-hier" | gcloud secrets versions add openai-api-key --data-file=-
```

### Pinecone API Key:
```bash
# Vervang met je echte Pinecone key
echo -n "jouw-pinecone-api-key-hier" | gcloud secrets versions add pinecone-api-key --data-file=-
```

### NextAuth Secret:
```bash
# Genereer een random secret
openssl rand -base64 32

# Kopieer de output en gebruik het hier:
echo -n "de-gegenereerde-secret-hier" | gcloud secrets versions add nextauth-secret --data-file=-
```

### Database URL (gebruik tijdelijk een placeholder):
```bash
echo -n "postgresql://placeholder" | gcloud secrets versions add database-url --data-file=-
```

## Stap 3: Deploy naar Cloud Run

### Run het deployment script:
```bash
# Maak uitvoerbaar
chmod +x scripts/deploy-to-gcp.sh

# Run deployment
./scripts/deploy-to-gcp.sh
```

### Kies optie 2:
```
Choose deployment method:
1. Deploy from source (Cloud Build)
2. Build locally and deploy
Enter choice (1 or 2): 2
```

### Wat gebeurt er:
1. Docker image wordt gebouwd (kan 5-10 minuten duren)
2. Image wordt geüpload naar Google Container Registry
3. Cloud Run service wordt gemaakt/geüpdatet
4. Je krijgt een URL zoals: `https://groeimetai-platform-xxxxx-ew.a.run.app`

## Stap 4: Test je Deployment

### Open de URL in je browser
Je krijgt aan het einde een URL, bijvoorbeeld:
```
Service URL: https://groeimetai-platform-xxxxx-ew.a.run.app
```

### Check de logs (optioneel):
```bash
# Bekijk live logs
gcloud run logs read --tail=50 -f
```

## Troubleshooting

### "Permission denied" error:
```bash
# Login opnieuw
gcloud auth login
gcloud config set project jouw-project-id
```

### "Billing account required":
- Ga naar https://console.cloud.google.com/billing
- Voeg een billing account toe (je krijgt $300 gratis credits!)

### Build failures:
```bash
# Check build logs
gcloud builds list
gcloud builds log [BUILD_ID]
```

### "Service not ready":
- Wacht 1-2 minuten, Cloud Run heeft tijd nodig om op te starten
- Check logs: `gcloud run logs read`

## Kosten

### Gratis tier:
- 2 miljoen requests per maand gratis
- 360.000 GB-seconden compute tijd
- 180.000 vCPU-seconden

### Verwachte kosten:
- Bij weinig traffic: €0-5 per maand
- Bij gemiddeld traffic: €10-20 per maand

## Volgende Stappen

### 1. Custom Domain (optioneel)
```bash
# Map je eigen domein
gcloud run domain-mappings create --service groeimetai-platform --domain groeimetai.nl --region europe-west4
```

### 2. Monitoring
- Ga naar: https://console.cloud.google.com/run
- Klik op je service
- Bekijk metrics, logs, en errors

### 3. Updates deployen
```bash
# Voor toekomstige updates, run gewoon:
./scripts/deploy-to-gcp.sh
```

## Belangrijke Links

- **Cloud Console**: https://console.cloud.google.com
- **Cloud Run Dashboard**: https://console.cloud.google.com/run
- **Logs Viewer**: https://console.cloud.google.com/logs
- **Billing**: https://console.cloud.google.com/billing

## Support

Als je vastloopt:
1. Check de logs: `gcloud run logs read`
2. Kijk in Cloud Console voor errors
3. De meeste issues zijn billing of permission gerelateerd

Succes! 🎉