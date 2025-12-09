import { defaultRenderContext } from '../src/data';
import type { RenderContext, PostData, CategoryData, TagData, AuthorData, PageSummary } from '../src/data/types';

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;

if (!GRAPHQL_ENDPOINT) {
  console.warn('GRAPHQL_ENDPOINT is not set. Data fetch will fail without it.');
}

async function graphqlQuery<T>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!GRAPHQL_ENDPOINT) {
    throw new Error('GRAPHQL_ENDPOINT is not configured');
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL error ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  if (payload.errors) {
    throw new Error(JSON.stringify(payload.errors));
  }

  return payload.data;
}

const QUERIES = {
  posts: `
    query GetAllPosts {
      posts(first: 100) {
        nodes {
          postId
          title
          content
          excerpt
          slug
          date
          featuredImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
                sizes {
                  name
                  sourceUrl
                  width
                  height
                }
              }
            }
          }
          categories {
            nodes {
              categoryId
              name
              slug
              description
              count
            }
          }
          tags {
            nodes {
              tagId
              name
              slug
              count
            }
          }
          author {
            node {
              userId
              name
              slug
              avatar {
                url
              }
            }
          }
        }
      }
    }
  `,
  categories: `
    query GetCategories {
      categories(first: 100) {
        nodes {
          categoryId
          name
          slug
          description
          count
        }
      }
    }
  `,
  tags: `
    query GetTags {
      tags(first: 100) {
        nodes {
          tagId
          name
          slug
          count
        }
      }
    }
  `,
  users: `
    query GetUsers {
      users(first: 100) {
        nodes {
          userId
          name
          slug
          avatar {
            url
          }
        }
      }
    }
  `,
  pages: `
    query GetPages {
      pages(first: 20) {
        nodes {
          pageId
          title
          content
          slug
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `,
};

function mapPost(node: any): PostData {
  const sizesArray = node.featuredImage?.node?.mediaDetails?.sizes as
    | Array<{ name: string; sourceUrl: string; width: string; height: string }>
    | undefined;

  const sizesMap: Record<string, { sourceUrl: string; width: string; height: string }> = {};
  sizesArray?.forEach((s) => {
    if (s?.name) sizesMap[s.name] = s;
  });

  const buildSize = (s?: { sourceUrl: string; width: string; height: string }) =>
    s
      ? {
          url: s.sourceUrl,
          width: parseInt(s.width, 10) || 0,
          height: parseInt(s.height, 10) || 0,
          alt: node.featuredImage?.node?.altText,
        }
      : undefined;

  const full = node.featuredImage?.node?.mediaDetails
    ? {
        url: node.featuredImage.node.sourceUrl,
        width: node.featuredImage.node.mediaDetails.width ?? 0,
        height: node.featuredImage.node.mediaDetails.height ?? 0,
        alt: node.featuredImage.node.altText,
      }
    : undefined;

  const sizes = {
    thumbnail: buildSize(sizesMap.thumbnail),
    medium: buildSize(sizesMap.medium),
    mediumLarge: buildSize(sizesMap.medium_large),
    large: buildSize(sizesMap.large),
    full,
  };

  const thumb = sizes.thumbnail || full;

  return {
    id: node.postId,
    slug: node.slug,
    title: node.title,
    excerpt: node.excerpt ?? '',
    content: node.content ?? '',
    date: {
      display: node.date ? new Date(node.date).toLocaleDateString() : new Date().toLocaleDateString(),
      raw: node.date ?? new Date().toISOString(),
    },
    featuredImage: node.featuredImage?.node
      ? {
          url: sizes.large?.url || sizes.mediumLarge?.url || sizes.medium?.url || node.featuredImage.node.sourceUrl,
          alt: node.featuredImage.node.altText,
          sizes,
        }
      : undefined,
    thumbnail: thumb,
    categories: (node.categories?.nodes || []).map((cat: any) => ({
      id: cat.categoryId,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      count: cat.count,
    })),
    tags: (node.tags?.nodes || []).map((tag: any) => ({
      id: tag.tagId,
      name: tag.name,
      slug: tag.slug,
      count: tag.count,
    })),
    author: node.author?.node
      ? {
          id: node.author.node.userId,
          name: node.author.node.name,
          slug: node.author.node.slug,
          avatar: node.author.node.avatar?.url,
        }
      : undefined,
  };
}

function deriveAuthors(posts: PostData[]): AuthorData[] {
  const map = new Map<number, number>();
  posts.forEach((post) => {
    if (post.author) {
      map.set(post.author.id, (map.get(post.author.id) || 0) + 1);
    }
  });
  const authors: AuthorData[] = [];
  posts.forEach((post) => {
    if (post.author && !authors.find((a) => a.id === post.author!.id)) {
      authors.push({
        ...post.author,
        count: map.get(post.author.id) ?? 0,
      });
    }
  });
  return authors;
}

function buildPageSummaries(pages: any[]): PageSummary[] {
  return pages.map((page) => ({
    id: page.pageId,
    slug: page.slug,
    title: page.title,
    excerpt: page.content ? page.content.substring(0, 150) + '...' : '',
    content: page.content,
    featuredImage: page.featuredImage?.node
      ? {
          url: page.featuredImage.node.sourceUrl,
          alt: page.featuredImage.node.altText,
        }
      : undefined,
  }));
}

export type DataCollections = {
  posts: PostData[];
  categories: CategoryData[];
  tags: TagData[];
  authors: AuthorData[];
  pages: PageSummary[];
};

export async function fetchAllData(): Promise<DataCollections> {
  if (!GRAPHQL_ENDPOINT) {
    throw new Error('GRAPHQL_ENDPOINT is not configured');
  }

  console.log('🔄 Fetching data from WordPress GraphQL...');

  const [postsResult, categoriesResult, tagsResult, usersResult, pagesResult] = await Promise.all([
    graphqlQuery<{ posts: { nodes: any[] } }>(QUERIES.posts),
    graphqlQuery<{ categories: { nodes: any[] } }>(QUERIES.categories),
    graphqlQuery<{ tags: { nodes: any[] } }>(QUERIES.tags),
    graphqlQuery<{ users: { nodes: any[] } }>(QUERIES.users),
    graphqlQuery<{ pages: { nodes: any[] } }>(QUERIES.pages),
  ]);

  const posts = (postsResult.posts.nodes || []).map(mapPost);
  const categories: CategoryData[] = (categoriesResult.categories.nodes || []).map((cat: any) => ({
    id: cat.categoryId,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    count: cat.count,
  }));
  const tags: TagData[] = (tagsResult.tags.nodes || []).map((tag: any) => ({
    id: tag.tagId,
    name: tag.name,
    slug: tag.slug,
    count: tag.count,
  }));
  const authors = deriveAuthors(posts);
  const pages = buildPageSummaries(pagesResult.pages.nodes || []);

  console.log(`✅ Fetched ${posts.length} posts, ${categories.length} categories, ${tags.length} tags, ${authors.length} authors, ${pages.length} pages.`);

  return { posts, categories, tags, authors, pages };
}

export function buildRenderContext(collections: DataCollections): RenderContext {
  return {
    posts: { posts: collections.posts },
    categories: collections.categories,
    tags: collections.tags,
    authors: collections.authors,
    pages: collections.pages,
    site: defaultRenderContext.site,
    menu: defaultRenderContext.menu,
    assets: {
      s3AssetsUrl: process.env.S3_ASSETS_URL ?? '',
    },
  };
}

const CACHE_TTL_MS = Number(process.env.DATA_CACHE_TTL ?? 60_000);
let cached: { context: RenderContext; collections: DataCollections; ts: number } | null = null;

export async function getBaseContext(options?: { force?: boolean }): Promise<RenderContext> {
  const now = Date.now();
  const valid = cached && !options?.force && now - cached.ts < CACHE_TTL_MS;
  if (valid && cached) return cached.context;

  const collections = await fetchAllData();
  const context = buildRenderContext(collections);
  cached = { context, collections, ts: now };
  return context;
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

function extractSlug(path: string, prefix: string) {
  if (!path.startsWith(prefix)) return null;
  const slug = path.slice(prefix.length);
  return slug || null;
}

const BLOG_PAGE_SIZE = Number(process.env.BLOG_PAGE_SIZE ?? 3);

export function sliceRouteContext(path: string, base: RenderContext): RenderContext {
  const normalized = normalizePath(path);
  const posts = base.posts.posts;

  // Home
  if (normalized === '/') {
    const perPage = 8;
    const slice = posts.slice(0, perPage);
    return {
      ...base,
      posts: { posts: slice },
      route: { type: 'home', perPage, totalPosts: posts.length },
    };
  }

  // Blog with optional page
  if (normalized === '/blog' || normalized.startsWith('/blog/')) {
    const pageStr = normalized === '/blog' ? '1' : normalized.replace('/blog/', '');
    const page = Math.max(1, Number(pageStr) || 1);
    const perPage = BLOG_PAGE_SIZE;
    const start = (page - 1) * perPage;
    const pageItems = posts.slice(start, start + perPage);
    return {
      ...base,
      posts: { posts: pageItems },
      route: { type: 'blog', page, perPage, totalPosts: posts.length },
    };
  }

  // Single post
  if (normalized.startsWith('/posts/')) {
    const slug = extractSlug(normalized, '/posts/');
    const current = slug ? posts.find((p) => p.slug === slug) : undefined;
    const related = posts.filter((p) => p.slug !== slug).slice(0, 4);
    return {
      ...base,
      posts: { posts: current ? [current, ...related] : related },
      route: { type: 'post', slug: slug ?? undefined, totalPosts: posts.length },
    };
  }

  // Category
  if (normalized.startsWith('/category/')) {
    const slug = extractSlug(normalized, '/category/');
    const filtered = slug ? posts.filter((p) => p.categories?.some((c) => c.slug === slug)) : [];
    return {
      ...base,
      posts: { posts: filtered },
      route: { type: 'category', categorySlug: slug ?? undefined, totalPosts: filtered.length },
    };
  }

  // Tag
  if (normalized.startsWith('/tag/')) {
    const slug = extractSlug(normalized, '/tag/');
    const filtered = slug ? posts.filter((p) => p.tags?.some((t) => t.slug === slug)) : [];
    return {
      ...base,
      posts: { posts: filtered },
      route: { type: 'tag', tagSlug: slug ?? undefined, totalPosts: filtered.length },
    };
  }

  // Author
  if (normalized.startsWith('/author/')) {
    const slug = extractSlug(normalized, '/author/');
    const filtered = slug ? posts.filter((p) => p.author?.slug === slug) : [];
    return {
      ...base,
      posts: { posts: filtered },
      route: { type: 'author', authorSlug: slug ?? undefined, totalPosts: filtered.length },
    };
  }

  // Search keeps full dataset
  if (normalized === '/search') {
    return { ...base, route: { type: 'search', totalPosts: posts.length } };
  }

  // Default: full context
  return { ...base, route: { type: 'other', totalPosts: posts.length } };
}

export async function getRouteContext(path: string): Promise<RenderContext> {
  const base = await getBaseContext();
  return sliceRouteContext(path, base);
}

export function collectRoutes(base: RenderContext, blogPageSize: number): string[] {
  const routes = new Set<string>([
    '/',
    '/about',
    '/blog',
    '/search',
    '/categories',
    '/tags',
    '/authors',
    '/test',
  ]);

  const posts = base.posts?.posts ?? [];
  const categories = base.categories ?? [];
  const tags = base.tags ?? [];
  const authors = base.authors ?? [];

  posts.forEach((p) => p?.slug && routes.add(`/posts/${p.slug}`));
  categories.forEach((c) => c?.slug && routes.add(`/category/${c.slug}`));
  tags.forEach((t) => t?.slug && routes.add(`/tag/${t.slug}`));
  authors.forEach((a) => a?.slug && routes.add(`/author/${a.slug}`));

  const perPage = Math.max(1, blogPageSize);
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  for (let page = 2; page <= totalPages; page += 1) {
    routes.add(`/blog/${page}`);
  }

  return Array.from(routes).sort();
}
