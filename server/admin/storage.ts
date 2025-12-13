import type { FlexibleStorageAdapter } from '../storage/types';
import { getLocalFlexibleAdapters } from '../storage';

export type AdapterSource = 'MAINDB' | 'BACKUPDB' | 'none';

function stableId() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const uuid = (globalThis.crypto as any)?.randomUUID?.();
  if (typeof uuid === 'string') return uuid;
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function safe<T>(fn: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function readWithFallback<T>(op: (a: FlexibleStorageAdapter) => Promise<T>, opts?: { treatEmptyAsMiss?: (v: T) => boolean }) {
  const { main, backup } = getLocalFlexibleAdapters();

  const mainRes = main ? await safe(() => op(main)) : null;
  if (mainRes?.ok) {
    const emptyMiss = opts?.treatEmptyAsMiss?.(mainRes.value) ?? false;
    if (!emptyMiss) return { value: mainRes.value, source: 'MAINDB' as AdapterSource, errors: [] as unknown[] };
  }

  const backupRes = backup ? await safe(() => op(backup)) : null;
  if (backupRes?.ok) return { value: backupRes.value, source: 'BACKUPDB' as AdapterSource, errors: [mainRes && !mainRes.ok ? mainRes.error : null].filter(Boolean) as unknown[] };

  const errors = [mainRes && !mainRes.ok ? mainRes.error : null, backupRes && !backupRes.ok ? backupRes.error : null].filter(Boolean) as unknown[];
  throw Object.assign(new Error('All adapters failed'), { errors });
}

export async function writeWithPriority(params: {
  opName: string;
  writePrimary: (a: FlexibleStorageAdapter) => Promise<void>;
  writeSecondary?: (a: FlexibleStorageAdapter) => Promise<void>;
}) {
  const { main, backup } = getLocalFlexibleAdapters();

  // 1) Try MAINDB first
  if (main) {
    const res = await safe(() => params.writePrimary(main));
    if (res.ok) {
      // Best-effort write-through to BACKUPDB (non-fatal)
      if (backup && params.writeSecondary) {
        await safe(() => params.writeSecondary!(backup));
      }
      return { source: 'MAINDB' as AdapterSource };
    }
  }

  // 2) Fallback to BACKUPDB
  if (backup) {
    const res = await safe(() => params.writePrimary(backup));
    if (res.ok) {
      // Best-effort write-through to MAINDB (non-fatal)
      if (main && params.writeSecondary) {
        await safe(() => params.writeSecondary!(main));
      }
      return { source: 'BACKUPDB' as AdapterSource };
    }
  }

  throw new Error(`Write failed for operation: ${params.opName}`);
}

export async function ensureCollection(name: string) {
  await writeWithPriority({
    opName: 'createCollection',
    writePrimary: async (a) => a.createCollection(name),
    writeSecondary: async (a) => a.createCollection(name),
  });
}

export async function insertJsonDocument(params: { collection: string; json: string }) {
  const parsed = JSON.parse(params.json);
  const id = typeof parsed?._id === 'string' && parsed._id ? parsed._id : stableId();
  const doc = { ...parsed, _id: id };

  await writeWithPriority({
    opName: 'insert',
    writePrimary: async (a) => {
      await a.insert(params.collection, doc);
    },
    writeSecondary: async (a) => {
      await a.insert(params.collection, doc);
    },
  });

  return { id };
}

export async function updateJsonDocument(params: { collection: string; id: string; json: string }) {
  const parsed = JSON.parse(params.json);
  const update = { ...parsed, _id: params.id };

  await writeWithPriority({
    opName: 'update',
    writePrimary: async (a) => {
      await a.update(params.collection, { _id: params.id }, update);
    },
    writeSecondary: async (a) => {
      await a.update(params.collection, { _id: params.id }, update);
    },
  });
}

export async function deleteDocument(params: { collection: string; id: string }) {
  await writeWithPriority({
    opName: 'delete',
    writePrimary: async (a) => {
      await a.delete(params.collection, { _id: params.id });
    },
    writeSecondary: async (a) => {
      await a.delete(params.collection, { _id: params.id });
    },
  });
}

export async function dropCollection(name: string) {
  await writeWithPriority({
    opName: 'dropCollection',
    writePrimary: async (a) => a.dropCollection(name),
    writeSecondary: async (a) => a.dropCollection(name),
  });
}


