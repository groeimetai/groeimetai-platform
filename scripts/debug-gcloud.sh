#!/bin/bash

# Debug script voor Google Cloud authenticatie problemen

echo "🔍 Google Cloud Debug Script"
echo "==========================="
echo ""

# 1. Check current auth
echo "1. Current authentication:"
echo "   Active account: $(gcloud config get-value account)"
echo "   Active project: $(gcloud config get-value project)"
echo ""

# 2. List all projects
echo "2. Available projects for this account:"
gcloud projects list --format="table(projectId,name,projectNumber)"
echo ""

# 3. Check if project exists
echo "3. Checking if project 'groeimetai' exists:"
if gcloud projects describe groeimetai 2>/dev/null; then
    echo "   ✅ Project found!"
    
    # Check billing
    echo ""
    echo "4. Checking billing status:"
    BILLING_ENABLED=$(gcloud beta billing projects describe groeimetai --format="value(billingEnabled)" 2>/dev/null)
    if [ "$BILLING_ENABLED" = "True" ]; then
        echo "   ✅ Billing is enabled"
    else
        echo "   ❌ Billing is NOT enabled!"
        echo "   👉 Enable billing at: https://console.cloud.google.com/billing/linkedaccount?project=groeimetai"
    fi
else
    echo "   ❌ Project not found or no access!"
    echo ""
    echo "   Possible issues:"
    echo "   - Wrong project ID"
    echo "   - Project doesn't exist"
    echo "   - No permissions (even though you're listed as owner)"
fi

# 4. Check Application Default Credentials
echo ""
echo "5. Application Default Credentials:"
if [ -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
    echo "   ✅ ADC file exists"
    echo "   Account in ADC: $(cat $HOME/.config/gcloud/application_default_credentials.json | grep client_email | cut -d'"' -f4)"
else
    echo "   ❌ No ADC file found"
    echo "   👉 Run: gcloud auth application-default login"
fi

# 5. Try to list services
echo ""
echo "6. Checking API access:"
if gcloud services list --enabled --limit=5 &>/dev/null; then
    echo "   ✅ Can list APIs"
    echo "   Enabled APIs (first 5):"
    gcloud services list --enabled --limit=5 --format="table(config.name)"
else
    echo "   ❌ Cannot list APIs"
fi

echo ""
echo "7. Recommendations:"
echo ""

# Check if we need to set quota project
if gcloud auth application-default print-access-token &>/dev/null; then
    echo "   ✅ Application Default Credentials are working"
else
    echo "   ❌ Fix Application Default Credentials:"
    echo "      gcloud auth application-default login"
    echo "      gcloud auth application-default set-quota-project groeimetai"
fi

echo ""
echo "📋 Quick fixes to try:"
echo ""
echo "1. Re-authenticate completely:"
echo "   gcloud auth login --update-adc"
echo ""
echo "2. Set the quota project:"
echo "   gcloud auth application-default set-quota-project groeimetai"
echo ""
echo "3. If billing is the issue, enable it at:"
echo "   https://console.cloud.google.com/billing"
echo ""
echo "4. Try using the project number instead of ID:"
echo "   Look for the project number in the table above"