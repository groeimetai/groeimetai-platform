# 🚀 GroeiMetAI Platform

AI-powered learning platform voor Nederlandse bedrijven en professionals.

## Features

- 🤖 AI Chatbot met RAG (Retrieval Augmented Generation)
- 📚 Uitgebreide cursuscatalogus
- 🎯 Gepersonaliseerde leertrajecten
- 💬 Real-time chat ondersteuning
- 🔐 Veilige authenticatie

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4, Pinecone Vector Database
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Google Cloud Run

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Deploy to Google Cloud Run

#### Via GitHub Integration (Recommended)

1. Fork/clone this repository
2. Go to [Cloud Run Console](https://console.cloud.google.com/run)
3. Click "Create Service"
4. Choose "Continuously deploy from a repository"
5. Connect this GitHub repository
6. Configure build settings (Dockerfile)
7. Deploy!

#### Via CLI

```bash
gcloud run deploy groeimetai-platform \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated
```

## Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX=groeimetai-courses

# Optional
NEXTAUTH_SECRET=...
DATABASE_URL=...
```

## Project Structure

```
├── src/
│   ├── app/          # Next.js 14 app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── styles/       # Global styles
├── public/           # Static assets
├── Dockerfile        # Production Docker config
└── cloudbuild.yaml   # Google Cloud Build config
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

Private - All rights reserved

---

Built with ❤️ by GroeiMetAI Team