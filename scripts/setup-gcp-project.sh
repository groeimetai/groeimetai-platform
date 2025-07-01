#!/bin/bash

# Initial GCP Project Setup Script
# Run this once to set up your GCP project for GroeimetAI

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   GroeimetAI - GCP Project Setup Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${GREEN}Checking prerequisites...${NC}"

if ! command_exists gcloud; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    echo "Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${YELLOW}⚠️  Docker not found (optional for local builds)${NC}"
fi

# Get or create project
echo -e "${GREEN}Setting up GCP Project...${NC}"
echo -n "Enter your GCP Project ID (or press enter to create new): "
read PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    # Generate project ID suggestion
    SUGGESTED_ID="groeimetai-$(date +%Y%m%d)"
    echo -n "Enter new project ID (default: $SUGGESTED_ID): "
    read NEW_PROJECT_ID
    PROJECT_ID=${NEW_PROJECT_ID:-$SUGGESTED_ID}
    
    echo -e "${GREEN}Creating new project: ${PROJECT_ID}${NC}"
    gcloud projects create ${PROJECT_ID} --name="GroeimetAI Platform"
fi

# Set project
gcloud config set project ${PROJECT_ID}

# Link billing account
echo -e "${YELLOW}Checking billing...${NC}"
BILLING_ACCOUNTS=$(gcloud billing accounts list --filter=open=true --format="value(name)")
if [ -z "$BILLING_ACCOUNTS" ]; then
    echo -e "${RED}❌ No active billing account found${NC}"
    echo "Please set up billing at: https://console.cloud.google.com/billing"
    exit 1
fi

# If multiple billing accounts, let user choose
BILLING_COUNT=$(echo "$BILLING_ACCOUNTS" | wc -l)
if [ $BILLING_COUNT -gt 1 ]; then
    echo "Multiple billing accounts found:"
    echo "$BILLING_ACCOUNTS" | nl
    echo -n "Select billing account number: "
    read BILLING_CHOICE
    BILLING_ACCOUNT=$(echo "$BILLING_ACCOUNTS" | sed -n "${BILLING_CHOICE}p")
else
    BILLING_ACCOUNT=$BILLING_ACCOUNTS
fi

echo -e "${GREEN}Linking billing account...${NC}"
gcloud billing projects link ${PROJECT_ID} --billing-account=${BILLING_ACCOUNT}

# Enable APIs
echo -e "${GREEN}Enabling required APIs...${NC}"
apis=(
    "run.googleapis.com"                 # Cloud Run
    "cloudbuild.googleapis.com"          # Cloud Build
    "secretmanager.googleapis.com"       # Secret Manager
    "containerregistry.googleapis.com"   # Container Registry
    "cloudresourcemanager.googleapis.com"# Resource Manager
    "iam.googleapis.com"                 # IAM
    "logging.googleapis.com"             # Cloud Logging
    "monitoring.googleapis.com"          # Cloud Monitoring
)

for api in "${apis[@]}"; do
    echo -e "Enabling ${api}..."
    gcloud services enable ${api}
done

# Create service account for Cloud Run
echo -e "${GREEN}Creating service account...${NC}"
SERVICE_ACCOUNT_NAME="groeimetai-runner"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT_EMAIL} &> /dev/null; then
    gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
        --display-name="GroeimetAI Cloud Run Service Account"
fi

# Grant necessary permissions
echo -e "${GREEN}Setting up IAM permissions...${NC}"
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"

# Set up Firebase (if needed)
echo -e "${YELLOW}Do you want to set up Firebase? (y/n)${NC}"
read -n 1 SETUP_FIREBASE
echo

if [ "$SETUP_FIREBASE" = "y" ]; then
    echo -e "${GREEN}Enabling Firebase APIs...${NC}"
    gcloud services enable firebase.googleapis.com
    gcloud services enable firestore.googleapis.com
    echo -e "${YELLOW}Please complete Firebase setup at: https://console.firebase.google.com${NC}"
fi

# Create initial secrets
echo -e "${GREEN}Setting up Secret Manager...${NC}"
echo -e "${YELLOW}We'll now create placeholder secrets. You'll need to update these with real values.${NC}"

create_secret() {
    SECRET_NAME=$1
    SECRET_DESC=$2
    
    if ! gcloud secrets describe ${SECRET_NAME} &> /dev/null; then
        echo -e "Creating secret: ${SECRET_NAME}"
        echo "PLACEHOLDER_VALUE" | gcloud secrets create ${SECRET_NAME} \
            --data-file=- \
            --replication-policy="automatic"
        echo -e "${YELLOW}⚠️  Remember to update ${SECRET_NAME} with real value${NC}"
    else
        echo -e "${GREEN}✓ Secret ${SECRET_NAME} already exists${NC}"
    fi
}

create_secret "openai-api-key" "OpenAI API Key"
create_secret "pinecone-api-key" "Pinecone API Key"
create_secret "nextauth-secret" "NextAuth Secret"
create_secret "database-url" "Database Connection URL"

# Create .env.gcp file
echo -e "${GREEN}Creating .env.gcp configuration file...${NC}"
cat > .env.gcp << EOF
# GCP Configuration for GroeimetAI
GCP_PROJECT_ID=${PROJECT_ID}
GCP_REGION=europe-west4
SERVICE_NAME=groeimetai-platform
SERVICE_ACCOUNT_EMAIL=${SERVICE_ACCOUNT_EMAIL}

# Add these to Secret Manager:
# - openai-api-key
# - pinecone-api-key
# - nextauth-secret
# - database-url
EOF

# Summary
echo
echo -e "${GREEN}✅ GCP Project setup complete!${NC}"
echo
echo -e "${BLUE}Project Summary:${NC}"
echo -e "Project ID: ${PROJECT_ID}"
echo -e "Service Account: ${SERVICE_ACCOUNT_EMAIL}"
echo -e "Region: europe-west4 (Netherlands)"
echo
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Update secrets in Secret Manager with real values:"
echo -e "   gcloud secrets versions add openai-api-key --data-file=-"
echo -e "2. Run deployment script:"
echo -e "   ./scripts/deploy-to-gcp.sh"
echo -e "3. Configure custom domain (optional)"
echo
echo -e "${GREEN}Happy deploying! 🚀${NC}"