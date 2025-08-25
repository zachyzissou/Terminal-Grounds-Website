# Terminal Grounds Website - Auto-updating Static Site with Nginx
FROM nginx:1.27-alpine

# Install git and nodejs for automated updates and asset pipeline
RUN apk add --no-cache git nodejs npm wget

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create auto-update entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body>OK</body></html>' > /usr/share/nginx/html/health

# Expose port 80
EXPOSE 80

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

# Use custom entrypoint that pulls latest code and runs asset pipeline
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]