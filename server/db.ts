import { open } from 'lmdb';
import { defaultRenderContext } from '../src/data';
import type {
  RenderContext,
  PostData,
  CategoryData,
  TagData,
  AuthorData,
  HomeData,
  AboutData,
  PageSummary,
} from '../src/data/types';

const DB_PATH = './data/db';

export const db = open({
  path: DB_PATH,
  compression: true,
  maxDbs: 10,
  maxReaders: 126,
  mapSize: 2 * 1024 * 1024 * 1024, // 2GB
});

const postsDb = db.openDB('posts');
const categoriesDb = db.openDB('categories');
const tagsDb = db.openDB('tags');
const authorsDb = db.openDB('authors');
const metaDb = db.openDB('meta');

// In-memory cache for faster access
let postsCache: PostData[] = [];
let categoriesCache: CategoryData[] = [];
let tagsCache: TagData[] = [];
let authorsCache: AuthorData[] = [];

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
  } catch (error) {
    console.warn('Failed to load data from LmDB, using empty cache:', error);
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
  },

  saveCategories(categories: CategoryData[]) {
    replaceStore(categoriesDb, categories, (cat) => cat.id);
    categoriesCache = categories;
  },

  saveTags(tags: TagData[]) {
    replaceStore(tagsDb, tags, (tag) => tag.id);
    tagsCache = tags;
  },

  saveAuthors(authors: AuthorData[]) {
    replaceStore(authorsDb, authors, (author) => author.id);
    authorsCache = authors;
  },

  saveMeta(key: string, value: unknown) {
    metaDb.put(key, value);
  },

  getMeta<T>(key: string, fallback: T): T {
    return (metaDb.get(key) as T) ?? fallback;
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

  async getRenderContext(): Promise<RenderContext> {
    const [home, about] = await Promise.all([
      this.getMeta<HomeData>('home', defaultRenderContext.home),
      this.getMeta<AboutData>('about', defaultRenderContext.about),
    ]);

    const pages = this.getMeta<PageSummary[]>('pages', defaultRenderContext.pages);
    const blog = this.getMeta('blog', defaultRenderContext.blog);

    return {
      home,
      about,
      blog,
      posts: { posts: this.getPosts() },
      categories: this.getCategories(),
      tags: this.getTags(),
      authors: this.getAuthors(),
      pages,
      site: this.getMeta('site', defaultRenderContext.site),
      menu: this.getMeta('menu', defaultRenderContext.menu),
    };
  },
};
