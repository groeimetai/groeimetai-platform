#!/bin/bash

# Simple Docker deployment script
set -e

echo "🐳 Docker Deployment Script"
echo "=========================="

# Variables
DOCKER_USERNAME="${DOCKER_USERNAME:-groeimetai}"
IMAGE_NAME="groeimetai-platform"
TAG="${TAG:-latest}"
FULL_IMAGE="$DOCKER_USERNAME/$IMAGE_NAME:$TAG"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t $FULL_IMAGE .

echo -e "${GREEN}✓ Build complete!${NC}"

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}🔐 Login to Docker Hub:${NC}"
    docker login
fi

echo -e "${YELLOW}📤 Pushing to Docker Hub...${NC}"
docker push $FULL_IMAGE

echo -e "${GREEN}✓ Push complete!${NC}"
echo -e "${GREEN}🎉 Docker image available at: $FULL_IMAGE${NC}"

echo ""
echo "========================================="
echo "Deploy options:"
echo "========================================="
echo ""
echo "1️⃣  Railway.app (Easiest - Recommended):"
echo "   - Go to: https://railway.app"
echo "   - Click 'New Project' → 'Deploy from Docker Hub'"
echo "   - Enter: $FULL_IMAGE"
echo "   - Add environment variables"
echo ""
echo "2️⃣  Render.com:"
echo "   - Go to: https://render.com"
echo "   - New → Web Service → Docker"
echo "   - Image URL: $FULL_IMAGE"
echo ""
echo "3️⃣  Fly.io:"
echo "   fly launch --image $FULL_IMAGE"
echo ""
echo "4️⃣  Any VPS with Docker:"
echo "   docker run -d -p 80:3000 \\"
echo "     -e OPENAI_API_KEY=your-key \\"
echo "     -e PINECONE_API_KEY=your-key \\"
echo "     $FULL_IMAGE"
echo ""
echo "========================================="