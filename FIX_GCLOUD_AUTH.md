# 🔧 Google Cloud Authenticatie Fix

Je bent momenteel ingelogd als `niels@groeimetai.io`, maar dit account heeft geen permissies voor het project `groeimetai`.

## Opties om dit op te lossen:

### Optie 1: Login met het juiste Google account
```bash
# Logout van huidige account
gcloud auth revoke niels@groeimetai.io

# Login met het account dat eigenaar is van het Google Cloud project
gcloud auth login

# Selecteer het juiste project
gcloud config set project groeimetai
```

### Optie 2: Check welke accounts beschikbaar zijn
```bash
# Lijst alle accounts
gcloud auth list

# Switch naar een ander account
gcloud config set account YOUR-ADMIN-ACCOUNT@gmail.com
```

### Optie 3: Login met service account (als je de key hebt)
```bash
# Als je een service account key hebt van eerdere setup
gcloud auth activate-service-account --key-file=gcp-sa-key-groeimetai.json
```

### Optie 4: Check project permissies in de Console
1. Ga naar https://console.cloud.google.com
2. Selecteer project "groeimetai"
3. Ga naar IAM & Admin → IAM
4. Check of `niels@groeimetai.io` permissies heeft
5. Zo niet, voeg jezelf toe als Owner of Editor

## Na authenticatie:
Als je correct bent ingelogd, run dan:
```bash
./scripts/quick-fix-artifact-registry.sh
```

Of gebruik de Google Cloud Console om handmatig:
1. Artifact Registry aan te zetten
2. Een repository `groeimetai-docker` aan te maken in `europe-west1`