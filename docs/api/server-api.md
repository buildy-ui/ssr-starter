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

Synchronizes data from GraphQL API.

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