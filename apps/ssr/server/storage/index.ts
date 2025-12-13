import { LegacyLmdbAdapter, FlexibleLmdbAdapter } from '@buildy-ui/adapters-lmdb';
import { LegacyJsonAdapter, FlexibleJsonAdapter } from '@buildy-ui/adapters-json';
import { GraphQLAdapter } from './adapter.graphql';
import type { StorageAdapter, FlexibleStorageAdapter } from '@buildy-ui/adapters-core';

type AdapterName = 'LMDB' | 'IndexedDB' | 'ContextDB' | 'FALSE' | 'JsonDB';
type GraphQLMode = 'GETMODE' | 'SETMODE' | 'CRUDMODE';

function buildAdapter(name?: string): StorageAdapter | null {
  const upper = (name || '').toUpperCase() as AdapterName;
  switch (upper) {
    case 'LMDB':
      return new LegacyLmdbAdapter();
    case 'INDEXEDDB':
      // For server-side offline mode we map IndexedDB to JSON file persistence.
      return new LegacyJsonAdapter();
    case 'CONTEXTDB':
    case 'JSONDB':
      return new LegacyJsonAdapter();
    case 'FALSE':
    default:
      return null;
  }
}

function buildFlexibleAdapter(name?: string): FlexibleStorageAdapter | null {
  const upper = (name || '').toUpperCase() as AdapterName;
  switch (upper) {
    case 'LMDB':
      return new FlexibleLmdbAdapter();
    case 'INDEXEDDB':
    case 'CONTEXTDB':
    case 'JSONDB':
      // For server-side offline mode we map IndexedDB/ContextDB/JsonDB to JSON file persistence.
      return new FlexibleJsonAdapter();
    default:
      return null;
  }
}

export function getAdapters() {
  const main = buildAdapter(process.env.MAINDB);
  const backup = buildAdapter(process.env.BACKUPDB);
  return { main, backup };
}

export function getFlexibleAdapters() {
  const graphQLEndpoint = process.env.GRAPHQL_ENDPOINT;
  const graphQLMode = (process.env.GRAPHQL_MODE || 'GETMODE') as GraphQLMode;

  // Get the underlying flexible adapter
  const flexibleMain = buildFlexibleAdapter(process.env.MAINDB);
  const flexibleBackup = buildFlexibleAdapter(process.env.BACKUPDB);

  // Wrap with GraphQL adapter if GraphQL is configured
  let main: FlexibleStorageAdapter | null = flexibleMain;
  let backup: FlexibleStorageAdapter | null = flexibleBackup;

  if (graphQLEndpoint && flexibleMain) {
    main = new GraphQLAdapter(flexibleMain, graphQLEndpoint, graphQLMode);
  }

  if (graphQLEndpoint && flexibleBackup) {
    backup = new GraphQLAdapter(flexibleBackup, graphQLEndpoint, graphQLMode);
  }

  return { main, backup };
}

// Local-only flexible adapters (no GraphQL wrapper). Useful for admin/offline CMS pages and actions.
export function getLocalFlexibleAdapters() {
  const main = buildFlexibleAdapter(process.env.MAINDB);
  const backup = buildFlexibleAdapter(process.env.BACKUPDB);
  return { main, backup };
}

export { LegacyLmdbAdapter, LegacyJsonAdapter, GraphQLAdapter, FlexibleLmdbAdapter, FlexibleJsonAdapter };

