# WordPress GraphQL Integration Guide (101 Level)

## 🎯 Overview

This comprehensive guide will walk you through setting up and integrating a modern React application with WordPress using the MYGraphQL plugin. By the end of this guide, you'll have a fully functional headless WordPress setup with dynamic content loading.

## 📋 Prerequisites

Before you begin, ensure you have:

- **WordPress 5.0+** installed and running
- **WPGraphQL plugin** installed and activated
- **MYGraphQL plugin** (the custom plugin we'll be using)
- **Node.js 18+** and **npm/yarn/pnpm** for the frontend
- Basic knowledge of **React** and **TypeScript**

## 🛠️ Part 1: Setting Up WordPress with MYGraphQL Plugin

### Step 1.1: Install Required WordPress Plugins

1. **Install WPGraphQL**:
   - Go to **WordPress Admin** → **Plugins** → **Add New**
   - Search for "WPGraphQL"
   - Install and activate the plugin

2. **Install MYGraphQL Plugin**:
   - Download the MYGraphQL plugin files
   - Upload them to `/wp-content/plugins/mygraphql/`
   - Or use the zip upload method in WordPress admin
   - Activate the plugin

### Step 1.2: Verify Plugin Installation

After activation, you should see:
- GraphQL endpoint available at: `https://yourdomain.com/graphql`
- New menu items in WordPress admin under **GraphQL**

### Step 1.3: Test GraphQL API

Visit your GraphQL endpoint in a browser or use a tool like GraphiQL:

```bash
# Test basic query
curl -X POST https://yourdomain.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id title } } }"}'
```

Expected response:
```json
{
  "data": {
    "posts": {
      "nodes": [
        {
          "id": "cG9zdDox",
          "title": "Hello World"
        }
      ]
    }
  }
}
```

## 🚀 Part 2: Setting Up Your React Application

### Step 2.1: Create a New Project

### Step 2.2: Configure Environment Variables

Create an `.env` file in your project root:

```env
# GraphQL API endpoint
GRAPHQL_ENDPOINT=https://yourdomain.com/graphql
```

### Step 2.3: Configuration

## 📡 Part 3: Understanding the GraphQL API Structure

### Available Queries

The MYGraphQL plugin exposes these main queries:

#### Posts Query
```graphql
{
  posts(first: 10, after: "cursor") {
    nodes {
      id
      postId
      title
      content
      excerpt
      slug
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          categoryId
          name
          slug
        }
      }
      tags {
        nodes {
          tagId
          name
          slug
        }
      }
      author {
        node {
          userId
          name
          slug
        }
      }
      postFields {
        key
        value
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

#### Categories Query
```graphql
{
  categories(first: 50) {
    nodes {
      id
      categoryId
      name
      slug
      description
      count
    }
  }
}
```

#### Tags Query
```graphql
{
  tags(first: 100) {
    nodes {
      id
      tagId
      name
      slug
      count
    }
  }
}
```

#### Users/Authors Query
```graphql
{
  users(first: 50) {
    nodes {
      id
      userId
      name
      slug
      email
      avatar {
        url
      }
    }
  }
}
```

#### Pages Query
```graphql
{
  pages(first: 20) {
    nodes {
      id
      pageId
      title
      content
      slug
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      pageFields {
        key
        value
      }
    }
  }
}
```

### Data Types and Interfaces

Create these TypeScript interfaces in your project:

```typescript
// GraphQL Response Types
interface GraphQLPost {
  id: string;
  postId: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  categories: {
    nodes: Array<{
      categoryId: number;
      name: string;
      slug: string;
    }>;
  };
  tags: {
    nodes: Array<{
      tagId: number;
      name: string;
      slug: string;
    }>;
  };
  author?: {
    node: {
      userId: number;
      name: string;
      slug: string;
    };
  };
  postFields?: Array<{
    key: string;
    value: any;
  }>;
}

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
  }>;
}
```

## 🔧 Part 4: Implementing Data Fetching

### Step 4.1: Create API Client

Create a GraphQL client utility:

```typescript
// utils/graphql.ts
const GRAPHQL_ENDPOINT = import.meta.env.GRAPHQL_ENDPOINT;

export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: variables || {}
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL API error: ${response.status}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  return result.data;
}
```

### Step 4.2: Create Data Fetching Functions

```typescript
// services/api.ts
import { graphqlQuery } from '../utils/graphql';

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  author?: {
    id: number;
    name: string;
    slug: string;
  };
}

export async function getPosts(limit = 10): Promise<Post[]> {
  const query = `
    query GetPosts($first: Int!) {
      posts(first: $first) {
        nodes {
          postId
          title
          content
          excerpt
          slug
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          categories {
            nodes {
              categoryId
              name
              slug
            }
          }
          tags {
            nodes {
              tagId
              name
              slug
            }
          }
          author {
            node {
              userId
              name
              slug
            }
          }
        }
      }
    }
  `;

  const data = await graphqlQuery<{
    posts: {
      nodes: Array<{
        postId: number;
        title: string;
        content: string;
        excerpt: string;
        slug: string;
        date: string;
        featuredImage?: {
          node: {
            sourceUrl: string;
            altText: string;
          };
        };
        categories: {
          nodes: Array<{
            categoryId: number;
            name: string;
            slug: string;
          }>;
        };
        tags: {
          nodes: Array<{
            tagId: number;
            name: string;
            slug: string;
          }>;
        };
        author?: {
          node: {
            userId: number;
            name: string;
            slug: string;
          };
        };
      }>;
    };
  }>(query, { first: limit });

  return data.posts.nodes.map(post => ({
    id: post.postId,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    slug: post.slug,
    date: post.date,
    featuredImage: post.featuredImage ? {
      url: post.featuredImage.node.sourceUrl,
      alt: post.featuredImage.node.altText
    } : undefined,
    categories: post.categories.nodes.map(cat => ({
      id: cat.categoryId,
      name: cat.name,
      slug: cat.slug
    })),
    tags: post.tags.nodes.map(tag => ({
      id: tag.tagId,
      name: tag.name,
      slug: tag.slug
    })),
    author: post.author ? {
      id: post.author.node.userId,
      name: post.author.node.name,
      slug: post.author.node.slug
    } : undefined
  }));
}

export async function getCategories() {
  const query = `
    {
      categories(first: 50) {
        nodes {
          categoryId
          name
          slug
          description
          count
        }
      }
    }
  `;

  const data = await graphqlQuery<{
    categories: {
      nodes: Array<{
        categoryId: number;
        name: string;
        slug: string;
        description?: string;
        count: number;
      }>;
    };
  }>(query);

  return data.categories.nodes.map(cat => ({
    id: cat.categoryId,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    count: cat.count
  }));
}
```

## ⚛️ Part 5: Integrating with React Components

### Step 5.1: Create Custom Hooks

```typescript
// hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { getPosts, Post } from '../services/api';

export function usePosts(limit = 10) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts(limit);
        setPosts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit]);

  return { posts, loading, error };
}
```

### Step 5.2: Create React Components

```typescript
// components/PostCard.tsx
import React from 'react';
import { Post } from '../services/api';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      {post.featuredImage && (
        <img
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      <div className="post-meta text-sm text-gray-500 mb-2">
        <span>{new Date(post.date).toLocaleDateString()}</span>
        {post.author && (
          <span> • By {post.author.name}</span>
        )}
      </div>

      <h2 className="text-xl font-bold mb-2">
        <a href={`/posts/${post.slug}`} className="hover:text-blue-600">
          {post.title}
        </a>
      </h2>

      <p className="text-gray-700 mb-4">{post.excerpt}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.categories.map(category => (
          <span
            key={category.id}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
          >
            {category.name}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {post.tags.map(tag => (
          <span
            key={tag.id}
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </article>
  );
}
```

### Step 5.3: Create Main Application Component

```typescript
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { PostPage } from './pages/PostPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/posts/:slug" element={<PostPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
```

### Step 5.4: Create Page Components

```typescript
// pages/HomePage.tsx
import React from 'react';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';

export function HomePage() {
  const { posts, loading, error } = usePosts(6); // Get 6 latest posts

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to My WordPress Blog
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

```typescript
// pages/BlogPage.tsx
import React from 'react';
import { usePosts } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';

export function BlogPage() {
  const { posts, loading, error } = usePosts(12); // Get 12 posts for blog page

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

## 🔧 Part 6: Advanced Configuration and Best Practices

### Step 6.1: Error Handling and Loading States

```typescript
// components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GraphQL Integration Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We're having trouble loading content. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Step 6.2: Caching and Performance Optimization

```typescript
// utils/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();
```

```typescript
// Enhanced API client with caching
export async function cachedGraphQLQuery<T>(
  query: string,
  variables?: Record<string, any>,
  ttl = 300000
): Promise<T> {
  const cacheKey = JSON.stringify({ query, variables });

  // Check cache first
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const data = await graphqlQuery<T>(query, variables);

  // Cache the result
  cache.set(cacheKey, data, ttl);

  return data;
}
```

### Step 6.3: Environment-Specific Configuration

```typescript
// config/index.ts
export const config = {
  graphqlEndpoint: import.meta.env.GRAPHQL_ENDPOINT,
  isDevelopment: import.meta.env.DEV,
  cacheEnabled: import.meta.env.PROD, // Enable caching in production only

  // API settings
  defaultPostLimit: 10,
  defaultCategoryLimit: 50,
  defaultTagLimit: 100,

  // Cache settings (in milliseconds)
  postCacheTtl: 5 * 60 * 1000, // 5 minutes
  categoryCacheTtl: 10 * 60 * 1000, // 10 minutes
  tagCacheTtl: 15 * 60 * 1000, // 15 minutes
};
```

## 🚀 Part 7: Deployment and Production Setup

### Step 7.1: Build Configuration

Update your `package.json`:

```json
{
  "scripts": {
    "dev": "",
    "build": "",
    "preview": "",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Step 7.2: Production Environment Variables

Create `.env.production`:

```env
# Production GraphQL endpoint
GRAPHQL_ENDPOINT=https://your-production-wordpress-site.com/graphql
```

### Step 7.3: Build and Deploy

```bash
# Build for production
bun run build

# Preview locally
bun run preview

# Deploy the dist/ folder to your hosting service
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "GraphQL endpoint not found"
- Check that your WordPress site is accessible
- Verify the URL in `.env` file
- Ensure MYGraphQL plugin is activated

#### 2. "CORS errors"
- MYGraphQL plugin should handle CORS, but check WordPress configuration
- Add CORS headers in your server configuration if needed

#### 3. "Data not loading"
- Check browser network tab for failed requests
- Verify GraphQL queries are correct
- Check WordPress debug logs

#### 4. "TypeScript errors"
- Ensure all interfaces match your GraphQL schema
- Run `bun run build` to check for type errors

### Debug Mode

Enable debug mode in development:

```typescript
// Add to your main.tsx or App.tsx
if (import.meta.env.DEV) {
  console.log('GraphQL Endpoint:', import.meta.env.GRAPHQL_ENDPOINT);
  console.log('Development mode enabled');
}
```

## 📚 Additional Resources

- [WPGraphQL Documentation](https://www.wpgraphql.com/)
- [React Query for Data Fetching](https://tanstack.com/query/latest/)
- [TypeScript GraphQL](https://the-guild.dev/graphql/codegen)

## 🎯 Next Steps

Now that you have a working WordPress + React integration, you can:

1. **Add authentication** for user management
2. **Implement search functionality** using GraphQL queries
3. **Add comments system** integration
4. **Create admin dashboard** for content management
5. **Add internationalization** (i18n) support

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your WordPress GraphQL endpoint is accessible
3. Ensure all environment variables are set correctly
4. Check the WordPress debug logs

## 🎉 Congratulations!

You've successfully integrated your React application with WordPress using GraphQL! Your application now has:

- ✅ Dynamic content loading from WordPress
- ✅ Type-safe data fetching
- ✅ Error handling and loading states
- ✅ Scalable architecture
- ✅ Production-ready setup

Happy coding! 🚀
