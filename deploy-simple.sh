#!/bin/bash

# Ultra Simple Deployment - No Cloud CLIs needed!
set -e

echo "🚀 Simple Docker Deployment"
echo "=========================="
echo ""

# Step 1: Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is niet geïnstalleerd!"
    echo "   Installeer vanaf: https://docker.com/get-started"
    exit 1
fi

echo "✅ Docker gevonden"

# Step 2: Build
echo ""
echo "🔨 Building Docker image..."
docker build -t groeimetai-app .
echo "✅ Build complete!"

# Step 3: Deployment keuze
echo ""
echo "Kies deployment optie:"
echo ""
echo "1) Test lokaal (gratis)"
echo "2) Push naar Docker Hub"
echo "3) Deploy instructies tonen"
echo ""
read -p "Keuze (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🏃 Starting lokaal..."
        echo ""
        echo "⚠️  Voeg eerst je API keys toe:"
        read -p "OpenAI API Key (sk-...): " OPENAI_KEY
        read -p "Pinecone API Key: " PINECONE_KEY
        
        echo ""
        echo "Starting app op http://localhost:3000"
        echo "(Stop met Ctrl+C)"
        echo ""
        
        docker run -it --rm \
            -p 3000:3000 \
            -e OPENAI_API_KEY="$OPENAI_KEY" \
            -e PINECONE_API_KEY="$PINECONE_KEY" \
            -e NEXTAUTH_SECRET="local-dev-secret" \
            groeimetai-app
        ;;
        
    2)
        echo ""
        read -p "Docker Hub username: " DOCKER_USER
        
        echo "🏷️  Tagging image..."
        docker tag groeimetai-app $DOCKER_USER/groeimetai-platform:latest
        
        echo "🔐 Login to Docker Hub..."
        docker login -u $DOCKER_USER
        
        echo "📤 Pushing image..."
        docker push $DOCKER_USER/groeimetai-platform:latest
        
        echo ""
        echo "✅ Klaar! Image beschikbaar op:"
        echo "   $DOCKER_USER/groeimetai-platform:latest"
        echo ""
        echo "Deploy nu op:"
        echo "- Railway.app → New Project → Deploy Docker Image"
        echo "- Render.com → New → Web Service → Docker"
        echo "- Of elke andere Docker host!"
        ;;
        
    3)
        echo ""
        echo "📋 Deployment Instructies"
        echo "========================"
        echo ""
        echo "RAILWAY.APP (Makkelijkst):"
        echo "1. Ga naar https://railway.app"
        echo "2. Sign up met GitHub"
        echo "3. New Project → Deploy Docker Image"
        echo "4. Image: groeimetai/groeimetai-platform"
        echo "5. Add variables → OPENAI_API_KEY, PINECONE_API_KEY"
        echo ""
        echo "RENDER.COM (Gratis tier):"
        echo "1. Ga naar https://render.com"  
        echo "2. New → Web Service"
        echo "3. Public Git repository → jouw GitHub URL"
        echo "4. Of: Docker → Public Image URL"
        echo ""
        echo "DIGITALOCEAN APP PLATFORM:"
        echo "1. Ga naar https://cloud.digitalocean.com/apps"
        echo "2. Create App → Docker Hub"
        echo "3. Repository: groeimetai/groeimetai-platform"
        echo ""
        echo "EIGEN VPS:"
        echo "ssh user@server 'docker run -d -p 80:3000 groeimetai/groeimetai-platform'"
        ;;
esac

echo ""
echo "✨ Done!"