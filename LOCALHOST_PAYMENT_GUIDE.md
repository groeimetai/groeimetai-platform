# 💳 Localhost Payment Testing Guide

## Het Probleem
Mollie kan geen webhooks sturen naar `localhost` omdat het niet bereikbaar is vanaf het internet. Dit is normaal tijdens lokale development.

## De Oplossing
We hebben de payment flow aangepast voor localhost development:

1. **Webhooks zijn uitgeschakeld** voor localhost
2. **Payment status wordt handmatig gecheckt** wanneer je terugkomt van Mollie
3. **Enrollment wordt automatisch aangemaakt** bij succesvolle betaling

## Test Flow

### 1. Start een betaling
- Ga naar een cursus pagina
- Klik "Koop deze cursus"
- Vul je gegevens in
- Klik "Doorgaan naar betaling"

### 2. Mollie Test Checkout
Je wordt doorgestuurd naar Mollie's test omgeving waar je kunt kiezen:
- ✅ **Betaling succesvol** → Kies een betaalmethode en rond af
- ❌ **Betaling mislukt** → Klik "Annuleren" of kies "Failed"

### 3. Terug op de site
Na de betaling kom je terug op `/payment/complete`:
- De pagina checkt automatisch de status bij Mollie
- Bij succesvolle betaling wordt je enrollment aangemaakt
- Je krijgt toegang tot de cursus

## Test Betaalmethoden

In Mollie's test mode kun je deze methoden gebruiken:

### iDEAL
- Bank: Kies een willekeurige bank
- Status: Kies "Paid" voor succes

### Creditcard
- Nummer: `4111 1111 1111 1111`
- Vervaldatum: Elke toekomstige datum
- CVC: `123`

## Productie Setup

Voor productie moet je:

1. **Publieke URL gebruiken** (bijv. `https://jouwdomein.nl`)
2. **Webhook URL configureren** in Mollie Dashboard
3. **Live API key** gebruiken in plaats van test key

## Alternatief: Ngrok voor Webhooks

Als je webhooks wilt testen op localhost:

```bash
# Installeer ngrok
npm install -g ngrok

# Start een tunnel
ngrok http 3000

# Gebruik de ngrok URL in .env.local
NEXT_PUBLIC_APP_URL=https://xyz123.ngrok.io
```

## Troubleshooting

### "Payment creation failed"
- Check of `MOLLIE_API_KEY` in `.env.local` staat
- Zorg dat het begint met `test_` voor development

### "Enrollment niet aangemaakt"
- Check de console logs in je terminal
- Kijk of de payment status correct wordt bijgewerkt

### Test je Mollie configuratie
Open: http://localhost:3000/api/test-mollie

Dit toont:
- Of je API key werkt
- Welke payment methods beschikbaar zijn
- Of je in test of live mode zit