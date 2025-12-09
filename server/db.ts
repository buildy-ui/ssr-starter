import { open } from 'lmdb';
import { defaultRenderContext } from '../src/data';
import { getPosts, getCategories, getTags, getAuthors, getPages } from '../src/data/graphql';
import type { RenderContext, PostData, CategoryData, TagData, AuthorData, PageSummary } from '../src/data/types';

const DB_PATH = './data/db';

export const db = open({
  path: DB_PATH,
  compression: true,
  maxDbs: 10,
  maxReaders: 126,
  mapSize: 2 * 1024 * 1024 * 1024, // 2GB
});

const postsDb = db.openDB({ name: 'posts' });
const categoriesDb = db.openDB({ name: 'categories' });
const tagsDb = db.openDB({ name: 'tags' });
const authorsDb = db.openDB({ name: 'authors' });
const pagesDb = db.openDB({ name: 'pages' });
const metaDb = db.openDB({ name: 'meta' });

// In-memory caches for fast, allocation-free reads
let postsCache: PostData[] = [];
let categoriesCache: CategoryData[] = [];
let tagsCache: TagData[] = [];
let authorsCache: AuthorData[] = [];
let pagesCache: PageSummary[] = [];
let metaCache: Record<string, unknown> = {};

// Render-time caches (rebuilt after every sync/write)
let renderContextCache: RenderContext | null = null;
const routeContextCache = new Map<string, RenderContext>();

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

function invalidateContextCaches() {
  renderContextCache = null;
  routeContextCache.clear();
}

function loadFromDb() {
  try {
    // Load data from LmDB into cache
    postsCache = [];
    for (const { value } of postsDb.getRange()) {
      postsCache.push(value);
    }
    categoriesCache = [];
    for (const { value } of categoriesDb.getRange()) {
      categoriesCache.push(value);
    }
    tagsCache = [];
    for (const { value } of tagsDb.getRange()) {
      tagsCache.push(value);
    }
    authorsCache = [];
    for (const { value } of authorsDb.getRange()) {
      authorsCache.push(value);
    }
    pagesCache = [];
    for (const { value } of pagesDb.getRange()) {
      pagesCache.push(value);
    }
    metaCache = {};
    for (const { key, value } of metaDb.getRange()) {
      metaCache[String(key)] = value;
    }
    invalidateContextCaches();
  } catch (error) {
    console.warn('Failed to load data from LmDB, using empty cache:', error);
  }
}

// Function to sync data from GraphQL to LmDB
async function syncFromGraphQL() {
  try {
    console.log('🚀 Syncing data from GraphQL...');

    // Fetch data from GraphQL
    const [posts, categories, tags, authors, pages] = await Promise.all([
      getPosts(),
      getCategories(),
      getTags(),
      getAuthors(),
      getPages()
    ]);

    // Transform and save posts (preserve date object, images, sizes, thumbnail)
    const transformedPosts = posts.posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      date: post.date ?? {
        display: new Date().toLocaleDateString(),
        raw: new Date().toISOString(),
      },
      featuredImage: post.featuredImage,
      thumbnail: post.thumbnail,
      categories: post.categories || [],
      tags: post.tags || [],
      author: post.author,
    }));

    // Transform and save pages
    const transformedPages = pages.map((page: any) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      excerpt: page.excerpt,
      content: page.content,
      featuredImage: page.featuredImage
    }));

    // Save to database
    dbOperations.savePosts(transformedPosts);
    dbOperations.saveCategories(categories);
    dbOperations.saveTags(tags);
    dbOperations.saveAuthors(authors);
    dbOperations.savePages(transformedPages);

    console.log(`✅ Synced ${transformedPosts.length} posts, ${categories.length} categories, ${tags.length} tags, ${authors.length} authors, ${transformedPages.length} pages`);

  } catch (error) {
    console.error('❌ Failed to sync from GraphQL:', error);
  }
}

// Initialize cache on module load
loadFromDb();

function replaceStore<T>(store: any, entries: T[], keyExtractor: (item: T) => number) {
  // Simply put all entries - LmDB will overwrite existing keys
  for (const entry of entries) {
    store.put(keyExtractor(entry), entry);
  }
}

export const dbOperations = {
  savePosts(posts: PostData[]) {
    replaceStore(postsDb, posts, (post) => post.id);
    postsCache = posts;
    invalidateContextCaches();
  },

  saveCategories(categories: CategoryData[]) {
    replaceStore(categoriesDb, categories, (cat) => cat.id);
    categoriesCache = categories;
    invalidateContextCaches();
  },

  saveTags(tags: TagData[]) {
    replaceStore(tagsDb, tags, (tag) => tag.id);
    tagsCache = tags;
    invalidateContextCaches();
  },

  saveAuthors(authors: AuthorData[]) {
    replaceStore(authorsDb, authors, (author) => author.id);
    authorsCache = authors;
    invalidateContextCaches();
  },

  savePages(pages: PageSummary[]) {
    replaceStore(pagesDb, pages, (page) => page.id);
    pagesCache = pages;
    invalidateContextCaches();
  },

  saveMeta(key: string, value: unknown) {
    metaDb.put(key, value);
    metaCache[key] = value;
    invalidateContextCaches();
  },

  getMeta<T>(key: string, fallback: T): T {
    return (metaCache[key] as T) ?? fallback;
  },

  getPosts(): PostData[] {
    return postsCache;
  },

  getCategories(): CategoryData[] {
    return categoriesCache;
  },

  getTags(): TagData[] {
    return tagsCache;
  },

  getAuthors(): AuthorData[] {
    return authorsCache;
  },

  getPages(): PageSummary[] {
    return pagesCache;
  },

  getRenderContext(): RenderContext {
    if (renderContextCache) return renderContextCache;

    renderContextCache = {
      posts: { posts: this.getPosts() },
      categories: this.getCategories(),
      tags: this.getTags(),
      authors: this.getAuthors(),
      pages: this.getPages(),
      site: this.getMeta('site', defaultRenderContext.site),
      menu: this.getMeta('menu', defaultRenderContext.menu),
      assets: {
        s3AssetsUrl: process.env.S3_ASSETS_URL!,
      },
    };
    return renderContextCache;
  },

  getRouteContext(path: string): RenderContext {
    const normalized = normalizePath(path);
    const cached = routeContextCache.get(normalized);
    if (cached) return cached;

    const context = this.getRenderContext();
    routeContextCache.set(normalized, context);
    return context;
  },

  invalidateCaches() {
    invalidateContextCaches();
  },
};
