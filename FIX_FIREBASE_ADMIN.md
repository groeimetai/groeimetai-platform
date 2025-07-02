# 🚨 Firebase Admin Fix - Wat je NU moet doen

## Het probleem
Je ziet "Firebase Admin not initialized" omdat de environment variables niet zijn ingesteld.

## Snelle oplossing (2 minuten)

### Optie 1: Automatisch (aanbevolen)
```bash
# 1. Download je service account key van Firebase Console
# 2. Run dit commando:
node scripts/setup-firebase-admin.js ~/Downloads/[jouw-firebase-key].json

# 3. Herstart je development server:
npm run dev
```

### Optie 2: Handmatig
Voeg deze regels toe aan je `.env.local` bestand:
```
FIREBASE_PROJECT_ID="groeimetai-platform" 
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@groeimetai-platform.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[jouw private key]\n-----END PRIVATE KEY-----\n"
```

## Test of het werkt
```bash
node scripts/test-firebase-admin.js
```

## Voor Google Cloud Run
Zelfde environment variables toevoegen in Cloud Run settings:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Belangrijke info
- De certificate verification pagina werkt ook zonder Firebase Admin (gebruikt dan client-side verification)
- Maar met Firebase Admin is het veiliger en betrouwbaarder
- Je service account key NOOIT committen naar git!

## Nog vragen?
Check `SETUP_FIREBASE_ADMIN.md` voor meer details.