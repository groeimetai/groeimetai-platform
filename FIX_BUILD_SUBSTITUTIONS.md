# 🔧 Firebase Build Error Fix - OPGELOST!

## Het Probleem

Je kreeg `Firebase: Error (auth/invalid-api-key)` tijdens de build omdat de Firebase configuratie niet beschikbaar was tijdens `npm run build`.

## De Oplossing (SIMPEL!)

We hebben de publieke Firebase configuratie direct in de Dockerfile gezet als ENV statements. Deze waarden zijn **niet geheim** en mogen gewoon in de Dockerfile staan.

### Waarom is dit veilig?

Alle `NEXT_PUBLIC_*` variabelen worden sowieso aan de browser/client blootgesteld. Dit zijn geen geheimen! 

**Publieke waarden (veilig in Git):**
- `NEXT_PUBLIC_FIREBASE_API_KEY` ✅
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` ✅
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` ✅
- etc.

**Geheime waarden (NOOIT in Git):**
- `FIREBASE_PRIVATE_KEY` ❌
- `MOLLIE_API_KEY` ❌
- `BLOCKCHAIN_PRIVATE_KEY` ❌

## Wat moet je nu doen?

1. **Check of `.env.production` correct is**
   - Open het bestand en controleer of de Firebase waarden kloppen
   - Deze zijn gekopieerd uit je .env.local

2. **Push de wijzigingen naar GitHub**
   ```bash
   git add .
   git commit -m "Fix Firebase build configuration"
   git push
   ```

3. **De build zou nu moeten werken!**
   - Cloud Build gebruikt automatisch `.env.production`
   - Geen complexe substitutions meer nodig

## Verificatie

In de build logs zou je nu moeten zien:
```
✅ NEXT_PUBLIC_FIREBASE_API_KEY: AIzaSy...PxKi
✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: groeimetai.firebaseapp.com
✅ Build environment is properly configured!
```

## Cloud Run Environment Variables

Voor de **runtime** secrets, stel deze in als environment variables in Cloud Run:
- Via Cloud Console → je service → Edit & Deploy New Revision
- Of via Secret Manager voor gevoelige waarden

Deze zijn voor server-side only en worden NIET tijdens build gebruikt.