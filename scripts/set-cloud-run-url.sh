#!/bin/bash

# This script sets the Cloud Run URL dynamically
# Used during deployment to avoid hardcoding URLs

SERVICE_NAME="groeimetai-platform"
REGION="europe-west1"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

if [ -z "$SERVICE_URL" ]; then
  echo "Error: Could not retrieve Cloud Run service URL"
  exit 1
fi

echo "Cloud Run Service URL: $SERVICE_URL"

# Update environment variables
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --update-env-vars "NEXT_PUBLIC_APP_URL=$SERVICE_URL" \
  --quiet

echo "Updated NEXT_PUBLIC_APP_URL to: $SERVICE_URL"