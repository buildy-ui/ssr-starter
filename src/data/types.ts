import type { WPFastyContext } from './wpfasty/types';

export interface ImageData {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface ImageSizes {
  thumbnail?: ImageData;
  medium?: ImageData;
  mediumLarge?: ImageData;
  large?: ImageData;
  full?: ImageData;
}

export interface MediaData extends ImageData {
  sizes?: ImageSizes;
}

export interface PageData {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  featuredImage?: ImageData;
  id?: number;
  url?: string;
}

export interface Feature {
  id: number;
  title: string;
  excerpt: string;
  featuredImage?: ImageData;
}

export interface HomeData {
  page: PageData;
}

export interface BlogData {
  page: PageData;
}

export interface AboutData {
  page: PageData;
  features: Feature[];
}

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface TagData {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface AuthorData {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
  count?: number;
}

export interface PostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: {
    display: string;
    raw: string;
  };
  featuredImage?: MediaData;
  thumbnail?: ImageData;
  categories: CategoryData[];
  tags: TagData[];
  author?: AuthorData;
}

export interface PageSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  featuredImage?: ImageData;
}

export interface RenderContext {
  posts: { posts: PostData[] };
  categories: CategoryData[];
  tags: TagData[];
  authors: AuthorData[];
  pages: PageSummary[];
  site: WPFastyContext['site'];
  menu: WPFastyContext['menu'];
  assets: {
    s3AssetsUrl: string;
  };
  admin?: AdminContext;
  route?: {
    type: 'home' | 'blog' | 'post' | 'category' | 'tag' | 'author' | 'search' | 'other';
    page?: number;
    perPage?: number;
    totalPosts?: number;
    slug?: string;
    categorySlug?: string;
    tagSlug?: string;
    authorSlug?: string;
  };
}

export type AdminView = 'collections' | 'documents' | 'stats';

export interface AdminContext {
  view: AdminView;
  source: 'MAINDB' | 'BACKUPDB' | 'none';
  collections: string[];
  currentCollection?: string;
  documents: any[];
  selectedDocument?: any | null;
  stats?: {
    collections: number;
    documents: number;
    indexes: number;
    size: number;
    lastModified: string;
  };
  notice?: string;
  error?: string;
}