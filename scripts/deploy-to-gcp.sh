#!/bin/bash

# Deploy to Google Cloud Platform Script
# This script handles the complete deployment process to Cloud Run

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-groeimetai-platform}"
REGION="${GCP_REGION:-europe-west4}"
SERVICE_NAME="${SERVICE_NAME:-groeimetai-platform}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${GREEN}🚀 Starting deployment to Google Cloud Run${NC}"
echo -e "Project: ${PROJECT_ID}"
echo -e "Region: ${REGION}"
echo -e "Service: ${SERVICE_NAME}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated. Running gcloud auth login...${NC}"
    gcloud auth login
fi

# Set project
echo -e "${GREEN}📋 Setting project to ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${GREEN}🔧 Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Check if secrets exist, if not create them
echo -e "${GREEN}🔐 Checking secrets...${NC}"
check_and_create_secret() {
    SECRET_NAME=$1
    if ! gcloud secrets describe ${SECRET_NAME} &> /dev/null; then
        echo -e "${YELLOW}Creating secret: ${SECRET_NAME}${NC}"
        echo -n "Enter value for ${SECRET_NAME}: "
        read -s SECRET_VALUE
        echo
        echo -n "${SECRET_VALUE}" | gcloud secrets create ${SECRET_NAME} --data-file=-
    else
        echo -e "${GREEN}✓ Secret ${SECRET_NAME} exists${NC}"
    fi
}

# Create secrets if they don't exist
check_and_create_secret "openai-api-key"
check_and_create_secret "pinecone-api-key"
check_and_create_secret "nextauth-secret"
check_and_create_secret "database-url"

# Choose deployment method
echo -e "${YELLOW}Choose deployment method:${NC}"
echo "1. Deploy from source (Cloud Build)"
echo "2. Build locally and deploy"
echo -n "Enter choice (1 or 2): "
read DEPLOY_METHOD

if [ "$DEPLOY_METHOD" = "1" ]; then
    # Deploy using Cloud Build
    echo -e "${GREEN}🏗️  Deploying using Cloud Build...${NC}"
    
    # Check if cloudbuild.yaml exists
    if [ ! -f "cloudbuild.yaml" ]; then
        echo -e "${RED}❌ cloudbuild.yaml not found!${NC}"
        exit 1
    fi
    
    # Submit build
    gcloud builds submit --config cloudbuild.yaml \
        --substitutions=_REGION=${REGION}
        
elif [ "$DEPLOY_METHOD" = "2" ]; then
    # Build and deploy locally
    echo -e "${GREEN}🐳 Building Docker image locally...${NC}"
    
    # Use Cloud Run optimized Dockerfile if it exists
    DOCKERFILE="Dockerfile.cloudrun"
    if [ ! -f "$DOCKERFILE" ]; then
        DOCKERFILE="Dockerfile"
    fi
    
    # Configure docker for gcr.io
    gcloud auth configure-docker
    
    # Build image
    docker build -t ${IMAGE_NAME}:latest -f ${DOCKERFILE} .
    
    # Push image
    echo -e "${GREEN}📤 Pushing image to Container Registry...${NC}"
    docker push ${IMAGE_NAME}:latest
    
    # Deploy to Cloud Run
    echo -e "${GREEN}🚀 Deploying to Cloud Run...${NC}"
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:latest \
        --region ${REGION} \
        --platform managed \
        --allow-unauthenticated \
        --port 3000 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production \
        --set-secrets "OPENAI_API_KEY=openai-api-key:latest" \
        --set-secrets "PINECONE_API_KEY=pinecone-api-key:latest" \
        --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest" \
        --set-secrets "DATABASE_URL=database-url:latest"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "Service URL: ${SERVICE_URL}"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test your application at: ${SERVICE_URL}"
echo -e "2. Configure custom domain (optional)"
echo -e "3. Set up monitoring and alerts"
echo -e "4. Configure CI/CD pipeline"