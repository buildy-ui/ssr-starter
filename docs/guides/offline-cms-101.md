# Offline CMS Development 101

A complete beginner's guide to building offline-first web applications with SSR-Starter's flexible storage adapters.

## 🎯 What You'll Learn

By the end of this guide, you'll know how to:

- ✅ Set up flexible data storage for any application type
- ✅ Build a complete CMS admin interface
- ✅ Create, read, update, and delete data offline
- ✅ Use UI8Kit components for beautiful interfaces
- ✅ Handle data synchronization and conflicts
- ✅ Deploy offline-first applications

## 📋 Prerequisites

- Basic JavaScript/TypeScript knowledge
- SSR-Starter installed and running
- Understanding of React components
- Basic database concepts (optional)

## 🏗 Step 1: Setting Up Flexible Storage

### Understanding Storage Adapters

SSR-Starter supports multiple storage backends:

```typescript
// Legacy simple storage (WordPress data only)
import { LmdbAdapter } from '../server/storage/adapter.lmdb'

// New flexible storage (any data structure)
import { FlexibleLmdbAdapter } from '../server/storage/adapter.flexible.lmdb'
```

### Creating Your First Flexible Adapter

```typescript
// In your component or service
import { FlexibleLmdbAdapter } from '../../server/storage/adapter.flexible.lmdb'

// Create adapter instance
const adapter = new FlexibleLmdbAdapter('./data/my-app-db')
```

### Initializing Collections

Collections are like database tables - they define your data structure:

```typescript
// Initialize your app's database
async function initializeDatabase() {
  // Create a "tasks" collection
  await adapter.createCollection('tasks', {
    fields: {
      title: { type: 'string', required: true },
      description: { type: 'string' },
      completed: { type: 'boolean', default: false },
      priority: { type: 'string', default: 'medium' },
      createdAt: { type: 'date', default: () => new Date() }
    },
    indexes: [
      { fields: ['completed'] },
      { fields: ['priority'] },
      { fields: ['createdAt'] }
    ]
  })

  console.log('Database initialized!')
}

// Call this when your app starts
initializeDatabase()
```

## 🎨 Step 2: Building Your First Admin Interface

### Use the built-in SSR Admin (`/admin`)

SSR-Starter now ships with a **server-rendered** CMS admin panel:

- Open: `/admin`
- It works **without React hydration** (no client JS required for CRUD).
- It uses only the local UI kit primitives from `src/components/ui8kit.ts`.
- All CRUD actions are done via standard HTML forms (POST + redirect), so it stays offline-friendly.

#### Storage priority (LMDB → JsonDB)

Admin reads and writes follow this priority:

- **Read**: try `MAINDB` first; if it fails or has no collections, fall back to `BACKUPDB`.
- **Write**: try `MAINDB` first; if it fails, fall back to `BACKUPDB`.
- **Write-through**: after a successful write, the server best-effort mirrors the same operation to the other adapter.

Recommended offline env:

```bash
export MAINDB=LMDB
export BACKUPDB=JsonDB
```

#### Note about `GRAPHQL_MODE=GETMODE`

In **GETMODE** the app treats WordPress GraphQL as a **read-only upstream**:

- The site data (`posts`, `categories`, `tags`, `authors`, `pages`) is fetched from GraphQL (when available) and persisted locally.
- The Admin panel can also **seed** the flexible collections with these documents so you can browse/edit them locally.
- Any new documents you create (for example `products`, or local drafts inside `posts`) are written **only to local flexible storage** (LMDB/JsonDB). They are **not** pushed to GraphQL in GETMODE.

#### Admin actions (server routes)

These are the endpoints used by the `/admin` page:

- `POST /admin/actions/collection/create` (`name`)
- `POST /admin/actions/collection/drop` (`name`)
- `POST /admin/actions/document/create` (`collection`, `json`)
- `POST /admin/actions/document/update` (`collection`, `id`, `json`)
- `POST /admin/actions/document/delete` (`collection`, `id`)

#### Form building with UI8Kit primitives

The inputs are built using `Block`/`Box` polymorphism (see `docs/guides/create-form.md`):

```tsx
import { Block, Box, Button } from '@/components/ui8kit'

export function CreateCollectionForm() {
  return (
    <Block component="form" method="post" action="/admin/actions/collection/create" className="space-y-3">
      <Box
        component="input"
        name="name"
        placeholder="products"
        w="full"
        p="md"
        rounded="md"
        border="1px"
        borderColor="border"
        bg="background"
      />
      <Button type="submit">Create</Button>
    </Block>
  )
}
```

## 📊 Step 3: Advanced Data Operations

### Searching and Filtering

```typescript
// Search tasks by title or description
const searchTasks = async (query: string) => {
  const results = await adapter.search('tasks', {
    query,
    fields: ['title', 'description'],
    limit: 20
  })

  return results.map(result => result.document)
}

// Filter by priority and completion status
const getFilteredTasks = async (filters: {
  priority?: string
  completed?: boolean
}) => {
  const query = {}

  if (filters.priority) {
    query.priority = filters.priority
  }

  if (typeof filters.completed === 'boolean') {
    query.completed = filters.completed
  }

  return await adapter.find('tasks', query, {
    sort: { createdAt: -1 }
  })
}
```

### Analytics and Aggregation

```typescript
// Get task statistics
const getTaskStats = async () => {
  // Count by status
  const completedTasks = await adapter.count('tasks', { completed: true })
  const totalTasks = await adapter.count('tasks')

  // Count by priority
  const highPriority = await adapter.count('tasks', { priority: 'high' })
  const mediumPriority = await adapter.count('tasks', { priority: 'medium' })
  const lowPriority = await adapter.count('tasks', { priority: 'low' })

  // Recent tasks (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentTasks = await adapter.count('tasks', {
    createdAt: { $gte: weekAgo }
  })

  return {
    total: totalTasks,
    completed: completedTasks,
    pending: totalTasks - completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    byPriority: {
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority
    },
    recent: recentTasks
  }
}

// Get tasks created by day (last 30 days)
const getTaskTrends = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const pipeline = [
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: ['$completed', 1, 0] }
        }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        total: '$count',
        completed: '$completed'
      }
    },
    { $sort: { date: 1 } }
  ]

  return await adapter.aggregate('tasks', pipeline)
}
```

### Bulk Operations

```typescript
// Mark multiple tasks as completed
const completeTasks = async (taskIds: string[]) => {
  const operations = taskIds.map(id => ({
    query: { _id: id },
    update: { completed: true, completedAt: new Date() }
  }))

  await adapter.bulkUpdate('tasks', operations)
}

// Delete old completed tasks
const cleanupOldTasks = async (daysOld: number = 30) => {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

  await adapter.delete('tasks', {
    completed: true,
    completedAt: { $lt: cutoffDate }
  })
}

// Import tasks from JSON
const importTasks = async (tasksData: any[]) => {
  // Validate data structure
  const validTasks = tasksData.filter(task =>
    task.title && typeof task.title === 'string'
  )

  await adapter.bulkInsert('tasks', validTasks)
}
```

## 🔄 Step 4: Offline Synchronization

### Basic Sync Strategy

```typescript
// Check if we're online
const isOnline = () => navigator.onLine

// Sync manager class
class SyncManager {
  constructor(private adapter: FlexibleLmdbAdapter, private remoteUrl: string) {}

  async syncToRemote() {
    if (!isOnline()) return

    try {
      // Get local changes (tasks modified since last sync)
      const lastSync = await this.getLastSyncTime()
      const changedTasks = await this.adapter.find('tasks', {
        updatedAt: { $gt: lastSync }
      })

      // Send to remote server
      const response = await fetch(`${this.remoteUrl}/api/tasks/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: changedTasks })
      })

      if (response.ok) {
        await this.updateLastSyncTime(new Date())
      }
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  async syncFromRemote() {
    if (!isOnline()) return

    try {
      const response = await fetch(`${this.remoteUrl}/api/tasks`)
      const remoteTasks = await response.json()

      // Merge with local data
      for (const remoteTask of remoteTasks) {
        const localTask = await this.adapter.findOne('tasks', { _id: remoteTask._id })

        if (!localTask) {
          // New remote task
          await this.adapter.insert('tasks', remoteTask)
        } else if (remoteTask.updatedAt > localTask.updatedAt) {
          // Remote is newer
          await this.adapter.update('tasks', { _id: remoteTask._id }, remoteTask)
        }
        // Local is newer - keep local version
      }
    } catch (error) {
      console.error('Sync from remote failed:', error)
    }
  }

  private async getLastSyncTime(): Promise<Date> {
    try {
      const meta = await this.adapter.findOne('metadata', { key: 'lastSync' })
      return meta ? new Date(meta.value) : new Date(0)
    } catch {
      return new Date(0)
    }
  }

  private async updateLastSyncTime(time: Date): Promise<void> {
    await this.adapter.insert('metadata', {
      key: 'lastSync',
      value: time.toISOString()
    })
  }
}

// Usage with GraphQL modes
const syncManager = new SyncManager(adapter, 'https://my-api.com')

// Sync when online
window.addEventListener('online', () => {
  // In GETMODE: Only sync from GraphQL
  syncManager.syncFromRemote()

  // In SETMODE: Only sync to GraphQL
  // syncManager.syncToRemote()

  // In CRUDMODE: Bidirectional sync
  // syncManager.syncFromRemote()
  // syncManager.syncToRemote()
})

// Periodic sync based on mode
setInterval(() => {
  if (isOnline()) {
    const graphQLMode = process.env.GRAPHQL_MODE || 'GETMODE'

    switch (graphQLMode) {
      case 'GETMODE':
        syncManager.syncFromRemote() // Update local from GraphQL
        break
      case 'SETMODE':
        syncManager.syncToRemote() // Push local changes to GraphQL
        break
      case 'CRUDMODE':
        syncManager.syncFromRemote()
        syncManager.syncToRemote()
        break
    }
  }
}, 5 * 60 * 1000) // Every 5 minutes
```

### Conflict Resolution

```typescript
// Handle sync conflicts
async function resolveConflicts(localTasks: any[], remoteTasks: any[]) {
  const conflicts = []

  for (const localTask of localTasks) {
    const remoteTask = remoteTasks.find(t => t._id === localTask._id)

    if (remoteTask && localTask.updatedAt !== remoteTask.updatedAt) {
      conflicts.push({
        local: localTask,
        remote: remoteTask
      })
    }
  }

  // Auto-resolve: last write wins
  for (const conflict of conflicts) {
    if (conflict.local.updatedAt > conflict.remote.updatedAt) {
      // Keep local version (already in DB)
      console.log(`Kept local version of task ${conflict.local._id}`)
    } else {
      // Update with remote version
      await adapter.update('tasks', { _id: conflict.remote._id }, conflict.remote)
      console.log(`Updated with remote version of task ${conflict.remote._id}`)
    }
  }

  return conflicts.length
}
```

## 🎨 Step 5: Building Complete Applications

### Task Management Dashboard

```tsx
// src/routes/TaskDashboard.tsx
import React, { useState, useEffect } from 'react'
import {
  Block, Stack, Title, Text, Grid, Group, Button, Card, CardHeader, CardContent,
  Progress, Badge
} from '@ui8kit/core'
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { FlexibleLmdbAdapter } from '../../server/storage/adapter.flexible.lmdb'

export default function TaskDashboard() {
  const [adapter] = useState(() => new FlexibleLmdbAdapter('./data/tasks-db'))
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    // Get statistics
    const taskStats = await getTaskStats()
    setStats(taskStats)

    // Get recent tasks
    const recent = await adapter.find('tasks', {}, {
      sort: { createdAt: -1 },
      limit: 5
    })
    setRecentTasks(recent)
  }

  const getTaskStats = async () => {
    const total = await adapter.count('tasks')
    const completed = await adapter.count('tasks', { completed: true })
    const pending = total - completed
    const highPriority = await adapter.count('tasks', { priority: 'high', completed: false })

    // Tasks completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedToday = await adapter.count('tasks', {
      completed: true,
      completedAt: { $gte: today }
    })

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      highPriority,
      completedToday
    }
  }

  if (!stats) {
    return <div>Loading dashboard...</div>
  }

  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <Title order={1} size="2xl">Task Dashboard</Title>

        {/* Stats Cards */}
        <Grid cols="1-2-4" gap="lg">
          <Card>
            <CardContent className="p-6">
              <Group justify="between">
                <Stack gap="sm">
                  <Text className="text-sm font-medium text-muted-foreground">Total Tasks</Text>
                  <Title order={2} size="3xl">{stats.total}</Title>
                </Stack>
                <CheckCircle size={32} className="text-muted-foreground" />
              </Group>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Group justify="between">
                <Stack gap="sm">
                  <Text className="text-sm font-medium text-muted-foreground">Completed</Text>
                  <Title order={2} size="3xl">{stats.completed}</Title>
                  <Progress value={stats.completionRate} className="w-full" />
                  <Text className="text-xs text-muted-foreground">{stats.completionRate}% done</Text>
                </Stack>
                <CheckCircle size={32} className="text-green-500" />
              </Group>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Group justify="between">
                <Stack gap="sm">
                  <Text className="text-sm font-medium text-muted-foreground">Pending</Text>
                  <Title order={2} size="3xl">{stats.pending}</Title>
                </Stack>
                <Clock size={32} className="text-orange-500" />
              </Group>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Group justify="between">
                <Stack gap="sm">
                  <Text className="text-sm font-medium text-muted-foreground">High Priority</Text>
                  <Title order={2} size="3xl">{stats.highPriority}</Title>
                </Stack>
                <AlertTriangle size={32} className="text-red-500" />
              </Group>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <Group justify="between">
              <Title order={2} size="xl">Recent Tasks</Title>
              <Badge variant="secondary">Today: +{stats.completedToday}</Badge>
            </Group>
          </CardHeader>
          <CardContent>
            <Stack gap="md">
              {recentTasks.map(task => (
                <Group key={task._id} justify="between" align="center">
                  <Stack gap="sm">
                    <Text className={task.completed ? 'line-through' : 'font-medium'}>
                      {task.title}
                    </Text>
                    <Group gap="sm">
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {task.priority}
                      </Badge>
                      <Text className="text-sm text-muted-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </Text>
                    </Group>
                  </Stack>
                  {task.completed && <CheckCircle size={20} className="text-green-500" />}
                </Group>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Block>
  )
}
```

### Contact Management System

```tsx
// src/routes/ContactManager.tsx
import React, { useState, useEffect } from 'react'
import {
  Block, Stack, Title, Text, Grid, Group, Button, Card, CardHeader, CardContent,
  Input, Textarea, Badge, Table, TableHeader, TableBody, TableRow, TableCell
} from '@ui8kit/core'
import { Plus, Search, User, Mail, Phone } from 'lucide-react'
import { FlexibleLmdbAdapter } from '../../server/storage/adapter.flexible.lmdb'

export default function ContactManager() {
  const [adapter] = useState(() => new FlexibleLmdbAdapter('./data/contacts-db'))
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeContacts()
  }, [])

  useEffect(() => {
    loadContacts()
  }, [searchQuery])

  const initializeContacts = async () => {
    // Create contacts collection
    await adapter.createCollection('contacts', {
      fields: {
        name: { type: 'string', required: true },
        email: { type: 'string', required: true, unique: true },
        phone: { type: 'string' },
        company: { type: 'string' },
        notes: { type: 'string' },
        tags: { type: 'array', default: [] }
      },
      indexes: [
        { fields: ['email'], unique: true },
        { fields: ['company'] },
        { fields: ['tags'] }
      ]
    })

    await loadContacts()
    setLoading(false)
  }

  const loadContacts = async () => {
    let query = {}

    if (searchQuery) {
      // Simple text search
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { company: { $regex: searchQuery, $options: 'i' } }
        ]
      }
    }

    const results = await adapter.find('contacts', query, {
      sort: { name: 1 }
    })

    setContacts(results)
  }

  const addContact = async (contactData) => {
    await adapter.insert('contacts', contactData)
    await loadContacts()
  }

  const updateContact = async (id, updates) => {
    await adapter.update('contacts', { _id: id }, updates)
    await loadContacts()
  }

  const deleteContact = async (id) => {
    if (confirm('Delete this contact?')) {
      await adapter.delete('contacts', { _id: id })
      await loadContacts()
    }
  }

  if (loading) {
    return <div>Loading contacts...</div>
  }

  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <Group justify="between" align="center">
          <Title order={1} size="2xl">Contact Manager</Title>
          <AddContactForm onAdd={addContact} />
        </Group>

        <Group gap="sm">
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline">
            <Search size={16} />
          </Button>
        </Group>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map(contact => (
                <TableRow key={contact._id}>
                  <TableCell>
                    <Group gap="sm">
                      <User size={20} />
                      <Text className="font-medium">{contact.name}</Text>
                    </Group>
                  </TableCell>
                  <TableCell>
                    <Stack gap="sm">
                      <Group gap="sm">
                        <Mail size={16} />
                        <Text className="text-sm">{contact.email}</Text>
                      </Group>
                      {contact.phone && (
                        <Group gap="sm">
                          <Phone size={16} />
                          <Text className="text-sm">{contact.phone}</Text>
                        </Group>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{contact.company || '-'}</TableCell>
                  <TableCell>
                    <Group gap="sm">
                      {contact.tags?.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </Group>
                  </TableCell>
                  <TableCell>
                    <Group gap="sm">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContact(contact._id)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Stack>
    </Block>
  )
}

function AddContactForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onAdd(formData)
    setFormData({ name: '', email: '', phone: '', company: '', notes: '' })
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus size={16} />
        Add Contact
      </Button>
    )
  }

  return (
    <Card className="w-96">
      <CardHeader>
        <Title order={3} size="lg">Add Contact</Title>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Input
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <Input
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
            <Textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />

            <Group justify="end" gap="sm">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Contact
              </Button>
            </Group>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
```

## 🚀 Step 6: Deployment and Production

### Environment Configuration for Production

```bash
# Basic offline setup
export MAINDB=LMDB
export BACKUPDB=JsonDB

# GraphQL synchronization mode
export GRAPHQL_MODE=GETMODE  # Read from GraphQL, write to local
# export GRAPHQL_MODE=SETMODE # Future: Write to GraphQL, read from local
# export GRAPHQL_MODE=CRUDMODE # Future: Full bidirectional sync

# Build the application
bun run build

# Start production server
bun run start
```

### Understanding GraphQL Modes

#### GETMODE (Current - Recommended)
```typescript
// Perfect for current setup: WordPress GraphQL → Local Storage
GRAPHQL_MODE=GETMODE

// Behavior:
// 1. Initial sync: Fetch from WordPress GraphQL → Store in LMDB/JSON
// 2. Runtime: Use local storage for all reads
// 3. Offline: Works completely offline
// 4. Future: When GraphQL adds mutations, easy upgrade to CRUDMODE
```

#### Future Modes (When GraphQL API Supports Mutations)
```typescript
// SETMODE: Local changes sync to GraphQL
GRAPHQL_MODE=SETMODE

// CRUDMODE: Real-time bidirectional sync
GRAPHQL_MODE=CRUDMODE
```

### Progressive Web App (PWA)

```typescript
// public/sw.js - Service Worker
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

```json
// public/manifest.json
{
  "name": "My Offline App",
  "short_name": "OfflineApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Docker Deployment

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .

# Install dependencies
RUN bun install

# Build application
RUN bun run build

# Expose port
EXPOSE 3000

# Start with offline database
ENV MAINDB=LMDB BACKUPDB=IndexedDB
CMD ["bun", "run", "start"]
```

## 📚 Next Steps

### Advanced Topics

1. **Real-time Collaboration**
   - WebSocket connections
   - Operational transforms
   - Conflict-free replicated data types

2. **Advanced Search**
   - Full-text search engines
   - Faceted search
   - Search analytics

3. **Data Export/Import**
   - CSV/JSON export
   - Bulk import tools
   - Data migration scripts

4. **User Management**
   - Authentication systems
   - Role-based access control
   - User preferences

### Resources

- [SSR-Starter Documentation](../README.md)
- [UI8Kit Component Library](../api/component-library.md)
- [Storage Adapters Guide](storage-adapters.md)
- [Offline Patterns](https://web.dev/offline-cookbook/)

### Example Applications

Check out these complete examples:

- [Blog Admin Panel](../../../examples/blog/admin.tsx)
- [Task Manager](../../../examples/tasks/)
- [Contact Management](../../../examples/crm/)
- [E-commerce Store](../../../examples/store/)

---

**Congratulations!** 🎉 You've learned how to build complete offline-first web applications with SSR-Starter. The flexible storage adapters and UI8Kit components give you everything you need to create powerful, offline-capable applications for any use case.

Ready to build something amazing? Start with the examples and adapt them for your needs! 🚀
