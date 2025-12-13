import { open } from 'lmdb';
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

// Enhanced flexible adapter for advanced CMS use cases
export class FlexibleLmdbAdapter implements FlexibleStorageAdapter {
  private db: any;
  private schemas: Map<string, CollectionSchema> = new Map();
  public name = 'Flexible LMDB';

  constructor(path = './data/flexible-db') {
    this.db = open({
      path,
      compression: true,
      maxDbs: 100, // More DBs for collections
      maxReaders: 126,
      mapSize: 4 * 1024 * 1024 * 1024, // 4GB for flexible usage
    });
  }

  // Collection Management
  async createCollection(name: string, schema?: CollectionSchema): Promise<void> {
    const collectionDb = this.db.openDB({ name: `collection_${name}` });
    const schemaDb = this.db.openDB({ name: 'schemas' });

    if (schema) {
      this.schemas.set(name, schema);
      await schemaDb.put(name, schema);

      // Create indexes if specified
      if (schema.indexes) {
        for (const indexDef of schema.indexes) {
          await this.createIndex(name, indexDef.fields.join('_'), {
            unique: indexDef.unique,
            sparse: indexDef.sparse
          });
        }
      }
    }
  }

  async dropCollection(name: string): Promise<void> {
    // Note: LMDB doesn't support dropping DBs directly
    // We'll clear all data instead
    const collectionDb = this.db.openDB({ name: `collection_${name}` });
    for (const { key } of collectionDb.getRange()) {
      collectionDb.remove(key);
    }

    const indexDbs = this.db.openDB({ name: 'indexes' });
    const indexes = indexDbs.get(`${name}_indexes`) || [];
    for (const indexName of indexes) {
      const indexDb = this.db.openDB({ name: `index_${name}_${indexName}` });
      for (const { key } of indexDb.getRange()) {
        indexDb.remove(key);
      }
    }

    this.schemas.delete(name);
    const schemaDb = this.db.openDB({ name: 'schemas' });
    schemaDb.remove(name);
  }

  async listCollections(): Promise<string[]> {
    const schemaDb = this.db.openDB({ name: 'schemas' });
    return Array.from(schemaDb.getRange().map(({ key }) => key));
  }

  // CRUD Operations
  async insert(collection: string, document: Record<string, any>): Promise<string> {
    const collectionDb = this.db.openDB({ name: `collection_${collection}` });
    const id = document._id || this.generateId();

    // Validate against schema if exists
    const schema = this.schemas.get(collection);
    if (schema) {
      this.validateDocument(document, schema);
    }

    // Add metadata
    document._id = id;
    document.createdAt = new Date();
    document.updatedAt = new Date();

    await collectionDb.put(id, document);

    // Update indexes
    await this.updateIndexes(collection, document);

    return id;
  }

  async find(collection: string, query: Query = {}, options: FindOptions = {}): Promise<any[]> {
    const collectionDb = this.db.openDB({ name: `collection_${collection}` });
    let results: any[] = [];

    // Get all documents
    for (const { value } of collectionDb.getRange()) {
      if (this.matchesQuery(value, query)) {
        results.push(value);
      }
    }

    // Apply options
    if (options.sort) {
      results = this.sortDocuments(results, options.sort);
    }

    if (options.skip) {
      results = results.slice(options.skip);
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    if (options.projection) {
      results = results.map(doc => this.projectDocument(doc, options.projection));
    }

    return results;
  }

  async findOne(collection: string, query: Query): Promise<any | null> {
    const results = await this.find(collection, query, { limit: 1 });
    return results[0] || null;
  }

  async update(collection: string, query: Query, update: Partial<any>): Promise<number> {
    const collectionDb = this.db.openDB({ name: `collection_${collection}` });
    let updatedCount = 0;

    for (const { key, value } of collectionDb.getRange()) {
      if (this.matchesQuery(value, query)) {
        const updatedDoc = {
          ...value,
          ...update,
          updatedAt: new Date()
        };
        await collectionDb.put(key, updatedDoc);

        // Update indexes
        await this.updateIndexes(collection, updatedDoc);

        updatedCount++;
      }
    }

    return updatedCount;
  }

  async delete(collection: string, query: Query): Promise<number> {
    const collectionDb = this.db.openDB({ name: `collection_${collection}` });
    let deletedCount = 0;

    for (const { key, value } of collectionDb.getRange()) {
      if (this.matchesQuery(value, query)) {
        await collectionDb.remove(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Advanced Operations
  async count(collection: string, query: Query = {}): Promise<number> {
    const results = await this.find(collection, query);
    return results.length;
  }

  async distinct(collection: string, field: string, query: Query = {}): Promise<any[]> {
    const results = await this.find(collection, query);
    const values = new Set();

    for (const doc of results) {
      const value = this.getNestedValue(doc, field);
      if (value !== undefined) {
        values.add(value);
      }
    }

    return Array.from(values);
  }

  async aggregate(collection: string, pipeline: AggregationStage[]): Promise<any[]> {
    let results = await this.find(collection);

    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter(doc => this.matchesQuery(doc, stage.$match!));
      }
      if (stage.$group) {
        results = this.groupDocuments(results, stage.$group);
      }
      if (stage.$sort) {
        results = this.sortDocuments(results, stage.$sort);
      }
      if (stage.$limit) {
        results = results.slice(0, stage.$limit);
      }
      if (stage.$skip) {
        results = results.slice(stage.$skip);
      }
      if (stage.$project) {
        results = results.map(doc => this.projectDocument(doc, stage.$project));
      }
      if (stage.$lookup) {
        results = await this.performLookup(results, stage.$lookup);
      }
    }

    return results;
  }

  // Bulk Operations
  async bulkInsert(collection: string, documents: Record<string, any>[]): Promise<string[]> {
    const ids: string[] = [];
    for (const doc of documents) {
      const id = await this.insert(collection, doc);
      ids.push(id);
    }
    return ids;
  }

  async bulkUpdate(collection: string, operations: BulkUpdateOperation[]): Promise<BulkWriteResult> {
    let updatedCount = 0;

    for (const op of operations) {
      const count = await this.update(collection, op.query, op.update);
      updatedCount += count;
    }

    return {
      insertedCount: 0,
      updatedCount,
      deletedCount: 0
    };
  }

  async bulkDelete(collection: string, queries: Query[]): Promise<number> {
    let deletedCount = 0;

    for (const query of queries) {
      const count = await this.delete(collection, query);
      deletedCount += count;
    }

    return deletedCount;
  }

  // Indexing
  async createIndex(collection: string, field: string, options: IndexOptions = {}): Promise<void> {
    const indexDb = this.db.openDB({ name: `index_${collection}_${field}` });
    const indexMetaDb = this.db.openDB({ name: 'indexes' });

    // Store index metadata
    const indexes = indexMetaDb.get(`${collection}_indexes`) || [];
    if (!indexes.includes(field)) {
      indexes.push(field);
      indexMetaDb.put(`${collection}_indexes`, indexes);
    }

    // Build index
    const collectionDb = this.db.openDB({ name: `collection_${collection}` });
    for (const { value } of collectionDb.getRange()) {
      const fieldValue = this.getNestedValue(value, field);
      if (fieldValue !== undefined) {
        await indexDb.put(fieldValue, value._id);
      }
    }
  }

  async dropIndex(collection: string, field: string): Promise<void> {
    const indexDb = this.db.openDB({ name: `index_${collection}_${field}` });

    // Clear index
    for (const { key } of indexDb.getRange()) {
      indexDb.remove(key);
    }

    // Remove from metadata
    const indexMetaDb = this.db.openDB({ name: 'indexes' });
    const indexes = indexMetaDb.get(`${collection}_indexes`) || [];
    const filtered = indexes.filter((idx: string) => idx !== field);
    indexMetaDb.put(`${collection}_indexes`, filtered);
  }

  async search(collection: string, searchQuery: SearchQuery): Promise<SearchResult[]> {
    // Simple text search implementation
    const documents = await this.find(collection, searchQuery.filters);
    const results: SearchResult[] = [];

    for (const doc of documents) {
      let score = 0;
      const highlights: Record<string, string[]> = {};

      const fields = searchQuery.fields || Object.keys(doc);
      for (const field of fields) {
        const value = String(this.getNestedValue(doc, field) || '');
        const query = searchQuery.query.toLowerCase();

        if (value.toLowerCase().includes(query)) {
          score += 1;
          highlights[field] = [query];
        }
      }

      if (score > 0) {
        results.push({ document: doc, score, highlights });
      }
    }

    // Sort by score and apply limits
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, searchQuery.limit || 10);
  }

  // Backup and Restore
  async backup(path: string): Promise<void> {
    // Simple file-based backup
    const fs = await import('fs/promises');
    const data = await this.getAllCollectionsData();
    await fs.writeFile(path, JSON.stringify(data, null, 2));
  }

  async restore(path: string): Promise<void> {
    const fs = await import('fs/promises');
    const data = JSON.parse(await fs.readFile(path, 'utf8'));

    for (const [collection, documents] of Object.entries(data)) {
      await this.bulkInsert(collection, documents as any[]);
    }
  }

  // Health and Stats
  async health(): Promise<boolean> {
    try {
      await this.db.getStats();
      return true;
    } catch {
      return false;
    }
  }

  async stats(): Promise<StorageStats> {
    const collections = await this.listCollections();
    let documents = 0;
    let indexes = 0;
    let size = 0;

    for (const collection of collections) {
      const docs = await this.find(collection);
      documents += docs.length;

      const indexMetaDb = this.db.openDB({ name: 'indexes' });
      const collectionIndexes = indexMetaDb.get(`${collection}_indexes`) || [];
      indexes += collectionIndexes.length;
    }

    return {
      collections: collections.length,
      documents,
      indexes,
      size, // Would need to calculate actual file size
      lastModified: new Date()
    };
  }

  // Helper Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private matchesQuery(doc: any, query: Query): boolean {
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('$')) {
        // Handle operators
        switch (key) {
          case '$and':
            if (!value.every((q: Query) => this.matchesQuery(doc, q))) return false;
            break;
          case '$or':
            if (!value.some((q: Query) => this.matchesQuery(doc, q))) return false;
            break;
          case '$exists':
            if ((this.getNestedValue(doc, key) !== undefined) !== value) return false;
            break;
          case '$regex':
            const docValue = String(this.getNestedValue(doc, key) || '');
            if (!new RegExp(value as string | RegExp).test(docValue)) return false;
            break;
          case '$in':
            if (!value.includes(this.getNestedValue(doc, key))) return false;
            break;
          case '$nin':
            if (value.includes(this.getNestedValue(doc, key))) return false;
            break;
          case '$gt':
            if (!(this.getNestedValue(doc, key) > value)) return false;
            break;
          case '$gte':
            if (!(this.getNestedValue(doc, key) >= value)) return false;
            break;
          case '$lt':
            if (!(this.getNestedValue(doc, key) < value)) return false;
            break;
          case '$lte':
            if (!(this.getNestedValue(doc, key) <= value)) return false;
            break;
        }
      } else {
        const docValue = this.getNestedValue(doc, key);
        if (docValue !== value) return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private sortDocuments(docs: any[], sort: Record<string, 1 | -1>): any[] {
    return docs.sort((a, b) => {
      for (const [field, direction] of Object.entries(sort)) {
        const aVal = this.getNestedValue(a, field);
        const bVal = this.getNestedValue(b, field);

        if (aVal < bVal) return direction === 1 ? -1 : 1;
        if (aVal > bVal) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
  }

  private projectDocument(doc: any, projection: Record<string, any>): any {
    const result: any = {};
    for (const [field, include] of Object.entries(projection)) {
      if (include) {
        result[field] = this.getNestedValue(doc, field);
      }
    }
    return result;
  }

  private groupDocuments(docs: any[], groupSpec: any): any[] {
    const groups: Record<string, any> = {};

    for (const doc of docs) {
      const key = typeof groupSpec._id === 'string'
        ? this.getNestedValue(doc, groupSpec._id)
        : JSON.stringify(groupSpec._id); // Support for complex grouping

      if (!groups[key]) {
        groups[key] = { _id: key };
        // Initialize accumulator fields
        for (const [field, accumulator] of Object.entries(groupSpec)) {
          if (field !== '_id') {
            if (accumulator.$sum) groups[key][field] = 0;
            if (accumulator.$push) groups[key][field] = [];
            if (accumulator.$addToSet) groups[key][field] = new Set();
          }
        }
      }

      // Apply accumulators
      for (const [field, accumulator] of Object.entries(groupSpec)) {
        if (field !== '_id') {
          const value = accumulator.$field
            ? this.getNestedValue(doc, accumulator.$field)
            : this.getNestedValue(doc, field);

          if (accumulator.$sum) {
            groups[key][field] += value || 0;
          } else if (accumulator.$push) {
            groups[key][field].push(value);
          } else if (accumulator.$addToSet) {
            groups[key][field].add(value);
          }
        }
      }
    }

    // Convert Sets to Arrays
    for (const group of Object.values(groups)) {
      for (const [field, value] of Object.entries(group)) {
        if (value instanceof Set) {
          group[field] = Array.from(value);
        }
      }
    }

    return Object.values(groups);
  }

  private async performLookup(docs: any[], lookupSpec: any): Promise<any[]> {
    const foreignCollection = lookupSpec.from;
    const foreignDocs = await this.find(foreignCollection);

    return docs.map(doc => {
      const localValue = this.getNestedValue(doc, lookupSpec.localField);
      const matches = foreignDocs.filter(foreignDoc =>
        this.getNestedValue(foreignDoc, lookupSpec.foreignField) === localValue
      );
      return { ...doc, [lookupSpec.as]: matches };
    });
  }

  private async updateIndexes(collection: string, document: any): Promise<void> {
    const indexMetaDb = this.db.openDB({ name: 'indexes' });
    const indexes = indexMetaDb.get(`${collection}_indexes`) || [];

    for (const indexName of indexes) {
      const indexDb = this.db.openDB({ name: `index_${collection}_${indexName}` });
      const fieldValue = this.getNestedValue(document, indexName);

      if (fieldValue !== undefined) {
        await indexDb.put(fieldValue, document._id);
      }
    }
  }

  private validateDocument(document: any, schema: CollectionSchema): void {
    for (const [field, definition] of Object.entries(schema.fields)) {
      const value = document[field];

      if (definition.required && (value === undefined || value === null)) {
        throw new Error(`Field ${field} is required`);
      }

      if (value !== undefined && value !== null) {
        // Type validation
        switch (definition.type) {
          case 'string':
            if (typeof value !== 'string') {
              throw new Error(`Field ${field} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number') {
              throw new Error(`Field ${field} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new Error(`Field ${field} must be a boolean`);
            }
            break;
          case 'date':
            if (!(value instanceof Date)) {
              throw new Error(`Field ${field} must be a Date`);
            }
            break;
        }

        // Unique validation
        if (definition.unique) {
          // Would need to check index for uniqueness
        }
      }
    }
  }

  private async getAllCollectionsData(): Promise<Record<string, any[]>> {
    const collections = await this.listCollections();
    const data: Record<string, any[]> = {};

    for (const collection of collections) {
      data[collection] = await this.find(collection);
    }

    return data;
  }
}
