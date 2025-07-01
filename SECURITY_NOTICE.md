# ⚠️ SECURITY NOTICE

## API Keys Veiligheid

Je API keys zijn nu veilig opgeslagen in `.env.local`. 

**BELANGRIJK:**
- `.env.local` wordt NIET gecommit naar git (staat in .gitignore)
- `.env.example` bevat nu alleen placeholder waarden
- Deel NOOIT je echte API keys publiekelijk

## Controleer je Git Status

Voordat je commit, controleer altijd:

```bash
git status
```

Zorg ervoor dat `.env.local` NIET in de lijst staat.

## Als je per ongeluk keys hebt gecommit:

1. Verwijder ze onmiddellijk uit je repository
2. Maak NIEUWE API keys aan bij de providers:
   - OpenAI: https://platform.openai.com/api-keys
   - Pinecone: https://app.pinecone.io/
   - Firebase: Firebase Console
   - Mollie: Mollie Dashboard

3. Update je `.env.local` met de nieuwe keys

## Best Practices

1. Gebruik altijd `.env.local` voor lokale development
2. Gebruik environment variables in je deployment platform (Vercel, etc.)
3. Roteer je API keys regelmatig
4. Gebruik test keys voor development waar mogelijk