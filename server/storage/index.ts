import { LmdbAdapter } from './adapter.lmdb';
import { JsonAdapter } from './adapter.json';
import type { StorageAdapter } from './types';

type AdapterName = 'LMDB' | 'IndexedDB' | 'ContextDB' | 'FALSE' | 'JsonDB';

function buildAdapter(name?: string): StorageAdapter | null {
  const upper = (name || '').toUpperCase() as AdapterName;
  switch (upper) {
    case 'LMDB':
      return new LmdbAdapter();
    case 'INDEXEDDB':
      // For server-side offline mode we map IndexedDB to JSON file persistence.
      return new JsonAdapter();
    case 'CONTEXTDB':
    case 'JSONDB':
      return new JsonAdapter();
    case 'FALSE':
    default:
      return null;
  }
}

export function getAdapters() {
  const main = buildAdapter(process.env.MAINDB);
  const backup = buildAdapter(process.env.BACKUPDB);
  return { main, backup };
}

export { LmdbAdapter, JsonAdapter };

