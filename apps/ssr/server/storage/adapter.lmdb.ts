import { dbOperations } from '../db';
import type { DataCollections } from '../sync';
import type { StorageAdapter } from './types';

export class LmdbAdapter implements StorageAdapter {
  name = 'lmdb';

  async getAll(): Promise<DataCollections> {
    return {
      posts: dbOperations.getPosts(),
      categories: dbOperations.getCategories(),
      tags: dbOperations.getTags(),
      authors: dbOperations.getAuthors(),
      pages: dbOperations.getPages(),
      site: dbOperations.getMeta('site', undefined),
      menu: dbOperations.getMeta('menu', undefined),
    };
  }

  async saveAll(data: DataCollections): Promise<void> {
    dbOperations.savePosts(data.posts);
    dbOperations.saveCategories(data.categories);
    dbOperations.saveTags(data.tags);
    dbOperations.saveAuthors(data.authors);
    dbOperations.savePages(data.pages);
    dbOperations.saveMeta('site', data.site ?? dbOperations.getMeta('site', undefined));
    dbOperations.saveMeta('menu', data.menu ?? dbOperations.getMeta('menu', undefined));
  }

  async health(): Promise<boolean> {
    try {
      dbOperations.getPosts();
      return true;
    } catch {
      return false;
    }
  }
}

