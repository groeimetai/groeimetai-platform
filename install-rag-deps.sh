#!/bin/bash

echo "📦 Installing RAG dependencies..."

# Install only the missing RAG-related packages
npm install \
  @pinecone-database/pinecone@^2.0.0 \
  openai@^4.0.0

echo "✅ RAG dependencies installed!"
echo ""
echo "🚀 Now you can run: npm run dev"