# Docker Deployment

Complete guide to deploying SSR-Starter using Docker and containerization.

## Quick Start with Docker

### Prerequisites

- Docker Engine 20.10+
- Docker Compose (optional but recommended)

### Basic Docker Run

```bash
# Build and run with environment variables
docker run -d \
  --name ssr-starter \
  -p 3000:3000 \
  -e GRAPHQL_ENDPOINT=https://your-site.com/graphql \
  -e S3_ASSETS_URL=https://your-assets.com \
  -e MAINDB=LMDB \
  ghcr.io/buildy-ui/ssr-starter:latest
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  ssr-starter:
    image: ghcr.io/buildy-ui/ssr-starter:latest
    ports:
      - "3000:3000"
    environment:
      - GRAPHQL_ENDPOINT=https://your-site.com/graphql
      - S3_ASSETS_URL=https://your-assets.com
      - MAINDB=LMDB
      - BACKUPDB=IndexedDB
    restart: unless-stopped
    volumes:
      - ./data:/app/data  # Persist LMDB data
```

Run with:

```bash
docker compose up -d
```

## Dockerfile Analysis

### Build Stages

```dockerfile
# syntax=docker/dockerfile:1.4
FROM oven/bun:1

WORKDIR /app

# Copy source files
COPY . .

# Install dependencies
RUN bun install

# Set environment (build-time)
ARG GRAPHQL_ENDPOINT
ARG S3_ASSETS_URL
ENV NODE_ENV=production \
    PORT=3000 \
    GRAPHQL_ENDPOINT=${GRAPHQL_ENDPOINT} \
    S3_ASSETS_URL=${S3_ASSETS_URL}

# Build application
RUN bun run build

# Verify build artifacts
RUN ls -la dist/

EXPOSE 3000
CMD ["bun", "run", "start"]
```

### Build Arguments

```bash
# Build with specific endpoints
docker build \
  --build-arg GRAPHQL_ENDPOINT=https://api.example.com/graphql \
  --build-arg S3_ASSETS_URL=https://cdn.example.com \
  -t ssr-starter .
```

## Production Docker Compose

### Full Production Setup

```yaml
version: '3.8'
services:
  ssr-starter:
    image: ghcr.io/buildy-ui/ssr-starter:latest
    container_name: ssr-starter-prod
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - GRAPHQL_ENDPOINT=https://api.example.com/graphql
      - S3_ASSETS_URL=https://cdn.example.com
      - MAINDB=LMDB
      - BACKUPDB=IndexedDB
      - PORT=3000
      - DEBUG=false
    volumes:
      - ./data:/app/data:rw
      - ./logs:/app/logs:rw
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - web

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - ssr-starter
    networks:
      - web

networks:
  web:
    driver: bridge

volumes:
  ssr-data:
    driver: local
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream ssr_app {
        server ssr-starter:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json;

        # Static assets with caching
        location /styles.css {
            proxy_pass http://ssr_app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location /entry-client.js {
            proxy_pass http://ssr_app;
            expires 1M;
            add_header Cache-Control "public, immutable";
        }

        location /assets/ {
            proxy_pass http://ssr_app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API endpoints
        location /api/ {
            proxy_pass http://ssr_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # SSR pages
        location / {
            proxy_pass http://ssr_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Enable gzip
            gzip_vary on;

            # Timeout settings
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
```

## Multi-Stage Deployment

### Development Environment

```yaml
version: '3.8'
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: mysql
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wp_data:/var/www/html
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    volumes:
      - db_data:/var/lib/mysql

  ssr-starter:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      GRAPHQL_ENDPOINT: http://wordpress:80/graphql
      S3_ASSETS_URL: http://localhost:3000/assets
      MAINDB: JsonDB
      NODE_ENV: development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - wordpress

volumes:
  wp_data:
  db_data:
```

### CI/CD Pipeline

#### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/buildy-ui/ssr-starter:latest
          build-args: |
            GRAPHQL_ENDPOINT=${{ secrets.GRAPHQL_ENDPOINT }}
            S3_ASSETS_URL=${{ secrets.S3_ASSETS_URL }}

      - name: Deploy to production
        run: |
          echo "${{ secrets.DOCKER_COMPOSE_PROD }}" > docker-compose.prod.yml
          docker compose -f docker-compose.prod.yml up -d
```

## Storage Configuration

### LMDB Persistence

```yaml
services:
  ssr-starter:
    volumes:
      - ssr_lmdb_data:/app/data
    environment:
      - MAINDB=LMDB

volumes:
  ssr_lmdb_data:
    driver: local
```

### External Database

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  ssr-starter:
    environment:
      - MAINDB=Redis
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

volumes:
  redis_data:
```

## Monitoring and Logging

### Health Checks

```yaml
services:
  ssr-starter:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Logging Configuration

```yaml
services:
  ssr-starter:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    volumes:
      - ./logs:/app/logs
```

### Monitoring with Prometheus

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  ssr-starter:
    environment:
      - METRICS_PORT=9090

volumes:
  prometheus_data:
```

## Security Best Practices

### Non-Root User

```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs
```

### Security Scanning

```yaml
# Add security scanning to CI
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'image'
    scan-ref: 'ghcr.io/buildy-ui/ssr-starter:latest'
```

### Secrets Management

```yaml
services:
  ssr-starter:
    secrets:
      - graphql_endpoint
      - s3_assets_url

secrets:
  graphql_endpoint:
    file: ./secrets/graphql_endpoint.txt
  s3_assets_url:
    file: ./secrets/s3_assets_url.txt
```

## Performance Optimization

### Multi-Stage Builds

```dockerfile
# Dependencies stage
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json ./
RUN bun install --frozen-lockfile

# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1 AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["bun", "run", "start"]
```

### Resource Limits

```yaml
services:
  ssr-starter:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting Docker Issues

### Container Won't Start

```bash
# Check container logs
docker logs ssr-starter

# Check container status
docker ps -a

# Inspect container
docker inspect ssr-starter
```

### Build Failures

```bash
# Build with verbose output
docker build --progress=plain -t ssr-starter .

# Check build cache
docker system df
docker builder prune
```

### Network Issues

```bash
# Test connectivity from container
docker run --rm --network container:ssr-starter \
  curlimages/curl:latest \
  curl -f http://localhost:3000/health

# Check network configuration
docker network ls
docker network inspect bridge
```

### Storage Issues

```bash
# Check volume permissions
docker run --rm -v ssr_data:/data alpine ls -la /data

# Clean up volumes
docker volume rm $(docker volume ls -q)
```

## Advanced Docker Patterns

### Docker Swarm

```yaml
version: '3.8'
services:
  ssr-starter:
    image: ghcr.io/buildy-ui/ssr-starter:latest
    ports:
      - "80:3000"
    environment:
      - GRAPHQL_ENDPOINT=https://api.example.com/graphql
    deploy:
      mode: replicated
      replicas: 3
      restart_policy:
        condition: on-failure
      labels:
        - "traefik.http.routers.ssr.rule=Host(`ssr.example.com`)"
        - "traefik.http.services.ssr.loadbalancer.server.port=3000"
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ssr-starter
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ssr-starter
  template:
    metadata:
      labels:
        app: ssr-starter
    spec:
      containers:
      - name: ssr-starter
        image: ghcr.io/buildy-ui/ssr-starter:latest
        ports:
        - containerPort: 3000
        env:
        - name: GRAPHQL_ENDPOINT
          value: "https://api.example.com/graphql"
        - name: MAINDB
          value: "LMDB"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### GitOps with ArgoCD

```yaml
# Application manifest
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ssr-starter
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/buildy-ui/ssr-starter
    path: k8s
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: ssr-starter
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

This comprehensive Docker guide covers everything from basic containerization to advanced production deployments with monitoring, security, and scalability considerations.
