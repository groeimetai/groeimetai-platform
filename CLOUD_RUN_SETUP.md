# 🚀 Google Cloud Run Deployment Setup

## Vereisten

1. **Google Cloud Project** met de volgende services ingeschakeld:
   - Cloud Run API
   - Artifact Registry API
   - Cloud Build API
   - Cloud Scheduler API
   - Secret Manager API

2. **Service Account** met de volgende rollen:
   - Cloud Run Admin
   - Artifact Registry Administrator
   - Cloud Build Service Account
   - Cloud Scheduler Admin
   - Secret Manager Secret Accessor

## Setup Stappen

### 1. Maak een Artifact Registry Repository

```bash
gcloud artifacts repositories create docker-repo \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Docker repository voor GroeimetAI platform"
```

### 2. Maak Secrets in Secret Manager

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

### 3. GitHub Secrets

Voeg deze secrets toe aan je GitHub repository (Settings > Secrets and variables > Actions):

```
# Google Cloud
GCP_PROJECT_ID=your-project-id
GCP_PROJECT_NUMBER=your-project-number
GCP_SA_KEY=<service-account-json-key>

# Firebase (public keys)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Blockchain
NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON=0x... (je contract address)
BLOCKCHAIN_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Service Account JSON Key

1. Maak een service account:
```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"
```

2. Geef de juiste permissies:
```bash
PROJECT_ID=your-project-id
SERVICE_ACCOUNT=github-actions@${PROJECT_ID}.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudscheduler.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

3. Maak en download de key:
```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=${SERVICE_ACCOUNT}
```

4. Kopieer de inhoud van `key.json` naar GitHub secret `GCP_SA_KEY`

### 5. Grant Cloud Run Service Account toegang tot Secrets

```bash
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format="value(projectNumber)")
CLOUD_RUN_SA=${PROJECT_NUMBER}-compute@developer.gserviceaccount.com

# Geef toegang tot alle secrets
for secret in firebase-project-id firebase-client-email firebase-private-key mollie-api-key blockchain-private-key blockchain-webhook-secret pinata-api-key pinata-secret-api-key; do
  gcloud secrets add-iam-policy-binding ${secret} \
    --member="serviceAccount:${CLOUD_RUN_SA}" \
    --role="roles/secretmanager.secretAccessor"
done
```

## Deployment

### Automatisch (via GitHub Actions)

Push naar de `main` branch:
```bash
git add .
git commit -m "Deploy to Cloud Run"
git push origin main
```

### Handmatig (lokaal)

```bash
# Authenticeer
gcloud auth login
gcloud config set project your-project-id

# Build en push
docker build -t europe-west1-docker.pkg.dev/your-project-id/docker-repo/groeimetai-platform:latest .
docker push europe-west1-docker.pkg.dev/your-project-id/docker-repo/groeimetai-platform:latest

# Deploy
gcloud run deploy groeimetai-platform \
  --image=europe-west1-docker.pkg.dev/your-project-id/docker-repo/groeimetai-platform:latest \
  --region=europe-west1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --min-instances=1 \
  --max-instances=10 \
  --memory=2Gi \
  --cpu=2
```

## Monitoring

### Logs bekijken
```bash
gcloud run services logs read groeimetai-platform --region=europe-west1
```

### Cloud Scheduler status
```bash
gcloud scheduler jobs list --location=europe-west1
```

### Metrics
Ga naar: https://console.cloud.google.com/run

## Kosten Schatting

- **Cloud Run**: ~€50-100/maand (afhankelijk van traffic)
- **Artifact Registry**: ~€0.10/GB/maand
- **Cloud Scheduler**: Gratis (voor < 3 jobs)
- **Secret Manager**: Gratis (voor < 10,000 operations/maand)

## Troubleshooting

### "Permission denied" errors
- Check dat alle IAM roles correct zijn toegewezen
- Verifieer dat secrets toegankelijk zijn

### Build failures
- Check de Docker build logs in GitHub Actions
- Verhoog memory/timeout indien nodig

### 502 Bad Gateway
- Check Cloud Run logs
- Verifieer dat PORT=8080 is ingesteld
- Check dat de app luistert op 0.0.0.0:8080

### Blockchain queue processing
- Verifieer dat Cloud Scheduler job actief is
- Check webhook secret in environment variables
- Monitor via admin dashboard: https://your-url/admin/blockchain