import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import type { StorageAdapter } from '@buildy-ui/adapters-core';
import { DEFAULT_LEGACY_JSON_PATH } from './paths';

export class LegacyJsonAdapter<TCollections = unknown> implements StorageAdapter<TCollections> {
  public name = 'json';
  private filePath: string;

  constructor(path = process.env.LEGACY_JSON_PATH || DEFAULT_LEGACY_JSON_PATH) {
    this.filePath = path;
  }

  async getAll(): Promise<TCollections> {
    if (!existsSync(this.filePath)) throw new Error('json store missing');
    const raw = readFileSync(this.filePath, 'utf8');
    return JSON.parse(raw) as TCollections;
  }

  async saveAll(data: TCollections): Promise<void> {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async health(): Promise<boolean> {
    return existsSync(this.filePath);
  }
}


