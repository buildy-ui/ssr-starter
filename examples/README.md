# SSR-Starter Examples

Collection of example applications built with SSR-Starter, demonstrating various use cases and architectures.

## Examples Overview

### 1. Blog Platform
Complete blogging platform with categories, tags, authors, and comments.

**Features:**
- Markdown content editing
- Category and tag management
- Author profiles
- Search functionality
- RSS feed generation

**Files:**
- `examples/blog/` - Full blog implementation
- `examples/blog/admin.tsx` - Blog admin panel
- `examples/blog/frontend.tsx` - Public blog interface

### 2. Documentation Site
Technical documentation site with search, versioning, and multi-language support.

**Features:**
- Full-text search
- Version management
- Multi-language support
- Table of contents
- Code syntax highlighting

**Files:**
- `examples/docs/` - Documentation platform
- `examples/docs/search.tsx` - Search implementation
- `examples/docs/navigation.tsx` - Table of contents

### 3. E-commerce Store
Simple e-commerce platform with products, cart, and checkout.

**Features:**
- Product catalog
- Shopping cart
- User accounts
- Order management
- Payment integration (simulated)

**Files:**
- `examples/store/` - E-commerce application
- `examples/store/products.tsx` - Product management
- `examples/store/cart.tsx` - Shopping cart
- `examples/store/checkout.tsx` - Checkout process

### 4. Task Management App
Collaborative task management with projects, teams, and real-time updates.

**Features:**
- Project management
- Team collaboration
- Task assignment
- Progress tracking
- Real-time notifications

**Files:**
- `examples/tasks/` - Task management app
- `examples/tasks/projects.tsx` - Project management
- `examples/tasks/kanban.tsx` - Kanban board
- `examples/tasks/notifications.tsx` - Real-time updates

### 5. CRM System
Customer relationship management with contacts, deals, and analytics.

**Features:**
- Contact management
- Deal pipeline
- Activity tracking
- Analytics dashboard
- Report generation

**Files:**
- `examples/crm/` - CRM system
- `examples/crm/contacts.tsx` - Contact management
- `examples/crm/deals.tsx` - Deal pipeline
- `examples/crm/analytics.tsx` - Analytics dashboard

### 6. Personal Finance App
Personal finance tracking with budgets, transactions, and reporting.

**Features:**
- Transaction tracking
- Budget management
- Financial reports
- Goal setting
- Expense categorization

**Files:**
- `examples/finance/` - Finance tracking app
- `examples/finance/transactions.tsx` - Transaction management
- `examples/finance/budgets.tsx` - Budget planning
- `examples/finance/reports.tsx` - Financial reports

## Running Examples

### Prerequisites

```bash
# Install dependencies
bun install

# Set up environment
cp env.example .env
# Configure your settings
```

### Running Individual Examples

```bash
# Start the example server
MAINDB=JsonDB BACKUPDB=LMDB bun run dev

# Or run specific example
bun run examples/blog/server.ts
```

### Using Examples in Your Project

```typescript
// Import example components
import { BlogAdmin } from '../examples/blog/admin'
import { TaskBoard } from '../examples/tasks/kanban'
import { FinanceDashboard } from '../examples/finance/dashboard'

// Use in your routes
<Route path="/admin/blog" element={<BlogAdmin />} />
<Route path="/tasks" element={<TaskBoard />} />
<Route path="/finance" element={<FinanceDashboard />} />
```

## Architecture Patterns

### Data Management

All examples demonstrate different approaches to data management:

**Blog Example:**
```typescript
// Content-focused with categories and tags
interface BlogPost {
  title: string
  content: string
  categories: string[]
  tags: string[]
  author: string
  publishedAt: Date
}
```

**E-commerce Example:**
```typescript
// Product catalog with inventory
interface Product {
  name: string
  price: number
  inventory: number
  categories: string[]
  images: string[]
}
```

**CRM Example:**
```typescript
// Relationship management
interface Contact {
  name: string
  email: string
  company: string
  deals: Deal[]
  activities: Activity[]
}
```

### UI Patterns

Examples showcase different UI patterns using ui8kit:

**Dashboard Pattern:**
```tsx
function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <Grid cols="1-4" gap="lg">
      <Card className="col-span-1">
        <Sidebar />
      </Card>
      <Stack className="col-span-3" gap="lg">
        {children}
      </Stack>
    </Grid>
  )
}
```

**Form Pattern:**
```tsx
function DataForm<T>({ data, onSave }: { data: T; onSave: (data: T) => void }) {
  const [formData, setFormData] = useState(data)

  return (
    <Card>
      <form onSubmit={() => onSave(formData)}>
        <Stack gap="md">
          {/* Form fields */}
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    </Card>
  )
}
```

**List Pattern:**
```tsx
function DataList<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          {/* Column headers */}
        </TableHeader>
        <TableBody>
          {items.map(item => renderItem(item))}
        </TableBody>
      </Table>
    </Card>
  )
}
```

## Customization

### Adapting Examples

Each example can be customized for your needs:

1. **Change Styling:**
   ```css
   /* examples/blog/styles.css */
   .blog-post { /* custom styles */ }
   ```

2. **Modify Data Structure:**
   ```typescript
   // examples/blog/types.ts
   interface CustomBlogPost extends BlogPost {
     customField: string
   }
   ```

3. **Add Features:**
   ```typescript
   // examples/blog/features/comments.tsx
   function Comments({ postId }: { postId: string }) {
     // Comment functionality
   }
   ```

### Creating New Examples

Template for creating new examples:

```bash
# Create example directory
mkdir examples/my-app

# Create basic structure
touch examples/my-app/
  ├── index.tsx          # Main component
  ├── types.ts           # Type definitions
  ├── data.ts            # Data management
  ├── styles.css         # Custom styles
  └── README.md          # Documentation
```

## Performance Considerations

### Optimization Techniques

**Data Loading:**
```typescript
// Lazy load data
const data = await adapter.find('collection', query, {
  limit: 20,  // Pagination
  projection: { title: 1, date: 1 }  // Only needed fields
})
```

**Component Optimization:**
```typescript
// Memoize expensive components
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* expensive rendering */}</div>
})
```

**Bundle Optimization:**
```typescript
// Code splitting
const AdminPanel = lazy(() => import('./admin'))
const PublicApp = lazy(() => import('./public'))
```

### Database Optimization

**Indexing Strategy:**
```typescript
// Create indexes for frequently queried fields
await adapter.createIndex('posts', 'author')
await adapter.createIndex('posts', 'publishedAt')
await adapter.createIndex('posts', 'tags')
```

**Query Optimization:**
```typescript
// Use efficient queries
const posts = await adapter.find('posts', {
  status: 'published',
  publishedAt: { $gte: lastWeek }
}, {
  sort: { publishedAt: -1 },
  limit: 10
})
```

## Deployment

### Example Deployment Configurations

**Vercel (Static):**
```json
// vercel.json
{
  "buildCommand": "bun run build && bun run examples/blog/generate",
  "outputDirectory": "examples/blog/dist",
  "framework": null
}
```

**Railway (Full App):**
```yaml
# railway.toml
[build]
builder = "bun"
buildCommand = "bun run build"
startCommand = "bun run examples/blog/server.ts"
```

**Docker:**
```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "examples/blog/server.ts"]
```

## Contributing

### Adding New Examples

1. Create example directory under `examples/`
2. Implement the example following established patterns
3. Add documentation in `examples/example-name/README.md`
4. Update this README with the new example
5. Test the example thoroughly

### Example Guidelines

- Use TypeScript for all code
- Follow ui8kit component patterns
- Include proper error handling
- Add loading states
- Implement responsive design
- Include example data

## Support

For questions about examples:

- Check the example's README.md
- Review the source code comments
- Open an issue for bugs or improvements
- Join our Discord for community help

---

**Ready to build something amazing?** Explore the examples and start creating! 🚀
