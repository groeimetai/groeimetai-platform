#!/bin/bash

echo "🔧 Fixing npm install loop..."

# Kill any running npm processes
pkill -f npm || true

# Remove problematic gtoken
rm -rf node_modules/gtoken
rm -rf node_modules/.gtoken*

# Install without running scripts
echo "📦 Installing dependencies (without scripts)..."
npm install --ignore-scripts

echo "✅ Dependencies installed!"
echo ""
echo "🚀 Now you can run:"
echo "   npm run dev"
echo ""
echo "💡 If you need to run setup later:"
echo "   npm run setup"