# 🔐 Fix "Reauthentication Required"

## Stap 1: Login opnieuw
```bash
gcloud auth login
```

### Wat gebeurt er:
1. Je browser opent automatisch
2. Login met je Google account
3. Geef toestemming aan Google Cloud SDK
4. Je ziet "You are now authenticated"
5. Ga terug naar terminal

## Stap 2: Zet application default credentials
```bash
gcloud auth application-default login
```
(Dit is soms ook nodig voor Docker/Cloud Build)

## Stap 3: Check of het werkt
```bash
# Test authenticatie
gcloud auth list

# Je zou moeten zien:
# ACTIVE  ACCOUNT
# *       jouw-email@gmail.com
```

## Stap 4: Ga verder met deployment
```bash
# Als je project al bestaat, set het:
gcloud config set project groeimetai-platform

# Of maak een nieuw project:
gcloud projects create groeimetai-platform-2024 --name="GroeimetAI"

# Dan deploy:
./scripts/deploy-to-gcp.sh
```

## Quick Deploy (skip alle setup):
```bash
# Na authenticatie, direct deployen:
gcloud run deploy groeimetai-platform \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated \
  --project groeimetai-platform
```

## Tips:
- ✅ Browser niet geopend? Kopieer de URL uit terminal
- ✅ "Access blocked" error? Gebruik een andere browser
- ✅ Meerdere Google accounts? Kies de juiste!

## Als login niet werkt:

### Optie 1: Force nieuwe login
```bash
gcloud auth revoke --all
gcloud auth login
```

### Optie 2: Login met specifiek account
```bash
gcloud auth login --no-browser
# Kopieer de URL en plak in browser
```

### Optie 3: Check gcloud version
```bash
gcloud version
# Update indien nodig:
gcloud components update
```

Werkt het nu?