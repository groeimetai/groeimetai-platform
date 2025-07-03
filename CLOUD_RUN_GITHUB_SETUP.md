# 🚀 Google Cloud Run Continuous Deployment vanaf GitHub

Deze setup gebruikt Cloud Run's ingebouwde continuous deployment functie die direct integreert met GitHub.

## Voordelen van deze aanpak
- ✅ Geen GitHub Actions nodig
- ✅ Automatische builds via Cloud Build
- ✅ Direct vanuit GCP Console te beheren
- ✅ Automatische rollbacks mogelijk
- ✅ Eenvoudiger secrets management

## Stap 1: Voorbereidingen in GCP

### 1.1 Enable APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudscheduler.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 1.2 Maak Artifact Registry (optioneel - Cloud Build doet dit automatisch)
```bash
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Automatic Cloud Run deployments"
```

### 1.3 Maak Secrets in Secret Manager
```bash
# Firebase Admin
echo -n "your-firebase-project-id" | gcloud secrets create firebase-project-id --data-file=-
echo -n "your-firebase-client-email" | gcloud secrets create firebase-client-email --data-file=-
echo -n "your-firebase-private-key" | gcloud secrets create firebase-private-key --data-file=-

# Mollie
echo -n "your-mollie-api-key" | gcloud secrets create mollie-api-key --data-file=-

# Blockchain
echo -n "your-blockchain-private-key" | gcloud secrets create blockchain-private-key --data-file=-
echo -n "your-webhook-secret" | gcloud secrets create blockchain-webhook-secret --data-file=-

# Pinata IPFS
echo -n "your-pinata-api-key" | gcloud secrets create pinata-api-key --data-file=-
echo -n "your-pinata-secret-key" | gcloud secrets create pinata-secret-api-key --data-file=-
```

## Stap 2: Cloud Run Service aanmaken via Console

### ⚠️ BELANGRIJK: Build Substitutions vs Environment Variables

**Build Substitutions** (in Cloud Build trigger) zijn voor **build-time** variabelen:
- Worden gebruikt tijdens `docker build` en `npm run build`
- Alle `NEXT_PUBLIC_*` variabelen moeten hier
- Firebase configuratie moet hier voor de build

**Environment Variables** (in Cloud Run service) zijn voor **runtime** variabelen:
- Worden gebruikt wanneer de app draait
- Server-only secrets zoals `FIREBASE_PRIVATE_KEY`
- Database URLs, API keys, etc.

### Stappen:

1. **Ga naar Cloud Run Console**
   ```
   https://console.cloud.google.com/run
   ```

2. **Klik "CREATE SERVICE"**

3. **Selecteer "Continuously deploy from a repository"**
   - Klik "SET UP WITH CLOUD BUILD"

4. **Configureer Source Repository**
   - Provider: GitHub
   - Klik "Authenticate" en geef toegang tot je GitHub
   - Repository: Selecteer `groeimetai/groeimetai-platform`
   - Branch: `main`
   - Build Type: **Dockerfile (with optional cloudbuild.yaml)**
   - Source location: `/` (root directory)
   
   **BELANGRIJK - Dit moet je ZEKER doen!**
   
   Klik op "SHOW ADVANCED SETTINGS" en scroll naar "Substitution variables".
   
   **Voeg deze variabelen EXACT zo toe (met underscore _ prefix):**
   
   | Variable name | Variable value |
   |--------------|----------------|
   | `_NEXT_PUBLIC_FIREBASE_API_KEY` | `your-firebase-api-key` |
   | `_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-auth-domain.firebaseapp.com` |
   | `_NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` |
   | `_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-bucket.appspot.com` |
   | `_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `your-sender-id` |
   | `_NEXT_PUBLIC_FIREBASE_APP_ID` | `your-app-id` |
   | `_NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON` | `0x9Ef945A0Bf892f239b0927758BE1a03346efe86E` |
   
   ⚠️ **NIET in Environment Variables van Cloud Run zetten, maar in Build Substitutions!**

5. **Service configuratie**
   - Service name: `groeimetai-platform`
   - Region: `europe-west1`
   - CPU allocation: "CPU is always allocated"
   - Minimum instances: 1
   - Maximum instances: 10

6. **Container configuratie (klik "CONTAINER, VARIABLES & SECRETS, CONNECTIONS, SECURITY")**
   
   **Container:**
   - Memory: 2 GiB
   - CPU: 2
   - Request timeout: 300
   - Maximum concurrent requests: 100
   - Container port: 8080

   **Environment Variables:**
   ```
   NODE_ENV = production
   NEXT_PUBLIC_BLOCKCHAIN_ENABLED = true
   NEXT_PUBLIC_DEFAULT_NETWORK = polygon
   NEXT_PUBLIC_PINATA_GATEWAY = https://gateway.pinata.cloud
   ```

   **Plus alle NEXT_PUBLIC Firebase variabelen:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY = your-value
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-value
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-value
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-value
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your-value
   NEXT_PUBLIC_FIREBASE_APP_ID = your-value
   NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON = 0x... (je contract address)
   ```

   **Secrets (klik "ADD SECRET REFERENCE"):**
   Map elke secret naar een environment variable:
   - FIREBASE_PROJECT_ID → firebase-project-id:latest
   - FIREBASE_CLIENT_EMAIL → firebase-client-email:latest
   - FIREBASE_PRIVATE_KEY → firebase-private-key:latest
   - MOLLIE_API_KEY → mollie-api-key:latest
   - PRIVATE_KEY → blockchain-private-key:latest
   - BLOCKCHAIN_WEBHOOK_SECRET → blockchain-webhook-secret:latest
   - PINATA_API_KEY → pinata-api-key:latest
   - PINATA_SECRET_API_KEY → pinata-secret-api-key:latest

7. **Security**
   - Authentication: "Allow unauthenticated invocations"
   
8. **Klik "CREATE"**

## Stap 3: Wacht op eerste deployment

Cloud Run zal nu:
1. Een webhook in je GitHub repo installeren
2. Bij elke push naar `main` automatisch deployen
3. Docker image bouwen met Cloud Build
4. Deploy naar Cloud Run

## Stap 4: Cloud Scheduler voor Blockchain Queue

Na succesvolle deployment, stel de scheduler in:

```bash
# Verkrijg de service URL
SERVICE_URL=$(gcloud run services describe groeimetai-platform \
  --region=europe-west1 \
  --format='value(status.url)')

# Maak scheduler job
gcloud scheduler jobs create http blockchain-queue-processor \
  --location=europe-west1 \
  --schedule="*/5 * * * *" \
  --uri="${SERVICE_URL}/api/blockchain/process-queue" \
  --http-method=POST \
  --headers="Authorization=Bearer YOUR_WEBHOOK_SECRET" \
  --attempt-deadline=300s
```

## Stap 5: Update NEXT_PUBLIC_APP_URL

Na deployment, update de APP_URL:

```bash
# In Cloud Run Console, ga naar je service
# Kopieer de URL (bijv: https://groeimetai-platform-xxx-ew.a.run.app)
# Update de environment variable NEXT_PUBLIC_APP_URL met deze URL
# Klik "EDIT & DEPLOY NEW REVISION"
```

## Monitoring

### Build History
```
https://console.cloud.google.com/cloud-build/builds
```

### Service Logs
```bash
gcloud run services logs read groeimetai-platform --region=europe-west1
```

### Metrics
```
https://console.cloud.google.com/run/detail/europe-west1/groeimetai-platform/metrics
```

## Rollback

Als er iets mis gaat:
1. Ga naar Cloud Run Console
2. Selecteer je service
3. Ga naar "REVISIONS" tab
4. Klik "MANAGE TRAFFIC"
5. Route 100% traffic naar een werkende revision

## Kosten

- **Cloud Build**: ~€0.003 per build minute (eerste 120 min/maand gratis)
- **Cloud Run**: ~€50-100/maand voor deze configuratie
- **Secret Manager**: Gratis voor basis gebruik
- **Cloud Scheduler**: Gratis voor < 3 jobs

## Troubleshooting

### Build failures
- Check Cloud Build logs in Console
- Vaak door missing dependencies of verkeerde Node version

### Container start failures
- Check dat PORT=8080 correct is
- Verifieer dat alle environment variables zijn ingesteld

### Secrets not working
- Check IAM permissions voor Cloud Run service account
- Verifieer secret namen exact overeenkomen

### High latency
- Verhoog minimum instances
- Check memory/CPU limits