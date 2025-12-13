import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import type { DataCollections } from '../sync';
import type { StorageAdapter } from './types';

const JSON_PATH = resolve('./src/data/json/full.json');

export class JsonAdapter implements StorageAdapter {
  name = 'json';

  async getAll(): Promise<DataCollections> {
    if (!existsSync(JSON_PATH)) throw new Error('json store missing');
    const raw = readFileSync(JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed as DataCollections;
  }

  async saveAll(data: DataCollections): Promise<void> {
    mkdirSync(dirname(JSON_PATH), { recursive: true });
    writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
  }

  async health(): Promise<boolean> {
    return existsSync(JSON_PATH);
  }
}

