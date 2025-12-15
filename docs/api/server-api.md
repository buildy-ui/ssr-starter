# Server API Reference

Complete API reference for SSR-Starter's server-side endpoints and functionality.

## HTTP Endpoints

### GET `/`

**Homepage rendering**
```http
GET /
Accept: text/html
```

**Response**: Full HTML page with homepage content

### GET `/health`

**Server health check**
```http
GET /health
Accept: application/json
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "posts": 42,
  "memory": {
    "rss": 104857600,
    "heapTotal": 67108864,
    "heapUsed": 45000000,
    "external": 2000000
  },
  "uptime": 3600
}
```

### GET `/api/posts`

**Posts API with pagination**
```http
GET /api/posts?page=1&limit=10
Accept: application/json
```

**Query Parameters**:
- `page` (number, optional): Page number, default 1
- `limit` (number, optional): Items per page, default 10

**Response**:
```json
{
  "items": [
    {
      "id": 1,
      "slug": "hello-world",
      "title": "Hello World",
      "excerpt": "Welcome to our blog...",
      "date": {
        "display": "Jan 1, 2024",
        "raw": "2024-01-01T00:00:00.000Z"
      },
      "featuredImage": {
        "url": "https://example.com/image.jpg",
        "alt": "Hello World"
      },
      "categories": [{"id": 1, "name": "News"}],
      "tags": [{"id": 1, "name": "welcome"}],
      "author": {"id": 1, "name": "Admin"}
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 42,
  "hasMore": true
}
```

### GET `/*` (Catch-all)

**SSR rendering for all routes**
```http
GET /blog
GET /posts/my-post
GET /category/news
Accept: text/html
```

**Response**: Server-rendered HTML page

## Static Assets

### GET `/styles.css`

**Compiled TailwindCSS styles**
```http
GET /styles.css
Accept: text/css
```

### GET `/entry-client.js`

**Client-side React bundle**
```http
GET /entry-client.js
Accept: application/javascript
Cache-Control: no-cache, no-store, must-revalidate
```

### GET `/entry-client.js.map`

**Source map for debugging**
```http
GET /entry-client.js.map
Accept: application/json
```

### GET `/assets/*`

**Static assets (fonts, images)**
```http
GET /assets/fonts/nunito.woff2
Accept: font/woff2
```

## Server Functions

### `renderPage(path: string, context: RenderContext)`

Renders a React page to HTML string.

**Parameters**:
- `path` (string): Request path
- `context` (RenderContext): Data context for rendering

**Returns**: Promise with HTML and meta data

```typescript
const result = await renderPage('/blog', context);
// {
//   html: "<div id="root">...</div>",
//   meta: { title: "Blog", description: "...", ... }
// }
```

### `getRouteContext(path: string)`

Gets optimized context for specific route.

**Parameters**:
- `path` (string): Request path

**Returns**: RenderContext optimized for the route

```typescript
const context = getRouteContext('/');
// Returns minimal context for homepage

const blogContext = getRouteContext('/blog?page=2');
// Returns paginated posts for blog page
```

### `syncAllData()`

Synchronizes data from WordPress GraphQL API.

**Returns**: Promise<void>

```typescript
await syncAllData();
// Updates all storage adapters with fresh data
```

## Data Types

### RenderContext

```typescript
interface RenderContext {
  posts: { posts: PostData[] };
  categories: CategoryData[];
  tags: TagData[];
  authors: AuthorData[];
  pages: PageSummary[];
  site: SiteConfig;
  menu: MenuConfig;
  assets: { s3AssetsUrl: string };
  route?: RouteMetadata; // Optional route-specific data
}
```

### PostData

```typescript
interface PostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: {
    display: string;
    raw: string;
  };
  featuredImage?: MediaData;
  thumbnail?: ImageData;
  categories: CategoryData[];
  tags: TagData[];
  author?: AuthorData;
}
```

### RouteMetadata

```typescript
interface RouteMetadata {
  type: 'home' | 'blog' | 'post' | 'category' | 'tag' | 'author' | 'search';
  page?: number;
  perPage?: number;
  totalPosts?: number;
  slug?: string;
  postId?: number;
}
```

## Storage Adapters

### StorageAdapter Interface

```typescript
interface StorageAdapter {
  save(collections: DataCollections): Promise<void>;
  load(): Promise<DataCollections | null>;
  clear(): Promise<void>;
}
```

### DataCollections

```typescript
interface DataCollections {
  posts: PostData[];
  categories: CategoryData[];
  tags: TagData[];
  authors: AuthorData[];
  pages: PageSummary[];
  site?: SiteConfig;
  menu?: MenuConfig;
}
```

## Error Handling

### HTTP Error Responses

```typescript
// 404 Not Found
{ "error": "Not Found", "status": 404 }

// 500 Internal Server Error
{ "error": "Internal Server Error", "status": 500 }
```

### Error Types

- `GraphQLError`: WordPress GraphQL API errors
- `StorageError`: Storage adapter failures
- `RenderError`: React rendering failures
- `NetworkError`: Network connectivity issues

## Rate Limiting

Default rate limits:
- API endpoints: 100 requests/minute
- Static assets: 1000 requests/minute
- SSR pages: 50 requests/minute

## CORS Configuration

```typescript
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
```

## Environment Variables

### Required
- `GRAPHQL_ENDPOINT`: WordPress GraphQL API URL
- `S3_ASSETS_URL`: CDN URL for static assets

### Optional
- `PORT`: Server port (default: 3000)
- `MAINDB`: Primary storage adapter
- `BACKUPDB`: Backup storage adapter
- `NODE_ENV`: Environment mode

## Performance Metrics

### Response Times (Typical)

- Health check: < 10ms
- API endpoints: < 50ms
- SSR pages: < 200ms (with cache)
- Static assets: < 5ms

### Memory Usage

- Base memory: ~50MB
- Per request: ~2MB additional
- Cache size: Configurable (default: 100MB)

## Monitoring

### Health Checks

```bash
# Continuous monitoring
while true; do
  curl -f http://localhost:3000/health || echo "Service down"
  sleep 30
done
```

### Metrics Collection

```typescript
// Custom metrics
const metrics = {
  requestsTotal: requestCounter,
  responseTime: responseTimeHistogram,
  errorsTotal: errorCounter,
  memoryUsage: process.memoryUsage(),
  cacheHitRate: cacheHits / (cacheHits + cacheMisses)
};
```

## Security Considerations

### Headers
```typescript
// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Strict-Transport-Security': 'max-age=31536000'
};
```

### Input Validation
- Path parameters are validated and normalized
- Query parameters are sanitized
- GraphQL queries are predefined (no dynamic queries)

### Rate Limiting
- Implemented using in-memory store
- Configurable limits per endpoint
- Automatic cleanup of expired entries
