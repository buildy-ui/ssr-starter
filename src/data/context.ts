import { site, menu, page, posts as fallbackPosts } from './wpfasty/context';
import type {
  RenderContext,
  PostData,
  PageSummary,
  CategoryData,
  TagData,
  AuthorData,
} from './types';

const S3_ASSETS_URL = process.env.S3_ASSETS_URL;
if (!S3_ASSETS_URL) {
  throw new Error('S3_ASSETS_URL environment variable is required');
}

const mapLegacyPost = (source: any): PostData => ({
  id: source.id,
  slug: source.slug ?? source.url ?? `post-${source.id}`,
  title: source.title,
  excerpt: source.excerpt,
  content: source.content ?? '',
  date: {
    display: source.date?.display ?? source.date?.formatted ?? new Date().toLocaleDateString(),
    raw: source.date?.formatted ?? new Date().toISOString(),
  },
  featuredImage: source.featuredImage
    ? {
        url: source.featuredImage.url,
        alt: source.featuredImage.alt,
        width: source.featuredImage.width,
        height: source.featuredImage.height,
        sizes: source.featuredImage.sizes,
      }
    : undefined,
  thumbnail: source.thumbnail
    ? {
        url: source.thumbnail.url,
        alt: source.thumbnail.alt,
        width: source.thumbnail.width,
        height: source.thumbnail.height,
      }
    : undefined,
  categories: (source.categories || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    count: cat.count,
  })),
  tags: (source.tags || []).map((tag: any) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    count: tag.count,
  })),
  author: source.author
    ? {
        id: source.author.id,
        name: source.author.name,
        slug: source.author.slug,
        avatar: source.author.avatar?.url,
      }
    : undefined,
});

const fallbackPostsData = fallbackPosts.map(mapLegacyPost);
const fallbackCategories: CategoryData[] = fallbackPostsData.flatMap((post) => post.categories).filter(Boolean);
const fallbackTags: TagData[] = fallbackPostsData.flatMap((post) => post.tags).filter(Boolean);
const fallbackAuthors: AuthorData[] = [
  {
    id: 1,
    name: 'Admin',
    slug: 'admin',
    count: fallbackPostsData.length,
  },
];

const fallbackPages: PageSummary[] = [
  {
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
  },
];

export const defaultRenderContext: RenderContext = {
  posts: { posts: fallbackPostsData },
  categories: fallbackCategories,
  tags: fallbackTags,
  authors: fallbackAuthors,
  pages: fallbackPages,
  site,
  menu,
  assets: {
    s3AssetsUrl: S3_ASSETS_URL,
  },
};

export type {
  RenderContext,
  PostData,
  Feature,
  HomeData,
  AboutData,
  PageSummary,
  CategoryData,
  TagData,
  AuthorData,
} from './types';
