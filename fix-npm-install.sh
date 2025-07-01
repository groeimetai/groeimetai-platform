#!/bin/bash

echo "🔧 Fixing npm install issues..."
echo "================================"

# Stop any running Node processes
echo "📋 Stopping Node processes..."
pkill -f node || true
pkill -f npm || true

# Remove problematic directories
echo "🗑️  Removing problematic directories..."
rm -rf node_modules/.gtoken*
rm -rf node_modules/gtoken

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Remove all node_modules and lock file
echo "🗑️  Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# Create fresh install
echo "📦 Installing dependencies fresh..."
npm install

echo "✅ Done! Your dependencies should now be installed correctly."
echo ""
echo "⚠️  BELANGRIJK: Je .env.example bevat echte API keys!"
echo "    Deze moet je NOOIT committen naar git!"
echo "    Kopieer de keys naar .env.local en vervang ze in .env.example met placeholders."