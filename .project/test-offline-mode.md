# Offline Mode Testing Scenarios

Comprehensive testing guide for SSR-Starter's offline functionality with GraphQL synchronization.

## 📋 Test Environment Setup

### 1. Environment Configuration

Create `.env` file with test settings:

```bash
# GraphQL endpoint (your WordPress GraphQL URL)
GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql

# Storage configuration
MAINDB=LMDB
BACKUPDB=JsonDB

# GraphQL mode for testing
GRAPHQL_MODE=GETMODE

# Skip startup sync when testing offline boot
SYNC_ON_BOOT=false

# Optional: silence data source logs
LOG_DATA_SOURCE=false

# Development settings
NODE_ENV=development
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Initial Data Setup

```bash
# Build and sync initial data from WordPress GraphQL
bun run build

# Verify data is loaded
curl http://localhost:3000/health
```

---

## 🎯 Scenario 1: Forming Local Data for Offline Use

**Goal**: Ensure data is properly cached locally and works when internet is disconnected.

### Test Steps

#### Step 1: Verify Online Data Loading

```bash
# Start server
bun run dev

# Check initial data load
curl http://localhost:3000/api/posts

# Verify health endpoint shows data counts
curl http://localhost:3000/health
```

Expected output:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-13T...",
  "posts": 15  // Should show actual post count
}
```

#### Step 2: Simulate Offline Mode

```bash
# Stop GraphQL server or disconnect internet
# On Windows: Disable network adapter
# On Linux/Mac: sudo ifconfig en0 down

# Verify app still works offline
curl http://localhost:3000/health

# Test page rendering
curl http://localhost:3000/

# Test API endpoints
curl http://localhost:3000/api/posts
```

#### Step 3: Data Persistence Check

```bash
# Check LMDB files exist
ls -la data/db/

# Check JSON backup
ls -la src/data/json/

# Verify JSON backup contains data
cat src/data/json/full.json | head -20
```

#### Step 4: Reconnect and Verify Sync

```bash
# Reconnect internet
# On Windows: Enable network adapter
# On Linux/Mac: sudo ifconfig en0 up

# Wait for automatic sync or trigger manual sync
curl -X POST http://localhost:3000/api/sync

# Verify data is updated
curl http://localhost:3000/health
```

---

## 🎨 Scenario 2: Creating Entities and Data Types in Offline CMS

**Goal**: Test CRUD operations in offline mode using the flexible storage adapters.

### Prerequisites

Create a test admin route for managing tasks:

```typescript
// src/routes/TestAdmin.tsx
import React, { useState, useEffect } from 'react'
import { getFlexibleAdapters } from '../../server/storage'
import { Block, Stack, Title, Button, Input, Textarea, Card, CardContent } from '@ui8kit/core'

export default function TestAdmin() {
  const [adapter] = useState(() => getFlexibleAdapters().main)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const result = await adapter.find('test_tasks', {})
    setTasks(result)
  }

  const createTask = async (taskData) => {
    await adapter.insert('test_tasks', {
      title: taskData.title,
      description: taskData.description,
      completed: false,
      createdAt: new Date(),
      ...taskData
    })
    loadTasks()
  }

  // ... UI components for task management
}
```

### Test Steps

#### Step 1: Initialize Test Collection

```bash
# Start server
bun run dev

# Create test collection via API endpoint
curl -X POST http://localhost:3000/api/init-test-collection \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "test_tasks",
    "schema": {
      "fields": {
        "title": {"type": "string", "required": true},
        "description": {"type": "string"},
        "completed": {"type": "boolean", "default": false},
        "priority": {"type": "string", "default": "medium"},
        "createdAt": {"type": "date", "default": "() => new Date()"}
      }
    }
  }'
```

#### Step 2: Create Entities Offline

```bash
# Disconnect internet
# On Windows: Disable network connection

# Create first task via API
curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task 1",
    "description": "Created while offline",
    "priority": "high"
  }'

# Create second task
curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task 2",
    "description": "Another offline task",
    "priority": "medium"
  }'

# Verify tasks are stored locally
curl http://localhost:3000/api/test-tasks
```

Expected output:
```json
[
  {
    "_id": "auto-generated-id-1",
    "title": "Test Task 1",
    "description": "Created while offline",
    "priority": "high",
    "completed": false,
    "createdAt": "2025-12-13T..."
  },
  {
    "_id": "auto-generated-id-2",
    "title": "Test Task 2",
    "description": "Another offline task",
    "priority": "medium",
    "completed": false,
    "createdAt": "2025-12-13T..."
  }
]
```

#### Step 3: Test CRUD Operations Offline

```bash
# Update a task
curl -X PUT http://localhost:3000/api/test-tasks/auto-generated-id-1 \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true,
    "description": "Updated while offline"
  }'

# Delete a task
curl -X DELETE http://localhost:3000/api/test-tasks/auto-generated-id-2

# Verify changes
curl http://localhost:3000/api/test-tasks
```

#### Step 4: Test Data Types and Validation

```bash
# Test different data types
curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complex Task",
    "description": "Testing various data types",
    "priority": "low",
    "tags": ["urgent", "important"],
    "metadata": {
      "category": "work",
      "estimatedHours": 2.5
    },
    "dueDate": "2025-12-20T10:00:00Z"
  }'

# Test validation (should fail)
curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Missing required title"
  }'
```

Expected validation error:
```json
{
  "error": "Validation failed",
  "details": ["title is required"]
}
```

#### Step 5: Test Queries and Filtering

```bash
# Find by priority
curl "http://localhost:3000/api/test-tasks?priority=high"

# Find completed tasks
curl "http://localhost:3000/api/test-tasks?completed=true"

# Find by date range
curl "http://localhost:3000/api/test-tasks?createdAt[gte]=2025-12-13"

# Test search
curl "http://localhost:3000/api/test-tasks?search=offline"
```

---

## 🚀 Scenario 3: Sending New Entities to GraphQL (JSON Mode)

**Goal**: Test data export/sync mechanism when GraphQL mutations aren't ready yet.

### Prerequisites

Create export endpoint:

```typescript
// server/api/export.ts
import { getFlexibleAdapters } from '../storage'

export async function exportToJSON(collection: string) {
  const { main } = getFlexibleAdapters()
  const data = await main.find(collection, {})

  return {
    collection,
    exportedAt: new Date(),
    count: data.length,
    data
  }
}
```

### Test Steps

#### Step 1: Create Test Data

```bash
# Start server with internet connection
bun run dev

# Create several tasks
curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Export Test 1", "description": "To be exported"}'

curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Export Test 2", "description": "Ready for sync"}'

# Verify data exists
curl http://localhost:3000/api/test-tasks
```

#### Step 2: Export Data to JSON

```bash
# Export all test tasks
curl http://localhost:3000/api/export/test_tasks > exported_tasks.json

# Verify export file
cat exported_tasks.json | jq '.count'
```

Expected export format:
```json
{
  "collection": "test_tasks",
  "exportedAt": "2025-12-13T...",
  "count": 2,
  "data": [
    {
      "_id": "...",
      "title": "Export Test 1",
      "description": "To be exported",
      "completed": false,
      "createdAt": "2025-12-13T..."
    }
  ]
}
```

#### Step 3: Simulate GraphQL Submission (JSON Mode)

```bash
# Create submission endpoint simulation
curl -X POST http://localhost:3000/api/submit-to-graphql \
  -H "Content-Type: application/json" \
  -d @exported_tasks.json

# Expected response (simulation)
# {
#   "status": "queued",
#   "message": "Data queued for GraphQL submission when mutations are available",
#   "collection": "test_tasks",
#   "count": 2
# }
```

#### Step 4: Test Selective Export

```bash
# Export only completed tasks
curl -X POST http://localhost:3000/api/export/test_tasks \
  -H "Content-Type: application/json" \
  -d '{"query": {"completed": true}}' \
  > completed_tasks.json

# Export by date range
curl -X POST http://localhost:3000/api/export/test_tasks \
  -H "Content-Type: application/json" \
  -d '{"query": {"createdAt": {"$gte": "2025-12-13"}}}' \
  > todays_tasks.json
```

#### Step 5: Test Batch Operations

```bash
# Create multiple tasks at once
curl -X POST http://localhost:3000/api/test-tasks/batch \
  -H "Content-Type: application/json" \
  -d '[
    {"title": "Batch Task 1", "priority": "high"},
    {"title": "Batch Task 2", "priority": "medium"},
    {"title": "Batch Task 3", "priority": "low"}
  ]'

# Export batch data
curl http://localhost:3000/api/export/test_tasks > batch_export.json

# Verify batch export
cat batch_export.json | jq '.count'
```

#### Step 6: Test Export with Relations

```bash
# Create tasks with categories
curl -X POST http://localhost:3000/api/test-categories \
  -H "Content-Type: application/json" \
  -d '[
    {"name": "Work", "color": "#ff0000"},
    {"name": "Personal", "color": "#00ff00"}
  ]'

# Create tasks linked to categories
curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Linked Task",
    "categoryId": "category-id-1",
    "tags": ["work", "urgent"]
  }'

# Export with relations
curl http://localhost:3000/api/export/all > full_export.json

# Verify export contains both collections
cat full_export.json | jq 'keys'
```

Expected:
```json
{
  "test_tasks": { ... },
  "test_categories": { ... },
  "exportedAt": "2025-12-13T...",
  "version": "1.0"
}
```

---

## 🔄 Cross-Scenario Testing

### Test 1: Mode Switching

```bash
# Start with GETMODE
GRAPHQL_MODE=GETMODE bun run dev

# Test scenario 1 (data loading)
# ... run scenario 1 tests ...

# Switch to SETMODE (when GraphQL mutations ready)
GRAPHQL_MODE=SETMODE bun run dev

# Test export/sync behavior changes
# ... run scenario 3 tests ...
```

### Test 2: Storage Adapter Switching

```bash
# Test with LMDB
MAINDB=LMDB bun run dev
# ... run all scenarios ...

# Switch to JSON
MAINDB=JsonDB bun run dev
# ... run all scenarios ...

# Verify data consistency between adapters
```

### Test 3: Performance Testing

```bash
# Create many test records
for i in {1..1000}; do
  curl -X POST http://localhost:3000/api/test-tasks \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Task $i\", \"description\": \"Performance test\"}" &
done

# Test query performance
time curl "http://localhost:3000/api/test-tasks?limit=100"

# Test export performance
time curl http://localhost:3000/api/export/test_tasks > /dev/null
```

---

## 🐛 Troubleshooting Common Issues

### Issue: Data not persisting offline

```bash
# Check storage health
curl http://localhost:3000/api/storage/health

# Check file permissions
ls -la data/

# Check adapter configuration
curl http://localhost:3000/api/storage/config
```

### Issue: GraphQL sync failing

```bash
# Test GraphQL connectivity
curl -X POST $GRAPHQL_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Check GraphQL mode
echo $GRAPHQL_MODE

# Test adapter health
curl http://localhost:3000/api/storage/health
```

### Issue: Validation errors

```bash
# Check collection schema
curl http://localhost:3000/api/storage/schema/test_tasks

# Test with valid data
curl -X POST http://localhost:3000/api/test-tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Valid Task"}'
```

---

## 📊 Test Results Template

After running each scenario, document results:

```markdown
## Test Results Summary

### Scenario 1: Local Data Formation
- ✅ Data loads from GraphQL: YES/NO
- ✅ Offline mode works: YES/NO
- ✅ Data persists: YES/NO
- ✅ Reconnect sync works: YES/NO
- 📝 Notes: ...

### Scenario 2: Offline CRUD
- ✅ Create operations: YES/NO
- ✅ Read operations: YES/NO
- ✅ Update operations: YES/NO
- ✅ Delete operations: YES/NO
- ✅ Data validation: YES/NO
- 📝 Notes: ...

### Scenario 3: GraphQL Export
- ✅ Export functionality: YES/NO
- ✅ JSON format correct: YES/NO
- ✅ Selective export: YES/NO
- ✅ Batch operations: YES/NO
- 📝 Notes: ...

### Performance Metrics
- Data load time: ___ ms
- Query response time: ___ ms
- Export time: ___ ms
- Memory usage: ___ MB

### Issues Found
- 🐛 Issue 1: Description and fix
- 🐛 Issue 2: Description and fix
```

---

## 🚀 Next Steps After Testing

1. **Fix identified issues**
2. **Optimize performance bottlenecks**
3. **Add missing API endpoints**
4. **Update documentation**
5. **Prepare for GraphQL mutations**

This testing guide ensures comprehensive coverage of offline functionality across different scenarios and use cases.
