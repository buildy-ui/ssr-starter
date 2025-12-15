# Environment Variables

Complete guide to configuring SSR-Starter through environment variables.

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

**Requirements**:
- Must be a valid HTTP/HTTPS URL
- Must point to WordPress with WPGraphQL plugin
- Must be accessible from server

**Verification**:
```bash
curl -X POST $GRAPHQL_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id } } }"}'
```

### `S3_ASSETS_URL`

Base URL for static assets (fonts, images, etc.).

```bash
# AWS S3
S3_ASSETS_URL=https://myblog-assets.s3.amazonaws.com

# Cloudflare R2
S3_ASSETS_URL=https://assets.myblog.com

# Local development
S3_ASSETS_URL=http://localhost:3000/assets
```

**Requirements**:
- Must be a valid HTTP/HTTPS URL
- Must serve static assets
- Should have CORS configured if different domain

## Server Configuration

### `PORT`

Server listening port.

```bash
# Default
PORT=3000

# Custom port
PORT=8080

# For Docker
PORT=80
```

**Default**: `3000`
**Type**: Number

### `NODE_ENV`

Node.js environment mode.

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production

# Testing
NODE_ENV=test
```

**Default**: `undefined` (development)
**Affects**: Error handling, logging, caching

## Storage Configuration

### `MAINDB`

Primary storage adapter for application data.

```bash
# High-performance server storage
MAINDB=LMDB

# Browser-based storage (PWA)
MAINDB=IndexedDB

# File-based storage
MAINDB=JsonDB

# Context-only storage (HTML embedding)
MAINDB=ContextDB

# Disable persistent storage
MAINDB=FALSE
```

**Default**: `FALSE` (GraphQL → In-Memory)
**Options**:
- `LMDB`: Fast key-value database
- `IndexedDB`: Browser storage API
- `JsonDB`: JSON file storage
- `ContextDB`: HTML-embedded data
- `FALSE`: No persistence

### `BACKUPDB`

Backup storage adapter for offline mode.

```bash
# Same options as MAINDB
BACKUPDB=LMDB
BACKUPDB=IndexedDB
BACKUPDB=JsonDB
BACKUPDB=FALSE
```

**Default**: `FALSE`
**Purpose**: Fallback when primary storage fails

## GraphQL Configuration

### `GRAPHQL_MODE` (опционально)
GraphQL synchronization mode. Controls how data flows between GraphQL API and local storage.

```bash
# Only read from GraphQL, write to local storage (current implementation)
GRAPHQL_MODE=GETMODE

# Only write to GraphQL, read from local storage (future mutations)
GRAPHQL_MODE=SETMODE

# Full CRUD operations with GraphQL (when API supports mutations)
GRAPHQL_MODE=CRUDMODE
```

**Default**: `GETMODE`
**Options**:
- `GETMODE`: Read from GraphQL → Store locally (current implementation)
- `SETMODE`: Read locally → Write to GraphQL (for future mutations)
- `CRUDMODE`: Full bidirectional sync (when GraphQL supports mutations)

**Current Status**: Only `GETMODE` is fully implemented. `SETMODE` and `CRUDMODE` are prepared for future GraphQL mutation support.

### `SYNC_ON_BOOT` (опционально)
Controls whether the server runs `syncAllData()` during bootstrap.

```bash
# Default behavior: try to sync from GraphQL on startup
SYNC_ON_BOOT=true

# Offline-friendly behavior: skip startup sync and just warm cache from MAINDB/BACKUPDB
SYNC_ON_BOOT=false
```

**Default**: `true`
**Recommended for offline development**: `false`

### `LOG_DATA_SOURCE` (опционально)
Controls whether the server prints which data source was used to build the base context (GraphQL vs MAINDB vs BACKUPDB).

```bash
# Default behavior: print one line when the base context is loaded
LOG_DATA_SOURCE=true

# Quiet mode: do not print data source logs
LOG_DATA_SOURCE=false
```

**Default**: `true`

## WordPress Configuration

### `WP_USER`

WordPress username for authenticated requests.

```bash
WP_USER=myuser
```

### `WP_PASSWORD`

WordPress password for authenticated requests.

```bash
WP_PASSWORD=mypass123
```

### `WP_AUTH_ENDPOINT`

WordPress authentication endpoint.

```bash
WP_AUTH_ENDPOINT=https://myblog.com/wp-json/jwt-auth/v1/token
```

## Performance Configuration

### `BLOG_PAGE_SIZE`

Number of posts per blog page.

```bash
BLOG_PAGE_SIZE=10
```

**Default**: `3`
**Type**: Number

### `CACHE_TTL`

Cache time-to-live in seconds.

```bash
CACHE_TTL=3600  # 1 hour
```

**Default**: `1800` (30 minutes)

### `MAX_CACHE_SIZE`

Maximum cache size in MB.

```bash
MAX_CACHE_SIZE=100
```

**Default**: `50`

## Development Configuration

### `DEBUG`

Enable debug logging.

```bash
DEBUG=true
DEBUG=ssr:*
DEBUG=ssr:render,ssr:cache
```

**Default**: `false`

### `LOG_LEVEL`

Logging verbosity level.

```bash
LOG_LEVEL=error
LOG_LEVEL=warn
LOG_LEVEL=info
LOG_LEVEL=debug
```

**Default**: `info`

### `HOT_RELOAD`

Enable hot module reloading.

```bash
HOT_RELOAD=true
```

**Default**: `true` in development

## Deployment Configuration

### `HOST`

Server bind host.

```bash
HOST=0.0.0.0    # All interfaces
HOST=localhost  # Local only
```

**Default**: `0.0.0.0`

### `TRUST_PROXY`

Trust proxy headers (for reverse proxies).

```bash
TRUST_PROXY=true
TRUST_PROXY=1
```

**Default**: `false`

### `HEALTH_CHECK_PATH`

Custom health check endpoint.

```bash
HEALTH_CHECK_PATH=/api/health
```

**Default**: `/health`

## Security Configuration

### `ALLOWED_ORIGINS`

CORS allowed origins (comma-separated).

```bash
ALLOWED_ORIGINS=https://myblog.com,https://admin.myblog.com
```

**Default**: `http://localhost:3000`

### `SECRET_KEY`

Application secret for sessions/cookies.

```bash
SECRET_KEY=your-super-secret-key-here
```

### `RATE_LIMIT_WINDOW`

Rate limiting window in milliseconds.

```bash
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

**Default**: `900000`

### `RATE_LIMIT_MAX`

Maximum requests per window.

```bash
RATE_LIMIT_MAX=100
```

**Default**: `100`

## CDN Configuration

### `CDN_URL`

CDN base URL for assets.

```bash
CDN_URL=https://cdn.myblog.com
```

### `CDN_PURGE_KEY`

CDN cache purge API key.

```bash
CDN_PURGE_KEY=your-purge-key
```

## Monitoring Configuration

### `METRICS_PORT`

Metrics server port (for Prometheus/etc).

```bash
METRICS_PORT=9090
```

### `SENTRY_DSN`

Sentry error tracking DSN.

```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### `ANALYTICS_ID`

Google Analytics tracking ID.

```bash
ANALYTICS_ID=GA-XXXXXXXXX
```

## Advanced Configuration

### `MAX_POST_SIZE`

Maximum POST request body size.

```bash
MAX_POST_SIZE=10mb
```

**Default**: `1mb`

### `TIMEOUT`

Request timeout in milliseconds.

```bash
TIMEOUT=30000  # 30 seconds
```

**Default**: `10000`

### `CONNECTION_POOL_SIZE`

Database connection pool size.

```bash
CONNECTION_POOL_SIZE=10
```

**Default**: `5`

## Environment File Examples

### Development (.env.development)

```bash
# Basic setup
GRAPHQL_ENDPOINT=http://localhost:8080/graphql
S3_ASSETS_URL=http://localhost:3000/assets
PORT=3000

# Development features
NODE_ENV=development
DEBUG=true
HOT_RELOAD=true

# Storage (in-memory for speed)
MAINDB=FALSE
BACKUPDB=FALSE
```

### Production (.env.production)

```bash
# Production endpoints
GRAPHQL_ENDPOINT=https://myblog.com/graphql
S3_ASSETS_URL=https://cdn.myblog.com
PORT=80

# Production settings
NODE_ENV=production
DEBUG=false

# High-performance storage
MAINDB=LMDB
BACKUPDB=IndexedDB

# Performance tuning
BLOG_PAGE_SIZE=12
CACHE_TTL=7200
MAX_CACHE_SIZE=200

# Security
SECRET_KEY=production-secret-key
ALLOWED_ORIGINS=https://myblog.com
RATE_LIMIT_MAX=500

# Monitoring
SENTRY_DSN=https://dsn@sentry.io/project
ANALYTICS_ID=GA-PRODUCTION
```

### Docker (.env.docker)

```bash
# Container settings
HOST=0.0.0.0
PORT=80
TRUST_PROXY=true

# Docker-specific paths
GRAPHQL_ENDPOINT=https://host.docker.internal:8080/graphql
S3_ASSETS_URL=https://cdn.myblog.com

# Container storage
MAINDB=LMDB
BACKUPDB=FALSE
```

### Testing (.env.test)

```bash
# Test environment
NODE_ENV=test
GRAPHQL_ENDPOINT=http://localhost:3001/graphql
S3_ASSETS_URL=http://localhost:3001/assets

# Test storage
MAINDB=JsonDB
BACKUPDB=FALSE

# Test settings
DEBUG=false
LOG_LEVEL=error
```

## Validation

Environment variables are validated at startup:

```typescript
// Required variables
if (!process.env.GRAPHQL_ENDPOINT) {
  throw new Error('GRAPHQL_ENDPOINT is required');
}

// URL validation
try {
  new URL(process.env.GRAPHQL_ENDPOINT);
} catch {
  throw new Error('GRAPHQL_ENDPOINT must be a valid URL');
}

// Enum validation
const validMainDB = ['LMDB', 'IndexedDB', 'JsonDB', 'ContextDB', 'FALSE'];
if (!validMainDB.includes(process.env.MAINDB)) {
  throw new Error(`MAINDB must be one of: ${validMainDB.join(', ')}`);
}
```

## Runtime Configuration

Access environment variables in code:

```typescript
// Safe access with defaults
const port = Number(process.env.PORT ?? 3000);
const isDevelopment = process.env.NODE_ENV === 'development';
const graphQLEndpoint = process.env.GRAPHQL_ENDPOINT!;

// Configuration object
const config = {
  port,
  isDevelopment,
  graphQLEndpoint,
  storage: {
    main: process.env.MAINDB || 'FALSE',
    backup: process.env.BACKUPDB || 'FALSE',
  },
  performance: {
    blogPageSize: Number(process.env.BLOG_PAGE_SIZE ?? 3),
    cacheTTL: Number(process.env.CACHE_TTL ?? 1800),
  },
};
```

## Troubleshooting

### Common Issues

**"GRAPHQL_ENDPOINT is required"**
- Set the `GRAPHQL_ENDPOINT` variable
- Ensure it's a valid URL
- Check WordPress GraphQL plugin is active

**"Invalid MAINDB value"**
- Use only allowed values: `LMDB`, `IndexedDB`, `JsonDB`, `ContextDB`, `FALSE`
- Check for typos in variable name

**"Port already in use"**
- Change `PORT` to an available port
- Kill existing process: `lsof -ti:3000 | xargs kill`

**"Storage adapter failed"**
- Check file permissions for LMDB/JSON directories
- Ensure sufficient disk space
- Verify adapter-specific requirements

### Environment-Specific Issues

**Development**: Enable `DEBUG=true` for verbose logging

**Production**: Set `NODE_ENV=production` for optimizations

**Docker**: Use `HOST=0.0.0.0` and configure `TRUST_PROXY=true`
