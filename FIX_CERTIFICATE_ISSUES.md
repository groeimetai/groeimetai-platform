# Fix Certificate Issues

## 🚨 Acties die je moet ondernemen:

### 1. Deploy Firestore Rules (BELANGRIJK!)
```bash
firebase login --reauth
firebase deploy --only firestore:rules
```

Dit voegt permissions toe voor:
- `instructors` collection (read-only)
- `certificate_logs` collection (write-only voor audit logs)

### 2. Check je certificaten
Gebruik dit script om te zien welke certificaten je hebt:

```bash
node scripts/check-certificates.js <jouw-email> <jouw-wachtwoord>
```

Dit toont:
- Alle certificaten voor jouw account
- Certificate IDs, cursus namen, en scores

### 3. Check een specifiek certificaat
Als je een certificate ID hebt (zoals `5wlcgAFT6pZjUlE1dCQ1`):

```bash
node scripts/check-certificates.js <email> <wachtwoord> 5wlcgAFT6pZjUlE1dCQ1
```

### 4. Genereer ontbrekende certificaten
Als je geen certificaten ziet maar wel cursussen hebt voltooid:

```bash
node scripts/sync-progress-and-generate-certificates.js <email> <wachtwoord>
```

## Wat is er opgelost?

1. **Instructor permissions error** ✅
   - Firestore rules toegevoegd voor instructors collection

2. **Certificate verification** ✅
   - Verify page gebruikt nu direct Firebase Admin SDK
   - Geen API call meer nodig, dus betrouwbaarder

3. **Certificate not found** ✅
   - Als het certificaat echt bestaat, zou het nu moeten werken
   - Gebruik het check script om te verifiëren

## Tips:

- Na het deployen van de rules, refresh je browser
- Als je een 404 krijgt op certificate verify, check eerst of het certificaat bestaat met het script
- Certificaten worden alleen gegenereerd voor 100% voltooide cursussen

## Certificaat URL Format
De juiste URL voor een certificaat is:
```
http://localhost:3000/certificate/verify/<CERTIFICATE_ID>
```

Bijvoorbeeld:
```
http://localhost:3000/certificate/verify/5wlcgAFT6pZjUlE1dCQ1
```