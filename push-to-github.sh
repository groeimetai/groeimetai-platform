#!/bin/bash

echo "🚀 Push to GitHub & Deploy from Cloud"
echo "===================================="

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add GitHub remote
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/vadupdawg/groeimetai-platform.git || git remote set-url origin https://github.com/vadupdawg/groeimetai-platform.git

# Create .gitignore if not exists
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Production
*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# Docker
.dockerignore

# Temporary files
*.log
tmp/
temp/
EOF
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit - GroeiMetAI Platform" || echo "No changes to commit"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code is now on GitHub!"
echo "   https://github.com/vadupdawg/groeimetai-platform"
echo ""
echo "===================================="
echo "🚀 Deploy vanuit GitHub op Cloud Run:"
echo "===================================="
echo ""
echo "Optie 1: Via Console (Makkelijkst)"
echo "1. Ga naar: https://console.cloud.google.com/run"
echo "2. Klik 'CREATE SERVICE'"
echo "3. Kies 'Continuously deploy from a repository'"
echo "4. Connect je GitHub account"
echo "5. Selecteer: vadupdawg/groeimetai-platform"
echo "6. Branch: main"
echo "7. Build type: Dockerfile"
echo "8. Klik 'CREATE'"
echo ""
echo "Optie 2: Via gcloud CLI"
echo "gcloud run deploy groeimetai-platform \\"
echo "  --source https://github.com/vadupdawg/groeimetai-platform \\"
echo "  --region europe-west4 \\"
echo "  --allow-unauthenticated"
echo ""
echo "===================================="