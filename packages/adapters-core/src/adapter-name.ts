import type { AdapterName } from './types';

export function normalizeAdapterName(value: string | undefined | null): AdapterName {
  const upper = String(value || '').toUpperCase();
  switch (upper) {
    case 'LMDB':
      return 'LMDB';
    case 'INDEXEDDB':
      return 'IndexedDB';
    case 'CONTEXTDB':
      return 'ContextDB';
    case 'JSONDB':
      return 'JsonDB';
    case 'FALSE':
    default:
      return 'FALSE';
  }
}


