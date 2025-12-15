# Blog Admin Example

Complete offline blog management system demonstrating SSR-Starter's flexible storage capabilities.

## Features

### Content Management
- ✅ Create, edit, delete blog posts
- ✅ Rich text content with HTML/Markdown support
- ✅ Draft and published status management
- ✅ Automatic slug generation
- ✅ Excerpt and full content separation

### Category System
- ✅ Hierarchical category management
- ✅ Color-coded categories for visual organization
- ✅ Category assignment to posts
- ✅ Unique slug generation

### Analytics Dashboard
- ✅ Post statistics and metrics
- ✅ Category distribution
- ✅ Publishing trends
- ✅ Engagement metrics

### Offline-First Architecture
- ✅ No internet connection required
- ✅ All data stored locally in LMDB
- ✅ Real-time synchronization when online
- ✅ Progressive Web App capabilities

## Technical Implementation

### Data Schema

```typescript
// Blog Post Schema
interface BlogPost {
  _id: string
  title: string
  slug: string          // URL-friendly identifier
  content: string       // Full HTML/Markdown content
  excerpt: string       // Short summary
  status: 'draft' | 'published'
  author: string
  categories: string[]  // Array of category IDs
  tags: string[]        // Array of tag strings
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// Category Schema
interface BlogCategory {
  _id: string
  name: string
  slug: string
  description: string
  color: string          // Hex color for UI
}
```

### Database Configuration

```typescript
// Flexible LMDB Adapter Configuration
const adapter = new FlexibleLmdbAdapter('./data/blog-admin-db')

// Post Collection with Indexes
await adapter.createCollection('posts', {
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true, unique: true },
    content: { type: 'string', required: true },
    status: { type: 'string', required: true },
    author: { type: 'string', required: true },
    categories: { type: 'array', default: [] },
    tags: { type: 'array', default: [] },
    publishedAt: { type: 'date' }
  },
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['status'] },
    { fields: ['author'] },
    { fields: ['categories'] },
    { fields: ['publishedAt'] }
  ]
})
```

### CRUD Operations

```typescript
// Create Post
const postId = await adapter.insert('posts', {
  title: 'My Blog Post',
  slug: 'my-blog-post',
  content: '<p>Full content here...</p>',
  excerpt: 'Short summary...',
  status: 'draft',
  author: 'Admin',
  categories: ['tech', 'web-dev'],
  tags: ['javascript', 'react']
})

// Find Published Posts
const publishedPosts = await adapter.find('posts', {
  status: 'published'
}, {
  sort: { publishedAt: -1 },
  limit: 10
})

// Update Post
await adapter.update('posts', { _id: postId }, {
  status: 'published',
  publishedAt: new Date()
})

// Delete Post
await adapter.delete('posts', { _id: postId })
```

## UI Components Usage

### Form Handling

```typescript
// Post Creation Form
function PostForm({ onSave }: { onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    tags: []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        placeholder="Post title"
      />
      <Textarea
        value={formData.content}
        onChange={(e) => setFormData({...formData, content: e.target.value})}
        placeholder="Post content"
      />
      <Button type="submit">Save Post</Button>
    </form>
  )
}
```

### Data Tables

```typescript
// Posts List with Actions
function PostsTable({ posts, onEdit, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Categories</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map(post => (
          <TableRow key={post._id}>
            <TableCell>{post.title}</TableCell>
            <TableCell>
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status}
              </Badge>
            </TableCell>
            <TableCell>
              {post.categories.map(catId => (
                <Badge key={catId} variant="outline">{catId}</Badge>
              ))}
            </TableCell>
            <TableCell>
              <Button onClick={() => onEdit(post)}>Edit</Button>
              <Button onClick={() => onDelete(post._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## Running the Example

### Prerequisites

```bash
# SSR-Starter is already set up
cd ssr-starter

# Install dependencies
bun install
```

### Start Blog Admin

```bash
# Configure environment
export MAINDB=JsonDB  # Use JSON for easy inspection
export BACKUPDB=FALSE

# Start development server
bun run dev

# Navigate to admin panel
# http://localhost:3000/admin/blog
```

### Alternative: Run Standalone

```bash
# Create standalone script
echo 'import BlogAdmin from "./examples/blog/admin"
export default BlogAdmin' > temp-admin.tsx

# Run with SSR-Starter
MAINDB=JsonDB bun run dev
```

## Data Persistence

### File Structure

```
data/
├── blog-admin-db/           # LMDB database files
│   ├── data.mdb
│   └── lock.mdb
└── json/
    └── full.json           # Alternative JSON storage
```

### Backup and Restore

```typescript
// Backup data
await adapter.backup('./backup/blog-admin-backup.json')

// Restore from backup
await adapter.restore('./backup/blog-admin-backup.json')
```

### Data Export/Import

```typescript
// Export posts to JSON
const posts = await adapter.find('posts')
const exportData = JSON.stringify(posts, null, 2)
await writeFile('./export/posts.json', exportData)

// Import posts from JSON
const importData = JSON.parse(await readFile('./import/posts.json'))
for (const post of importData) {
  await adapter.insert('posts', post)
}
```

## Advanced Features

### Search Functionality

```typescript
// Full-text search
const searchResults = await adapter.search('posts', {
  query: 'javascript react',
  fields: ['title', 'content', 'tags'],
  limit: 20
})

// Filter and sort
const filteredPosts = await adapter.find('posts', {
  status: 'published',
  categories: { $in: ['tech', 'web-dev'] }
}, {
  sort: { publishedAt: -1 },
  limit: 10
})
```

### Aggregation Queries

```typescript
// Posts by category
const categoryStats = await adapter.aggregate('posts', [
  { $match: { status: 'published' } },
  {
    $group: {
      _id: '$categories',
      count: { $sum: 1 },
      posts: { $push: '$title' }
    }
  },
  { $sort: { count: -1 } }
])

// Monthly post count
const monthlyStats = await adapter.aggregate('posts', [
  {
    $group: {
      _id: {
        year: { $year: '$publishedAt' },
        month: { $month: '$publishedAt' }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } }
])
```

### Real-time Synchronization

```typescript
// Sync with remote API when online
async function syncWithRemote() {
  if (!navigator.onLine) return

  try {
    const remotePosts = await fetch('/api/remote-posts').then(r => r.json())

    for (const remotePost of remotePosts) {
      const localPost = await adapter.findOne('posts', { slug: remotePost.slug })

      if (!localPost) {
        await adapter.insert('posts', remotePost)
      } else if (remotePost.updatedAt > localPost.updatedAt) {
        await adapter.update('posts', { _id: localPost._id }, remotePost)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Auto-sync every 5 minutes
setInterval(syncWithRemote, 5 * 60 * 1000)
```

## Extending the Blog System

### Custom Post Types

```typescript
// Add video posts
await adapter.createCollection('video-posts', {
  fields: {
    title: { type: 'string', required: true },
    videoUrl: { type: 'string', required: true },
    thumbnail: { type: 'string' },
    duration: { type: 'number' },
    // ... other fields
  }
})
```

### User Management

```typescript
// Add author management
await adapter.createCollection('authors', {
  fields: {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true, unique: true },
    bio: { type: 'string' },
    avatar: { type: 'string' },
    role: { type: 'string', default: 'author' }
  }
})
```

### Comments System

```typescript
// Add comments collection
await adapter.createCollection('comments', {
  fields: {
    postId: { type: 'string', required: true },
    author: { type: 'string', required: true },
    content: { type: 'string', required: true },
    status: { type: 'string', default: 'approved' },
    parentId: { type: 'string' } // For nested comments
  },
  indexes: [
    { fields: ['postId'] },
    { fields: ['status'] },
    { fields: ['parentId'] }
  ]
})
```

## Performance Considerations

### Database Optimization

```typescript
// Create indexes for better performance
await adapter.createIndex('posts', 'publishedAt')
await adapter.createIndex('posts', 'author')
await adapter.createIndex('posts', 'categories')

// Use efficient queries
const recentPosts = await adapter.find('posts', {
  status: 'published',
  publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
}, {
  sort: { publishedAt: -1 },
  limit: 20,
  projection: { content: 0 } // Exclude heavy content field
})
```

### UI Performance

```typescript
// Lazy load admin components
const AdminPanel = lazy(() => import('./admin'))
const PostEditor = lazy(() => import('./PostEditor'))

// Virtual scrolling for large lists
function VirtualizedPostList({ posts }) {
  // Implement virtual scrolling for 1000+ posts
  return (
    <VirtualList
      items={posts}
      itemHeight={60}
      renderItem={(post) => <PostRow post={post} />}
    />
  )
}
```

## Deployment

### Docker Configuration

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .

# Install dependencies
RUN bun install

# Build admin interface
RUN bun run build

# Expose port
EXPOSE 3000

# Start with blog admin
CMD ["bun", "run", "examples/blog/server.ts"]
```

### Environment Variables

```bash
# Blog-specific settings
BLOG_TITLE="My Awesome Blog"
BLOG_DESCRIPTION="Thoughts on tech and life"
BLOG_AUTHOR="John Doe"

# Database settings
MAINDB=LMDB
BACKUPDB=JsonDB

# Admin settings
ADMIN_USERNAME=admin
ADMIN_PASSWORD=securepassword
```

## Security Considerations

### Data Validation

```typescript
// Input sanitization
function sanitizePostInput(input: any) {
  return {
    title: sanitizeHtml(input.title),
    content: sanitizeHtml(input.content, {
      allowedTags: ['p', 'br', 'strong', 'em', 'a', 'img']
    }),
    excerpt: sanitizeHtml(input.excerpt),
    // ... other fields
  }
}
```

### Access Control

```typescript
// Role-based permissions
const permissions = {
  admin: ['create', 'read', 'update', 'delete', 'publish'],
  editor: ['create', 'read', 'update', 'publish'],
  author: ['create', 'read', 'update'],
  viewer: ['read']
}

function hasPermission(userRole: string, action: string): boolean {
  return permissions[userRole]?.includes(action) || false
}
```

## Conclusion

This blog admin example demonstrates how SSR-Starter's flexible storage adapters enable building complete offline-first applications with:

- ✅ Full CRUD operations
- ✅ Complex data relationships
- ✅ Search and analytics
- ✅ Real-time synchronization
- ✅ Scalable architecture

The same patterns can be applied to build:
- E-commerce platforms
- CRM systems
- Task management apps
- Document management systems
- Any data-intensive web application

Ready to build your own offline CMS? Start with this example and extend it for your specific needs!
