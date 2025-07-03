#!/bin/bash

# Helper script to copy service account key to clipboard

if [ -z "$1" ]; then
    echo "Usage: ./scripts/copy-sa-key.sh <path-to-key-file>"
    echo ""
    echo "Example: ./scripts/copy-sa-key.sh gcp-sa-key-groeimetai.json"
    exit 1
fi

KEY_FILE=$1

if [ ! -f "$KEY_FILE" ]; then
    echo "❌ File not found: $KEY_FILE"
    exit 1
fi

# Detect OS and copy to clipboard
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    cat "$KEY_FILE" | pbcopy
    echo "✅ Service account key copied to clipboard!"
    echo "   You can now paste it into GitHub Secrets as GCP_SA_KEY"
elif command -v xclip &> /dev/null; then
    # Linux with xclip
    cat "$KEY_FILE" | xclip -selection clipboard
    echo "✅ Service account key copied to clipboard!"
    echo "   You can now paste it into GitHub Secrets as GCP_SA_KEY"
elif command -v xsel &> /dev/null; then
    # Linux with xsel
    cat "$KEY_FILE" | xsel --clipboard
    echo "✅ Service account key copied to clipboard!"
    echo "   You can now paste it into GitHub Secrets as GCP_SA_KEY"
else
    # Fallback - just display the content
    echo "📋 Copy the following content and paste it as GCP_SA_KEY in GitHub Secrets:"
    echo ""
    cat "$KEY_FILE"
fi