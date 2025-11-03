#!/bin/bash
# Quick deployment script for Vercel

echo "🚀 Deploying Brel Menu to Vercel..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Initialize database
echo "🗄️ Initializing database..."
npm run init-db

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel

echo "✅ Deployment complete!"
echo "📱 Your menu is now live!"
echo "🔐 Admin login: admin / admin123"
echo "⚠️  Remember to change the admin password in production!"