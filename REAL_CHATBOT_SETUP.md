# 🤖 Echte LLM Chatbot met RAG Setup

## Overzicht

Je hebt nu een complete RAG (Retrieval Augmented Generation) chatbot die:
- ✅ OpenAI GPT-4 gebruikt voor natuurlijke conversaties
- ✅ Pinecone vector database gebruikt voor semantische zoekfuncties
- ✅ Je cursusinhoud doorzoekt om accurate antwoorden te geven
- ✅ Automatisch terugvalt op mock data als API's niet beschikbaar zijn

## 🚀 Quick Setup

### 1. Controleer je setup
```bash
node src/scripts/check-rag-setup.js
```

Dit controleert:
- Of je API keys correct zijn
- Of Pinecone bereikbaar is
- Of je index bestaat
- Hoeveel vectors er zijn

### 2. Maak een Pinecone Index (indien nodig)

Als je nog geen index hebt:
1. Ga naar https://app.pinecone.io
2. Maak een nieuwe index:
   - **Name**: `groeimetai-courses` (of wat je in .env.local hebt)
   - **Dimension**: `1536` (voor OpenAI embeddings)
   - **Metric**: `cosine`
   - **Region**: Kies een region (bijv. `us-east-1`)

### 3. Index je cursussen naar Pinecone
```bash
npm run index-pinecone
```

Dit script:
- Leest alle cursussen uit `/src/lib/data/course-content`
- Genereert OpenAI embeddings voor elke les
- Slaat alles op in Pinecone
- Toont progress en totaal aantal vectors

### 4. Start de applicatie
```bash
npm run dev
```

### 5. Test de chatbot
- Ga naar http://localhost:3000
- Klik op de chat button rechtsonder
- Stel een vraag over je cursussen!

## 🔧 Hoe het werkt

### RAG Pipeline:
1. **Gebruiker stelt vraag** → 
2. **Genereer embedding** (OpenAI) → 
3. **Zoek relevante content** (Pinecone) → 
4. **Genereer antwoord** (GPT-4 met context) → 
5. **Stream response** naar gebruiker

### Code structuur:
- `/src/lib/rag/real-chatbot.ts` - De echte chatbot implementatie
- `/src/scripts/index-to-pinecone.js` - Indexeert cursussen naar Pinecone
- `/src/app/api/chat/route.ts` - API endpoint die automatisch switcht tussen real/mock

## 📊 Kosten indicatie

- **OpenAI Embeddings**: ~$0.0001 per 1K tokens
- **GPT-4 Turbo**: ~$0.01 per 1K input tokens, $0.03 per 1K output tokens
- **Pinecone**: Gratis tot 100K vectors

Voor een typische vraag:
- Embedding: ~$0.0001
- Context search: Gratis (Pinecone)
- GPT-4 response: ~$0.05

## 🐛 Troubleshooting

### "No vectors in Pinecone"
```bash
npm run index-pinecone
```

### "Invalid API key"
Check je `.env.local`:
```
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=groeimetai-courses
```

### "Index not found"
1. Check de exacte naam in Pinecone dashboard
2. Update `PINECONE_INDEX` in `.env.local`

### Chatbot gebruikt nog steeds mock data
1. Check of beide API keys zijn ingesteld
2. Herstart de dev server
3. Check de browser console voor errors

## 🎯 Voorbeeldvragen

Probeer deze vragen om te testen:
- "Wat leer ik in de LangChain cursus?"
- "Hoe werkt RAG?"
- "Welke cursus is het beste voor beginners?"
- "Leg uit wat prompt engineering is"
- "Hoe kan ik ChatGPT gebruiken voor mijn bedrijf?"

## 🔐 Veiligheid

- API keys staan alleen in `.env.local` (niet in git)
- Rate limiting voorkomt misbruik (10 req/min)
- Automatische fallback naar mock bij API problemen
- Geen gevoelige data in vector database

## 🚀 Productie

Voor productie:
1. Gebruik environment variables van je hosting provider
2. Overweeg Redis voor rate limiting
3. Implementeer proper error logging
4. Monitor API usage en kosten
5. Cache populaire queries

## 💡 Tips

- **Betere antwoorden**: Zorg voor goede lesson descriptions
- **Snellere responses**: Gebruik GPT-3.5-turbo voor lagere kosten
- **Meer context**: Verhoog `topK` in searchContext (nu 5)
- **Nederlandse focus**: Alle prompts zijn al in het Nederlands!