#!/bin/bash

echo "🚀 Monitoring MythSeeker GitHub Actions Deployment..."
echo "=================================================="

# Get the latest workflow run
LATEST_RUN=$(gh run list --limit 1 --json status,conclusion,url,createdAt --jq '.[0]')

if [ "$LATEST_RUN" = "null" ]; then
    echo "❌ No workflow runs found. Check if the workflow file is properly configured."
    exit 1
fi

STATUS=$(echo "$LATEST_RUN" | jq -r '.status')
CONCLUSION=$(echo "$LATEST_RUN" | jq -r '.conclusion')
URL=$(echo "$LATEST_RUN" | jq -r '.url')
CREATED_AT=$(echo "$LATEST_RUN" | jq -r '.createdAt')

echo "📊 Latest Run Status: $STATUS"
echo "📈 Conclusion: $CONCLUSION"
echo "🔗 URL: $URL"
echo "⏰ Created: $CREATED_AT"
echo ""

case $STATUS in
    "completed")
        if [ "$CONCLUSION" = "success" ]; then
            echo "✅ Deployment completed successfully!"
            echo "🌐 Your app should be live at: https://mythseekers-rpg.web.app"
        else
            echo "❌ Deployment failed with conclusion: $CONCLUSION"
            echo "🔍 Check the logs at: $URL"
        fi
        ;;
    "in_progress")
        echo "🔄 Deployment in progress..."
        echo "📋 View live logs at: $URL"
        ;;
    "queued")
        echo "⏳ Deployment queued..."
        echo "📋 View status at: $URL"
        ;;
    *)
        echo "❓ Unknown status: $STATUS"
        echo "📋 Check details at: $URL"
        ;;
esac

echo ""
echo "💡 Tips:"
echo "  - Visit the Actions tab on GitHub for detailed logs"
echo "  - Check Firebase Console for deployment status"
echo "  - Monitor your app at: https://mythseekers-rpg.web.app" 