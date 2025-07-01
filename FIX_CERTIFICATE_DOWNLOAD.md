# Certificate Download Fix

## Wat is er gefixt?

1. **Nieuwe download API endpoint** - `/api/certificate/download/[certificateId]`
   - Genereert PDF on-the-fly als de URL ontbreekt
   - Gebruikt @react-pdf/renderer die al geïnstalleerd is
   - Forceert een echte download in plaats van nieuwe tab

2. **Verbeterde download handler** in CertificateDisplay
   - Gebruikt de nieuwe API endpoint
   - Creëert een tijdelijke download link
   - Fallback naar certificateUrl als API faalt

## Hoe werkt het nu?

Als je op "Download PDF" klikt:
1. Eerst wordt geprobeerd de PDF via API te downloaden
2. Als er geen opgeslagen PDF is, wordt deze gegenereerd
3. De PDF wordt direct gedownload (niet in nieuwe tab)
4. Als dit faalt, valt het terug op de oude methode

## Troubleshooting

Als het nog steeds niet werkt:
1. Check de browser console voor errors
2. Check de server logs in je terminal
3. Mogelijk probleem met Firebase Storage permissions

## Test het nu!
1. Ga naar een certificaat
2. Klik op "Download PDF"
3. Het bestand zou moeten downloaden als `certificate-[ID].pdf`