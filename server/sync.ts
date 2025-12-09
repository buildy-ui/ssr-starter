import { dbOperations } from './db';
import type { PostData, CategoryData, TagData, AuthorData, PageSummary } from '../src/data/types';
import { defaultRenderContext } from '../src/data';

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;

if (!GRAPHQL_ENDPOINT) {
  console.warn('GRAPHQL_ENDPOINT is not set. Sync will not run without a configured endpoint.');
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

export async function syncAllData() {
  if (!GRAPHQL_ENDPOINT) {
    console.warn('Skipping sync because GRAPHQL_ENDPOINT is not configured.');
    return;
  }

  console.log('🔄 Syncing data from WordPress GraphQL...');

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

  dbOperations.savePosts(posts);
  dbOperations.saveCategories(categories);
  dbOperations.saveTags(tags);
  dbOperations.saveAuthors(authors);
  dbOperations.savePages(pages);

  dbOperations.saveMeta('site', defaultRenderContext.site);
  dbOperations.saveMeta('menu', defaultRenderContext.menu);

  console.log(`✅ Synced ${posts.length} posts, ${categories.length} categories, ${tags.length} tags, ${authors.length} authors, ${pages.length} pages.`);
}
