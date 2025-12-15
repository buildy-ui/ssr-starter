// Example: Blog Admin Panel using Flexible LMDB Adapter
// This demonstrates how to create a full-featured CMS admin interface

import React, { useState, useEffect } from 'react'
import {
  Block, Stack, Title, Text, Grid, Group, Button, Card, CardHeader, CardContent,
  Input, Textarea, Select, Badge, Table, TableHeader, TableBody, TableRow, TableCell,
  Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger, TabsContent
} from '../../src/components/ui8kit'
import { Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react'
import { FlexibleLmdbAdapter } from '../../server/storage/adapter.flexible.lmdb'

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'draft' | 'published'
  author: string
  categories: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

interface BlogCategory {
  _id: string
  name: string
  slug: string
  description: string
  color: string
}

export default function BlogAdmin() {
  const [adapter] = useState(() => new FlexibleLmdbAdapter('./data/blog-admin-db'))
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')

  useEffect(() => {
    initializeBlog()
  }, [])

  const initializeBlog = async () => {
    try {
      // Initialize collections
      await adapter.createCollection('posts', {
        fields: {
          title: { type: 'string', required: true },
          slug: { type: 'string', required: true, unique: true },
          content: { type: 'string', required: true },
          excerpt: { type: 'string' },
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

      await adapter.createCollection('categories', {
        fields: {
          name: { type: 'string', required: true },
          slug: { type: 'string', required: true, unique: true },
          description: { type: 'string' },
          color: { type: 'string', default: '#3b82f6' }
        },
        indexes: [
          { fields: ['slug'], unique: true }
        ]
      })

      // Load data
      await loadData()
    } catch (error) {
      console.error('Failed to initialize blog:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    const [postsData, categoriesData] = await Promise.all([
      adapter.find('posts', {}, { sort: { createdAt: -1 } }),
      adapter.find('categories', {}, { sort: { name: 1 } })
    ])

    setPosts(postsData)
    setCategories(categoriesData)
  }

  const createPost = async (postData: Omit<BlogPost, '_id' | 'createdAt' | 'updatedAt'>) => {
    await adapter.insert('posts', postData)
    await loadData()
  }

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    await adapter.update('posts', { _id: id }, { ...updates, updatedAt: new Date() })
    await loadData()
  }

  const deletePost = async (id: string) => {
    await adapter.delete('posts', { _id: id })
    await loadData()
  }

  const publishPost = async (id: string) => {
    await updatePost(id, { status: 'published', publishedAt: new Date() })
  }

  const createCategory = async (categoryData: Omit<BlogCategory, '_id'>) => {
    await adapter.insert('categories', categoryData)
    await loadData()
  }

  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg" align="center">
          <Title order={1} size="2xl">Loading Blog Admin...</Title>
          <Text>Initializing database and loading content...</Text>
        </Stack>
      </Block>
    )
  }

  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <Group justify="between" align="center">
          <Title order={1} size="2xl">Blog Admin Panel</Title>
          <Group gap="sm">
            <Badge variant="secondary">
              {posts.filter(p => p.status === 'published').length} Published
            </Badge>
            <Badge variant="outline">
              {posts.filter(p => p.status === 'draft').length} Drafts
            </Badge>
          </Group>
        </Group>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <PostsTab
              posts={posts}
              categories={categories}
              onCreatePost={createPost}
              onUpdatePost={updatePost}
              onDeletePost={deletePost}
              onPublishPost={publishPost}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab
              categories={categories}
              onCreateCategory={createCategory}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab posts={posts} categories={categories} />
          </TabsContent>
        </Tabs>
      </Stack>
    </Block>
  )
}

function PostsTab({
  posts,
  categories,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onPublishPost
}: {
  posts: BlogPost[]
  categories: BlogCategory[]
  onCreatePost: (post: any) => void
  onUpdatePost: (id: string, updates: any) => void
  onDeletePost: (id: string) => void
  onPublishPost: (id: string) => void
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <Title order={2} size="xl">Posts ({posts.length})</Title>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={16} />
          New Post
        </Button>
      </Group>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post._id}>
                <TableCell>
                  <Stack gap="sm">
                    <Text className="font-medium">{post.title}</Text>
                    <Text className="text-sm text-muted-foreground">/{post.slug}</Text>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Group gap="sm">
                    {post.categories.slice(0, 2).map(catId => {
                      const category = categories.find(c => c._id === catId)
                      return category ? (
                        <Badge key={catId} variant="outline" style={{ backgroundColor: category.color + '20' }}>
                          {category.name}
                        </Badge>
                      ) : null
                    })}
                    {post.categories.length > 2 && (
                      <Badge variant="outline">+{post.categories.length - 2}</Badge>
                    )}
                  </Group>
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Group gap="sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPost(post)}
                    >
                      <Edit size={14} />
                    </Button>
                    {post.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPublishPost(post._id)}
                      >
                        <Eye size={14} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this post?')) {
                          onDeletePost(post._id)
                        }
                      }}
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

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <PostForm
            categories={categories}
            onSave={(postData) => {
              onCreatePost(postData)
              setShowCreateDialog(false)
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      {editingPost && (
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            <PostForm
              initialData={editingPost}
              categories={categories}
              onSave={(postData) => {
                onUpdatePost(editingPost._id, postData)
                setEditingPost(null)
              }}
              onCancel={() => setEditingPost(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Stack>
  )
}

function PostForm({
  initialData,
  categories,
  onSave,
  onCancel
}: {
  initialData?: BlogPost
  categories: BlogCategory[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    status: initialData?.status || 'draft',
    author: initialData?.author || 'Admin',
    categories: initialData?.categories || [],
    tags: initialData?.tags || []
  })

  const [tagInput, setTagInput] = useState('')

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Post title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
          <Input
            placeholder="post-slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>

        <Textarea
          placeholder="Post excerpt..."
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={3}
        />

        <Textarea
          placeholder="Post content (HTML/Markdown)..."
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={10}
          required
        />

        <div className="grid grid-cols-3 gap-4">
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>

          <Input
            placeholder="Author name"
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            required
          />

          <div className="space-y-2">
            <Text className="text-sm font-medium">Categories</Text>
            <div className="flex flex-wrap gap-1">
              {categories.map(cat => (
                <label key={cat._id} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat._id)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setFormData(prev => ({
                        ...prev,
                        categories: checked
                          ? [...prev.categories, cat._id]
                          : prev.categories.filter(id => id !== cat._id)
                      }))
                    }}
                  />
                  <Badge variant="outline" style={{ backgroundColor: cat.color + '20' }}>
                    {cat.name}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Text className="text-sm font-medium">Tags</Text>
          <Group gap="sm">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>Add</Button>
          </Group>
          <div className="flex flex-wrap gap-1">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} <X size={12} />
              </Badge>
            ))}
          </div>
        </div>

        <Group justify="end" gap="sm">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save size={16} />
            {initialData ? 'Update' : 'Create'} Post
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

function CategoriesTab({
  categories,
  onCreateCategory
}: {
  categories: BlogCategory[]
  onCreateCategory: (data: any) => void
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <Stack gap="lg">
      <Group justify="between" align="center">
        <Title order={2} size="xl">Categories ({categories.length})</Title>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={16} />
          New Category
        </Button>
      </Group>

      <Grid cols="1-2-3" gap="md">
        {categories.map(category => (
          <Card key={category._id}>
            <CardContent className="p-4">
              <Stack gap="sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <Title order={4} size="md">{category.name}</Title>
                </div>
                <Text className="text-sm text-muted-foreground">
                  /{category.slug}
                </Text>
                {category.description && (
                  <Text className="text-sm">{category.description}</Text>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSave={(data) => {
              onCreateCategory(data)
              setShowCreateDialog(false)
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

function CategoryForm({
  onSave,
  onCancel
}: {
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6'
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Input
          placeholder="Category name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
        <Input
          placeholder="category-slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          required
        />
        <Textarea
          placeholder="Category description..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        <div className="space-y-2">
          <Text className="text-sm font-medium">Color</Text>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="w-full h-10 border rounded"
          />
        </div>

        <Group justify="end" gap="sm">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save size={16} />
            Create Category
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

function AnalyticsTab({
  posts,
  categories
}: {
  posts: BlogPost[]
  categories: BlogCategory[]
}) {
  const publishedPosts = posts.filter(p => p.status === 'published')
  const totalViews = publishedPosts.length * 100 // Mock data
  const avgEngagement = 4.2 // Mock data

  const postsByCategory = categories.map(cat => ({
    category: cat.name,
    count: posts.filter(p => p.categories.includes(cat._id)).length,
    color: cat.color
  }))

  return (
    <Grid cols="1-2-2" gap="lg">
      <Card>
        <CardContent className="p-6">
          <Stack gap="sm">
            <Title order={3} size="lg">{publishedPosts.length}</Title>
            <Text className="text-muted-foreground">Published Posts</Text>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Stack gap="sm">
            <Title order={3} size="lg">{totalViews.toLocaleString()}</Title>
            <Text className="text-muted-foreground">Total Views</Text>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Stack gap="sm">
            <Title order={3} size="lg">{avgEngagement}</Title>
            <Text className="text-muted-foreground">Avg Engagement</Text>
          </Stack>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <Title order={3} size="lg">Posts by Category</Title>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {postsByCategory.map(item => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text>{item.category}</Text>
                </div>
                <Badge variant="secondary">{item.count} posts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Grid>
  )
}
