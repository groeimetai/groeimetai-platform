#!/bin/bash

# Quick fix for Artifact Registry permissions
# Run this if you get permission errors when pushing Docker images

set -e

echo "🔧 Quick Fix: Artifact Registry Setup"
echo "===================================="
echo ""

# Variables
PROJECT_ID=${1:-groeimetai-platform}
REGION=${2:-europe-west1}
ARTIFACT_REPO="groeimetai-docker"
SERVICE_ACCOUNT_NAME="github-actions-deploy"

echo "Using:"
echo "  Project: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Repository: $ARTIFACT_REPO"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Enable Artifact Registry API
echo "1. Enabling Artifact Registry API..."
gcloud services enable artifactregistry.googleapis.com

# Create repository if it doesn't exist
echo ""
echo "2. Creating Artifact Registry repository..."
if gcloud artifacts repositories describe $ARTIFACT_REPO --location=$REGION &>/dev/null; then
    echo "   ✅ Repository already exists"
else
    echo "   Creating repository..."
    gcloud artifacts repositories create $ARTIFACT_REPO \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for GroeimetAI"
    echo "   ✅ Repository created"
fi

# Grant permissions to service account
echo ""
echo "3. Granting permissions to service account..."
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Check if service account exists
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &>/dev/null; then
    echo "   ✅ Service account found"
    
    # Grant Artifact Registry permissions
    gcloud artifacts repositories add-iam-policy-binding $ARTIFACT_REPO \
        --location=$REGION \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="roles/artifactregistry.writer"
    
    echo "   ✅ Permissions granted"
else
    echo "   ❌ Service account not found!"
    echo "   Run ./scripts/setup-google-cloud.sh first"
    exit 1
fi

echo ""
echo "✅ Quick fix complete!"
echo ""
echo "Your Docker images will be pushed to:"
echo "  ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/groeimetai-platform"
echo ""
echo "Now re-run your GitHub Action and it should work!"