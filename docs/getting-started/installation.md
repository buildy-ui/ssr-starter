# Installation

Complete installation guide for SSR-Starter with all prerequisites and configurations.

## System Requirements

### Minimum Requirements

- **Operating System**: Linux, macOS, or Windows 10+
- **Memory**: 512MB RAM (2GB recommended for development)
- **Disk Space**: 500MB free space
- **Network**: Internet connection for WordPress GraphQL API

### Recommended Setup

- **Operating System**: Linux or macOS
- **Memory**: 4GB+ RAM
- **Disk Space**: 1GB+ free space
- **Runtime**: Bun 1.0+ (or Node.js 18+)

## Runtime Installation

### Option 1: Bun (Recommended)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (restart terminal or run)
source ~/.bashrc

# Verify installation
bun --version
```

### Option 2: Node.js

```bash
# Install Node.js 18+ (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

## Project Setup

### 1. Clone Repository

```bash
# Clone the project
git clone https://github.com/your-org/ssr-starter.git
cd ssr-starter

# Verify files
ls -la
```

### 2. Install Dependencies

```bash
# With Bun (recommended)
bun install

# With npm
npm install

# With yarn
yarn install
```

### 3. Verify Installation

```bash
# Check that all dependencies are installed
bun pm ls  # or npm list

# Verify build tools
bun run --help
```

## WordPress Configuration

### 1. Install WordPress

If you don't have WordPress:

```bash
# Using Docker
docker run -d \
  --name wordpress \
  -p 8080:80 \
  -e WORDPRESS_DB_HOST=mysql \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wordpress \
  -e WORDPRESS_DB_NAME=wordpress \
  wordpress:latest

# Access at http://localhost:8080
```

### 2. Install WPGraphQL Plugin

1. Go to WordPress Admin → **Plugins** → **Add New**
2. Search for "**WPGraphQL**"
3. Click **Install Now** → **Activate**

### 3. Configure GraphQL

1. Go to **GraphQL** → **Settings** in WordPress Admin
2. Configure CORS settings:
   - **CORS Settings**: Enable
   - **Allowed Origins**: Add your domain(s)
   - **Allowed Headers**: `Content-Type, Authorization`

### 4. Verify GraphQL Endpoint

```bash
# Test GraphQL endpoint
curl -X POST https://your-wordpress-site.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id title } } }"}'

# Expected response:
# {"data":{"posts":{"nodes":[{"id":"...", "title":"..."}]}}}
```

## Environment Configuration

### 1. Create Environment File

```bash
# Copy template
cp env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

### 2. Required Variables

```bash
# WordPress GraphQL API endpoint
GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql

# CDN URL for static assets (fonts, images)
S3_ASSETS_URL=https://cdn.your-site.com
```

### 3. Optional Variables

```bash
# Server port (default: 3000)
PORT=3000

# Storage adapters
MAINDB=LMDB          # Primary storage: LMDB | IndexedDB | JsonDB | FALSE
BACKUPDB=IndexedDB   # Backup storage: LMDB | IndexedDB | JsonDB | FALSE

# Development settings
NODE_ENV=development
```

## Build Assets

### 1. Initial Build

```bash
# Build all assets
bun run build

# This will:
# - Sync data from WordPress GraphQL
# - Build TailwindCSS styles
# - Bundle client JavaScript
```

### 2. Verify Build Output

```bash
# Check build artifacts
ls -la dist/
# Should contain: entry-client.js, entry-client.js.map, styles.css

ls -la data/
# Should contain: db/ (LMDB files) or json/ (JSON files)
```

## Start Development Server

### Development Mode

```bash
# Full development with hot reload
bun run dev

# Or start server only (assets pre-built)
bun run server:dev
```

### Production Mode

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Verify Installation

### 1. Check Server Health

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00.000Z","posts":42}
```

### 2. Test Application

Open `http://localhost:3000` and verify:

- ✅ Homepage loads with content
- ✅ Navigation works
- ✅ Blog page shows posts
- ✅ Individual post pages render
- ✅ Search functionality works

### 3. Test API Endpoints

```bash
# Get posts via API
curl "http://localhost:3000/api/posts?page=1&limit=3"

# Expected response:
# {"items":[...],"page":1,"limit":3,"total":42,"hasMore":true}
```

## Troubleshooting Installation

### Common Issues

**Bun installation failed**
```bash
# Try alternative installation
curl -fsSL https://bun.sh/install | bash -s -- --path ~/.bun

# Add to PATH
export PATH="$HOME/.bun/bin:$PATH"
```

**WordPress GraphQL not accessible**
```bash
# Check WordPress site
curl https://your-wordpress-site.com/wp-json/wp/v2/posts

# Check GraphQL specifically
curl -X POST https://your-wordpress-site.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id } } }"}'
```

**Build fails**
```bash
# Clear cache and rebuild
rm -rf node_modules/.cache dist/
bun install
bun run build
```

**Port conflicts**
```bash
# Use different port
PORT=3001 bun run dev

# Find process using port 3000
lsof -i :3000
kill -9 <PID>
```

### Getting Help

- Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
- Review [FAQ](../troubleshooting/faq.md)
- Open an [issue](https://github.com/your-org/ssr-starter/issues)

## Next Steps

Once installation is complete:

1. **Customize your theme** in `src/assets/css/index.css`
2. **Add new pages** following the [Adding Pages Guide](../guides/adding-pages.md)
3. **Configure storage** in [Storage Adapters Guide](../guides/storage-adapters.md)
4. **Deploy** using [Deployment Guides](../deployment/docker.md)
