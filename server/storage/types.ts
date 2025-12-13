import type { DataCollections } from '../sync';

export interface StorageAdapter {
  name: string;
  getAll(): Promise<DataCollections>;
  saveAll(data: DataCollections): Promise<void>;
  health(): Promise<boolean>;
}

export type AdapterKind = 'lmdb' | 'json' | 'memory';


