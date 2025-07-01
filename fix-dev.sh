#!/bin/bash

echo "🔧 GroeimetAI Development Fix Script"
echo "====================================="

# Kill any process on port 3000
echo "🔍 Checking port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Found process on port 3000, killing it..."
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t)
    sleep 2
fi

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf .next-*

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your API keys!"
fi

# Try to start the dev server
echo "🚀 Starting development server..."
echo "================================"
echo "If you see 'Route / not found', try:"
echo "1. Visit http://localhost:3000/test"
echo "2. Check the console for errors"
echo "3. Make sure all imports in page.tsx are valid"
echo "================================"

npm run dev