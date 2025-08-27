# Terminal Grounds Website - Automated Deployment

This repository includes automated deployment configuration for seamless updates via Docker and Unraid.

## 🚀 How It Works

The container automatically:
1. **Pulls latest code** from this GitHub repository on startup
2. **Syncs game assets** from the Terminal-Grounds repository via asset pipeline
3. **Serves the updated website** with nginx
4. **Health monitoring** ensures container reliability

## 📦 Unraid Deployment (Recommended)

### Quick Setup
1. Add the template URL to your Unraid Community Applications:
   ```
   https://raw.githubusercontent.com/zachyzissou/Terminal-Grounds-Website/main/bloom-unraid-template.xml
   ```

2. Install "Terminal-Grounds-Website" from your apps

3. Configure settings:
   - **Port**: Default 2161 (customizable)
   - **Timezone**: Your local timezone
   - **Logs**: Optional persistent log storage

### Updating the Website
To deploy website updates:
1. **Push changes to GitHub** (development team)
2. **Restart the container** in Unraid (you)
3. **That's it!** The container automatically pulls the latest code

## 🐳 Docker Compose Deployment

For non-Unraid setups:

```bash
# Clone repository
git clone https://github.com/zachyzissou/Terminal-Grounds-Website.git
cd Terminal-Grounds-Website

# Build and start
docker-compose up -d --build

# Update website (pulls latest from GitHub)
docker-compose up -d --build --force-recreate
```

## 🔧 Manual Docker Build

```bash
# Build image
docker build -t terminal-grounds-website .

# Run container
docker run -d \
  --name terminal-grounds-website \
  --restart unless-stopped \
  -p 2161:80 \
  --health-cmd="wget -qO- http://127.0.0.1/health || exit 1" \
  --health-interval=30s \
  terminal-grounds-website
```

## 📋 Container Features

- **Auto-updating**: Pulls latest GitHub changes on startup
- **Asset Pipeline**: Syncs 120+ game assets automatically  
- **Health Checks**: Built-in monitoring and recovery
- **Performance Optimized**: Alpine Linux + nginx
- **Production Ready**: Proper logging and error handling
- **Zero Downtime**: Restart container = instant updates

## 🔍 Monitoring

### Health Check
The container includes a health check endpoint at `/health`

### Logs
View container logs:
```bash
# Docker Compose
docker-compose logs -f terminal-grounds-website

# Docker
docker logs -f terminal-grounds-website
```

### Asset Pipeline Status
Check if assets synced properly by looking for:
- `/assets/images/manifest.json` (asset inventory)
- Console logs during container startup

## 🛠️ Troubleshooting

### Container won't start
1. Check logs: `docker logs terminal-grounds-website`
2. Verify port 2161 is available
3. Ensure sufficient disk space

### Website not updating  
1. Restart container to pull latest changes
2. Check GitHub repository is accessible
3. Verify container has network access

### Asset pipeline issues
1. Check Terminal-Grounds repository access
2. Verify nodejs/npm are working in container
3. Review asset-pipeline.js logs

## 📱 Access

After deployment:
- **Website**: http://your-server-ip:2161
- **Health**: http://your-server-ip:2161/health

## 🔄 Development Workflow

1. **Developers**: Push changes to GitHub
2. **Operations**: Restart Unraid container  
3. **Automated**: Container pulls updates and deploys

This creates a simple, reliable deployment pipeline where code changes automatically become live with a single container restart.