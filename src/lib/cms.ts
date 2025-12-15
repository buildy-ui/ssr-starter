// CMS Data Management Library
// Provides high-level API for managing different content types

import { FlexibleLmdbAdapter } from '../../server/storage/adapter.flexible.lmdb'

// CMS Content Types
export interface CMSContent {
  _id: string
  title: string
  slug: string
  content: string
  status: 'draft' | 'published' | 'archived'
  author: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface CMSCategory {
  _id: string
  name: string
  slug: string
  description: string
  color?: string
  parent?: string
  order: number
}

export interface CMSUser {
  _id: string
  username: string
  email: string
  role: 'admin' | 'editor' | 'author'
  avatar?: string
  bio?: string
  permissions: string[]
}

export interface CMSSettings {
  _id: string
  siteTitle: string
  siteDescription: string
  theme: 'light' | 'dark'
  language: string
  timezone: string
  customFields: Record<string, any>
}

// CMS Manager Class
export class CMSManager {
  private adapter: FlexibleLmdbAdapter

  constructor(dbPath = './data/cms-db') {
    this.adapter = new FlexibleLmdbAdapter(dbPath)
  }

  // Initialize CMS collections
  async initialize() {
    // Content collection
    await this.adapter.createCollection('content', {
      fields: {
        title: { type: 'string', required: true },
        slug: { type: 'string', required: true, unique: true },
        content: { type: 'string', required: true },
        status: { type: 'string', required: true },
        author: { type: 'string', required: true },
        tags: { type: 'array', default: [] },
        publishedAt: { type: 'date' }
      },
      indexes: [
        { fields: ['slug'], unique: true },
        { fields: ['status'] },
        { fields: ['author'] },
        { fields: ['tags'] }
      ]
    })

    // Categories collection
    await this.adapter.createCollection('categories', {
      fields: {
        name: { type: 'string', required: true },
        slug: { type: 'string', required: true, unique: true },
        description: { type: 'string' },
        color: { type: 'string' },
        parent: { type: 'string' },
        order: { type: 'number', default: 0 }
      },
      indexes: [
        { fields: ['slug'], unique: true },
        { fields: ['parent'] }
      ]
    })

    // Users collection
    await this.adapter.createCollection('users', {
      fields: {
        username: { type: 'string', required: true, unique: true },
        email: { type: 'string', required: true, unique: true },
        role: { type: 'string', required: true },
        avatar: { type: 'string' },
        bio: { type: 'string' },
        permissions: { type: 'array', default: [] }
      },
      indexes: [
        { fields: ['username'], unique: true },
        { fields: ['email'], unique: true },
        { fields: ['role'] }
      ]
    })

    // Settings collection (single document)
    await this.adapter.createCollection('settings')

    console.log('CMS initialized successfully')
  }

  // Content Management
  async createContent(content: Omit<CMSContent, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return await this.adapter.insert('content', content)
  }

  async getContent(slug: string): Promise<CMSContent | null> {
    return await this.adapter.findOne('content', { slug })
  }

  async getPublishedContent(options: {
    limit?: number
    skip?: number
    category?: string
    author?: string
    tags?: string[]
  } = {}): Promise<CMSContent[]> {
    const query: any = { status: 'published' }

    if (options.category) {
      query.categories = options.category
    }

    if (options.author) {
      query.author = options.author
    }

    if (options.tags?.length) {
      query.tags = { $in: options.tags }
    }

    return await this.adapter.find('content', query, {
      limit: options.limit || 10,
      skip: options.skip || 0,
      sort: { publishedAt: -1 }
    })
  }

  async updateContent(id: string, updates: Partial<CMSContent>): Promise<number> {
    return await this.adapter.update('content', { _id: id }, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async deleteContent(id: string): Promise<number> {
    return await this.adapter.delete('content', { _id: id })
  }

  async publishContent(id: string): Promise<number> {
    return await this.adapter.update('content', { _id: id }, {
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date()
    })
  }

  // Category Management
  async createCategory(category: Omit<CMSCategory, '_id'>): Promise<string> {
    return await this.adapter.insert('categories', category)
  }

  async getCategories(parent?: string): Promise<CMSCategory[]> {
    const query = parent ? { parent } : {}
    return await this.adapter.find('categories', query, {
      sort: { order: 1, name: 1 }
    })
  }

  async updateCategory(id: string, updates: Partial<CMSCategory>): Promise<number> {
    return await this.adapter.update('categories', { _id: id }, updates)
  }

  async deleteCategory(id: string): Promise<number> {
    // Check if category has children or content
    const children = await this.adapter.count('categories', { parent: id })
    const contentCount = await this.adapter.count('content', { categories: id })

    if (children > 0 || contentCount > 0) {
      throw new Error('Cannot delete category with children or content')
    }

    return await this.adapter.delete('categories', { _id: id })
  }

  // User Management
  async createUser(user: Omit<CMSUser, '_id'>): Promise<string> {
    return await this.adapter.insert('users', user)
  }

  async getUser(username: string): Promise<CMSUser | null> {
    return await this.adapter.findOne('users', { username })
  }

  async getUsersByRole(role: string): Promise<CMSUser[]> {
    return await this.adapter.find('users', { role })
  }

  async updateUser(username: string, updates: Partial<CMSUser>): Promise<number> {
    return await this.adapter.update('users', { username }, updates)
  }

  // Search and Analytics
  async searchContent(query: string, options: {
    limit?: number
    fields?: string[]
  } = {}): Promise<any[]> {
    const results = await this.adapter.search('content', {
      query,
      fields: options.fields || ['title', 'content', 'excerpt'],
      limit: options.limit || 20
    })

    return results.map(result => result.document)
  }

  async getContentStats(): Promise<{
    total: number
    published: number
    drafts: number
    archived: number
    byCategory: Record<string, number>
    byAuthor: Record<string, number>
  }> {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]

    const statusStats = await this.adapter.aggregate('content', pipeline)

    const byCategoryPipeline = [
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 }
        }
      }
    ]

    const byAuthorPipeline = [
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 }
        }
      }
    ]

    const [byCategory, byAuthor] = await Promise.all([
      this.adapter.aggregate('content', byCategoryPipeline),
      this.adapter.aggregate('content', byAuthorPipeline)
    ])

    const total = await this.adapter.count('content')
    const published = statusStats.find(s => s._id === 'published')?.count || 0
    const drafts = statusStats.find(s => s._id === 'draft')?.count || 0
    const archived = statusStats.find(s => s._id === 'archived')?.count || 0

    return {
      total,
      published,
      drafts,
      archived,
      byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
      byAuthor: Object.fromEntries(byAuthor.map(a => [a._id, a.count]))
    }
  }

  // Settings Management
  async getSettings(): Promise<CMSSettings | null> {
    const settings = await this.adapter.find('settings', {}, { limit: 1 })
    return settings[0] || null
  }

  async updateSettings(updates: Partial<CMSSettings>): Promise<void> {
    const existing = await this.getSettings()

    if (existing) {
      await this.adapter.update('settings', { _id: existing._id }, updates)
    } else {
      await this.adapter.insert('settings', {
        siteTitle: 'My CMS',
        siteDescription: 'Content Management System',
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        customFields: {},
        ...updates
      } as CMSSettings)
    }
  }

  // Backup and Restore
  async backup(path: string): Promise<void> {
    await this.adapter.backup(path)
  }

  async restore(path: string): Promise<void> {
    await this.adapter.restore(path)
  }

  // Health check
  async health(): Promise<boolean> {
    return await this.adapter.health()
  }

  // Close connection
  async close(): Promise<void> {
    // Cleanup if needed
  }
}

// Pre-configured CMS instances for different use cases
export const contentCMS = new CMSManager('./data/content-db')
export const blogCMS = new CMSManager('./data/blog-db')
export const docsCMS = new CMSManager('./data/docs-db')

// Example usage patterns
export class BlogManager extends CMSManager {
  async createPost(post: {
    title: string
    content: string
    excerpt: string
    author: string
    categories: string[]
    tags: string[]
  }) {
    const slug = this.generateSlug(post.title)

    return await this.createContent({
      title: post.title,
      slug,
      content: post.content,
      excerpt: post.excerpt,
      status: 'draft',
      author: post.author,
      tags: post.tags,
      categories: post.categories
    })
  }

  async getPostsByCategory(categorySlug: string, options: { limit?: number } = {}) {
    // First get category
    const category = await this.adapter.findOne('categories', { slug: categorySlug })
    if (!category) return []

    // Get posts in category
    return await this.adapter.find('content', {
      categories: category._id,
      status: 'published'
    }, {
      limit: options.limit || 10,
      sort: { publishedAt: -1 }
    })
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export class UserManager extends CMSManager {
  async authenticate(username: string, password: string): Promise<CMSUser | null> {
    // In real app, hash and compare passwords
    const user = await this.getUser(username)
    if (user && user.password === password) { // Simplified
      return user
    }
    return null
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.adapter.findOne('users', { _id: userId })
    return user?.permissions.includes(permission) || false
  }

  async getUsersWithPermission(permission: string): Promise<CMSUser[]> {
    return await this.adapter.find('users', {
      permissions: { $in: [permission] }
    })
  }
}

export class AnalyticsManager extends CMSManager {
  async trackPageView(pageId: string, userId?: string, metadata?: any) {
    await this.adapter.insert('analytics', {
      type: 'pageview',
      pageId,
      userId,
      metadata,
      timestamp: new Date()
    })
  }

  async getPopularPages(limit = 10): Promise<any[]> {
    const pipeline = [
      { $match: { type: 'pageview' } },
      {
        $group: {
          _id: '$pageId',
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          pageId: '$_id',
          views: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit }
    ]

    return await this.adapter.aggregate('analytics', pipeline)
  }
}

// Export singleton instances
export const blogManager = new BlogManager('./data/blog-db')
export const userManager = new UserManager('./data/user-db')
export const analyticsManager = new AnalyticsManager('./data/analytics-db')
