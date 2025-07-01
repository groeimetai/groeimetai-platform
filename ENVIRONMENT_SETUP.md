# Environment Setup voor GroeimetAI Platform

## Probleem Opgelost ✅

De errors die je zag waren:
1. **Firebase Admin SDK error**: Environment variabelen werden niet goed gelezen
2. **CourseService import error**: `courseService` was niet correct geëxporteerd

## Oplossing

### 1. Firebase Admin SDK Configuratie
- Nieuw bestand: `/src/lib/firebase-admin.ts` met gedeelde Firebase Admin configuratie
- Alle API routes gebruiken nu `adminDb` en `adminAuth` imports
- Betere error handling voor environment variabelen

### 2. CourseService Export Fix
- Toegevoegd: `getAllCourses()` method met fallback naar statische data
- Export singleton `courseService` instance voor compatibility
- Hybride approach: Firebase data met fallback naar lokale course data

## Environment Variabelen Instellen

### 1. Kopieer example file
```bash
cp .env.local.example .env.local
```

### 2. Vul de volgende variabelen in:

#### Firebase Admin SDK (Voor API endpoints)
```bash
FIREBASE_PROJECT_ID=je-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@je-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nJE_PRIVATE_KEY_HIER\n-----END PRIVATE KEY-----\n"
```

#### Mollie Payment (Voor betalingen)
```bash
MOLLIE_API_KEY=test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM
```

#### Application URLs
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Firebase Service Account Key Verkrijgen

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Select je project → Project Settings → Service Accounts
3. Klik "Generate new private key"
4. Download het JSON bestand
5. Kopieer de values naar je `.env.local`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (behoud de quotes en \\n)

### 4. Mollie Test Account

1. Ga naar [mollie.com](https://mollie.com) en maak test account
2. Ga naar Dashboard → Developers → API keys
3. Kopieer de "Test API key"
4. Zet in `MOLLIE_API_KEY`

## Test de Setup

```bash
# Start de development server
npm run dev

# Test de endpoints
curl http://localhost:3000/api/enrollments/list
# Should return 401 (unauthorized) - dit is correct!
```

## Volgende Stappen

1. ✅ Environment variabelen instellen
2. ✅ Firebase project configureren
3. ✅ Mollie test account aanmaken
4. ✅ Payment flow testen
5. ✅ Dashboard en video player testen

De errors zouden nu opgelost moeten zijn! 🎉