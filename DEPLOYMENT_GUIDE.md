# Bloom Website Deployment Guide

## For Unraid Deployment

### 1. Upload Project to Unraid
```bash
# Copy the entire Terminal-Grounds-Website folder to your Unraid server
# For example, to /mnt/user/docker/bloom-website/
```

### 2. Configure Environment
Create a `.env` file in the project root:
```bash
HOST_PORT=2161
DOMAIN=bloom.yourdomain.com
TZ=America/New_York
```

### 3. Deploy with Docker Compose
```bash
cd /mnt/user/docker/bloom-website/
docker-compose up -d
```

### 4. Verify Deployment
```bash
# Check container is running
docker ps | grep bloom-website

# Test health endpoint
curl http://localhost:2161/health

# Should return: OK
```

### 5. Configure Reverse Proxy (Optional)
If using Nginx Proxy Manager or similar:
- **Domain**: bloom.yourdomain.com
- **Forward Hostname**: [your-unraid-ip]
- **Forward Port**: 2161
- **Enable SSL**: Yes (recommended)

## Alternative: Direct Docker Commands

### Build
```bash
docker build -t bloom-website .
```

### Run
```bash
docker run -d \
  --name bloom-website \
  -p 2161:80 \
  --restart unless-stopped \
  bloom-website
```

## For Development (Local Testing)

### Option 1: Python Simple Server
```bash
cd site
python -m http.server 8000
# Visit: http://localhost:8000
```

### Option 2: Node.js Serve
```bash
npx serve site -p 8000
# Visit: http://localhost:8000
```

## Content Updates

### Live Updates (Development)
Uncomment the volume mount in `docker-compose.yml`:
```yaml
volumes:
  - ./site:/usr/share/nginx/html:ro
```

Then restart: `docker-compose restart`

### Production Updates
1. Make changes to files in `site/`
2. Rebuild container: `docker-compose up -d --build`

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs bloom-website

# Check if port is in use
netstat -tlnp | grep 2161
```

### Website Not Accessible
1. Check firewall rules
2. Verify port mapping: `docker port bloom-website`
3. Check Nginx logs: `docker exec bloom-website tail -f /var/log/nginx/error.log`

### Health Check Failing
The health check endpoint is at `/health` and should return "OK".
```bash
curl http://localhost:2161/health
```

## Performance Notes

- Static files cached for 1 year
- Gzip compression enabled
- Health check every 30 seconds
- Nginx optimized for static content serving

## Security Features

- Security headers enabled (XSS, CSRF protection)
- HSTS ready (enable when using HTTPS)
- No server-side processing (static files only)
- Hidden files (.env, .git) blocked by Nginx