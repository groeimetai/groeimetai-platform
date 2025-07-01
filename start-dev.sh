#!/bin/bash

echo "🧹 Cleaning previous build..."
rm -rf .next

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "🚀 Starting development server..."
npm run dev