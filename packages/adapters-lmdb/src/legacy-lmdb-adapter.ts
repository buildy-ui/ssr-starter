import { open } from 'lmdb';
import type { StorageAdapter } from '@buildy-ui/adapters-core';
import { DEFAULT_LEGACY_LMDB_PATH } from './paths';

type WithNumericId = { id: number };

type LegacyCollectionsShape = {
  posts: WithNumericId[];
  categories: WithNumericId[];
  tags: WithNumericId[];
  authors: WithNumericId[];
  pages: WithNumericId[];
  site?: unknown;
  menu?: unknown;
};

function toArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function asId(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export class LegacyLmdbAdapter<TCollections extends LegacyCollectionsShape = LegacyCollectionsShape>
  implements StorageAdapter<TCollections>
{
  public name = 'lmdb';
  private db: any;

  constructor(path = process.env.LEGACY_LMDB_PATH || DEFAULT_LEGACY_LMDB_PATH) {
    this.db = open({
      path,
      compression: true,
      maxDbs: 10,
      maxReaders: 126,
      mapSize: 2 * 1024 * 1024 * 1024, // 2GB
    });
  }

  async getAll(): Promise<TCollections> {
    const postsDb = this.db.openDB({ name: 'posts' });
    const categoriesDb = this.db.openDB({ name: 'categories' });
    const tagsDb = this.db.openDB({ name: 'tags' });
    const authorsDb = this.db.openDB({ name: 'authors' });
    const pagesDb = this.db.openDB({ name: 'pages' });
    const metaDb = this.db.openDB({ name: 'meta' });

    const posts: any[] = [];
    for (const { value } of postsDb.getRange()) posts.push(value);
    const categories: any[] = [];
    for (const { value } of categoriesDb.getRange()) categories.push(value);
    const tags: any[] = [];
    for (const { value } of tagsDb.getRange()) tags.push(value);
    const authors: any[] = [];
    for (const { value } of authorsDb.getRange()) authors.push(value);
    const pages: any[] = [];
    for (const { value } of pagesDb.getRange()) pages.push(value);

    const site = metaDb.get('site', undefined);
    const menu = metaDb.get('menu', undefined);

    return {
      posts,
      categories,
      tags,
      authors,
      pages,
      site,
      menu,
    } as TCollections;
  }

  async saveAll(data: TCollections): Promise<void> {
    const postsDb = this.db.openDB({ name: 'posts' });
    const categoriesDb = this.db.openDB({ name: 'categories' });
    const tagsDb = this.db.openDB({ name: 'tags' });
    const authorsDb = this.db.openDB({ name: 'authors' });
    const pagesDb = this.db.openDB({ name: 'pages' });
    const metaDb = this.db.openDB({ name: 'meta' });

    // Replace content (overwrite by key). We do not delete old keys for simplicity;
    // ids are stable so this is typically fine for WP data sync.
    for (const p of toArray(data.posts)) postsDb.put(asId(p?.id), p);
    for (const c of toArray(data.categories)) categoriesDb.put(asId(c?.id), c);
    for (const t of toArray(data.tags)) tagsDb.put(asId(t?.id), t);
    for (const a of toArray(data.authors)) authorsDb.put(asId(a?.id), a);
    for (const pg of toArray(data.pages)) pagesDb.put(asId(pg?.id), pg);

    metaDb.put('site', data.site ?? metaDb.get('site', undefined));
    metaDb.put('menu', data.menu ?? metaDb.get('menu', undefined));
  }

  async health(): Promise<boolean> {
    try {
      await this.db.getStats();
      return true;
    } catch {
      return false;
    }
  }
}


