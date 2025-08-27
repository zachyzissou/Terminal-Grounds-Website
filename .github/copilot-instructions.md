# Terminal Grounds Website - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

**Build and Test the Repository:**
- No build process required - this is a static HTML5/CSS3/JavaScript website
- All content is in the `site/` directory
- **Local Development (Python)**: `cd site && python3 -m http.server 8000` - starts in under 2 seconds
- **Local Development (Node.js)**: `npx serve site --listen 8001` - starts in ~3 seconds
- **Docker Simple Build**: `docker build -t website -f Dockerfile.build .` - completes in ~4 seconds
- **Docker Compose Build**: `docker compose build` - completes in ~5 seconds
- **Full Deployment Test**: `docker compose up -d` - auto-updates and starts in ~5 seconds

**Asset Pipeline (Optional):**
- Requires Terminal-Grounds repository in parent directory (`../Terminal-Grounds/`)
- Run: `node scripts/asset-pipeline.js` - processes 115+ assets in ~2 seconds
- Only needed when syncing game assets from main repository
- Fails gracefully if Terminal-Grounds repo not available

## Validation

**ALWAYS test functionality after making changes:**
- **Local Testing**: Access `http://localhost:8000/` (Python) or `http://localhost:8001/` (Node.js)
- **Docker Testing**: Access `http://localhost:2161/` after `docker compose up -d`
- **Health Check**: Test `curl http://localhost:2161/health` - should return "OK"
- **Asset Verification**: Check `site/assets/images/manifest.json` exists and contains valid JSON

**Complete User Scenarios to Test:**
1. **Static Site Navigation**: Visit index.html, click through all navigation links (story.html, progress.html, milestones.html, concept-art.html, etc.)
2. **Asset Loading**: Verify images load correctly in the concept art gallery and progress pages
3. **Mobile Responsiveness**: Test on different viewport sizes
4. **Health Monitoring**: Confirm health endpoint responds correctly for container deployments

**Manual Validation Steps:**
- Always verify the website loads completely in a browser after changes
- Test at least 3 pages: index.html, progress.html, and concept-art.html
- Confirm all CSS and JavaScript assets load without 404 errors
- For Docker deployments, verify container logs show successful startup

## Deployment Paths

**Local Development (Fastest):**
```bash
cd site
python3 -m http.server 8000
# Access: http://localhost:8000/
```

**Production Testing (Docker Simple):**
```bash
docker build -t terminal-grounds-website -f Dockerfile.build .
docker run --rm -d --name tg-test -p 8080:80 terminal-grounds-website
# Access: http://localhost:8080/
# Cleanup: docker stop tg-test
```

**Full Production Deployment (Auto-updating):**
```bash
docker compose up -d
# Access: http://localhost:2161/
# Health: http://localhost:2161/health
# View logs: docker logs terminal-grounds-website
# Cleanup: docker compose down
```

**GitHub Actions CI/CD:**
- Automatically builds on push to main branch
- Uses `Dockerfile.build` for static builds
- Publishes to GitHub Container Registry: `ghcr.io/zachyzissou/terminal-grounds-website`

## Critical File Locations

**Core Website Files:**
- `site/index.html` - Main homepage (39KB)
- `site/assets/css/main.css` - Primary stylesheet
- `site/assets/js/main.js` - Interactive functionality
- `site/assets/images/` - Static assets and generated images

**Docker Configuration:**
- `Dockerfile.build` - Simple static site build (used in CI/CD)
- `Dockerfile` - Auto-updating container with asset pipeline
- `docker-compose.yml` - Production deployment configuration
- `docker-entrypoint.sh` - Auto-update script for production containers

**Asset Pipeline:**
- `scripts/asset-pipeline.js` - Node.js script for syncing game assets
- `sync-assets.bat` - Windows batch script for asset sync
- Requires `../Terminal-Grounds/` repository for asset sources

**GitHub Actions:**
- `.github/workflows/docker-build-deploy.yml` - CI/CD pipeline
- Builds Docker images and publishes to GitHub Container Registry

## Common Tasks

**Making Content Changes:**
1. Edit files in `site/` directory (HTML, CSS, JS)
2. Test locally: `cd site && python3 -m http.server 8000`
3. Verify changes at `http://localhost:8000/`
4. For production: `docker compose up -d --build`

**Updating Assets:**
1. If Terminal-Grounds repo available: `node scripts/asset-pipeline.js`
2. Check generated `site/assets/images/manifest.json`
3. Test asset loading in browser
4. Commit updated assets with content changes

**Docker Deployment Updates:**
1. Make code changes
2. Test locally first
3. Run: `docker compose up -d --build --force-recreate`
4. Verify: `curl http://localhost:2161/health`
5. Check logs: `docker logs terminal-grounds-website`

**Troubleshooting:**
- **Port conflicts**: Use different ports (8001, 8002, etc.) for multiple instances
- **Asset pipeline failures**: Ensure Terminal-Grounds repo exists at `../Terminal-Grounds/`
- **Docker issues**: Check logs with `docker logs terminal-grounds-website`
- **Health check failures**: Verify nginx started and port 2161 is accessible

## Performance Characteristics

- **Static site**: No server-side processing required
- **Fast builds**: All Docker operations complete in under 10 seconds
- **Lightweight**: 39KB homepage, optimized assets
- **Asset pipeline**: Processes 115+ game assets in ~2 seconds when available
- **Container startup**: Full auto-update deployment in ~5 seconds

## Browser Support and Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+) - no framework dependencies
- **Server**: Nginx (Alpine Linux) for production containers
- **Fonts**: Google Fonts (Orbitron, Inter)
- **Build**: Docker multi-stage builds for deployment
- **Browser Support**: Chrome/Edge 90+, Firefox 88+, Safari 14+, mobile browsers

## Important Notes

- **No npm install required** - pure static website with no build dependencies
- **No package.json** - uses CDN resources and vanilla JavaScript
- **No test suite** - manual validation of functionality is required
- **Asset pipeline is optional** - website works without Terminal-Grounds repository
- **Health endpoint** available at `/health` for monitoring
- **Auto-updating containers** pull latest code from GitHub on startup