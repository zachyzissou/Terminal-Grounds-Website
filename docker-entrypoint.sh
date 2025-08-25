#!/bin/sh

# Terminal Grounds Website Auto-Update Entrypoint
# Pulls latest changes from GitHub and runs asset pipeline on container startup

set -e

echo "🚀 Terminal Grounds Website - Starting auto-update process..."

# Configuration
REPO_URL="https://github.com/zachgentner/Terminal-Grounds-Website.git"
MAIN_REPO_URL="https://github.com/zachgentner/Terminal-Grounds.git"
WORK_DIR="/tmp/terminal-grounds-update"
WEBSITE_DIR="/usr/share/nginx/html"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to clean up temporary directories
cleanup() {
    log "🧹 Cleaning up temporary directories..."
    rm -rf "$WORK_DIR" || true
}

# Set up cleanup trap
trap cleanup EXIT

# Create temporary work directory
log "📁 Creating temporary work directory..."
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# Clone the website repository
log "📦 Cloning Terminal Grounds Website repository..."
git clone "$REPO_URL" website
cd website

# Get the latest commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
log "✅ Latest commit: $COMMIT_HASH"

# Check if Terminal-Grounds repository exists for asset pipeline
if [ -d "../Terminal-Grounds" ]; then
    log "🔄 Terminal-Grounds repository already exists, pulling updates..."
    cd ../Terminal-Grounds
    git pull origin main || log "⚠️ Failed to pull Terminal-Grounds updates, continuing with existing version..."
    cd ../website
else
    log "📦 Cloning Terminal-Grounds repository for assets..."
    cd ..
    git clone "$MAIN_REPO_URL" Terminal-Grounds || {
        log "⚠️ Failed to clone Terminal-Grounds repository, skipping asset pipeline..."
    }
    cd website
fi

# Run asset pipeline if script exists and Terminal-Grounds repo is available
if [ -f "scripts/asset-pipeline.js" ] && [ -d "../Terminal-Grounds" ]; then
    log "🎨 Running asset pipeline..."
    node scripts/asset-pipeline.js || {
        log "⚠️ Asset pipeline failed, continuing with existing assets..."
    }
else
    log "ℹ️ Asset pipeline not available, using existing assets..."
fi

# Copy website files to nginx directory
log "📋 Updating website files..."
rm -rf "$WEBSITE_DIR"/*
cp -r site/* "$WEBSITE_DIR/"

# Ensure health check endpoint exists
echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body>OK</body></html>' > "$WEBSITE_DIR/health"

# Set proper permissions
chown -R nginx:nginx "$WEBSITE_DIR"
chmod -R 755 "$WEBSITE_DIR"

log "✅ Website updated successfully!"
log "🌐 Commit: $COMMIT_HASH"
log "🚀 Starting nginx..."

# Execute the main command (nginx)
exec "$@"