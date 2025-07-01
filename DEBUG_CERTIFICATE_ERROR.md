# Debug Certificate Error

## De fout
Je krijgt een "Element type is invalid" error bij het bekijken van een certificaat.

## Wat ik heb geprobeerd om dit op te lossen:

1. **Dynamic imports toegevoegd** voor components die mogelijk SSR issues veroorzaken:
   - CertificateDisplay wordt nu dynamisch geïmporteerd in ClientCertificateVerify
   - BlockchainVerification wordt nu dynamisch geïmporteerd in CertificateDisplay
   - PDF generator wordt dynamisch geïmporteerd in de download API

2. **Safe wrapper gemaakt** voor PDF generatie om errors op te vangen

## Test deze stappen:

### 1. Herstart de development server
```bash
# Stop de server (Ctrl+C) en start opnieuw:
npm run dev
```

### 2. Clear je browser cache
- Hard refresh: Cmd+Shift+R (Mac) of Ctrl+Shift+R (Windows)

### 3. Test de certificate verify pagina weer
http://localhost:3000/certificate/verify/5wlcgAFT6pZjUlE1dCQ1

### 4. Als het nog steeds niet werkt, check de console
Kijk in de browser console (F12) voor meer specifieke errors.

## Alternatieve oplossing
Als het probleem blijft, kunnen we een eenvoudigere certificate viewer maken zonder de complexe components.

Laat me weten wat je ziet na het herstarten!