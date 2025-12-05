import { site, menu, page, posts as fallbackPosts } from './wpfasty/context';
import type {
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

const mapLegacyPost = (source: any): PostData => ({
  id: source.id,
  slug: source.slug ?? source.url ?? `post-${source.id}`,
  title: source.title,
  excerpt: source.excerpt,
  content: source.content ?? '',
  date: source.date?.formatted ?? new Date().toISOString(),
  featuredImage: source.featuredImage
    ? {
        url: source.featuredImage.url,
        alt: source.featuredImage.alt,
        width: source.featuredImage.width,
        height: source.featuredImage.height,
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

const buildFeatures = (items: PostData[]): Feature[] =>
  items.slice(0, 3).map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage,
  }));

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

const fallbackHome: HomeData = {
  page: {
    title: page.title,
    excerpt: page.excerpt,
    content: page.content,
    slug: page.slug,
  },
  features: buildFeatures(fallbackPostsData),
};

const fallbackBlog = {
  page: {
    title: 'Blog',
    excerpt: 'Latest posts and updates',
    content: '',
    slug: 'blog',
  },
};

const fallbackAbout: AboutData = {
  page: {
    title: page.title,
    excerpt: page.excerpt,
    content: page.content,
    slug: 'about',
  },
  features: [],
};

export const defaultRenderContext: RenderContext = {
  home: fallbackHome,
  about: fallbackAbout,
  blog: fallbackBlog,
  posts: { posts: fallbackPostsData },
  categories: fallbackCategories,
  tags: fallbackTags,
  authors: fallbackAuthors,
  pages: fallbackPages,
  site,
  menu,
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
