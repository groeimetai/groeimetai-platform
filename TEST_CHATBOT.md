# 🧪 Test je Chatbot

## Quick Test

### 1. Check je setup eerst:
```bash
node src/scripts/check-rag-setup.js
```

### 2. Als alles groen is, test via curl:

**Test of de API draait:**
```bash
curl http://localhost:3000/api/chat
```

**Stuur een test vraag:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Wat is LangChain?",
    "context": {"language": "nl"}
  }'
```

### 3. Check de response

**Mock response** (zonder API keys):
```json
{
  "answer": "Interessante vraag! Als AI assistent help ik je graag...",
  "mode": "mock"
}
```

**Real response** (met API keys):
```json
{
  "answer": "LangChain is een framework voor het bouwen van applicaties met Large Language Models...",
  "mode": "real",
  "sources": [...]
}
```

## Browser Console Test

Open de browser console (F12) en voer uit:

```javascript
// Test chat API
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Welke cursussen heb je voor beginners?'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Mode:', data.mode);
  console.log('Answer:', data.answer);
  console.log('Sources:', data.sources);
});
```

## Veelvoorkomende problemen

### "Using mock chatbot"
- Check of je API keys in `.env.local` staan
- Herstart de server na het toevoegen van keys

### "No vectors found"
- Run: `npm run index-pinecone`
- Wacht tot alle vectors zijn geüpload

### "Invalid API key"
- Controleer of je keys beginnen met `sk-` (OpenAI) of `pcsk_` (Pinecone)
- Test keys individueel met check script

### "Cannot reach endpoint"
- Zorg dat de server draait: `npm run dev`
- Check dat je op http://localhost:3000 bent