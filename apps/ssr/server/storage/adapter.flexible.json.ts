import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
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
  IndexOptions,
} from './types';

type JsonDbState = {
  schemas: Record<string, CollectionSchema | undefined>;
  collections: Record<string, Record<string, any>>; // collection -> id -> doc
  meta: {
    lastModified: string;
  };
};

function nowIso() {
  return new Date().toISOString();
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stableId() {
  // Bun/Node: crypto.randomUUID exists in modern runtimes; fall back to time+random for safety.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const uuid = (globalThis.crypto as any)?.randomUUID?.();
  if (typeof uuid === 'string') return uuid;
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export class FlexibleJsonAdapter implements FlexibleStorageAdapter {
  public name = 'Flexible JSON';
  private filePath: string;
  private state: JsonDbState | null = null;

  constructor(path = './data/flexible-json-db.json') {
    this.filePath = resolve(path);
  }

  private async load(): Promise<JsonDbState> {
    if (this.state) return this.state;

    if (!existsSync(this.filePath)) {
      this.state = {
        schemas: {},
        collections: {},
        meta: { lastModified: nowIso() },
      };
      return this.state;
    }

    const raw = await readFile(this.filePath, 'utf8');
    const parsed = JSON.parse(raw);

    const state: JsonDbState = {
      schemas: isObject(parsed?.schemas) ? parsed.schemas : {},
      collections: isObject(parsed?.collections) ? parsed.collections : {},
      meta: isObject(parsed?.meta) && typeof parsed.meta.lastModified === 'string'
        ? parsed.meta
        : { lastModified: nowIso() },
    };

    // Defensive: ensure per-collection is an object.
    for (const [k, v] of Object.entries(state.collections)) {
      if (!isObject(v)) state.collections[k] = {};
    }

    this.state = state;
    return state;
  }

  private async persist(): Promise<void> {
    const state = await this.load();
    state.meta.lastModified = nowIso();
    await mkdir(dirname(this.filePath), { recursive: true });
    // Atomic-ish write: writeFile is fine for small JSON; can be upgraded to temp+rename later.
    await writeFile(this.filePath, JSON.stringify(state, null, 2), 'utf8');
  }

  // Collection Management
  async createCollection(name: string, schema?: CollectionSchema): Promise<void> {
    const state = await this.load();
    if (!state.collections[name]) state.collections[name] = {};
    if (schema) state.schemas[name] = schema;
    await this.persist();
  }

  async dropCollection(name: string): Promise<void> {
    const state = await this.load();
    delete state.collections[name];
    delete state.schemas[name];
    await this.persist();
  }

  async listCollections(): Promise<string[]> {
    const state = await this.load();
    return Object.keys(state.collections).sort();
  }

  // CRUD Operations
  async insert(collection: string, document: Record<string, any>): Promise<string> {
    const state = await this.load();
    if (!state.collections[collection]) state.collections[collection] = {};

    const id = typeof document._id === 'string' && document._id ? document._id : stableId();
    const createdAt = document.createdAt ?? new Date().toISOString();
    const updatedAt = new Date().toISOString();

    const toStore = { ...document, _id: id, createdAt, updatedAt };
    state.collections[collection][id] = toStore;
    await this.persist();
    return id;
  }

  async find(collection: string, query: Query = {}, options: FindOptions = {}): Promise<any[]> {
    const state = await this.load();
    const col = state.collections[collection] ?? {};
    let results = Object.values(col).filter((doc) => this.matchesQuery(doc, query));

    if (options.sort) results = this.sortDocuments(results, options.sort);
    if (options.skip) results = results.slice(options.skip);
    if (options.limit) results = results.slice(0, options.limit);
    if (options.projection) results = results.map((doc) => this.projectDocument(doc, options.projection!));

    return results;
  }

  async findOne(collection: string, query: Query): Promise<any | null> {
    const results = await this.find(collection, query, { limit: 1 });
    return results[0] || null;
  }

  async update(collection: string, query: Query, update: Partial<any>): Promise<number> {
    const state = await this.load();
    const col = state.collections[collection] ?? {};
    let updated = 0;

    for (const [id, doc] of Object.entries(col)) {
      if (this.matchesQuery(doc, query)) {
        col[id] = { ...doc, ...update, updatedAt: new Date().toISOString() };
        updated += 1;
      }
    }

    if (updated > 0) await this.persist();
    return updated;
  }

  async delete(collection: string, query: Query): Promise<number> {
    const state = await this.load();
    const col = state.collections[collection] ?? {};
    let deleted = 0;

    for (const [id, doc] of Object.entries(col)) {
      if (this.matchesQuery(doc, query)) {
        delete col[id];
        deleted += 1;
      }
    }

    if (deleted > 0) await this.persist();
    return deleted;
  }

  // Advanced Operations
  async count(collection: string, query: Query = {}): Promise<number> {
    const docs = await this.find(collection, query);
    return docs.length;
  }

  async distinct(collection: string, field: string, query: Query = {}): Promise<any[]> {
    const docs = await this.find(collection, query);
    const out = new Set<any>();
    for (const doc of docs) out.add(this.getNestedValue(doc, field));
    return Array.from(out).filter((v) => v !== undefined);
  }

  async aggregate(collection: string, pipeline: AggregationStage[]): Promise<any[]> {
    // Minimal pipeline support (match/sort/limit/skip/project/lookup/group) similar to LMDB adapter, but naive.
    let results = await this.find(collection);

    for (const stage of pipeline) {
      if (stage.$match) results = results.filter((doc) => this.matchesQuery(doc, stage.$match!));
      if (stage.$sort) results = this.sortDocuments(results, stage.$sort);
      if (stage.$skip) results = results.slice(stage.$skip);
      if (stage.$limit) results = results.slice(0, stage.$limit);
      if (stage.$project) results = results.map((doc) => this.projectDocument(doc, stage.$project!));
      if (stage.$lookup) {
        const foreignDocs = await this.find(stage.$lookup.from);
        results = results.map((doc) => {
          const localValue = this.getNestedValue(doc, stage.$lookup!.localField);
          const matches = foreignDocs.filter(
            (f) => this.getNestedValue(f, stage.$lookup!.foreignField) === localValue
          );
          return { ...doc, [stage.$lookup!.as]: matches };
        });
      }
      if (stage.$group) {
        // Very minimal group: supports $sum and $push only when specified.
        const groups: Record<string, any> = {};
        for (const doc of results) {
          const key = typeof stage.$group._id === 'string'
            ? String(this.getNestedValue(doc, stage.$group._id))
            : JSON.stringify(stage.$group._id);

          if (!groups[key]) groups[key] = { _id: key };
          for (const [field, acc] of Object.entries(stage.$group)) {
            if (field === '_id') continue;
            if (acc?.$sum) groups[key][field] = (groups[key][field] ?? 0) + (this.getNestedValue(doc, acc.$sum) ?? 0);
            if (acc?.$push) {
              const val = this.getNestedValue(doc, acc.$push);
              (groups[key][field] ??= []).push(val);
            }
          }
        }
        results = Object.values(groups);
      }
    }
    return results;
  }

  // Bulk Operations
  async bulkInsert(collection: string, documents: Record<string, any>[]): Promise<string[]> {
    const ids: string[] = [];
    for (const doc of documents) ids.push(await this.insert(collection, doc));
    return ids;
  }

  async bulkUpdate(collection: string, operations: BulkUpdateOperation[]): Promise<BulkWriteResult> {
    let updatedCount = 0;
    for (const op of operations) updatedCount += await this.update(collection, op.query, op.update);
    return { insertedCount: 0, updatedCount, deletedCount: 0 };
  }

  async bulkDelete(collection: string, queries: Query[]): Promise<number> {
    let deleted = 0;
    for (const q of queries) deleted += await this.delete(collection, q);
    return deleted;
  }

  // Indexing and search (no-op / naive)
  async createIndex(_collection: string, _field: string, _options: IndexOptions = {}): Promise<void> {
    // Not implemented for JSON backend (could be added via secondary maps)
  }

  async dropIndex(_collection: string, _field: string): Promise<void> {
    // Not implemented
  }

  async search(collection: string, searchQuery: SearchQuery): Promise<SearchResult[]> {
    const docs = await this.find(collection, searchQuery.filters);
    const q = (searchQuery.query || '').toLowerCase();
    const results: SearchResult[] = [];

    for (const doc of docs) {
      const fields = searchQuery.fields || Object.keys(doc);
      let score = 0;
      for (const field of fields) {
        const v = String(this.getNestedValue(doc, field) ?? '').toLowerCase();
        if (v.includes(q)) score += 1;
      }
      if (score > 0) results.push({ document: doc, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, searchQuery.limit ?? 10);
  }

  // Backup and Restore
  async backup(path: string): Promise<void> {
    const state = await this.load();
    const outPath = resolve(path);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, JSON.stringify(state, null, 2), 'utf8');
  }

  async restore(path: string): Promise<void> {
    const raw = await readFile(resolve(path), 'utf8');
    const parsed = JSON.parse(raw);
    this.state = {
      schemas: isObject(parsed?.schemas) ? parsed.schemas : {},
      collections: isObject(parsed?.collections) ? parsed.collections : {},
      meta: { lastModified: nowIso() },
    };
    await this.persist();
  }

  // Health and Stats
  async health(): Promise<boolean> {
    try {
      await this.load();
      return true;
    } catch {
      return false;
    }
  }

  async stats(): Promise<StorageStats> {
    const state = await this.load();
    const collections = Object.keys(state.collections);
    let documents = 0;
    for (const c of collections) documents += Object.keys(state.collections[c] ?? {}).length;
    const size = existsSync(this.filePath) ? (await readFile(this.filePath)).byteLength : 0;
    return {
      collections: collections.length,
      documents,
      indexes: 0,
      size,
      lastModified: new Date(state.meta.lastModified || nowIso()),
    };
  }

  // Helpers
  private getNestedValue(obj: any, path: string): any {
    return String(path).split('.').reduce((cur, key) => cur?.[key], obj);
  }

  private sortDocuments(docs: any[], sort: Record<string, 1 | -1>): any[] {
    return docs.sort((a, b) => {
      for (const [field, direction] of Object.entries(sort)) {
        const av = this.getNestedValue(a, field);
        const bv = this.getNestedValue(b, field);
        if (av < bv) return direction === 1 ? -1 : 1;
        if (av > bv) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
  }

  private projectDocument(doc: any, projection: Record<string, any>): any {
    const result: any = {};
    for (const [field, include] of Object.entries(projection)) {
      if (include) result[field] = this.getNestedValue(doc, field);
    }
    return result;
  }

  private matchesQuery(doc: any, query: Query): boolean {
    for (const [key, value] of Object.entries(query)) {
      if (key === '$and' && Array.isArray(value)) {
        if (!value.every((q) => this.matchesQuery(doc, q))) return false;
        continue;
      }
      if (key === '$or' && Array.isArray(value)) {
        if (!value.some((q) => this.matchesQuery(doc, q))) return false;
        continue;
      }
      if (key.startsWith('$')) {
        // Minimal operator handling for top-level operators (rare in our use-case).
        continue;
      }

      const docValue = this.getNestedValue(doc, key);

      if (isObject(value)) {
        // Field operators: {$regex, $in, $gt...}
        if (value.$regex) {
          const re = value.$regex instanceof RegExp ? value.$regex : new RegExp(String(value.$regex), value.$options ?? undefined);
          if (!re.test(String(docValue ?? ''))) return false;
          continue;
        }
        if (Array.isArray(value.$in)) {
          if (!value.$in.includes(docValue)) return false;
          continue;
        }
        if (Array.isArray(value.$nin)) {
          if (value.$nin.includes(docValue)) return false;
          continue;
        }
        if (value.$gt !== undefined && !(docValue > value.$gt)) return false;
        if (value.$gte !== undefined && !(docValue >= value.$gte)) return false;
        if (value.$lt !== undefined && !(docValue < value.$lt)) return false;
        if (value.$lte !== undefined && !(docValue <= value.$lte)) return false;
        continue;
      }

      if (docValue !== value) return false;
    }
    return true;
  }
}


