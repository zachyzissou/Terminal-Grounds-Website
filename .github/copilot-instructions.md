# Terminal Grounds Website - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Project Overview
Terminal Grounds Website (codename "Bloom") is a static HTML/CSS/JavaScript website showcasing the tactical extraction FPS game set in the Terminal Grounds universe. The site features an automated asset pipeline that syncs game assets from the main Terminal-Grounds repository and deploys via Docker containers.

## Working Effectively

### Bootstrap and Setup
1. **Local Development Environment**:
   ```bash
   # Navigate to repository root
   cd /path/to/Terminal-Grounds-Website
   
   # Option A: Python HTTP server (recommended for quick testing)
   cd site
   python3 -m http.server 8000
   # Access at http://localhost:8000
   
   # Option B: Node.js serve (more features, takes ~10 seconds)
   npx serve site
   # Access at http://localhost:3000
   ```

2. **Asset Pipeline Setup** (Optional):
   ```bash
   # Only if you need to sync assets from Terminal-Grounds repository
   # Requires Terminal-Grounds repo in parent directory
   # Check if Terminal-Grounds exists
   ls ../Terminal-Grounds/
   
   # Run asset sync if available
   node scripts/asset-pipeline.js
   # OR on Windows
   sync-assets.bat
   ```

3. **Docker Production Build**:
   ```bash
   # Build production image (takes ~4 seconds)
   docker build -f Dockerfile.build -t terminal-grounds-website .
   # NEVER CANCEL: Build completes in under 10 seconds
   
   # Run container
   docker run -d --name terminal-grounds-website -p 2161:80 terminal-grounds-website
   # Access at http://localhost:2161
   
   # Stop and remove
   docker stop terminal-grounds-website && docker rm terminal-grounds-website
   ```

4. **Docker Compose** (Note: Development build may fail):
   ```bash
   # Production build using Dockerfile.build works
   docker compose -f docker-compose.yml build --build-arg DOCKERFILE=Dockerfile.build
   
   # Standard build (Dockerfile) fails due to network restrictions
   # DO NOT USE: docker compose build (will fail after 2+ minutes)
   ```

### CRITICAL TIMING AND CANCELLATION WARNINGS

- **NEVER CANCEL**: Docker production builds complete in under 10 seconds. Wait for completion.
- **DO NOT USE**: Docker development builds (using main Dockerfile) - they fail due to apk package restrictions after 2+ minutes
- **ASSET PIPELINE**: Fails quickly (~1 second) if Terminal-Grounds repo missing - this is expected behavior
- **Local servers**: Start in under 10 seconds for npx serve, instantly for Python

## Validation

### Always Test These Scenarios After Changes
1. **Local Development Validation**:
   ```bash
   # Test Python server
   cd site && python3 -m http.server 8000 &
   curl -I http://localhost:8000/
   curl -I http://localhost:8000/story.html
   curl -I http://localhost:8000/assets/css/main.css
   kill %1
   
   # Test npx serve 
   npx serve site &
   sleep 10
   curl -I http://localhost:3000/
   curl -I http://localhost:3000/factions.html
   kill %1
   ```

2. **Docker Production Validation**:
   ```bash
   # Build and test production image
   docker build -f Dockerfile.build -t test-build .
   docker run -d --name test-container -p 8080:80 test-build
   
   # Validate all key endpoints
   curl -I http://localhost:8080/
   curl -I http://localhost:8080/health
   curl -I http://localhost:8080/story.html
   curl -I http://localhost:8080/assets/css/main.css
   curl -I http://localhost:8080/assets/js/main.js
   
   # Clean up
   docker stop test-container && docker rm test-container
   ```

3. **Manual Website Functionality**:
   - Visit homepage: verify navigation menu loads
   - Test story page: verify content displays properly
   - Test factions page: verify faction information renders
   - Verify CSS styling applies correctly
   - Test responsive design on different screen sizes

### Asset Pipeline Validation (If Terminal-Grounds Available)
```bash
# Test asset pipeline
node scripts/asset-pipeline.js

# Verify assets synced correctly
ls -la site/assets/images/
cat site/assets/images/manifest.json | head -20

# Check for new assets in categories
ls site/assets/images/environments/
ls site/assets/images/weapons/
ls site/assets/images/factions/
```

## Common Tasks

### Making Content Changes
```bash
# Edit site content
# All website files are in site/ directory
vim site/index.html         # Homepage
vim site/story.html         # Story page
vim site/assets/css/main.css # Styling
vim site/assets/js/main.js   # JavaScript

# Test changes locally
cd site && python3 -m http.server 8000

# Validate in browser at http://localhost:8000
```

### Asset Management
```bash
# Manual asset placement (if no Terminal-Grounds repo)
# Add images to appropriate directories:
site/assets/images/environments/
site/assets/images/weapons/
site/assets/images/factions/
site/assets/images/ui/

# Update manifest manually if needed
vim site/assets/images/manifest.json
```

### Docker Development
```bash
# ALWAYS use Dockerfile.build for reliable builds
# DO NOT use main Dockerfile - it requires internet access

# Build production image
docker build -f Dockerfile.build -t terminal-grounds-website .

# Test with docker compose equivalent
docker run -d \
  --name terminal-grounds-website \
  --restart unless-stopped \
  -p 2161:80 \
  terminal-grounds-website

# Health check
curl http://localhost:2161/health
```

## Troubleshooting

### Local Development Issues
- **Python server not starting**: Ensure you're in the `site/` directory
- **npx serve fails**: Node.js may not be installed or npm registry access blocked
- **Assets missing**: Run asset pipeline or manually place images in `site/assets/images/`

### Docker Issues  
- **Build fails with apk errors**: Use `Dockerfile.build` instead of `Dockerfile`
- **Container won't start**: Check port 2161 isn't in use: `netstat -tlnp | grep 2161`
- **Health check fails**: Ensure `site/index.html` exists and container has proper permissions

### Asset Pipeline Issues
- **Pipeline fails immediately**: Terminal-Grounds repository not found at `../Terminal-Grounds/`
- **No assets synced**: Check Terminal-Grounds repository has `Style_Staging` directory
- **Permission errors**: Ensure write access to `site/assets/images/` directory

## Important File Locations

### Core Website Files
```
site/
├── index.html              # Homepage
├── story.html             # Story/lore page  
├── factions.html          # Factions information
├── regions.html           # Game regions
├── technical.html         # Technical details
├── progress.html          # Development progress
├── assets/
│   ├── css/main.css       # Main stylesheet (3000+ lines)
│   ├── js/main.js         # Main JavaScript
│   ├── js/webgl-effects.js # Visual effects
│   └── images/            # Game assets (synced from Terminal-Grounds)
└── robots.txt             # SEO configuration
```

### Build and Deployment
```
├── Dockerfile             # Development build (FAILS - don't use)
├── Dockerfile.build       # Production build (USE THIS)
├── docker-compose.yml     # Compose configuration
├── docker-entrypoint.sh   # Auto-update script
├── nginx.conf             # Nginx configuration
└── .github/workflows/     # CI/CD pipeline
```

### Asset Pipeline
```
├── scripts/asset-pipeline.js  # Asset sync script
├── sync-assets.bat           # Windows asset sync
└── ../Terminal-Grounds/      # Required parent repo for assets
```

## GitHub Actions Integration

The repository includes automated CI/CD that:
- Builds Docker images on push to main
- Publishes to GitHub Container Registry
- Uses `Dockerfile.build` for reliable builds
- Takes ~2-3 minutes total including upload

### Manual Workflow Testing
```bash
# Test the same build process as GitHub Actions
docker build -f Dockerfile.build -t ghcr.io/zachyzissou/terminal-grounds-website:test .

# Verify image works
docker run -d --name github-test -p 8080:80 ghcr.io/zachyzissou/terminal-grounds-website:test
curl http://localhost:8080/health
docker stop github-test && docker rm github-test
```

## Performance Notes

- **Static site**: No build process required for content changes
- **Asset pipeline**: Only needed when syncing from Terminal-Grounds repo
- **Docker builds**: Production builds are fast (~4 seconds)
- **Local development**: Instant startup with Python server

## Common Pitfalls to Avoid

1. **DO NOT** use the main `Dockerfile` - it will fail after 2+ minutes
2. **DO NOT** cancel Docker builds - they complete quickly when using correct Dockerfile
3. **DO NOT** expect asset pipeline to work without Terminal-Grounds repo in parent directory
4. **ALWAYS** test both local development and Docker deployment
5. **ALWAYS** validate website functionality manually after changes

## Repository Structure Reference

### Repository Root
```
Terminal-Grounds-Website/
├── .github/
│   ├── copilot-instructions.md    # This file
│   └── workflows/
│       └── docker-build-deploy.yml # CI/CD pipeline
├── site/                          # Website content
│   ├── index.html                 # Homepage (39KB)
│   ├── story.html                 # Story page (18KB) 
│   ├── factions.html              # Factions info (7KB)
│   ├── regions.html               # Game regions (11KB)
│   ├── concept-art.html           # Concept art gallery (25KB)
│   ├── milestones.html            # Development milestones (27KB)
│   ├── progress.html              # Progress updates (21KB)
│   ├── technical.html             # Technical details (6KB)
│   ├── 404.html                   # Error page (11KB)
│   ├── robots.txt                 # SEO configuration
│   ├── sitemap.xml                # Site map
│   └── assets/                    # Website assets
├── scripts/
│   └── asset-pipeline.js          # Asset sync script (15KB)
├── Dockerfile                     # Development build (FAILS)
├── Dockerfile.build               # Production build (WORKS)
├── docker-compose.yml             # Container orchestration
├── docker-entrypoint.sh           # Auto-update script
├── nginx.conf                     # Web server config
├── sync-assets.bat                # Windows asset sync
└── [Documentation files]          # README.md, DEPLOYMENT.md, etc.
```

### Quick Reference Commands
```bash
# Common operations (copy/paste ready)
cd site && python3 -m http.server 8000                    # Local dev server
docker build -f Dockerfile.build -t tg-website .          # Production build
docker run -d --name tg-website -p 2161:80 tg-website     # Run container
node scripts/asset-pipeline.js                            # Sync assets
curl http://localhost:8000/health                         # Health check
```

Fixes #3.