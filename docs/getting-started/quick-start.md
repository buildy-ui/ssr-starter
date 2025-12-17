# Quick Start

Get SSR-Starter up and running in less than 5 minutes.

## Prerequisites

- **Bun** (recommended) or Node.js 18+
- **WordPress** site with WPGraphQL plugin

## 1. Install Bun

```bash
# Install Bun runtime
curl -fsSL https://bun.sh/install | bash

# Restart your terminal or run:
source ~/.bashrc
```

## 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/buildy-ui/ssr-starter.git
cd ssr-starter

# Install dependencies
bun install
```

## 3. Configure WordPress

1. Install [WPGraphQL](https://wordpress.org/plugins/wp-graphql/) plugin
2. Configure CORS settings for your domain
3. Verify GraphQL endpoint: `https://your-site.com/graphql`

## 4. Set Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit .env file
GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql
S3_ASSETS_URL=https://your-assets-cdn.com
```

## 5. Build and Run

```bash
# Build assets
bun run build

# Start development server
bun run dev
```

## 6. Verify Installation

Open `http://localhost:3000` in your browser. You should see:

- ✅ Homepage with latest posts
- ✅ Navigation working
- ✅ Blog page with pagination
- ✅ Individual post pages

## Test Commands

```bash
# Check server health
curl http://localhost:3000/health

# Test API endpoints
curl "http://localhost:3000/api/posts?page=1&limit=5"

# Generate static site
bun run scripts/generate
```

## Next Steps

🎉 **Congratulations!** Your SSR-Starter is running.

### What to do next:

1. **Customize Styling**: Modify `src/assets/css/index.css`
2. **Add New Pages**: Follow the [Adding Pages Guide](../guides/adding-pages.md)
3. **Configure Storage**: Set up [Storage Adapters](../guides/storage-adapters.md)
4. **Deploy**: Check [Deployment Options](../deployment/docker.md)

### Development Workflow

```bash
# Development with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Common Issues

**Port 3000 already in use?**
```bash
# Use different port
PORT=3001 bun run dev
```

**GraphQL connection failed?**
```bash
# Check your GraphQL endpoint
curl $GRAPHQL_ENDPOINT -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id } } }"}'
```

**Need help?**
- Check [Troubleshooting](../troubleshooting/common-issues.md)
- Open an [issue](https://github.com/buildy-ui/ssr-starter/issues)
