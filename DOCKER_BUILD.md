# Docker Build and Push Instructions

## Building the Docker Image

To build the Docker image for the Bloom website:

```bash
# Navigate to the project directory
cd C:\Users\Zachg\Terminal-Grounds-Website

# Build the Docker image
docker build -t ghcr.io/zachyzissou/terminal-grounds-website:latest .

# Test locally (optional)
docker run -d --name bloom-website-test -p 2161:80 ghcr.io/zachyzissou/terminal-grounds-website:latest

# Test the website at http://localhost:2161
# Check health endpoint: http://localhost:2161/health

# Stop test container
docker stop bloom-website-test && docker rm bloom-website-test
```

## Pushing to GitHub Container Registry

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push the image
docker push ghcr.io/zachyzissou/terminal-grounds-website:latest

# Verify the push
docker pull ghcr.io/zachyzissou/terminal-grounds-website:latest
```

> **Note**: Replace `USERNAME` with your GitHub username and `$GITHUB_TOKEN` with a GitHub Personal Access Token that has `write:packages` permission.

## Using the Unraid Template

1. **Add Template**: Copy `bloom-unraid-template.xml` content to your Unraid Community Applications
2. **Install**: Search for "Bloom Website" in Community Applications and install
3. **Configure**: 
   - Port: 2161 (default, thematically matches game year)
   - Timezone: Set to your local timezone
   - Config Path: `/mnt/user/appdata/bloom-website`
4. **Access**: Visit `http://YOUR_UNRAID_IP:2161`

## Template Features

- **Production Ready**: Optimized Nginx configuration with security headers
- **Health Monitoring**: Built-in health checks at `/health` endpoint  
- **Proper Permissions**: Uses nobody:users (99:100) for security
- **Config Persistence**: Stores container data in `/mnt/user/appdata/bloom-website`
- **Thematic Port**: Uses 2161 to match Bloom's timeline (2161 post-Cascade)
- **Modern Format**: Uses Container version="2" format for latest Unraid

## Troubleshooting

### Container Won't Start
- Check port 2161 isn't in use: `netstat -tlnp | grep 2161`
- Verify Docker image exists: `docker images | grep terminal-grounds-website`
- Check logs: `docker logs bloom-website`

### Website Not Accessible
- Verify container is running: `docker ps | grep bloom-website`
- Test health endpoint: `curl http://localhost:2161/health`
- Check Unraid firewall settings

### Template Issues
- Ensure template URL is accessible
- Verify Docker Hub repository exists and is public
- Check Community Applications logs in Unraid