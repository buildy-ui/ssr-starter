import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import {
  Block, Stack, Title, Text, Grid, Group, Button, Card, CardHeader, CardContent,
  Input, Textarea, Select, Badge, Table, TableHeader, TableBody, TableRow, TableCell,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Tabs, TabsList, TabsTrigger, TabsContent
} from '@ui8kit/core'
import { Plus, Edit, Trash2, Search, Filter, Database, Settings, Users, FileText, BarChart3 } from 'lucide-react'

// Import flexible adapter (would be injected via context in real app)
import { FlexibleLmdbAdapter } from '../../server/storage/adapter.flexible.lmdb'

// CMS Admin Panel Component
export default function AdminPanel() {
  const [adapter] = useState(() => new FlexibleLmdbAdapter('./data/cms-db'))
  const [collections, setCollections] = useState<string[]>([])
  const [currentCollection, setCurrentCollection] = useState<string>('')
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (currentCollection) {
      loadDocuments(currentCollection)
    }
  }, [currentCollection])

  const loadCollections = async () => {
    try {
      const cols = await adapter.listCollections()
      setCollections(cols)
      if (cols.length > 0 && !currentCollection) {
        setCurrentCollection(cols[0])
      }
    } catch (error) {
      console.error('Failed to load collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async (collection: string) => {
    try {
      const docs = await adapter.find(collection, {}, { limit: 50 })
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const createCollection = async (name: string, schema?: any) => {
    try {
      await adapter.createCollection(name, schema)
      await loadCollections()
      setCurrentCollection(name)
    } catch (error) {
      console.error('Failed to create collection:', error)
    }
  }

  const deleteDocument = async (id: string) => {
    if (!currentCollection) return
    try {
      await adapter.delete(currentCollection, { _id: id })
      await loadDocuments(currentCollection)
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg" align="center">
          <Title order={1} size="2xl">Loading CMS...</Title>
          <Text>Initializing database connection...</Text>
        </Stack>
      </Block>
    )
  }

  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <Group justify="between" align="center">
          <Title order={1} size="2xl">CMS Admin Panel</Title>
          <Group gap="sm">
            <Badge variant="secondary">
              <Database size={14} />
              {collections.length} Collections
            </Badge>
            <Badge variant="secondary">
              <FileText size={14} />
              {documents.length} Documents
            </Badge>
          </Group>
        </Group>

        <Tabs defaultValue="collections" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="collections">
            <CollectionsTab
              collections={collections}
              currentCollection={currentCollection}
              onCollectionChange={setCurrentCollection}
              onCreateCollection={createCollection}
              adapter={adapter}
            />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab
              collection={currentCollection}
              documents={documents}
              onRefresh={() => loadDocuments(currentCollection)}
              onDelete={deleteDocument}
              adapter={adapter}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab adapter={adapter} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab adapter={adapter} />
          </TabsContent>
        </Tabs>
      </Stack>
    </Block>
  )
}

// Collections Management Tab
function CollectionsTab({
  collections,
  currentCollection,
  onCollectionChange,
  onCreateCollection,
  adapter
}: {
  collections: string[]
  currentCollection: string
  onCollectionChange: (collection: string) => void
  onCreateCollection: (name: string, schema?: any) => void
  adapter: FlexibleLmdbAdapter
}) {
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim())
      setNewCollectionName('')
      setShowCreateDialog(false)
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <Title order={2} size="xl">Collections</Title>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <Stack gap="md">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <Group justify="end" gap="sm">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCollection}>
                  Create
                </Button>
              </Group>
            </Stack>
          </DialogContent>
        </Dialog>
      </Group>

      <Grid cols="1-2-3-4" gap="md">
        {collections.map(collection => (
          <Card
            key={collection}
            className={currentCollection === collection ? 'ring-2 ring-primary' : ''}
            onClick={() => onCollectionChange(collection)}
          >
            <CardContent className="p-4">
              <Stack gap="sm" align="center">
                <Database size={24} />
                <Text className="font-medium">{collection}</Text>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Stack>
  )
}

// Documents Management Tab
function DocumentsTab({
  collection,
  documents,
  onRefresh,
  onDelete,
  adapter
}: {
  collection: string
  documents: any[]
  onRefresh: () => void
  onDelete: (id: string) => void
  adapter: FlexibleLmdbAdapter
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const filteredDocuments = documents.filter(doc =>
    JSON.stringify(doc).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!collection) {
    return (
      <Stack gap="lg" align="center">
        <Database size={48} className="text-muted-foreground" />
        <Title order={2} size="xl">No Collection Selected</Title>
        <Text className="text-muted-foreground">
          Select a collection from the Collections tab to manage documents.
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <Title order={2} size="xl">Documents in "{collection}"</Title>
        <Group gap="sm">
          <Button variant="outline" onClick={onRefresh}>
            <Search size={16} />
            Refresh
          </Button>
          <Button>
            <Plus size={16} />
            New Document
          </Button>
        </Group>
      </Group>

      <Group gap="sm">
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline">
          <Filter size={16} />
          Filter
        </Button>
      </Group>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Data Preview</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map(doc => (
              <TableRow key={doc._id}>
                <TableCell className="font-mono text-sm">
                  {doc._id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <Text className="text-sm text-muted-foreground max-w-md truncate">
                    {JSON.stringify(doc).substring(0, 100)}...
                  </Text>
                </TableCell>
                <TableCell>
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Group gap="sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDocument(doc)
                        setShowEditDialog(true)
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(doc._id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Group>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredDocuments.length === 0 && (
        <Stack gap="lg" align="center">
          <FileText size={48} className="text-muted-foreground" />
          <Title order={3} size="lg">No Documents Found</Title>
          <Text className="text-muted-foreground">
            {searchQuery ? 'No documents match your search.' : 'This collection is empty.'}
          </Text>
        </Stack>
      )}

      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <DocumentEditor
              document={selectedDocument}
              collection={collection}
              adapter={adapter}
              onSave={() => {
                onRefresh()
                setShowEditDialog(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

// Document Editor Component
function DocumentEditor({
  document,
  collection,
  adapter,
  onSave
}: {
  document: any
  collection: string
  adapter: FlexibleLmdbAdapter
  onSave: () => void
}) {
  const [editedDoc, setEditedDoc] = useState(JSON.stringify(document, null, 2))
  const [isValid, setIsValid] = useState(true)

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(editedDoc)
      await adapter.update(collection, { _id: document._id }, parsed)
      onSave()
    } catch (error) {
      console.error('Failed to save document:', error)
    }
  }

  const handleJsonChange = (value: string) => {
    setEditedDoc(value)
    try {
      JSON.parse(value)
      setIsValid(true)
    } catch {
      setIsValid(false)
    }
  }

  return (
    <Stack gap="md">
      <Textarea
        value={editedDoc}
        onChange={(e) => handleJsonChange(e.target.value)}
        className={`font-mono text-sm min-h-[400px] ${!isValid ? 'border-red-500' : ''}`}
        placeholder="JSON document..."
      />
      {!isValid && (
        <Text className="text-red-500 text-sm">
          Invalid JSON format
        </Text>
      )}
      <Group justify="end" gap="sm">
        <Button variant="outline" onClick={() => setEditedDoc(JSON.stringify(document, null, 2))}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={!isValid}>
          Save Changes
        </Button>
      </Group>
    </Stack>
  )
}

// Analytics Tab
function AnalyticsTab({ adapter }: { adapter: FlexibleLmdbAdapter }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    adapter.stats().then(setStats)
  }, [adapter])

  if (!stats) {
    return <Text>Loading analytics...</Text>
  }

  return (
    <Grid cols="1-2-3" gap="lg">
      <Card>
        <CardContent className="p-6">
          <Stack gap="sm">
            <Database size={24} />
            <Title order={3} size="lg">{stats.collections}</Title>
            <Text className="text-muted-foreground">Collections</Text>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Stack gap="sm">
            <FileText size={24} />
            <Title order={3} size="lg">{stats.documents}</Title>
            <Text className="text-muted-foreground">Documents</Text>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Stack gap="sm">
            <BarChart3 size={24} />
            <Title order={3} size="lg">{stats.indexes}</Title>
            <Text className="text-muted-foreground">Indexes</Text>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}

// Settings Tab
function SettingsTab({ adapter }: { adapter: FlexibleLmdbAdapter }) {
  const [backupPath, setBackupPath] = useState('./backup/cms-backup.json')

  const handleBackup = async () => {
    try {
      await adapter.backup(backupPath)
      alert('Backup created successfully!')
    } catch (error) {
      console.error('Backup failed:', error)
      alert('Backup failed!')
    }
  }

  const handleRestore = async () => {
    if (!confirm('This will overwrite all current data. Continue?')) return

    try {
      await adapter.restore(backupPath)
      alert('Data restored successfully!')
      window.location.reload()
    } catch (error) {
      console.error('Restore failed:', error)
      alert('Restore failed!')
    }
  }

  return (
    <Stack gap="lg">
      <Card>
        <CardHeader>
          <Title order={3} size="lg">Backup & Restore</Title>
        </CardHeader>
        <CardContent>
          <Stack gap="md">
            <Input
              value={backupPath}
              onChange={(e) => setBackupPath(e.target.value)}
              placeholder="Backup file path"
            />
            <Group gap="sm">
              <Button onClick={handleBackup}>
                Create Backup
              </Button>
              <Button variant="outline" onClick={handleRestore}>
                Restore from Backup
              </Button>
            </Group>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Title order={3} size="lg">Database Maintenance</Title>
        </CardHeader>
        <CardContent>
          <Stack gap="md">
            <Text className="text-sm text-muted-foreground">
              Perform maintenance operations on the database.
            </Text>
            <Group gap="sm">
              <Button variant="outline">
                Optimize Database
              </Button>
              <Button variant="outline">
                Clear Cache
              </Button>
            </Group>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
