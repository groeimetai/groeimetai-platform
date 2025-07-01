# QR Code Positie & Signatures Fix

## Wat ik heb aangepast:

### 1. QR Code verplaatst naar links ✅
- QR code staat nu links onderin
- Certificate info rechts uitgelijnd
- Mooie balans in de layout

### 2. Overlappende handtekeningen gefixt ✅
- Spacer van 80px tussen de twee signature blocks
- Elke signature block heeft vaste breedte (150px)
- Verkleinde font sizes voor betere spacing
- Signatures gecentreerd in plaats van space-around

### 📐 Nieuwe layout structuur:

**Onderkant certificaat:**
```
[QR Code]                    [Certificate No: ABC123]
[Scan to verify]             [groeimetai.com]

    [Instructor Name]              [Director]
    _______________               _______________
    Course Instructor             GroeiMetAI Academy
```

## Technische aanpassingen:
- Signature blocks: 150px breed (was flex: 1)
- Spacer tussen signatures: 80px
- Font sizes: 11px/9px (was 12px/10px)
- QR code links, cert info rechts

## Resultaat:
✅ Geen overlappende tekst meer
✅ QR code op de gewenste positie
✅ Duidelijke scheiding tussen handtekeningen
✅ Alles past nog steeds op één pagina

Test het nu en je ziet een perfect gebalanceerd certificaat!