#!/bin/sh

# Terminal Grounds Website Auto-Update Entrypoint
# Periodically pulls latest changes from GitHub and runs asset pipeline.
# No Docker Hub / no runner required.

set -e

echo "🚀 Terminal Grounds Website - Starting auto-update process..."

# Configuration
REPO_URL="https://github.com/zachyzissou/Terminal-Grounds-Website.git"
MAIN_REPO_URL="https://github.com/zachyzissou/Terminal-Grounds.git"
SRC_ROOT="/var/cache/site-src"
WEBSITE_CLONE="$SRC_ROOT/website"
MAIN_CLONE="$SRC_ROOT/Terminal-Grounds"
WEBSITE_DIR="/usr/share/nginx/html"
STATE_FILE="$SRC_ROOT/last_deployed_commit"
UPDATE_INTERVAL_SECONDS="${UPDATE_INTERVAL_SECONDS:-600}" # default 10 minutes

# Log helper
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Safe git for containerized environments
git config --global --add safe.directory "$WEBSITE_CLONE" 2>/dev/null || true
git config --global --add safe.directory "$MAIN_CLONE" 2>/dev/null || true

ensure_clones() {
    mkdir -p "$SRC_ROOT"
    if [ -d "$WEBSITE_CLONE/.git" ]; then
        (cd "$WEBSITE_CLONE" && git fetch --depth=1 origin main && git reset --hard origin/main) || log "⚠️ Failed to update website repo"
    else
        log "📦 Cloning website repo..."
        rm -rf "$WEBSITE_CLONE" || true
        git clone --depth=1 -b main "$REPO_URL" "$WEBSITE_CLONE" || log "⚠️ Failed to clone website repo"
    fi

    if [ -d "$MAIN_CLONE/.git" ]; then
        (cd "$MAIN_CLONE" && git fetch --depth=1 origin main && git reset --hard origin/main) || log "⚠️ Failed to update Terminal-Grounds repo"
    else
        log "📦 Cloning Terminal-Grounds repo for assets..."
        rm -rf "$MAIN_CLONE" || true
        git clone --depth=1 -b main "$MAIN_REPO_URL" "$MAIN_CLONE" || log "⚠️ Failed to clone Terminal-Grounds repo (asset pipeline may be skipped)"
    fi
}

run_asset_pipeline() {
    if [ -f "$WEBSITE_CLONE/scripts/asset-pipeline.js" ] && [ -d "$MAIN_CLONE" ]; then
        log "🎨 Running asset pipeline..."
        (cd "$WEBSITE_CLONE" && node scripts/asset-pipeline.js) || log "⚠️ Asset pipeline failed, using existing assets"
    elif [ -f "$WEBSITE_CLONE/scripts/local-asset-scan.js" ]; then
        log "🎨 Running local asset scan..."
        (cd "$WEBSITE_CLONE" && node scripts/local-asset-scan.js) || log "⚠️ Local asset scan failed, using existing assets"
    else
        log "ℹ️ Asset pipeline not available, using existing assets"
    fi
}

deploy_site() {
    mkdir -p "$WEBSITE_DIR"
    rm -rf "$WEBSITE_DIR"/*
    
    # Check if we have Astro setup (package.json with astro dependency)
    if [ -f "$WEBSITE_CLONE/package.json" ] && grep -q '"astro"' "$WEBSITE_CLONE/package.json"; then
        log "🏗️ Building Astro site..."
        (cd "$WEBSITE_CLONE" && npm install && npm run build) || {
            log "⚠️ Astro build failed, falling back to static site"
            [ -d "$WEBSITE_CLONE/site" ] && cp -r "$WEBSITE_CLONE/site"/* "$WEBSITE_DIR/" || true
        }
        # Copy built Astro site
        [ -d "$WEBSITE_CLONE/dist" ] && cp -r "$WEBSITE_CLONE/dist"/* "$WEBSITE_DIR/" || true
    else
        # Fallback to static site
        log "📄 Using static site (no Astro detected)"
        [ -d "$WEBSITE_CLONE/site" ] && cp -r "$WEBSITE_CLONE/site"/* "$WEBSITE_DIR/" || true
    fi
    
    # Ensure health check endpoint exists
    echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body>OK</body></html>' > "$WEBSITE_DIR/health"
    # Permissions (best-effort)
    chown -R nginx:nginx "$WEBSITE_DIR" 2>/dev/null || true
    chmod -R 755 "$WEBSITE_DIR" 2>/dev/null || true
}

current_commit() {
    [ -d "$WEBSITE_CLONE/.git" ] && (cd "$WEBSITE_CLONE" && git rev-parse --short HEAD) || echo "unknown"
}

update_once() {
    ensure_clones
    NEW_COMMIT=$(current_commit)
    OLD_COMMIT=""
    [ -f "$STATE_FILE" ] && OLD_COMMIT=$(cat "$STATE_FILE" 2>/dev/null || echo "")
    if [ "$NEW_COMMIT" != "$OLD_COMMIT" ] && [ "$NEW_COMMIT" != "unknown" ]; then
        log "🔄 New commit detected: $OLD_COMMIT -> $NEW_COMMIT"
        run_asset_pipeline
        deploy_site
        echo "$NEW_COMMIT" > "$STATE_FILE"
        log "✅ Deployed commit $NEW_COMMIT"
    else
        log "⏭️ No changes (commit $NEW_COMMIT). Skipping deploy."
    fi
}

# Initial update before starting nginx
update_once

# Start a background loop for periodic updates
(
  while true; do
    sleep "$UPDATE_INTERVAL_SECONDS"
    update_once || log "⚠️ Periodic update failed"
  done
) &

log "🚀 Starting nginx..."
exec "$@"