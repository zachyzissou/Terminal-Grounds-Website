# Bloom - Official Website

A standalone static website showcasing the Bloom tactical extraction game, set in the Terminal Grounds universe.

## Features

- **Modern Design**: Cyberpunk-inspired aesthetic matching the game's visual identity
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

### Docker Deployment (Production)
```bash
# Build and run
docker-compose up -d

# Access at http://localhost:2161
```

### Unraid Deployment (Automated)

**Using Community Applications Template:**
1. **Add Template**: Use template URL: `https://raw.githubusercontent.com/zachyzissou/Terminal-Grounds-Website/main/bloom-unraid-template.xml`
2. **Install**: Search for "Bloom Website" in Community Applications
3. **Configure**: 
   - Port: 2161 (default, thematically matches game year 2161)
   - Timezone: Set to your timezone
   - Config Path: `/mnt/user/appdata/bloom-website`
4. **Access**: Visit `http://YOUR_UNRAID_IP:2161`

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
- `latest`: Latest main branch build  
- Version tags: Released versions (e.g., `v1.0.0`)

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
```
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