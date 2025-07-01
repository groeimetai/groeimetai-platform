#!/bin/bash

# GroeimetAI Course Platform Deployment Script
# Usage: ./scripts/deploy.sh [production|staging]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${GREEN}🚀 Deploying GroeimetAI Course Platform - ${ENVIRONMENT}${NC}"

# Check if .env file exists
if [ ! -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${RED}❌ .env.${ENVIRONMENT} file not found!${NC}"
    echo "Please create .env.${ENVIRONMENT} with the following variables:"
    echo "  - OPENAI_API_KEY"
    echo "  - PINECONE_API_KEY"
    echo "  - PINECONE_ENVIRONMENT"
    echo "  - PINECONE_INDEX"
    echo "  - NEXT_PUBLIC_API_URL"
    exit 1
fi

# Load environment variables
export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)

# Check required environment variables
required_vars=("OPENAI_API_KEY" "PINECONE_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing required environment variable: $var${NC}"
        exit 1
    fi
done

echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🔄 Stopping existing containers...${NC}"
docker-compose down

echo -e "${YELLOW}🗄️ Starting Redis...${NC}"
docker-compose up -d redis
sleep 5  # Wait for Redis to start

echo -e "${YELLOW}📚 Indexing course content...${NC}"
docker-compose run --rm app npm run index-courses

echo -e "${YELLOW}🚀 Starting all services...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose up -d
else
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
fi

echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check health status
echo -e "${YELLOW}🏥 Checking service health...${NC}"

# Check app health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ App is healthy${NC}"
else
    echo -e "${RED}❌ App health check failed${NC}"
    docker-compose logs app
    exit 1
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis health check failed${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo ""
echo "Services running:"
echo "  - App: http://localhost:3000"
echo "  - Redis: localhost:6379"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "  - Nginx: http://localhost"
fi
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - View stats: docker stats"