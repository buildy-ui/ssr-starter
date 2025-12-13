import type { DataCollections } from '../sync';

// Legacy interface for backward compatibility
export interface StorageAdapter {
  name: string;
  getAll(): Promise<DataCollections>;
  saveAll(data: DataCollections): Promise<void>;
  health(): Promise<boolean>;
}

// Enhanced interface for flexible data management
export interface FlexibleStorageAdapter {
  name: string;

  // Collection management
  createCollection(name: string, schema?: CollectionSchema): Promise<void>;
  dropCollection(name: string): Promise<void>;
  listCollections(): Promise<string[]>;

  // CRUD operations
  insert(collection: string, document: Record<string, any>): Promise<string>;
  find(collection: string, query?: Query, options?: FindOptions): Promise<any[]>;
  findOne(collection: string, query: Query): Promise<any | null>;
  update(collection: string, query: Query, update: Partial<any>): Promise<number>;
  delete(collection: string, query: Query): Promise<number>;

  // Advanced operations
  count(collection: string, query?: Query): Promise<number>;
  distinct(collection: string, field: string, query?: Query): Promise<any[]>;
  aggregate(collection: string, pipeline: AggregationStage[]): Promise<any[]>;

  // Bulk operations
  bulkInsert(collection: string, documents: Record<string, any>[]): Promise<string[]>;
  bulkUpdate(collection: string, operations: BulkUpdateOperation[]): Promise<BulkWriteResult>;
  bulkDelete(collection: string, queries: Query[]): Promise<number>;

  // Indexing and search
  createIndex(collection: string, field: string, options?: IndexOptions): Promise<void>;
  dropIndex(collection: string, field: string): Promise<void>;
  search(collection: string, searchQuery: SearchQuery): Promise<SearchResult[]>;

  // Transactions (optional)
  transaction?<T>(operations: () => Promise<T>): Promise<T>;

  // Backup and restore
  backup(path: string): Promise<void>;
  restore(path: string): Promise<void>;

  // Health and maintenance
  health(): Promise<boolean>;
  stats(): Promise<StorageStats>;
  compact?(): Promise<void>;
}

// Collection schema definition
export interface CollectionSchema {
  fields: Record<string, FieldDefinition>;
  indexes?: IndexDefinition[];
  validation?: ValidationRule[];
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required?: boolean;
  default?: any;
  unique?: boolean;
  references?: {
    collection: string;
    field: string;
  };
}

export interface IndexDefinition {
  fields: string[];
  unique?: boolean;
  sparse?: boolean;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message?: string;
}

// Query interfaces
export interface Query {
  [key: string]: any;
  $and?: Query[];
  $or?: Query[];
  $not?: Query;
  $exists?: boolean;
  $regex?: string | RegExp;
  $in?: any[];
  $nin?: any[];
  $gt?: number | Date;
  $gte?: number | Date;
  $lt?: number | Date;
  $lte?: number | Date;
}

export interface FindOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 1 | 0>;
}

export interface AggregationStage {
  $match?: Query;
  $group?: {
    _id: any;
    [field: string]: any;
  };
  $sort?: Record<string, 1 | -1>;
  $limit?: number;
  $skip?: number;
  $project?: Record<string, any>;
  $lookup?: {
    from: string;
    localField: string;
    foreignField: string;
    as: string;
  };
}

export interface BulkUpdateOperation {
  query: Query;
  update: Partial<any>;
  upsert?: boolean;
}

export interface BulkWriteResult {
  insertedCount: number;
  updatedCount: number;
  deletedCount: number;
}

// Search interfaces
export interface SearchQuery {
  query: string;
  fields?: string[];
  limit?: number;
  offset?: number;
  filters?: Query;
}

export interface SearchResult {
  document: any;
  score: number;
  highlights?: Record<string, string[]>;
}

// Configuration interfaces
export interface IndexOptions {
  unique?: boolean;
  sparse?: boolean;
  background?: boolean;
}

export interface StorageStats {
  collections: number;
  documents: number;
  indexes: number;
  size: number; // bytes
  lastModified: Date;
}

export type AdapterKind = 'lmdb' | 'json' | 'memory' | 'indexeddb' | 'sqlite' | 'redis';


