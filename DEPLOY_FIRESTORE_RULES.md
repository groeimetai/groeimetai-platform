# Deploy Firestore Security Rules

De Firestore security rules zijn geüpdatet om certificaat generatie mogelijk te maken. Volg deze stappen om ze te deployen:

## Stap 1: Firebase Login
```bash
firebase login --reauth
```

## Stap 2: Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Wat is er veranderd?

### Enrollments Collection
- Gebruikers kunnen nu hun eigen enrollment records updaten
- Alleen deze velden kunnen worden gewijzigd:
  - `completedLessons` - lijst van voltooide lessen
  - `progress` - voortgangspercentage
  - `completedAt` - voltooiingsdatum
  - `currentLessonId` - huidige les
  - `lastAccessedAt` - laatste toegang

### Certificates Collection
- Gebruikers kunnen nu certificaten aanmaken voor zichzelf
- Dit maakt client-side certificaat generatie mogelijk

## Sync Bestaande Voortgang

Als je al cursussen hebt voltooid maar geen certificaten hebt, kun je het sync script gebruiken:

### Voor Individuele Gebruiker:
```bash
node scripts/sync-progress-and-generate-certificates.js <email> <password>
```

Dit script zal:
1. Je video voortgang synchroniseren met enrollment records
2. Detecteren welke cursussen 100% voltooid zijn
3. Automatisch certificaten genereren voor voltooide cursussen

### Voor Alle Gebruikers (Admin):
Als je admin bent, kun je het `generate-missing-certificates.ts` script gebruiken om certificaten voor alle gebruikers te genereren.

## Belangrijk

Na het deployen van de rules:
1. Refresh je browser
2. Ga naar een cursus die je hebt voltooid
3. De CourseViewer zal automatisch je voortgang synchroniseren
4. Als de cursus 100% voltooid is, wordt automatisch een certificaat gegenereerd
5. Check je dashboard voor het certificaat