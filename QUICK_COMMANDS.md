# 🎯 Quick Commands - Copy & Paste

## Complete deployment in 10 minuten:

### 1️⃣ Setup (eenmalig)
```bash
# Navigate naar project
cd /Users/nielsvanderwerf/Projects/groeimetai-cursus-platform

# Run setup
chmod +x scripts/setup-gcp-project.sh
./scripts/setup-gcp-project.sh
```

### 2️⃣ API Keys toevoegen
```bash
# OpenAI (vervang sk-... met je key)
echo -n "sk-JOUW_OPENAI_KEY" | gcloud secrets versions add openai-api-key --data-file=-

# Pinecone (vervang met je key)
echo -n "JOUW_PINECONE_KEY" | gcloud secrets versions add pinecone-api-key --data-file=-

# Generate & add NextAuth secret
echo -n "$(openssl rand -base64 32)" | gcloud secrets versions add nextauth-secret --data-file=-

# Database URL (placeholder)
echo -n "postgresql://placeholder" | gcloud secrets versions add database-url --data-file=-
```

### 3️⃣ Deploy!
```bash
# Run deployment
chmod +x scripts/deploy-to-gcp.sh
./scripts/deploy-to-gcp.sh

# Kies optie: 2
```

### 4️⃣ Check status
```bash
# Bekijk logs
gcloud run logs read --tail=50

# Get service URL
gcloud run services describe groeimetai-platform --region europe-west4 --format 'value(status.url)'
```

## Snelle Updates (na eerste deployment)

### Deploy nieuwe versie:
```bash
./scripts/deploy-to-gcp.sh
# Kies optie 2
```

### Direct vanaf source (sneller):
```bash
gcloud run deploy groeimetai-platform \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated
```

## Handig om te weten:

### Check welk project actief is:
```bash
gcloud config get-value project
```

### Switch naar je project:
```bash
gcloud config set project groeimetai-platform-2024
```

### Zie alle services:
```bash
gcloud run services list
```

### Delete service (om opnieuw te beginnen):
```bash
gcloud run services delete groeimetai-platform --region europe-west4
```

## Tips:
- 🎯 De eerste deployment duurt 10-15 minuten
- 🚀 Updates duren meestal 3-5 minuten
- 💰 Monitor je kosten: https://console.cloud.google.com/billing
- 📊 Check metrics: https://console.cloud.google.com/run