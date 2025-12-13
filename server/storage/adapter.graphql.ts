import type {
  FlexibleStorageAdapter,
  Query,
  FindOptions,
  AggregationStage,
  BulkUpdateOperation,
  BulkWriteResult,
  SearchQuery,
  SearchResult,
  CollectionSchema,
  StorageStats,
  IndexOptions
} from './types';

// GraphQL synchronization adapter
// Currently supports GETMODE (read from GraphQL, write to local storage)
// Future-ready for SETMODE and CRUDMODE when GraphQL API supports mutations
export class GraphQLAdapter implements FlexibleStorageAdapter {
  public name = 'GraphQL Sync';
  private localAdapter: FlexibleStorageAdapter;
  private endpoint: string;
  private mode: 'GETMODE' | 'SETMODE' | 'CRUDMODE';

  constructor(localAdapter: FlexibleStorageAdapter, endpoint: string, mode: string = 'GETMODE') {
    this.localAdapter = localAdapter;
    this.endpoint = endpoint;
    this.mode = (mode as any) || 'GETMODE';
  }

  // Collection Management - delegate to local adapter
  async createCollection(name: string, schema?: CollectionSchema): Promise<void> {
    return this.localAdapter.createCollection(name, schema);
  }

  async dropCollection(name: string): Promise<void> {
    return this.localAdapter.dropCollection(name);
  }

  async listCollections(): Promise<string[]> {
    return this.localAdapter.listCollections();
  }

  // CRUD Operations
  async insert(collection: string, document: Record<string, any>): Promise<string> {
    if (this.mode === 'GETMODE') {
      // In GETMODE, we only read from GraphQL, write to local
      return this.localAdapter.insert(collection, document);
    }

    // Future: Implement GraphQL mutations for SETMODE/CRUDMODE
    throw new Error(`GraphQL mutations not implemented for mode: ${this.mode}`);
  }

  async find(collection: string, query: Query = {}, options: FindOptions = {}): Promise<any[]> {
    // First try local storage for immediate response
    try {
      const localResults = await this.localAdapter.find(collection, query, options);
      if (localResults.length > 0) {
        return localResults;
      }
    } catch (error) {
      console.warn('Local storage query failed:', error);
    }

    // If no local data and we can fetch from GraphQL, do it
    if (navigator.onLine && this.canReadFromGraphQL()) {
      try {
        await this.syncCollectionFromGraphQL(collection);
        // Try local again after sync
        return this.localAdapter.find(collection, query, options);
      } catch (error) {
        console.warn('GraphQL sync failed:', error);
        // Return empty array if sync fails
        return [];
      }
    }

    // Fallback to local even if empty
    return this.localAdapter.find(collection, query, options);
  }

  async findOne(collection: string, query: Query): Promise<any | null> {
    const results = await this.find(collection, query, { limit: 1 });
    return results[0] || null;
  }

  async update(collection: string, query: Query, update: Partial<any>): Promise<number> {
    if (this.mode === 'GETMODE') {
      // In GETMODE, we don't write back to GraphQL
      return this.localAdapter.update(collection, query, update);
    }

    // Future: Implement GraphQL mutations for SETMODE/CRUDMODE
    throw new Error(`GraphQL mutations not implemented for mode: ${this.mode}`);
  }

  async delete(collection: string, query: Query): Promise<number> {
    if (this.mode === 'GETMODE') {
      // In GETMODE, we don't delete from GraphQL
      return this.localAdapter.delete(collection, query);
    }

    // Future: Implement GraphQL mutations for SETMODE/CRUDMODE
    throw new Error(`GraphQL mutations not implemented for mode: ${this.mode}`);
  }

  // Advanced Operations - delegate to local adapter
  async count(collection: string, query: Query = {}): Promise<number> {
    return this.localAdapter.count(collection, query);
  }

  async distinct(collection: string, field: string, query: Query = {}): Promise<any[]> {
    return this.localAdapter.distinct(collection, field, query);
  }

  async aggregate(collection: string, pipeline: AggregationStage[]): Promise<any[]> {
    return this.localAdapter.aggregate(collection, pipeline);
  }

  // Bulk Operations
  async bulkInsert(collection: string, documents: Record<string, any>[]): Promise<string[]> {
    if (this.mode === 'GETMODE') {
      return this.localAdapter.bulkInsert(collection, documents);
    }
    throw new Error(`Bulk operations not implemented for mode: ${this.mode}`);
  }

  async bulkUpdate(collection: string, operations: BulkUpdateOperation[]): Promise<BulkWriteResult> {
    if (this.mode === 'GETMODE') {
      return this.localAdapter.bulkUpdate(collection, operations);
    }
    throw new Error(`Bulk operations not implemented for mode: ${this.mode}`);
  }

  async bulkDelete(collection: string, queries: Query[]): Promise<number> {
    if (this.mode === 'GETMODE') {
      return this.localAdapter.bulkDelete(collection, queries);
    }
    throw new Error(`Bulk operations not implemented for mode: ${this.mode}`);
  }

  // Indexing - delegate to local adapter
  async createIndex(collection: string, field: string, options: IndexOptions = {}): Promise<void> {
    return this.localAdapter.createIndex(collection, field, options);
  }

  async dropIndex(collection: string, field: string): Promise<void> {
    return this.localAdapter.dropIndex(collection, field);
  }

  async search(collection: string, searchQuery: SearchQuery): Promise<SearchResult[]> {
    return this.localAdapter.search(collection, searchQuery);
  }

  // Backup and Restore - delegate to local adapter
  async backup(path: string): Promise<void> {
    return this.localAdapter.backup(path);
  }

  async restore(path: string): Promise<void> {
    return this.localAdapter.restore(path);
  }

  // Health and Stats
  async health(): Promise<boolean> {
    const localHealth = await this.localAdapter.health();
    const graphQLHealth = await this.checkGraphQLHealth();
    return localHealth && graphQLHealth;
  }

  async stats(): Promise<StorageStats> {
    const localStats = await this.localAdapter.stats();
    return {
      ...localStats,
      lastModified: new Date() // Override with sync time
    };
  }

  // Private methods
  private canReadFromGraphQL(): boolean {
    return this.mode === 'GETMODE' || this.mode === 'CRUDMODE';
  }

  private canWriteToGraphQL(): boolean {
    return this.mode === 'SETMODE' || this.mode === 'CRUDMODE';
  }

  private async checkGraphQLHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ __typename }' // Simple health check query
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async syncCollectionFromGraphQL(collection: string): Promise<void> {
    // This is a placeholder for future GraphQL sync logic
    // Currently, data comes from the existing sync.ts system
    console.log(`Syncing collection ${collection} from GraphQL`);

    // Future implementation will:
    // 1. Query GraphQL for collection data
    // 2. Transform GraphQL response to internal format
    // 3. Store in local adapter
    // 4. Handle conflicts and merges
  }

  // Future methods for full CRUD support
  private async executeGraphQLMutation(query: string, variables?: any): Promise<any> {
    if (!this.canWriteToGraphQL()) {
      throw new Error(`GraphQL mutations not allowed in ${this.mode} mode`);
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`GraphQL mutation failed: ${response.status}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  // Placeholder for future CRUD operations
  async createDocument(collection: string, data: any): Promise<string> {
    // Future: Implement GraphQL create mutation
    throw new Error('GraphQL create not implemented yet');
  }

  async updateDocument(collection: string, id: string, data: any): Promise<void> {
    // Future: Implement GraphQL update mutation
    throw new Error('GraphQL update not implemented yet');
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    // Future: Implement GraphQL delete mutation
    throw new Error('GraphQL delete not implemented yet');
  }
}
