# Storage Adapters

Complete guide to SSR-Starter's storage adapters and caching strategies.

## Overview

SSR-Starter supports multiple storage adapters that allow you to choose the best persistence strategy for your use case. Each adapter implements the same interface but optimizes for different scenarios.

## Storage Adapter Interface

All storage adapters implement this common interface:

```typescript
interface StorageAdapter {
  save(collections: DataCollections): Promise<void>;
  load(): Promise<DataCollections | null>;
  clear(): Promise<void>;
  getLastModified?(): Promise<Date>;
  invalidate?(): Promise<void>;
}
```

## Available Adapters

### LMDB Adapter

**Best for**: High-performance server-side storage

**Characteristics**:
- Memory-mapped database
- Extremely fast reads/writes
- Persistent storage
- Server-side only

**Configuration**:
```bash
MAINDB=LMDB
# Data stored in: ./data/db/
```

**Use Cases**:
- Production server deployments
- High-traffic applications
- Data-intensive applications

**Implementation**:
```typescript
// server/storage/adapter.lmdb.ts
export class LMDBAdapter implements StorageAdapter {
  private db: Database;

  constructor() {
    this.db = open({
      path: './data/db',
      compression: true,
      maxDbs: 10,
      mapSize: 2 * 1024 * 1024 * 1024 // 2GB
    });
  }

  async save(collections: DataCollections) {
    const postsDb = this.db.openDB({ name: 'posts' });
    const categoriesDb = this.db.openDB({ name: 'categories' });

    // Batch write operations
    await Promise.all([
      postsDb.put('data', collections.posts),
      categoriesDb.put('data', collections.categories)
      // ... other collections
    ]);
  }

  async load() {
    try {
      const postsDb = this.db.openDB({ name: 'posts' });
      const posts = postsDb.get('data');

      // Return all collections
      return {
        posts,
        categories: categoriesDb.get('data'),
        // ... other collections
      };
    } catch {
      return null;
    }
  }
}
```

### IndexedDB Adapter

**Best for**: Progressive Web Apps and offline functionality

**Characteristics**:
- Browser-native storage
- Large storage capacity (50MB+)
- Asynchronous API
- Client-side only

**Configuration**:
```bash
MAINDB=IndexedDB
# Data stored in browser's IndexedDB
```

**Use Cases**:
- Offline-first applications
- PWA functionality
- Client-side caching

**Implementation**:
```typescript
// Browser-based IndexedDB adapter
export class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase;

  async save(collections: DataCollections) {
    const transaction = this.db.transaction(['collections'], 'readwrite');
    const store = transaction.objectStore('collections');

    for (const [key, data] of Object.entries(collections)) {
      await this.put(store, key, data);
    }
  }

  async load() {
    const transaction = this.db.transaction(['collections'], 'readonly');
    const store = transaction.objectStore('collections');

    const collections: Partial<DataCollections> = {};

    for (const key of ['posts', 'categories', 'tags', 'authors', 'pages']) {
      collections[key] = await this.get(store, key);
    }

    return collections as DataCollections;
  }
}
```

### JSON Adapter

**Best for**: Development and simple deployments

**Characteristics**:
- File-based JSON storage
- Human-readable
- Easy debugging
- Cross-platform

**Configuration**:
```bash
MAINDB=JsonDB
# Data stored in: ./data/json/full.json
```

**Use Cases**:
- Development environments
- Simple deployments
- Debugging data issues

**Implementation**:
```typescript
// server/storage/adapter.json.ts
export class JSONAdapter implements StorageAdapter {
  private filePath = './data/json/full.json';

  async save(collections: DataCollections) {
    const dir = dirname(this.filePath);
    await mkdir(dir, { recursive: true });

    await writeFile(
      this.filePath,
      JSON.stringify(collections, null, 2),
      'utf8'
    );
  }

  async load(): Promise<DataCollections | null> {
    try {
      const content = await readFile(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async getLastModified() {
    try {
      const stats = await stat(this.filePath);
      return stats.mtime;
    } catch {
      return new Date(0);
    }
  }
}
```

### ContextDB Adapter

**Best for**: Static site generation and embedded data

**Characteristics**:
- Data embedded in HTML
- No external requests needed
- SEO-friendly
- Fast initial loads

**Configuration**:
```bash
MAINDB=ContextDB
# Data embedded in HTML <script> tags
```

**Use Cases**:
- Static site generation
- SEO-critical pages
- Fast initial page loads

**Implementation**:
```typescript
// Embed data in HTML context
export class ContextAdapter implements StorageAdapter {
  async save(collections: DataCollections) {
    // Data will be embedded in HTML during render
    global.__SSR_DATA__ = collections;
  }

  async load() {
    return global.__SSR_DATA__ || null;
  }
}
```

### In-Memory Adapter (Default)

**Best for**: Development and testing

**Characteristics**:
- No persistence
- Fastest performance
- Lost on restart
- Memory-only

**Configuration**:
```bash
MAINDB=FALSE  # or omit entirely
# No data persistence
```

**Use Cases**:
- Development environments
- Testing scenarios
- CI/CD pipelines

## Configuration

### Environment Variables

```bash
# Primary storage adapter
MAINDB=LMDB          # LMDB | IndexedDB | JsonDB | ContextDB | FALSE

# Backup storage adapter (optional)
BACKUPDB=IndexedDB   # Same options as MAINDB

# Performance tuning
MAX_CACHE_SIZE=100   # MB
CACHE_TTL=3600       # seconds
```

### Runtime Configuration

```typescript
// server/storage/index.ts
export function createStorageAdapter(type: string): StorageAdapter {
  const adapters = {
    LMDB: () => new LMDBAdapter(),
    IndexedDB: () => new IndexedDBAdapter(),
    JsonDB: () => new JSONAdapter(),
    ContextDB: () => new ContextAdapter(),
    FALSE: () => new InMemoryAdapter()
  };

  return adapters[type]?.() || new InMemoryAdapter();
}
```

## Storage Hierarchy

SSR-Starter uses a hierarchical storage approach:

```
1. In-Memory Cache (fastest)
   └── Render Context Cache
   └── Route Context Cache

2. Primary Storage (MAINDB)
   └── LMDB/IndexedDB/JSON/ContextDB

3. Backup Storage (BACKUPDB)
   └── Fallback for primary storage

4. Network Fallback
   └── Fresh GraphQL fetch
```

## Data Synchronization

### Automatic Sync

```typescript
// server/sync.ts
export async function syncAllData() {
  const data = await fetchFromGraphQL();

  // Save to primary storage
  await primaryAdapter.save(data);

  // Save to backup storage (if configured)
  if (backupAdapter) {
    await backupAdapter.save(data);
  }

  // Invalidate caches
  invalidateCaches();
}
```

### Manual Sync

```bash
# Trigger manual sync
curl -X POST http://localhost:3000/api/sync

# Or rebuild application
bun run build
```

## Performance Comparison

| Adapter | Read Speed | Write Speed | Persistence | Use Case |
|---------|------------|-------------|-------------|----------|
| In-Memory | ⚡⚡⚡ | ⚡⚡⚡ | ❌ | Development |
| LMDB | ⚡⚡⚡ | ⚡⚡ | ✅ | Production |
| IndexedDB | ⚡⚡ | ⚡⚡ | ✅ | PWA/Offline |
| JSON | ⚡ | ⚡ | ✅ | Simple/Dev |
| ContextDB | ⚡⚡⚡ | ⚡ | ❌ | SSG |

## Caching Strategies

### Multi-Level Caching

```typescript
// 1. Application-level cache
const renderContextCache: RenderContext | null = null;

// 2. Route-level cache
const routeContextCache = new Map<string, RenderContext>();

// 3. Storage-level cache
// Handled by individual adapters
```

### Cache Invalidation

```typescript
export function invalidateCaches() {
  renderContextCache = null;
  routeContextCache.clear();

  // Invalidate storage caches
  primaryAdapter.invalidate?.();
  backupAdapter?.invalidate?.();
}
```

## Migration Between Adapters

### Data Migration Script

```typescript
// scripts/migrate-storage.ts
export async function migrateStorage(fromType: string, toType: string) {
  const fromAdapter = createStorageAdapter(fromType);
  const toAdapter = createStorageAdapter(toType);

  // Load data from old adapter
  const data = await fromAdapter.load();
  if (!data) {
    throw new Error('No data to migrate');
  }

  // Save to new adapter
  await toAdapter.save(data);

  // Verify migration
  const migratedData = await toAdapter.load();
  if (!migratedData) {
    throw new Error('Migration failed');
  }

  console.log('Migration completed successfully');
}
```

### Migration Commands

```bash
# Migrate from JSON to LMDB
bun run scripts/migrate-storage.ts JsonDB LMDB

# Migrate from LMDB to IndexedDB
bun run scripts/migrate-storage.ts LMDB IndexedDB
```

## Monitoring and Maintenance

### Storage Metrics

```typescript
// server/index.ts
app.get('/health', async () => {
  const metrics = {
    storage: {
      primary: await primaryAdapter.getStats?.(),
      backup: await backupAdapter?.getStats?.(),
      cache: {
        renderContext: renderContextCache !== null,
        routeContexts: routeContextCache.size
      }
    }
  };

  return metrics;
});
```

### Maintenance Tasks

```typescript
// Clean old cache entries
export async function cleanupStorage() {
  // Remove expired cache entries
  await primaryAdapter.cleanup?.();

  // Compact storage if supported
  await primaryAdapter.compact?.();
}
```

## Best Practices

### Choosing the Right Adapter

**For Development**:
```bash
MAINDB=FALSE  # Fast, no persistence
```

**For Production Server**:
```bash
MAINDB=LMDB
BACKUPDB=IndexedDB
```

**For PWA/Offline App**:
```bash
MAINDB=IndexedDB
BACKUPDB=JsonDB
```

**For Static Sites**:
```bash
MAINDB=ContextDB
```

### Performance Optimization

1. **Use appropriate cache sizes**:
   ```bash
   MAX_CACHE_SIZE=100  # MB
   ```

2. **Configure TTL appropriately**:
   ```bash
   CACHE_TTL=3600  # 1 hour for content
   ```

3. **Monitor storage usage**:
   ```bash
   # Check storage metrics
   curl http://localhost:3000/health
   ```

### Backup and Recovery

1. **Regular backups**:
   ```bash
   # Backup script
   cp -r data/ backup/$(date +%Y%m%d)/
   ```

2. **Recovery procedures**:
   ```bash
   # Restore from backup
   cp -r backup/20240101/ data/

   # Rebuild caches
   bun run build
   ```

## Using Storage Adapters

### Basic Storage Adapters

```typescript
import { getAdapters } from '../server/storage';

// Get configured adapters
const { main, backup } = getAdapters();

// Use main adapter for primary operations
await main.saveAllPosts(posts);

// Use backup as fallback
if (!main) {
  await backup.saveAllPosts(posts);
}
```

### GraphQL-Aware Flexible Adapters

```typescript
import { getFlexibleAdapters } from '../server/storage';

// Get GraphQL-aware adapters
const { main, backup } = getFlexibleAdapters();

// These adapters automatically handle GraphQL sync based on GRAPHQL_MODE
await main.insert('tasks', { title: 'New Task', completed: false });

// In GETMODE: Reads from local, syncs from GraphQL when empty
const tasks = await main.find('tasks', { completed: false });

// Future-ready for mutations when GraphQL supports them
// In SETMODE/CRUDMODE: Changes will sync to GraphQL automatically
```

### GraphQL Synchronization Modes

#### GETMODE (Current - Recommended)
```bash
GRAPHQL_MODE=GETMODE
```
- ✅ Reads from GraphQL, writes to local storage
- ✅ Perfect for current WordPress setup
- ✅ Works completely offline
- ✅ Easy to upgrade when GraphQL mutations ready

#### SETMODE (Future)
```bash
GRAPHQL_MODE=SETMODE
```
- 🔄 Reads from local, writes to GraphQL
- 📋 For when you want to push local changes to server

#### CRUDMODE (Future)
```bash
GRAPHQL_MODE=CRUDMODE
```
- 🔄 Full bidirectional synchronization
- ⚡ Real-time sync between local and GraphQL

## Troubleshooting

### Common Storage Issues

**"Storage adapter failed to save"**:
```bash
# Check permissions
ls -la data/
chmod 755 data/

# Check disk space
df -h

# Clear corrupted data
rm -rf data/db/ data/json/
bun run build
```

**"IndexedDB not available"**:
```javascript
// Check browser support
if (!window.indexedDB) {
  console.warn('IndexedDB not supported, falling back to JSON');
}
```

**"LMDB database corrupted"**:
```bash
# Remove corrupted database
rm -rf data/db/

# Re-sync data
bun run build
```

### Performance Issues

**Slow storage access**:
```bash
# Check storage metrics
curl http://localhost:3000/health

# Optimize cache settings
MAX_CACHE_SIZE=200 bun run dev
```

**High memory usage**:
```bash
# Reduce cache size
MAX_CACHE_SIZE=50 bun run dev

# Use lighter adapter
MAINDB=JsonDB bun run dev
```

This comprehensive storage adapter system provides flexibility, performance, and reliability for any deployment scenario.
