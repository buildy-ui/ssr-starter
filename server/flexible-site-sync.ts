import type { RenderContext, PostData, CategoryData, TagData, AuthorData, PageSummary } from '../src/data/types';
import { getLocalFlexibleAdapters } from './storage';
import type { FlexibleStorageAdapter } from './storage/types';

const SITE_COLLECTIONS = ['posts', 'categories', 'tags', 'authors', 'pages'] as const;
export type SiteCollectionName = (typeof SITE_COLLECTIONS)[number];

function safeStringId(id: unknown): string {
  if (typeof id === 'string' && id.trim()) return id.trim();
  if (typeof id === 'number' && Number.isFinite(id)) return String(id);
  return String(id ?? '');
}

function toPostDoc(post: PostData) {
  return {
    _id: safeStringId(post.id) || post.slug,
    origin: 'graphql' as const,
    type: 'post' as const,
    ...post,
    // Normalize a few fields for admin readability/search
    titleText: post.title,
    slug: post.slug,
    dateRaw: post.date?.raw,
    updatedAt: new Date().toISOString(),
    createdAt: post.date?.raw ?? new Date().toISOString(),
  };
}

function toCategoryDoc(cat: CategoryData) {
  return {
    _id: safeStringId(cat.id) || cat.slug,
    origin: 'graphql' as const,
    type: 'category' as const,
    ...cat,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function toTagDoc(tag: TagData) {
  return {
    _id: safeStringId(tag.id) || tag.slug,
    origin: 'graphql' as const,
    type: 'tag' as const,
    ...tag,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function toAuthorDoc(author: AuthorData) {
  return {
    _id: safeStringId(author.id) || author.slug,
    origin: 'graphql' as const,
    type: 'author' as const,
    ...author,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function toPageDoc(page: PageSummary) {
  return {
    _id: safeStringId(page.id) || page.slug,
    origin: 'graphql' as const,
    type: 'page' as const,
    ...page,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

async function ensureCollections(adapter: FlexibleStorageAdapter, names: string[]) {
  // Create collections best-effort (ignore errors to allow read-only / unsupported backends later)
  for (const name of names) {
    try {
      await adapter.createCollection(name);
    } catch {
      // ignore
    }
  }
}

async function upsertMany(adapter: FlexibleStorageAdapter, collection: string, docs: any[]) {
  for (const doc of docs) {
    const id = safeStringId(doc?._id);
    if (!id) continue;
    // Update existing GraphQL doc by id; if nothing updated, insert.
    const updated = await adapter.update(collection, { _id: id }, doc).catch(() => 0);
    if (!updated) {
      await adapter.insert(collection, doc).catch(() => undefined);
    }
  }
}

export async function seedFlexibleSiteCollectionsFromRenderContext(ctx: RenderContext): Promise<void> {
  const { main, backup } = getLocalFlexibleAdapters();
  const primary = main ?? backup;
  const secondary = main && backup ? backup : null;

  if (!primary) return;

  const work = async (adapter: FlexibleStorageAdapter) => {
    await ensureCollections(adapter, [...SITE_COLLECTIONS]);
    const posts = ctx.posts?.posts ?? [];
    const categories = ctx.categories ?? [];
    const tags = ctx.tags ?? [];
    const authors = ctx.authors ?? [];
    const pages = ctx.pages ?? [];

    // Upsert only when we have data. We never delete.
    if (posts.length) await upsertMany(adapter, 'posts', posts.map(toPostDoc));
    if (categories.length) await upsertMany(adapter, 'categories', categories.map(toCategoryDoc));
    if (tags.length) await upsertMany(adapter, 'tags', tags.map(toTagDoc));
    if (authors.length) await upsertMany(adapter, 'authors', authors.map(toAuthorDoc));
    if (pages.length) await upsertMany(adapter, 'pages', pages.map(toPageDoc));
  };

  await work(primary);
  if (secondary) {
    // Best-effort mirror, non-fatal
    await work(secondary).catch(() => undefined);
  }
}


