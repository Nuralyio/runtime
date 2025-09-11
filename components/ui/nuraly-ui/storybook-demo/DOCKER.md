# Docker Setup for NuralyUI Storybook

This directory contains Docker configuration files to host the NuralyUI Storybook on a server.

## Files Overview

- `docker-compose.yml` - Production setup with Nginx
- `docker-compose.dev.yml` - Development setup with hot reload
- `Dockerfile` - Production Docker image with static build
- `Dockerfile.dev` - Development Docker image
- `nginx.conf` - Nginx configuration for serving static files
- `nginx-proxy.conf` - Nginx reverse proxy configuration (optional)

## Quick Start

### Development Mode

Run Storybook in development mode with hot reload:

```bash
# Build and start development container
docker-compose -f docker-compose.dev.yml up --build

# Access Storybook at http://localhost:6006
```

### Production Mode

Build and serve static Storybook files:

```bash
# Build and start production container
docker-compose up --build

# Access Storybook at http://localhost:3001
```

## Production Deployment

### Basic Deployment

1. **Build the static files:**
   ```bash
   npm run build-storybook
   ```

2. **Start the production container:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access your Storybook:**
   - Local: http://localhost:3001
   - Server: http://your-server-ip:3001

### Advanced Deployment with Reverse Proxy

For production with custom domain and SSL:

1. **Update nginx-proxy.conf:**
   ```bash
   # Replace 'your-domain.com' with your actual domain
   sed -i 's/your-domain.com/yourdomain.com/g' nginx-proxy.conf
   ```

2. **Add SSL certificates (optional):**
   ```bash
   mkdir ssl
   # Copy your SSL certificates to the ssl/ directory
   cp your-cert.crt ssl/
   cp your-key.key ssl/
   ```

3. **Start with reverse proxy:**
   ```bash
   docker-compose --profile production up -d --build
   ```

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
# Port configuration
STORYBOOK_PORT=3001
PROXY_PORT=80
HTTPS_PORT=443

# Domain configuration
DOMAIN=localhost

# SSL configuration (optional)
SSL_CERT_PATH=./ssl/cert.crt
SSL_KEY_PATH=./ssl/private.key
```

## Commands

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild development environment
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Production Commands

```bash
# Start production environment
docker-compose up -d

# View logs
docker-compose logs -f storybook

# Stop production environment
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

### Maintenance Commands

```bash
# View container status
docker-compose ps

# Access container shell
docker-compose exec storybook sh

# View Nginx logs
docker-compose exec storybook tail -f /var/log/nginx/access.log

# Clean up unused images and containers
docker system prune -a
```

## Customization

### Nginx Configuration

Edit `nginx.conf` to customize:
- Caching rules
- Security headers  
- Compression settings
- Custom routes

### Docker Configuration

Edit `docker-compose.yml` to customize:
- Port mappings
- Environment variables
- Volume mounts
- Network settings

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change the port in docker-compose.yml
   ports:
     - "3002:80"  # Change 3001 to 3002
   ```

2. **Build fails:**
   ```bash
   # Clean build cache
   docker-compose build --no-cache
   ```

3. **Can't access Storybook:**
   ```bash
   # Check container status
   docker-compose ps
   
   # Check logs
   docker-compose logs storybook
   ```

### Health Check

The Nginx configuration includes a health check endpoint:
```bash
curl http://localhost:3001/health
```

## Performance Optimization

### Nginx Optimization

The included `nginx.conf` provides:
- Gzip compression for text files
- Long-term caching for static assets
- Security headers
- Optimized buffer sizes

### Docker Optimization

- Multi-stage build reduces image size
- Alpine Linux base images for smaller footprint
- Proper layer caching for faster builds

## Security Considerations

### Production Security

1. **Use HTTPS in production:**
   - Configure SSL certificates
   - Enable HTTPS redirect
   - Use security headers

2. **Firewall configuration:**
   - Only expose necessary ports
   - Use reverse proxy for SSL termination

3. **Regular updates:**
   - Keep base images updated
   - Monitor for security vulnerabilities

### Development Security

- Development containers should not be used in production
- Bind mounts can expose host filesystem
- Use development containers only in trusted environments

## Monitoring

### Basic Monitoring

```bash
# Monitor container resources
docker stats

# Monitor logs in real-time
docker-compose logs -f

# Check container health
docker-compose exec storybook nginx -t
```

### Advanced Monitoring

Consider adding monitoring services like:
- Prometheus for metrics
- Grafana for visualization
- ELK stack for log analysis

## Backup and Recovery

### Backup

```bash
# Backup container
docker commit nuralyui-storybook nuralyui-storybook:backup

# Export image
docker save -o storybook-backup.tar nuralyui-storybook:backup
```

### Recovery

```bash
# Import image
docker load -i storybook-backup.tar

# Start from backup
docker run -p 3001:80 nuralyui-storybook:backup
```
