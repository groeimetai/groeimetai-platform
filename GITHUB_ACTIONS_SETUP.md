# GitHub Actions Setup voor Cloud Run Deployment

## Stap 1: Service Account aanmaken in Google Cloud

1. Ga naar [Google Cloud Console](https://console.cloud.google.com)
2. Selecteer je project (groeimetai)
3. Ga naar IAM & Admin → Service Accounts
4. Klik op "Create Service Account"
5. Geef het een naam: `github-actions-deploy`
6. Voeg de volgende rollen toe:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin (voor Container Registry)
7. Klik op "Create Key" → JSON
8. Download de JSON key file

## Stap 2: GitHub Secrets instellen

Ga naar je GitHub repository → Settings → Secrets and variables → Actions

### 1. Google Cloud Service Account
- **GCP_SA_KEY**: Plak de complete inhoud van de JSON key file

### 2. Firebase Public Config (uit .env.production)
- **NEXT_PUBLIC_FIREBASE_API_KEY**: `AIzaSyAcVXLLoHLOlybI9FACwhC7ZV50nVOCmM0`
- **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**: `groeimetai-platform.firebaseapp.com`
- **NEXT_PUBLIC_FIREBASE_PROJECT_ID**: `groeimetai-platform`
- **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**: `groeimetai-platform.firebasestorage.app`
- **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**: `1031990594888`
- **NEXT_PUBLIC_FIREBASE_APP_ID**: `1:1031990594888:web:c707bf22aa511a101cf77d`

### 3. Blockchain Public Config
- **NEXT_PUBLIC_BLOCKCHAIN_ENABLED**: `true`
- **NEXT_PUBLIC_DEFAULT_NETWORK**: `polygon`
- **NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON**: `0x9Ef945A0Bf892f239b0927758BE1a03346efe86E`
- **NEXT_PUBLIC_PINATA_GATEWAY**: `https://gateway.pinata.cloud`

### 4. Firebase Admin SDK (uit Firebase Console → Project Settings → Service Accounts)
- **FIREBASE_PROJECT_ID**: `groeimetai-platform`
- **FIREBASE_CLIENT_EMAIL**: (uit service account JSON)
- **FIREBASE_PRIVATE_KEY**: (uit service account JSON - let op quotes!)

### 5. Overige Services
- **MOLLIE_API_KEY**: (uit Mollie dashboard)
- **OPENAI_API_KEY**: (uit OpenAI dashboard)
- **PINECONE_API_KEY**: (uit Pinecone dashboard)
- **PINECONE_ENVIRONMENT**: (bv. `us-east-1-aws`)
- **BLOCKCHAIN_PRIVATE_KEY**: (wallet private key)
- **PINATA_API_KEY**: (uit Pinata dashboard)
- **PINATA_SECRET_KEY**: (uit Pinata dashboard)
- **RESEND_API_KEY**: (uit Resend dashboard)

### 6. Optioneel
- **REDIS_URL**: (Redis connection string)
- **N8N_API_KEY**: (n8n API key)
- **N8N_WEBHOOK_URL**: (n8n webhook URL)

## Stap 3: Cloud Run voorbereiden

1. Ga naar Cloud Run in Google Cloud Console
2. Als je al een service hebt, verwijder deze of disable de GitHub trigger
3. De GitHub Action zal automatisch een nieuwe service aanmaken

## Stap 4: Deployment triggeren

1. Push naar de `main` branch, of
2. Ga naar Actions → Deploy to Cloud Run → Run workflow

## Belangrijke notities

### Firebase Private Key formatting
Bij het toevoegen van `FIREBASE_PRIVATE_KEY` als GitHub Secret:
- Kopieer de key inclusief de `-----BEGIN PRIVATE KEY-----` en `-----END PRIVATE KEY-----` delen
- Behoud alle `\n` karakters
- Plaats de hele key tussen quotes in de secret value

### Voorbeeld:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n"
```

### Debugging
Als de deployment faalt:
1. Check de GitHub Actions logs
2. Controleer of alle secrets correct zijn ingesteld
3. Verifieer dat de service account de juiste permissies heeft
4. Check Cloud Build logs in Google Cloud Console

## Volgende stappen

Na succesvolle deployment:
1. De Cloud Run URL wordt getoond in de GitHub Actions output
2. Update je custom domain settings indien nodig
3. Test alle functionaliteit