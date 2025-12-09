import type { WPFastyContext } from '../wpfasty/types';

type PostsCollection = {
  posts: (WPFastyContext['archive']['posts'] & { tags?: { id: number; name: string; slug: string }[]; author?: { id: number; name: string; slug: string } })[];
};

// GraphQL API configuration
const GRAPHQL_ENDPOINT = import.meta.env.GRAPHQL_ENDPOINT || 'https://example.com/graphql';

interface GraphQLPost {
  id: string;
  postId: number;
  date: string;
  title: string;
  content: string;
  excerpt: string;
  categories: {
    nodes: Array<{
      id: string;
      categoryId: number;
      name: string;
    }>;
  };
  tags: {
    nodes: Array<{
      id: string;
      tagId: number;
      name: string;
    }>;
  };
  featuredImage?: {
    node: {
      id: string;
      sourceUrl: string;
      altText: string;
      caption?: string;
    };
  };
  postFields?: Array<{
    key: string;
    value: string;
  }>;
}

interface GraphQLResponse {
  data: {
    posts: {
      nodes: GraphQLPost[];
    };
  };
}

// Function to fetch posts from GraphQL API
async function fetchPostsFromAPI(): Promise<GraphQLPost[]> {
  const query = `
    {
      posts(first: 50) {
        nodes {
          id
          postId
          date
          title
          content
          excerpt
          categories {
            nodes {
              id
              categoryId
              name
            }
          }
          tags {
            nodes {
              id
              tagId
              name
            }
          }
          featuredImage {
            node {
              id
              sourceUrl
              altText
              caption
            }
          }
          postFields {
            key
            value
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL API error: ${response.status}`);
    }

    const result: GraphQLResponse = await response.json();
    return result.data.posts.nodes;
  } catch (error) {
    console.error('Failed to fetch posts from GraphQL API:', error);
    return [];
  }
}

// Function to fetch all categories
async function fetchCategoriesFromAPI(): Promise<Array<{
  id: string;
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  count: number;
}>> {
  const query = `
    {
      categories(first: 50) {
        nodes {
          id
          categoryId
          name
          slug
          description
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Categories API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.categories?.nodes || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// Function to fetch all tags
async function fetchTagsFromAPI(): Promise<Array<{
  id: string;
  tagId: number;
  name: string;
  slug: string;
  count: number;
}>> {
  const query = `
    {
      tags(first: 100) {
        nodes {
          id
          tagId
          name
          slug
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Tags API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.tags?.nodes || [];
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

// Function to fetch all users/authors
async function fetchUsersFromAPI(): Promise<Array<{
  id: string;
  userId: number;
  name: string;
  slug: string;
  email?: string;
  avatar?: {
    url: string;
  };
}>> {
  const query = `
    {
      users(first: 50) {
        nodes {
          id
          userId
          name
          slug
          email
          avatar {
            url
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Users API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.users?.nodes || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

// Function to fetch pages
async function fetchPagesFromAPI(): Promise<Array<{
  id: string;
  pageId: number;
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  pageFields?: Array<{
    key: string;
    value: string;
  }>;
}>> {
  const query = `
    {
      pages(first: 20) {
        nodes {
          id
          pageId
          title
          content
          slug
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          pageFields {
            key
            value
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Pages API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.pages?.nodes || [];
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return [];
  }
}

// Transform GraphQL post to our internal format
function transformGraphQLPostToInternal(post: GraphQLPost): any {
  return {
    title: post.title,
    content: post.content,
    slug: `post-${post.postId}`, // Generate slug from ID
    url: `/posts/post-${post.postId}`,
    id: post.postId,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage ? {
      url: post.featuredImage.node.sourceUrl,
      width: 800, // Default dimensions
        height: 600,
      alt: post.featuredImage.node.altText
    } : null,
    thumbnail: post.featuredImage ? {
      url: post.featuredImage.node.sourceUrl,
        width: 250,
        height: 216,
      alt: post.featuredImage.node.altText
    } : null,
      meta: {
        _edit_last: '1',
      _edit_lock: `${Date.now()}:1`
    },
    categories: post.categories.nodes.map(cat => ({
      name: cat.name,
      url: `/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
      id: cat.categoryId,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      description: `${cat.name} posts`,
      count: 1 // We don't have actual count from API
    })),
    tags: post.tags.nodes.map(tag => ({
      id: tag.tagId,
      name: tag.name,
      slug: tag.name.toLowerCase().replace(/\s+/g, '-')
    })),
    author: {
      id: 1, // Default author
      name: 'Admin',
      slug: 'admin'
    },
      date: {
      formatted: new Date(post.date).toISOString(),
      display: new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      modified: new Date(post.date).toISOString(),
      modified_display: new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      timestamp: Math.floor(new Date(post.date).getTime() / 1000),
      year: new Date(post.date).getFullYear().toString(),
      month: (new Date(post.date).getMonth() + 1).toString().padStart(2, '0'),
      day: new Date(post.date).getDate().toString().padStart(2, '0')
    }
  };
}

// Async function to get posts (for dynamic loading)
export async function getPosts(): Promise<PostsCollection> {
  const apiPosts = await fetchPostsFromAPI();
  const transformedPosts = apiPosts.map(transformGraphQLPostToInternal);

  return {
    posts: transformedPosts
  };
}

// Async function to get all categories
export async function getCategories(): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
}>> {
  const apiCategories = await fetchCategoriesFromAPI();

  return apiCategories.map(cat => ({
    id: cat.categoryId,
    name: cat.name,
    slug: cat.slug,
    count: cat.count || 0,
    description: cat.description || `${cat.name} posts`
  })).sort((a, b) => a.name.localeCompare(b.name));
}

// Async function to get all tags
export async function getTags(): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  count: number;
}>> {
  const apiTags = await fetchTagsFromAPI();

  return apiTags.map(tag => ({
    id: tag.tagId,
    name: tag.name,
    slug: tag.slug,
    count: tag.count || 0
  })).sort((a, b) => a.name.localeCompare(b.name));
}

// Async function to get all authors/users
export async function getAuthors(): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  count: number;
  avatar?: string;
  bio?: string;
}>> {
  const apiUsers = await fetchUsersFromAPI();

  return apiUsers.map(user => ({
    id: user.userId,
    name: user.name,
    slug: user.slug,
    count: 0, // Will be calculated from posts
    avatar: user.avatar?.url,
    bio: '' // Can be extended with additional user data
  })).sort((a, b) => a.name.localeCompare(b.name));
}

// Async function to get all pages
export async function getPages(): Promise<Array<{
  id: number;
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  url: string;
  featuredImage?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  thumbnail?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  meta: {
    _edit_last: string;
    _edit_lock: string;
  };
  categories: Array<any>; // Pages usually don't have categories
  date: {
    formatted: string;
    display: string;
    modified: string;
    modified_display: string;
    timestamp: number;
    year: string;
    month: string;
    day: string;
  };
}>> {
  const apiPages = await fetchPagesFromAPI();

  return apiPages.map(page => ({
    id: page.pageId,
    title: page.title,
    content: page.content,
    slug: page.slug,
    excerpt: page.excerpt,
    url: `/pages/${page.slug}`,
    featuredImage: page.featuredImage ? {
      url: page.featuredImage.node.sourceUrl,
      width: 800,
      height: 600,
      alt: page.featuredImage.node.altText
    } : undefined,
    thumbnail: page.featuredImage ? {
      url: page.featuredImage.node.sourceUrl.replace('/w=800&h=600&fit=crop', '/w=300&h=200&fit=crop'),
      width: 300,
      height: 200,
      alt: page.featuredImage.node.altText
    } : undefined,
    meta: {
      _edit_last: '1',
      _edit_lock: `${Date.now()}:1`
    },
    categories: [], // Pages don't typically have categories
    date: {
      formatted: new Date().toISOString(), // Pages might not have dates in GraphQL
      display: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      modified: new Date().toISOString(),
      modified_display: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      timestamp: Math.floor(Date.now() / 1000),
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      day: new Date().getDate().toString().padStart(2, '0')
    }
  }));
}

// Async function to get specific page by slug
export async function getPageBySlug(slug: string): Promise<{
  id: number;
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  url: string;
  featuredImage?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  thumbnail?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  meta: {
    _edit_last: string;
    _edit_lock: string;
  };
  categories: Array<any>;
  date: {
    formatted: string;
    display: string;
    modified: string;
    modified_display: string;
    timestamp: number;
    year: string;
    month: string;
    day: string;
  };
} | null> {
  const query = `
    {
      page(id: "/${slug}/", idType: URI) {
        id
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
        pageFields {
          key
          value
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Page API error: ${response.status}`);
    }

    const result = await response.json();
    const page = result.data?.page;

    if (!page) {
      return null;
    }

    return {
      id: page.pageId,
      title: page.title,
      content: page.content,
      slug: page.slug,
      excerpt: page.content ? page.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
      url: `/${page.slug}`,
      featuredImage: page.featuredImage ? {
        url: page.featuredImage.node.sourceUrl,
        width: 800,
        height: 600,
        alt: page.featuredImage.node.altText
      } : undefined,
      thumbnail: page.featuredImage ? {
        url: page.featuredImage.node.sourceUrl.replace('/w=800&h=600&fit=crop', '/w=300&h=200&fit=crop'),
        width: 300,
        height: 200,
        alt: page.featuredImage.node.altText
      } : undefined,
      meta: {
        _edit_last: '1',
        _edit_lock: `${Date.now()}:1`
      },
      categories: [],
      date: {
        formatted: new Date().toISOString(),
        display: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        modified: new Date().toISOString(),
        modified_display: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        timestamp: Math.floor(Date.now() / 1000),
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
        day: new Date().getDate().toString().padStart(2, '0')
      }
    };
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return null;
  }
}

// NOTE: home/about pages are resolved via getPages()/getPageBySlug in the app. No separate helpers here.

// Static posts for backward compatibility (fallback)
export const posts: PostsCollection = {
  posts: []
};

// Export async function as default for dynamic loading
export default getPosts;