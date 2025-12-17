# Environment Variables

Configuration options for the SSR application.

## Required Variables

### `GRAPHQL_ENDPOINT`

WordPress GraphQL API endpoint URL.

```bash
# Production
GRAPHQL_ENDPOINT=https://myblog.com/graphql

# Development
GRAPHQL_ENDPOINT=https://dev.myblog.com/graphql

# Local WordPress
GRAPHQL_ENDPOINT=http://localhost:8080/graphql
```

### `S3_ASSETS_URL`

Base URL for static assets (fonts, images, etc.).

```bash
# AWS S3
S3_ASSETS_URL=https://myblog-assets.s3.amazonaws.com

# Local development
S3_ASSETS_URL=http://localhost:3000/assets
```

## Server Configuration

### `PORT`

Server listening port.

```bash
# Default
PORT=3000

# Custom port
PORT=8080
```

**Default**: `3000`

### `NODE_ENV`

Environment mode.

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

**Default**: `development`

## Optional Variables

### `HOST`

Server bind host.

```bash
HOST=0.0.0.0    # All interfaces
HOST=localhost  # Local only
```

**Default**: `0.0.0.0`