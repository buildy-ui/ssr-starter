import type { AdminContext, AdminView } from '../../src/data/types';
import { getLocalFlexibleAdapters } from '../storage';
import type { FlexibleStorageAdapter } from '../storage/types';

type Source = AdminContext['source'];

async function pickReadAdapter(): Promise<{ adapter: FlexibleStorageAdapter | null; source: Source }> {
  const { main, backup } = getLocalFlexibleAdapters();

  const tryList = async (a: FlexibleStorageAdapter | null) => {
    if (!a) return null;
    try {
      const collections = await a.listCollections();
      return { adapter: a, collections };
    } catch {
      return null;
    }
  };

  const mainResult = await tryList(main);
  if (mainResult && mainResult.collections.length > 0) return { adapter: mainResult.adapter, source: 'MAINDB' };

  const backupResult = await tryList(backup);
  if (backupResult && backupResult.collections.length > 0) return { adapter: backupResult.adapter, source: 'BACKUPDB' };

  if (mainResult) return { adapter: mainResult.adapter, source: 'MAINDB' };
  if (backupResult) return { adapter: backupResult.adapter, source: 'BACKUPDB' };
  return { adapter: null, source: 'none' };
}

function asView(value: string | null): AdminView {
  const v = (value || '').toLowerCase();
  if (v === 'documents') return 'documents';
  if (v === 'stats') return 'stats';
  return 'collections';
}

export async function buildAdminContext(params: {
  searchParams: URLSearchParams;
}): Promise<AdminContext> {
  const view = asView(params.searchParams.get('view'));
  const collectionParam = params.searchParams.get('collection') || undefined;
  const editId = params.searchParams.get('edit') || undefined;
  const notice = params.searchParams.get('notice') || undefined;
  const error = params.searchParams.get('error') || undefined;

  const { adapter, source } = await pickReadAdapter();
  if (!adapter) {
    return {
      view,
      source,
      collections: [],
      documents: [],
      notice,
      error: error ?? 'No storage adapter configured. Set MAINDB=LMDB or MAINDB=JsonDB (and optionally BACKUPDB).',
    };
  }

  const collections = await adapter.listCollections();
  const currentCollection = collectionParam ?? collections[0];

  let documents: any[] = [];
  let selectedDocument: any | null = null;

  if (view === 'documents' && currentCollection) {
    documents = await adapter.find(currentCollection, {}, { limit: 50, sort: { updatedAt: -1 } });
    if (editId) {
      selectedDocument = await adapter.findOne(currentCollection, { _id: editId });
    }
  }

  const stats = view === 'stats'
    ? await adapter.stats().then((s) => ({
        collections: s.collections,
        documents: s.documents,
        indexes: s.indexes,
        size: s.size,
        lastModified: s.lastModified.toISOString(),
      }))
    : undefined;

  return {
    view,
    source,
    collections,
    currentCollection,
    documents,
    selectedDocument,
    stats,
    notice,
    error,
  };
}


