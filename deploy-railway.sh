#!/bin/bash

# Railway deployment with persistent volume setup

echo "🚀 Setting up Brel Cafe with persistent database storage..."

# Add Railway volume through CLI (this needs to be done manually in Railway dashboard)
echo "📁 Database will be stored in persistent volume"

# Initialize database only if it doesn't exist
if [ ! -f "$RAILWAY_VOLUME_MOUNT_PATH/menu.db" ]; then
    echo "🔄 Initializing new database..."
    npm run init-db
else
    echo "✅ Database already exists, skipping initialization"
fi

# Start the application
echo "🌟 Starting Brel Cafe server..."
npm start