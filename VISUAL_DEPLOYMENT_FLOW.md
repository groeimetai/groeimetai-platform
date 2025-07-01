# 🎨 Visuele Deployment Flow

## Wat gaan we doen?

```
Jouw Computer                Google Cloud Platform
     |                              |
     |  1. Setup Project ---------> |  Nieuw GCP Project
     |                              |  APIs enabled ✓
     |                              |
     |  2. Add Secrets -----------> |  Secret Manager
     |     - OpenAI Key             |  - API Keys veilig
     |     - Pinecone Key           |  - Encrypted storage
     |                              |
     |  3. Build Docker Image       |
     |     (5-10 min) ⏱️            |
     |                              |
     |  4. Push to Cloud ---------> |  Container Registry
     |                              |  Docker image saved
     |                              |
     |  5. Deploy to Run ---------> |  Cloud Run Service
     |                              |  ✅ Live website\!
     |                              |
     v                              v
  Terminal                    https://groeimetai.run.app
```

## Eerste keer? Dit heb je nodig:

### ✅ Checklist
- [ ] Google Account
- [ ] Terminal open in project folder
- [ ] 15 minuten tijd
- [ ] OpenAI API key (van platform.openai.com)
- [ ] Pinecone API key (van pinecone.io)

### 💳 Kosten
- Eerste $300 gratis van Google\!
- Daarna: €0-20/maand voor normale usage

## Terminal Commands Visualized:

### 🔧 Setup (doe dit 1x)
```bash
$ ./scripts/setup-gcp-project.sh

📝 Enter project name: groeimetai-platform-2024
🔐 Logging into Google...
⚙️  Enabling APIs... [████████████] 100%
✅ Setup complete\!
```

### 🔑 Secrets toevoegen
```bash
$ echo -n "sk-abc123..." | gcloud secrets versions add openai-api-key --data-file=-
✅ Created secret version [1]

$ echo -n "pc-xyz789..." | gcloud secrets versions add pinecone-api-key --data-file=-
✅ Created secret version [1]
```

### 🚀 Deploy\!
```bash
$ ./scripts/deploy-to-gcp.sh

Choose deployment method:
1. Deploy from source (Cloud Build)
2. Build locally and deploy
Enter choice: 2

🐳 Building Docker image... [████████████] 100%
📤 Uploading to cloud...     [████████████] 100%
🚀 Deploying service...      [████████████] 100%

✅ Deployment complete\!
🌐 Your app is live at: https://groeimetai-platform-xxxxx-ew.a.run.app
```

## Problemen? Check dit:

### ❌ "Permission denied"
```bash
$ gcloud auth login
# → Opens browser voor Google login
```

### ❌ "Billing account required"
```
→ Ga naar: console.cloud.google.com/billing
→ Add payment method
→ Je krijgt $300 gratis\!
```

### ❌ "Build failed"
```bash
$ gcloud builds log [BUILD-ID]
# → Laat zien wat er mis ging
```

## 🎉 Success Indicators

Als alles goed gaat zie je:
1. ✅ "Deployment complete\!" in terminal
2. ✅ Een URL zoals https://groeimetai-platform-xxxxx.run.app
3. ✅ Je website is live\!

## 📱 Quick Check

Open in browser:
- Je deployment URL
- https://console.cloud.google.com/run (zie je service dashboard)

Alles groen? Gefeliciteerd\! 🎊
EOF < /dev/null