#!/bin/bash

# Script to help set up Mollie API key for payments

echo "=================================="
echo "Mollie API Key Setup Instructions"
echo "=================================="
echo ""
echo "To enable payments, you need to set up your Mollie API key in GitHub Secrets."
echo ""
echo "Steps:"
echo "1. Go to https://www.mollie.com/dashboard/ and log in"
echo "2. Navigate to Developers > API keys"
echo "3. Copy your Live API key (starts with 'live_')"
echo "   - For testing, use Test API key (starts with 'test_')"
echo ""
echo "4. Add to GitHub Secrets:"
echo "   Go to: https://github.com/groeimetai/groeimetai-platform/settings/secrets/actions"
echo "   Click 'New repository secret'"
echo "   Name: MOLLIE_API_KEY"
echo "   Value: [Your API key]"
echo ""
echo "5. Also add these payment-related secrets if not already set:"
echo "   - NEXT_PUBLIC_APP_URL (already hardcoded in workflow)"
echo ""
echo "Current status:"
echo "---------------"

# Check if we have Mollie API key in local env
if [ -f ".env.local" ]; then
    if grep -q "MOLLIE_API_KEY" .env.local; then
        echo "✅ MOLLIE_API_KEY found in .env.local"
        MOLLIE_KEY=$(grep "MOLLIE_API_KEY" .env.local | cut -d '=' -f2)
        if [[ $MOLLIE_KEY == test_* ]]; then
            echo "   ⚠️  Using TEST key (starts with 'test_')"
        elif [[ $MOLLIE_KEY == live_* ]]; then
            echo "   ✅ Using LIVE key (starts with 'live_')"
        fi
    else
        echo "❌ MOLLIE_API_KEY not found in .env.local"
    fi
else
    echo "❌ No .env.local file found"
fi

echo ""
echo "Testing payments locally:"
echo "------------------------"
echo "1. Use Mollie test API key in .env.local"
echo "2. Test payment methods:"
echo "   - iDEAL: Select any bank"
echo "   - Credit Card: 4543 4740 0224 9996"
echo "   - PayPal: Use test account"
echo ""
echo "For webhook testing locally, use ngrok:"
echo "  ngrok http 3000"
echo "  Update NEXT_PUBLIC_APP_URL in .env.local with ngrok URL"
echo ""

# Quick copy command for GitHub CLI
echo "Quick setup with GitHub CLI:"
echo "---------------------------"
if [ -f ".env.local" ] && grep -q "MOLLIE_API_KEY" .env.local; then
    MOLLIE_KEY=$(grep "MOLLIE_API_KEY" .env.local | cut -d '=' -f2)
    echo "gh secret set MOLLIE_API_KEY --body \"$MOLLIE_KEY\""
else
    echo "gh secret set MOLLIE_API_KEY --body \"your-mollie-api-key\""
fi