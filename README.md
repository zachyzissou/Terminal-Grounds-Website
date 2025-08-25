# Bloom - Official Website

A standalone static website showcasing the Bloom tactical extraction game, set in the Terminal Grounds universe.

## Features

- **Modern Design**: Cyberpunk-inspired aesthetic matching the game's visual identity
- **Responsive**: Mobile-first design that works on all devices
- **Fast Loading**: Optimized static assets with proper caching
- **Docker Ready**: Complete containerization for easy deployment on Unraid/Docker
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

# Access at http://localhost:8098
```

### Unraid Deployment

1. Copy this entire project to your Unraid server
2. Set environment variables:
   ```bash
   HOST_PORT=8098
   DOMAIN=bloom.yourserver.com
   TZ=America/New_York
   ```
3. Run: `docker-compose up -d`
4. Configure reverse proxy to point to port 8098

## Content Updates

### Adding New Artwork
1. Place images in `site/artwork/`
2. Update `site/data/artwork.json` with metadata
3. Rebuild container: `docker-compose up -d --build`

### Updating Progress
1. Edit `site/data/milestones.json`
2. Edit `site/data/progress.json`
3. Rebuild container (or use volume mount for live updates)

## Environment Variables

- `HOST_PORT`: Host port for the container (default: 8098)
- `DOMAIN`: Domain name for reverse proxy
- `TZ`: Timezone (default: UTC)

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