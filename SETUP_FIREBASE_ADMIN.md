# Firebase Admin Setup Guide

## Het probleem
Firebase Admin is niet geïnitialiseerd omdat de environment variables ontbreken. Dit is nodig voor server-side certificate verification.

## Stap 1: Service Account Key Downloaden

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Selecteer je GroeiMetAI project
3. Klik op het tandwiel ⚙️ → "Project Settings"
4. Ga naar het "Service accounts" tabje
5. Klik op "Generate new private key"
6. Download het JSON bestand (bewaar dit veilig!)

## Stap 2: Environment Variables Instellen

### Voor lokale development:

Maak een `.env.local` bestand in de root van je project:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID="jouw-project-id"
FIREBASE_CLIENT_EMAIL="jouw-service-account-email"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Voor Google Cloud Run:

1. Ga naar [Google Cloud Console](https://console.cloud.google.com)
2. Selecteer je project
3. Ga naar Cloud Run → je service → "Edit & Deploy New Revision"
4. Onder "Variables & Secrets" → "ADD VARIABLE"
5. Voeg de drie variables toe

## Stap 3: Automatisch Setup Script

Ik heb een script gemaakt dat dit voor je doet:

```bash
node scripts/setup-firebase-admin.js path/to/your-service-account-key.json
```

Dit script:
- Leest je service account JSON
- Maakt een `.env.local` bestand
- Toont instructies voor Cloud Run

## Alternatief: Client-Side Verification

Als je Firebase Admin niet wilt/kunt gebruiken, werkt de client-side verification ook:
- De verify page detecteert automatisch of Admin beschikbaar is
- Als niet, gebruikt het client-side verification
- Dit werkt prima voor de meeste use cases

## Test of het werkt

Na setup, start je server opnieuw:
```bash
npm run dev
```

Check de logs voor:
```
Firebase Admin initialized successfully
```

Of test een certificate URL:
```
http://localhost:3000/certificate/verify/[CERTIFICATE_ID]
```