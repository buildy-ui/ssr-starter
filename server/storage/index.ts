import { LmdbAdapter } from './adapter.lmdb';
import { JsonAdapter } from './adapter.json';
import { GraphQLAdapter } from './adapter.graphql';
import { FlexibleLmdbAdapter } from './adapter.flexible.lmdb';
import type { StorageAdapter, FlexibleStorageAdapter } from './types';

type AdapterName = 'LMDB' | 'IndexedDB' | 'ContextDB' | 'FALSE' | 'JsonDB';
type GraphQLMode = 'GETMODE' | 'SETMODE' | 'CRUDMODE';

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

function buildFlexibleAdapter(name?: string): FlexibleStorageAdapter | null {
  const upper = (name || '').toUpperCase() as AdapterName;
  switch (upper) {
    case 'LMDB':
      return new FlexibleLmdbAdapter();
    case 'JSONDB':
      // Use JSON adapter wrapped in flexible interface
      return new FlexibleLmdbAdapter('./data/json-flexible-db');
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

export { LmdbAdapter, JsonAdapter, GraphQLAdapter, FlexibleLmdbAdapter };

