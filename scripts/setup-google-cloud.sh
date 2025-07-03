#!/bin/bash

# Google Cloud Project Setup Script for GroeimetAI Cursus Platform
# This script helps set up your Google Cloud project for deployment

set -e

echo "🚀 GroeimetAI Cursus Platform - Google Cloud Setup Script"
echo "========================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Variables
echo ""
echo "📋 Please provide the following information:"
echo ""

# Default to groeimetai-platform if no input
read -p "Enter your Google Cloud Project ID (default: groeimetai-platform): " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-groeimetai-platform}

read -p "Enter your preferred region (default: europe-west1): " REGION
REGION=${REGION:-europe-west1}

SERVICE_NAME="groeimetai-platform"
ARTIFACT_REPO="groeimetai-docker"
SERVICE_ACCOUNT_NAME="github-actions-deploy"

echo ""
echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo "  Artifact Repository: $ARTIFACT_REPO"
echo "  Service Account: $SERVICE_ACCOUNT_NAME"
echo ""

read -p "Continue with these settings? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

# Set the project
echo ""
echo "1️⃣  Setting project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo ""
echo "2️⃣  Enabling required APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    cloudresourcemanager.googleapis.com \
    containerregistry.googleapis.com

# Create Artifact Registry repository
echo ""
echo "3️⃣  Creating Artifact Registry repository..."
# First try to describe the repository to see if it exists
if gcloud artifacts repositories describe $ARTIFACT_REPO --location=$REGION &>/dev/null; then
    echo "ℹ️  Repository already exists"
else
    echo "Creating new repository..."
    gcloud artifacts repositories create $ARTIFACT_REPO \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for GroeimetAI Cursus Platform"
fi

# Check if service account exists
echo ""
echo "4️⃣  Setting up service account..."
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &>/dev/null; then
    echo "ℹ️  Service account already exists"
    read -p "Do you want to create a new key for the existing service account? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "ℹ️  Skipping key creation"
        SKIP_KEY_CREATION=true
    fi
else
    echo "Creating new service account..."
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="GitHub Actions Deploy Service Account"
fi

# Grant necessary permissions
echo ""
echo "5️⃣  Granting permissions to service account..."
ROLES=(
    "roles/run.admin"
    "roles/storage.admin"
    "roles/artifactregistry.writer"
    "roles/artifactregistry.admin"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    echo "   Granting $ROLE..."
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="$ROLE" &>/dev/null
done

# Create and download service account key
if [ -z "$SKIP_KEY_CREATION" ]; then
    echo ""
    echo "6️⃣  Creating service account key..."
    KEY_FILE="gcp-sa-key-${PROJECT_ID}.json"
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_EMAIL
    
    echo ""
    echo "✅ Service account key created: $KEY_FILE"
else
    KEY_FILE="[Use existing key]"
fi

# Create Cloud Run service (optional)
echo ""
read -p "Do you want to create an initial Cloud Run service? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "7️⃣  Creating Cloud Run service..."
    gcloud run deploy $SERVICE_NAME \
        --region=$REGION \
        --platform=managed \
        --allow-unauthenticated \
        --image="gcr.io/cloudrun/hello" \
        2>/dev/null || echo "ℹ️  Service might already exist"
fi

# Output summary
echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Add the following to your GitHub repository secrets:"
echo "   (Settings → Secrets and variables → Actions)"
echo ""
echo "   📌 Required GitHub Secrets:"
echo "   ========================"
echo "   GCP_SA_KEY: [Contents of $KEY_FILE]"
echo ""
echo "2. Also add these Firebase & service secrets:"
echo ""
echo "   📌 Firebase Public Config:"
echo "   NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "   NEXT_PUBLIC_FIREBASE_APP_ID"
echo ""
echo "   📌 Firebase Admin SDK:"
echo "   FIREBASE_PROJECT_ID"
echo "   FIREBASE_CLIENT_EMAIL"
echo "   FIREBASE_PRIVATE_KEY"
echo ""
echo "   📌 Blockchain Config:"
echo "   NEXT_PUBLIC_BLOCKCHAIN_ENABLED"
echo "   NEXT_PUBLIC_DEFAULT_NETWORK"
echo "   NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON"
echo "   NEXT_PUBLIC_PINATA_GATEWAY"
echo "   BLOCKCHAIN_PRIVATE_KEY"
echo "   PINATA_API_KEY"
echo "   PINATA_SECRET_KEY"
echo ""
echo "   📌 Other Services:"
echo "   MOLLIE_API_KEY"
echo "   OPENAI_API_KEY"
echo "   PINECONE_API_KEY"
echo "   PINECONE_ENVIRONMENT"
echo "   RESEND_API_KEY"
echo ""
echo "3. Update the GitHub Actions workflow if needed:"
echo "   - Project ID in .github/workflows/deploy-cloud-run.yml"
echo "   - Region if different from $REGION"
echo ""
echo "4. Push to main branch to trigger deployment!"
echo ""
echo "5. Your app will be available at:"
echo "   https://${SERVICE_NAME}-${PROJECT_ID}.${REGION}.run.app"
echo ""
echo "📦 Docker images will be stored in:"
echo "   ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}"
echo ""
if [ -f "$KEY_FILE" ]; then
    echo "⚠️  IMPORTANT: The file '$KEY_FILE' contains sensitive credentials!"
    echo "   - Do NOT commit this file to git"
    echo "   - Store it securely"
    echo "   - Delete it after adding to GitHub Secrets"
fi
echo ""
echo "📚 Documentation: GITHUB_ACTIONS_SETUP.md"