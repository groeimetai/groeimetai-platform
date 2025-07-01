# 🚀 Super Simple Deployment - Geen GCloud gedoe!

## Optie 1: Docker Hub + Railway (5 minuten)

### Stap 1: Maak Docker Hub account
Ga naar https://hub.docker.com en maak gratis account

### Stap 2: Build & Push
```bash
# Maak script executable
chmod +x deploy-docker.sh

# Run het (vul je Docker Hub username in wanneer gevraagd)
./deploy-docker.sh
```

### Stap 3: Deploy op Railway
1. Ga naar https://railway.app
2. Klik "Start a New Project"
3. Kies "Deploy from Docker Hub" 
4. Vul in: `jouw-username/groeimetai-platform:latest`
5. Add environment variables:
   - OPENAI_API_KEY = jouw-key
   - PINECONE_API_KEY = jouw-key
6. Klaar! Je krijgt direct een URL!

## Optie 2: Direct Docker Run (Lokaal testen)

```bash
# Build image
docker build -t groeimetai-app .

# Run lokaal
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e PINECONE_API_KEY=... \
  groeimetai-app

# Open http://localhost:3000
```

## Optie 3: One-Click Deploy Services

### Render.com (Gratis tier)
```bash
# Maak render.yaml file
cat > render.yaml << 'EOF'
services:
  - type: web
    name: groeimetai-platform
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
EOF

# Push naar GitHub
git add .
git commit -m "Add render config"
git push

# Ga naar render.com en connect je GitHub repo
```

### Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch --name groeimetai-platform
fly secrets set OPENAI_API_KEY=sk-...
fly deploy
```

## Optie 4: VPS Deployment (Elke Linux server)

```bash
# SSH naar je server
ssh user@jouw-server.com

# Install Docker
curl -fsSL https://get.docker.com | sh

# Pull & Run
docker run -d \
  --name groeimetai \
  --restart always \
  -p 80:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e PINECONE_API_KEY=... \
  groeimetai/groeimetai-platform:latest
```

## Environment Variables Nodig:
```
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
NEXTAUTH_SECRET=genereer-met-openssl-rand-base64-32
```

## Kosten Vergelijking:
- Railway: $5/maand (500 uur gratis)
- Render: Gratis tier beschikbaar
- Fly.io: $0 voor 3 kleine apps
- VPS: €5-10/maand (Hetzner, DigitalOcean)