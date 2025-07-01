#!/bin/bash

echo "🚀 Quick npm install fix..."

# Only remove the problematic directory
rm -rf node_modules/gtoken
rm -rf node_modules/.gtoken*

# Quick install
npm install

echo "✅ Done!"