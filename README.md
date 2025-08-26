# Bloom - Official Website

A standalone static website showcasing the Bloom tactical extraction game, set in the Terminal Grounds universe.

## Features

- **Modern Design**: Cyberpunk-inspired aesthetic matching the game's visual identity
- **AAA Asset Gallery**: 112 premium Terminal Grounds assets showcasing PERFECT_PARAMS methodology
- **Responsive**: Mobile-first design that works on all devices
- **Fast Loading**: Optimized static assets with proper caching
- **Docker Ready**: Complete containerization for easy deployment on Unraid/Docker  
- **Automated Deployment**: GitHub Actions CI/CD pipeline for GitHub Container Registry publishing
- **SEO Optimized**: Proper meta tags and semantic HTML structure

## Project Structure

```
.
├── Dockerfile                 # Container configuration
├── docker-compose.yml        # Docker Compose setup for easy deployment
├── nginx.conf                # Production-ready Nginx configuration
├── README.md                 # This file
└── site/                     # Website content
    ├── index.html            # Homepage
    ├── story.html            # Story & Lore page
    ├── progress.html         # Development progress
    ├── concept-art.html      # Art gallery
    ├── milestones.html       # Project milestones
    ├── assets/
    │   ├── css/
    │   │   └── main.css      # Main stylesheet
    │   ├── js/
    │   │   └── main.js       # Interactive features
    │   └── images/           # Static images
    ├── data/                 # JSON data files
    └── artwork/              # Generated concept art
```

## Quick Start

### Local Development
```bash
# Serve locally (requires Python)
cd site
python -m http.server 8000

# Or with Node.js
npx serve site
```

### Populate the Gallery from Local Assets

If you want the Concept Art gallery to auto-populate from all images already in `site/assets/images/**`, run the local scanner:

```bash
node scripts/local-asset-scan.js
```

This generates:

- `site/assets/images/manifest.json`
- `site/assets/snippets/gallery-items.html` (auto-included on the Concept Art page)

Note: This does not require the sibling Terminal-Grounds repository. For cross-repo syncing, see `scripts/asset-pipeline.js`.

## Premium Asset Content

### Current Asset Library (112 Assets)
**Last Updated**: August 26, 2025

#### Asset Categories
- **Environmental Renders** (40+ assets): HQ metro corridors, IEZ facilities, post-cascade atmospherics
- **Enhanced Faction Emblems** (10+ assets): Premium DIR emblem variations with tactical authenticity
- **Production Concept Art** (15+ assets): PROD series with web-optimized variants
- **Refined Quality Assets** (25+ assets): REFINE_SHARP series with professional toning
- **Technical Demonstrations** (22+ assets): PERFECT_PARAMS showcase, workflow examples

#### Quality Standards
All assets generated using **PERFECT_PARAMS methodology**:
- Scheduler: `heun/normal`
- CFG Scale: `3.2` 
- Steps: `25`
- Quality Tier: 4-tier system with 85+ pass threshold

#### Asset Integration Process
```bash
# Sync premium assets from Terminal-Grounds repository
node scripts/asset-pipeline.js

# Generate gallery integration
node scripts/local-asset-scan.js

# Build with latest assets
docker-compose up -d --build
```

### Docker Deployment (Production)

```bash
# Build and run
docker-compose up -d

# Access at http://localhost:2161
```

### Unraid Deployment (Local Build: no registry, no runner)

Use the helper scripts to rebuild and restart locally (mirrors toonamiaftermath-downlink pattern):

- On Unraid/Linux:
  - Make executable once: chmod +x scripts/build-local.sh
  - Run: ./scripts/build-local.sh 2161

- On Windows (PowerShell):
  - Run: pwsh ./scripts/build-local.ps1 -Port 2161

Both scripts will:

- docker compose up -d --build
- Wait for /health to pass
- Print recent logs if health fails

Optional: Run `node scripts/local-asset-scan.js` before building to include all current images in the Concept Art gallery automatically.

**Using Community Applications Template:**

1. **Add Template**: Use template URL: `https://raw.githubusercontent.com/zachyzissou/Terminal-Grounds-Website/main/bloom-unraid-template.xml`
2. **Install**: Search for "Bloom Website" in Community Applications
3. **Configure**:

- Port: 2161 (default, thematically matches game year 2161)
- Timezone: Set to your timezone
- Config Path: `/mnt/user/appdata/bloom-website`

4) **Access**: Visit `http://YOUR_UNRAID_IP:2161`

**Manual Docker Setup:**

```bash
docker run -d \
  --name bloom-website \
  -p 2161:80 \
  -v /mnt/user/appdata/bloom-website:/config \
  ghcr.io/zachyzissou/terminal-grounds-website:latest
```

## Content Updates

### Adding New Artwork

1. Place images in `site/artwork/`
2. Update `site/data/artwork.json` with metadata
3. Rebuild container: `docker-compose up -d --build`

### Updating Progress

1. Edit `site/data/milestones.json`
2. Edit `site/data/progress.json`
3. Rebuild container (or use volume mount for live updates)

## Automated Deployment

This repository uses GitHub Actions to automatically build and deploy Docker images:

### Triggers

- **Push to main**: Automatically builds and pushes `latest` tag
- **Pull requests**: Builds image for testing (doesn't push)
- **Releases**: Creates versioned tags (e.g., `v1.0.0`, `1.0`, `1`)

### GitHub Container Registry

Images are published to: `ghcr.io/zachyzissou/terminal-grounds-website`

**Available Tags:**

- `latest`: Latest stable build from main branch
- `main`: Alias for latest
- `v*.*.*`: Semantic version releases

### Setup Requirements

Requires a `GITHUB_TOKEN` (automatically provided by GitHub Actions) for publishing images to GitHub Container Registry (GHCR).
No manual secret setup is required for basic publishing. For advanced permissions (e.g., publishing to other repositories), you may use a Personal Access Token (PAT) as a secret named `GHCR_PAT`.

## Environment Variables

- `HOST_PORT`: Host port for the container (default: 2161)
- `DOMAIN`: Domain name for reverse proxy  
- `TZ`: Timezone (default: America/New_York)

## Security Features

- Security headers (XSS, CSRF, etc.)
- HSTS support (when served via HTTPS)
- Health check endpoint at `/health`
- No server-side processing (static files only)

## Performance Features

- Gzip compression
- Asset caching (1 year for static assets)
- Optimized Nginx configuration
- Minified CSS/JS (in production)

## Reverse Proxy Configuration

### Nginx Proxy Manager

```text
Proxy Host: bloom.example.com
Forward Hostname/IP: container_ip
Forward Port: 80
```

### Traefik (labels included in docker-compose.yml)

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.bloom.rule=Host(`bloom.example.com`)"
```

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Server**: Nginx (Alpine Linux)
- **Fonts**: Google Fonts (Orbitron, Inter)
- **Icons**: Unicode/Emoji (no external dependencies)
- **Build**: Docker multi-stage build

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This website is part of the Bloom game project. All rights reserved.

---

**Bloom** - Tactical extraction redefined.

<!-- Docker build test -->