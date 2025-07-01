# Logo Setup Instructies

## Stap 1: Plaats de logo bestanden

Plaats de volgende PNG bestanden in de `/public/images/logo/` map:

1. `GroeimetAi_logo_text_black.png` - Volledige logo met tekst (oranje "Groeimet" + zwarte "AI")
2. `GroeimetAi_logo_text_white.png` - Volledige logo met witte tekst voor donkere achtergronden
3. `GroeimetAi_logo_image_black.png` - Alleen het AI icon (overlappende A en I letters)
4. `GroeimetAi_logo_image_white.png` - Alleen het AI icon in wit

⚠️ **Belangrijk**: De bestandsnamen moeten exact overeenkomen!

## Stap 2: Maak een favicon

1. Ga naar https://favicon.io/favicon-converter/
2. Upload `GroeimetAi_logo_image_black.png`
3. Download het gegenereerde favicon pakket
4. Plaats `favicon.ico` in de `/public/` map (vervang het huidige placeholder bestand)

## Stap 3: Optioneel - Open Graph image

Voor betere social media previews:
1. Maak een 1200x630px versie van het logo
2. Sla op als `/public/og-image.png`

## Gebruik in de code

Het logo wordt automatisch gebruikt op:
- Navigatie header
- Footer
- Login/Register pagina's
- Favicon

Je kunt het logo ook handmatig gebruiken:

```tsx
import { Logo } from '@/components/ui/Logo'

// Volledig logo met tekst
<Logo size="lg" variant="default" />

// Alleen icon
<Logo showText={false} size="md" />

// Witte versie voor donkere achtergronden
<Logo variant="white" />
```

## Troubleshooting

Als het logo niet verschijnt:
1. Check of de bestandsnamen exact kloppen
2. Clear je browser cache
3. Restart de development server met `npm run dev`