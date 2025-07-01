#!/bin/bash

# Deploy to existing GCP project
set -e

echo "🚀 Deploy naar bestaand Google Cloud Project"
echo "==========================================="

# Get current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)

if [ -z "$CURRENT_PROJECT" ]; then
    echo "⚠️  Geen actief project gevonden"
    echo ""
    echo "Beschikbare projecten:"
    gcloud projects list --format="table(projectId,name)"
    echo ""
    read -p "Voer project ID in: " PROJECT_ID
    gcloud config set project $PROJECT_ID
else
    echo "📌 Huidig project: $CURRENT_PROJECT"
    read -p "Gebruik dit project? (y/n): " use_current
    if [ "$use_current" != "y" ]; then
        gcloud projects list --format="table(projectId,name)"
        read -p "Voer project ID in: " PROJECT_ID
        gcloud config set project $PROJECT_ID
    fi
fi

# Quick deploy options
echo ""
echo "Kies deployment methode:"
echo "1) Direct vanaf source (makkelijkst)"
echo "2) Via Docker image"
echo "3) Met secrets setup"
echo ""
read -p "Keuze (1-3): " method

case $method in
    1)
        echo ""
        echo "🚀 Deploying direct vanaf source..."
        gcloud run deploy groeimetai-platform \
            --source . \
            --region europe-west4 \
            --allow-unauthenticated \
            --set-env-vars="NODE_ENV=production"
        ;;
        
    2)
        echo ""
        echo "🐳 Building en deploying via Container Registry..."
        
        # Get project ID
        PROJECT_ID=$(gcloud config get-value project)
        IMAGE="gcr.io/$PROJECT_ID/groeimetai-platform"
        
        # Configure docker
        gcloud auth configure-docker
        
        # Build and push
        docker build -t $IMAGE .
        docker push $IMAGE
        
        # Deploy
        gcloud run deploy groeimetai-platform \
            --image $IMAGE \
            --region europe-west4 \
            --allow-unauthenticated \
            --platform managed
        ;;
        
    3)
        echo ""
        echo "🔐 Setup met secrets..."
        
        # Check/create secrets
        echo "Checking secrets..."
        
        for secret in openai-api-key pinecone-api-key nextauth-secret; do
            if ! gcloud secrets describe $secret >/dev/null 2>&1; then
                echo "Creating secret: $secret"
                read -sp "Enter value for $secret: " secret_value
                echo
                echo -n "$secret_value" | gcloud secrets create $secret --data-file=-
            else
                echo "✓ Secret exists: $secret"
            fi
        done
        
        # Deploy with secrets
        echo ""
        echo "🚀 Deploying met secrets..."
        gcloud run deploy groeimetai-platform \
            --source . \
            --region europe-west4 \
            --allow-unauthenticated \
            --set-secrets="OPENAI_API_KEY=openai-api-key:latest" \
            --set-secrets="PINECONE_API_KEY=pinecone-api-key:latest" \
            --set-secrets="NEXTAUTH_SECRET=nextauth-secret:latest"
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Handig om te weten:"
echo "- Logs bekijken: gcloud run logs read --tail=50"
echo "- Service info: gcloud run services describe groeimetai-platform --region=europe-west4"
echo "- Update: run dit script opnieuw"