# Client API Reference

Complete reference for SSR-Starter's client-side JavaScript API and React hooks.

## React Hooks

### useRenderContext

Access server-rendered data in React components.

```typescript
import { useRenderContext } from '@/data'

interface UseRenderContextReturn {
  context: RenderContext | null
  loading: boolean
  error: string | null
}

function MyComponent() {
  const { context, loading, error } = useRenderContext()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!context) return <div>No data available</div>

  return (
    <div>
      <h1>{context.site.title}</h1>
      {/* Use context data */}
    </div>
  )
}
```

### useTheme

Access theme configuration and utilities.

```typescript
import { useTheme } from '@/providers/theme'

function ThemedComponent() {
  const theme = useTheme()

  return (
    <div className={theme.rounded.default}>
      {/* Use theme values */}
    </div>
  )
}
```

### useDocumentHead

Manage document head elements (title, meta tags).

```typescript
import { useDocumentHead } from '@/hooks/useDocumentHead'

function PageComponent() {
  useDocumentHead({
    title: 'My Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2'
  })

  return <div>My page content</div>
}
```

## Data Access Patterns

### Posts Data

```typescript
function BlogList() {
  const { context } = useRenderContext()

  if (!context) return null

  const { posts } = context

  return (
    <div>
      {posts.posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <time>{post.date.display}</time>
        </article>
      ))}
    </div>
  )
}
```

### Categories Navigation

```typescript
function CategoryNav() {
  const { context } = useRenderContext()

  if (!context) return null

  return (
    <nav>
      {context.categories.map(category => (
        <a key={category.id} href={`/category/${category.slug}`}>
          {category.name} ({category.count})
        </a>
      ))}
    </nav>
  )
}
```

### Search Functionality

```typescript
import { useSearchParams } from 'react-router-dom'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { context } = useRenderContext()

  if (!context) return null

  const { posts, categories, tags, authors } = context

  // Search posts
  const postResults = posts.posts.filter(post =>
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(query.toLowerCase())
  )

  // Search categories
  const categoryResults = categories.filter(cat =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <h1>Search Results for "{query}"</h1>

      <section>
        <h2>Posts ({postResults.length})</h2>
        {postResults.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <section>
        <h2>Categories ({categoryResults.length})</h2>
        {categoryResults.map(cat => (
          <CategoryCard key={cat.id} item={cat} />
        ))}
      </section>
    </div>
  )
}
```

## Component Library

### UI Components

#### Button Component

```typescript
import { Button } from '@ui8kit/core'

function MyComponent() {
  return (
    <Button variant="primary" size="md" onClick={handleClick}>
      Click me
    </Button>
  )
}

// Available props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

#### Card Component

```typescript
import { Card, CardHeader, CardContent, CardFooter } from '@ui8kit/core'

function PostCard({ post }: { post: PostData }) {
  return (
    <Card>
      <CardHeader>
        <h3>{post.title}</h3>
      </CardHeader>
      <CardContent>
        <p>{post.excerpt}</p>
        <time>{post.date.display}</time>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <a href={`/posts/${post.slug}`}>Read more</a>
        </Button>
      </CardFooter>
    </Card>
  )
}
```

#### Form Components

```typescript
import { Input, Textarea, Select } from '@ui8kit/core'

function ContactForm() {
  return (
    <form>
      <Input
        type="text"
        placeholder="Your name"
        required
      />

      <Input
        type="email"
        placeholder="your@email.com"
        required
      />

      <Textarea
        placeholder="Your message"
        rows={4}
      />

      <Select>
        <option value="">Select topic</option>
        <option value="support">Support</option>
        <option value="sales">Sales</option>
      </Select>

      <Button type="submit">Send</Button>
    </form>
  )
}
```

### Layout Components

#### Container

```typescript
import { Container } from '@ui8kit/core'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Container size="lg" className="py-8">
      {children}
    </Container>
  )
}

// Available sizes: 'sm' | 'md' | 'lg' | 'xl' | 'full'
```

#### Grid System

```typescript
import { Grid } from '@ui8kit/core'

function PostGrid() {
  const { context } = useRenderContext()

  if (!context) return null

  return (
    <Grid cols="1-2-4" gap="lg">
      {context.posts.posts.slice(0, 8).map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </Grid>
  )
}

// Responsive columns: "1-2-4" means 1 col mobile, 2 tablet, 4 desktop
```

#### Stack Layout

```typescript
import { Stack } from '@ui8kit/core'

function Article({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap="lg" align="start">
      {children}
    </Stack>
  )
}
```

### Content Components

#### HtmlContent

Render HTML content with proper sanitization.

```typescript
import { HtmlContent } from '@/components/HtmlContent'

function PostContent({ post }: { post: PostData }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <HtmlContent
        html={post.content}
        className="prose prose-lg max-w-none"
      />
    </article>
  )
}
```

#### Image Component

```typescript
import { Image } from '@ui8kit/core'

function FeaturedImage({ post }: { post: PostData }) {
  if (!post.featuredImage) return null

  return (
    <Image
      src={post.featuredImage.url}
      alt={post.featuredImage.alt}
      width={post.featuredImage.width}
      height={post.featuredImage.height}
      rounded="md"
      fit="cover"
    />
  )
}
```

#### SEO Component

```typescript
import { SEO } from '@/components/SEO'

function PostPage({ post }: { post: PostData }) {
  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.featuredImage?.url}
        url={`/posts/${post.slug}`}
        type="article"
      />

      <article>
        <h1>{post.title}</h1>
        <HtmlContent html={post.content} />
      </article>
    </>
  )
}
```

## Client-Side Routing

### React Router Integration

```typescript
import { Routes, Route, Link, useParams } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/posts/:slug" element={<PostPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
    </Routes>
  )
}
```

### Navigation Components

#### Breadcrumbs

```typescript
import { Breadcrumbs } from '@/components/Breadcrumbs'

function PostPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Home', to: '/' },
        { label: 'Blog', to: '/blog' },
        { label: 'Post', to: `/posts/${slug}` }
      ]} />

      {/* Page content */}
    </>
  )
}
```

#### Navigation Menu

```typescript
function MainNavigation() {
  const { context } = useRenderContext()

  if (!context) return null

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/blog">Blog</Link>
      <Link to="/about">About</Link>

      {/* Dynamic category links */}
      {context.categories.slice(0, 5).map(cat => (
        <Link key={cat.id} to={`/category/${cat.slug}`}>
          {cat.name}
        </Link>
      ))}
    </nav>
  )
}
```

## State Management

### Local Component State

```typescript
import { useState } from 'react'

function SearchForm() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PostData[]>([])

  const handleSearch = async () => {
    // Client-side search
    const { context } = useRenderContext()
    if (!context) return

    const filtered = context.posts.posts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase())
    )
    setResults(filtered)
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
      />
      <button onClick={handleSearch}>Search</button>

      {results.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### Global State with Context

```typescript
// providers/app-context.tsx
import { createContext, useContext, useState } from 'react'

interface AppContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  user: User | null
  setUser: (user: User | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [user, setUser] = useState<User | null>(null)

  return (
    <AppContext.Provider value={{ theme, setTheme, user, setUser }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

// Usage in components
function ThemeToggle() {
  const { theme, setTheme } = useApp()

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  )
}
```

## API Integration

### Fetching Additional Data

```typescript
import { useEffect, useState } from 'react'

function Comments({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then(res => res.json())
      .then(data => {
        setComments(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load comments:', error)
        setLoading(false)
      })
  }, [postId])

  if (loading) return <div>Loading comments...</div>

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <strong>{comment.author}</strong>
          <p>{comment.content}</p>
        </div>
      ))}
    </div>
  )
}
```

### Error Handling

```typescript
function DataComponent() {
  const { context, loading, error } = useRenderContext()
  const [apiError, setApiError] = useState<string | null>(null)

  const fetchAdditionalData = async () => {
    try {
      const response = await fetch('/api/additional-data')
      if (!response.ok) throw new Error('API request failed')
      const data = await response.json()
      // Process data
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data: {error}</div>
  if (apiError) return <div>API Error: {apiError}</div>
  if (!context) return <div>No data available</div>

  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

## Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react'

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))
const AdminPanel = lazy(() => import('./AdminPanel'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/heavy" element={<HeavyComponent />} />
      </Routes>
    </Suspense>
  )
}
```

### Image Optimization

```typescript
function OptimizedImage({ src, alt, sizes }: ImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="relative">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {error ? (
        <div className="bg-gray-100 flex items-center justify-center h-48">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
```

### Memoization

```typescript
import { memo, useMemo } from 'react'

const PostCard = memo(function PostCard({ post }: { post: PostData }) {
  return (
    <article>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <time>{post.date.display}</time>
    </article>
  )
})

function PostList() {
  const { context } = useRenderContext()

  const sortedPosts = useMemo(() => {
    if (!context) return []
    return [...context.posts.posts].sort((a, b) =>
      new Date(b.date.raw).getTime() - new Date(a.date.raw).getTime()
    )
  }, [context?.posts.posts])

  return (
    <div>
      {sortedPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

## Browser APIs

### Service Worker (PWA)

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ssr-starter-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/entry-client.js',
        '/manifest.json'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

### Local Storage

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  return [storedValue, setValue] as const
}

// Usage
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### Intersection Observer

```typescript
import { useEffect, useRef, useState } from 'react'

function useIntersectionObserver(options?: IntersectionObserverInit) {
  const ref = useRef<Element>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return [ref, isIntersecting] as const
}

// Usage
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  })

  return (
    <img
      ref={ref as any}
      src={isVisible ? src : ''}
      alt={alt}
      loading="lazy"
    />
  )
}
```

This comprehensive client API reference provides everything needed to build interactive React applications with SSR-Starter's data layer and component library.
