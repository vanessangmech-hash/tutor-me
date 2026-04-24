#!/bin/bash

# TutorMe Insforge Deployment Script
# Deploys backend functions to Insforge

set -e

echo "🚀 TutorMe Backend Deployment to Insforge"
echo "=========================================="

# Check if Insforge CLI is installed
if ! command -v insforge &> /dev/null; then
    echo "❌ Insforge CLI not found. Install it first:"
    echo "   npm install -g @insforge/cli"
    exit 1
fi

# Check if we have a project ID
if [ -z "$INSFORGE_PROJECT_ID" ]; then
    echo "❌ INSFORGE_PROJECT_ID environment variable not set"
    echo "   Set it with: export INSFORGE_PROJECT_ID=your_project_id"
    exit 1
fi

echo "📝 Project ID: $INSFORGE_PROJECT_ID"

# Login if needed
echo "🔐 Checking Insforge authentication..."
if ! insforge projects:list > /dev/null 2>&1; then
    echo "Please login to Insforge:"
    insforge login
fi

# Set project context
echo "📦 Setting project context..."
insforge projects:use $INSFORGE_PROJECT_ID

# Check if env vars are set
echo "🔑 Checking environment variables..."
if ! insforge env:list | grep -q "AKASHML_API_KEY"; then
    echo "⚠️  AKASHML_API_KEY not set in Insforge. Please add it in the dashboard."
fi

# Deploy functions
echo "🚀 Deploying backend functions..."
insforge functions:deploy backend/functions/ --force

# Verify deployment
echo "✅ Verifying deployment..."
DEPLOYED_COUNT=$(insforge functions:list | grep "✓" | wc -l)
echo "   Deployed $DEPLOYED_COUNT functions"

# List deployed functions
echo ""
echo "📊 Deployed Functions:"
insforge functions:list

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with the Insforge URL"
echo "2. Test the functions with: npm run dev"
echo "3. View logs with: insforge functions:logs <function-name> --follow"
