#!/bin/bash

# Script to force a new deployment to Google Cloud Run

echo "=================================="
echo "Force Redeploy to Google Cloud Run"
echo "=================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set variables
PROJECT_ID="groeimetai-platform"
SERVICE_NAME="groeimetai-platform"
REGION="europe-west1"

echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Get current service info
echo "Getting current service info..."
CURRENT_IMAGE=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --project=$PROJECT_ID \
    --format="value(spec.template.spec.containers[0].image)" 2>/dev/null)

if [ -z "$CURRENT_IMAGE" ]; then
    echo "Error: Could not find service $SERVICE_NAME"
    exit 1
fi

echo "Current image: $CURRENT_IMAGE"
echo ""

# Options
echo "What would you like to do?"
echo "1. Force redeploy with current image"
echo "2. Trigger GitHub Actions workflow"
echo "3. Clear CDN cache (if applicable)"
echo "4. View service logs"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "Forcing redeploy..."
        gcloud run services update $SERVICE_NAME \
            --region=$REGION \
            --project=$PROJECT_ID \
            --image=$CURRENT_IMAGE \
            --no-traffic
        
        # Then route all traffic to new revision
        gcloud run services update-traffic $SERVICE_NAME \
            --region=$REGION \
            --project=$PROJECT_ID \
            --to-latest
        
        echo "Redeploy complete!"
        ;;
    
    2)
        echo "To trigger GitHub Actions workflow:"
        echo "1. Go to: https://github.com/groeimetai/groeimetai-platform/actions"
        echo "2. Click on 'Deploy to Google Cloud Run' workflow"
        echo "3. Click 'Run workflow' > 'Run workflow'"
        echo ""
        echo "Or create an empty commit:"
        echo "git commit --allow-empty -m 'Force redeploy' && git push"
        ;;
    
    3)
        echo "Clearing any CDN/browser cache..."
        echo ""
        echo "For users experiencing cache issues:"
        echo "1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
        echo "2. Clear browser cache for the domain"
        echo "3. Try incognito/private browsing mode"
        echo ""
        echo "For Cloud Run service cache:"
        gcloud run services update $SERVICE_NAME \
            --region=$REGION \
            --project=$PROJECT_ID \
            --update-env-vars="CACHE_BUST=$(date +%s)"
        ;;
    
    4)
        echo "Viewing recent logs..."
        gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
            --project=$PROJECT_ID \
            --limit=50 \
            --format=json | jq -r '.[] | "\(.timestamp) [\(.severity)] \(.textPayload // .jsonPayload.message)"'
        ;;
esac

echo ""
echo "Service URL: https://${SERVICE_NAME}-1031990594888.europe-west1.run.app"
echo "Done!"