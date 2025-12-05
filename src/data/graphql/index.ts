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
      url: post.featuredImage.node.sourceUrl.replace('/w=800&h=600&fit=crop', '/w=300&h=200&fit=crop'),
        width: 300,
        height: 200,
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

// Async function to get home page data with features
export async function getHomePage(): Promise<{
  page: {
    title: string;
    excerpt: string;
    content: string;
  };
  features: Array<{
    id: number;
    title: string;
    excerpt: string;
    featuredImage: {
      url: string;
      alt: string;
      caption: string;
    };
  }>;
}> {
  // Try to get home page from GraphQL
  const homePage = await getPageBySlug('home');

  if (homePage) {
    // If home page exists in CMS, use it and create features from pageFields or default
    return {
      page: {
        title: homePage.title,
        excerpt: homePage.excerpt,
        content: homePage.content
      },
      features: [
        {
          id: 1,
          title: 'About Our Approach',
          excerpt: 'Discover how we transform Tailwind utilities into clean HTML5 semantic classes.',
          featuredImage: homePage.featuredImage ? {
            url: homePage.featuredImage.url,
            alt: homePage.featuredImage.alt,
            caption: 'Utility-first to semantic HTML5 transformation'
          } : {
            url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
            alt: 'Default feature image',
            caption: 'Feature image'
          }
        },
        {
          id: 2,
          title: 'Blog & Insights',
          excerpt: 'Deep dive into modern frontend development practices.',
          featuredImage: {
            url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
            alt: 'Blog and insights',
            caption: 'Frontend development insights'
          }
        },
        {
          id: 3,
          title: 'Three Pillars Architecture',
          excerpt: 'Explore the foundational pillars of modern frontend development.',
          featuredImage: {
            url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
            alt: 'Architecture pillars',
            caption: 'Modern frontend architecture'
          }
        }
      ]
    };
  }

  // Fallback to default static data if home page not found
  return {
    page: {
      title: 'Built with Pure HTML5 Semantic Structure',
      excerpt: 'Experience the power of clean, semantic HTML5 architecture combined with modern React components and Tailwind CSS transformation.',
      content: 'This website demonstrates the perfect implementation of semantic HTML5 structure, where every element serves a meaningful purpose. Built with clean, accessible markup that follows W3C standards, our approach transforms Tailwind CSS utilities into production-ready semantic classes. Explore how modern frontend architecture combines rapid development with maintainable, SEO-optimized code that works flawlessly across all devices and assistive technologies.'
    },
    features: [
      {
        id: 1,
        title: 'About Our Approach',
        excerpt: 'Discover how we transform Tailwind utilities into clean HTML5 semantic classes. Learn about our revolutionary methodology that bridges utility-first development with semantic production code, creating accessible, SEO-friendly markup.',
        featuredImage: {
          url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
          alt: 'Semantic HTML5 transformation approach',
          caption: 'Utility-first to semantic HTML5 transformation'
        }
      },
      {
        id: 2,
        title: 'Blog & Insights',
        excerpt: 'Deep dive into modern frontend development practices, clean code principles, and semantic HTML5 techniques. Explore articles about component architecture, accessibility best practices, and performance optimization strategies.',
        featuredImage: {
          url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
          alt: 'Frontend development blog and insights',
          caption: 'Clean code and semantic HTML5 insights'
        }
      },
      {
        id: 3,
        title: 'Three Pillars Architecture',
        excerpt: 'Explore the foundational pillars of modern frontend development: Semantic HTML5 Foundation, Component-Driven Architecture, and Utility-to-Semantic Transformation. See how these principles create scalable, maintainable applications.',
        featuredImage: {
          url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
          alt: 'Three pillars of modern frontend architecture',
          caption: 'Semantic HTML5, Components, and Clean Architecture'
        }
      }
    ]
  };
}

// Async function to get about page data with features
export async function getAboutPage(): Promise<{
  page: {
    title: string;
    excerpt: string;
    content: string;
  };
  features: Array<{
    id: number;
    title: string;
    excerpt: string;
    featuredImage: {
      url: string;
      alt: string;
      caption: string;
    };
  }>;
}> {
  // Try to get about page from GraphQL
  const aboutPage = await getPageBySlug('about');

  if (aboutPage) {
    return {
      page: {
        title: aboutPage.title,
        excerpt: aboutPage.excerpt,
        content: aboutPage.content
      },
      features: [
        {
          id: 1,
          title: 'Utility-First to Semantic CSS Architecture',
          excerpt: 'Leverage Tailwind CSS for rapid development while maintaining clean, semantic HTML5 output.',
          featuredImage: aboutPage.featuredImage ? {
            url: aboutPage.featuredImage.url,
            alt: aboutPage.featuredImage.alt,
            caption: 'Clean semantic HTML5 classes from Tailwind utilities'
          } : {
            url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
            alt: 'CSS Architecture',
            caption: 'Utility to semantic transformation'
          }
        },
        {
          id: 2,
          title: 'Component-Driven Development with CVA',
          excerpt: 'Build robust React components using Class Variance Authority (CVA) patterns.',
          featuredImage: {
            url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
            alt: 'Component-Driven Development',
            caption: 'CVA patterns for scalable component architecture'
          }
        },
        {
          id: 3,
          title: 'Production-Ready Semantic HTML5 Output',
          excerpt: 'Generate framework-agnostic, accessible HTML5 markup with semantic class names.',
          featuredImage: {
            url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
            alt: 'Production-Ready Semantic HTML5',
            caption: 'Framework-agnostic semantic HTML5 for better performance'
          }
        }
      ]
    };
  }

  // Fallback to default static data
  return {
    page: {
      title: 'Tailwind to Semantic HTML5 Transformation',
      excerpt: 'Revolutionary approach to modern frontend development: Build with utility-first CSS, deploy with semantic HTML5 classes.',
      content: 'Experience the future of component-driven development where Tailwind CSS utilities automatically transform into clean, semantic HTML5 classes. Our methodology bridges the gap between rapid prototyping and production-ready, maintainable code. Switch between development and production modes to see how utility classes become semantic BEM-like conventions instantly. Perfect for design systems, component libraries, and scalable frontend architecture.'
    },
    features: [
      {
        id: 1,
        title: 'Utility-First to Semantic CSS Architecture',
        excerpt: 'Leverage Tailwind CSS for rapid development while maintaining clean, semantic HTML5 output. Our automated extraction process converts utility classes into meaningful, BEM-inspired semantic classes that improve code readability, SEO performance, and maintainability.',
        featuredImage: {
          url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
          alt: 'Utility-First to Semantic CSS Architecture',
          caption: 'Clean semantic HTML5 classes from Tailwind utilities'
        }
      },
      {
        id: 2,
        title: 'Component-Driven Development with CVA',
        excerpt: 'Build robust React components using Class Variance Authority (CVA) patterns that automatically generate semantic class variants. Perfect for design systems, atomic design methodology, and TypeScript-first development workflows that scale across enterprise applications.',
        featuredImage: {
          url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
          alt: 'Component-Driven Development',
          caption: 'CVA patterns for scalable component architecture'
        }
      },
      {
        id: 3,
        title: 'Production-Ready Semantic HTML5 Output',
        excerpt: 'Generate framework-agnostic, accessible HTML5 markup with semantic class names that follow W3C standards. Ideal for headless CMS integration, server-side rendering, progressive web apps, and cross-platform compatibility with improved Core Web Vitals scores.',
        featuredImage: {
          url: 'https://images.unsplash.com/vector-1746618662777-7058cb830c6a?q=80&w=1934&auto=format&fit=crop',
          alt: 'Production-Ready Semantic HTML5',
          caption: 'Framework-agnostic semantic HTML5 for better performance'
        }
      }
    ]
  };
}

// Static posts for backward compatibility (fallback)
export const posts: PostsCollection = {
  posts: []
};

// Export async function as default for dynamic loading
export default getPosts;