import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../src/providers/theme';
import { RenderContextProvider } from '../src/providers/render-context';
import { defaultRenderContext } from '../src/data';
import type { RenderContext, PageContext } from '../src/data/types';
import { MainLayout } from '../src/layouts/MainLayout';
import Home from '../src/routes/Home';
import About from '../src/routes/About';
import Blog from '../src/routes/Blog';
import Post from '../src/routes/Post';
import Category from '../src/routes/Category';
import Tag from '../src/routes/Tag';
import Author from '../src/routes/Author';
import Authors from '../src/routes/Authors';
import Categories from '../src/routes/Categories';
import Tags from '../src/routes/Tags';
import Search from '../src/routes/Search';
import Test from '../src/routes/Test';
import NotFound from '../src/exceptions/NotFound';

// Strip heavy content from posts for listings (keep only metadata + excerpt)
function stripPostContent(post: any) {
  const { content, ...rest } = post;
  return rest;
}

// Build minimal page-specific context for client hydration
// This drastically reduces HTML size by only including needed data
export function getPageContext(path: string, fullContext: RenderContext): PageContext {
  const normalized = path.replace(/\/+$/, '') || '/';
  const { site, menu, categories, tags, authors } = fullContext;
  
  // Base context: site settings, menu, and sidebar data (categories/tags limited)
  const base: PageContext = {
    site,
    menu,
    // Sidebar needs categories/tags but we limit them
    page: undefined,
  };
  
  // Home page: home data + recent posts (stripped, limit 6)
  if (normalized === '/') {
    return {
      ...base,
      page: {
        type: 'home',
        data: {
          home: fullContext.home,
          recentPosts: fullContext.posts.posts.slice(0, 6).map(stripPostContent),
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // About page
  if (normalized === '/about') {
    return {
      ...base,
      page: {
        type: 'about',
        data: {
          about: fullContext.about,
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // Blog listing: paginated posts (stripped, first 10)
  if (normalized === '/blog') {
    return {
      ...base,
      page: {
        type: 'blog',
        data: {
          blog: fullContext.blog,
          posts: fullContext.posts.posts.slice(0, 10).map(stripPostContent),
          total: fullContext.posts.posts.length,
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // Single post: full post content + related posts (stripped)
  if (normalized.startsWith('/posts/')) {
    const slug = normalized.replace('/posts/', '');
    const post = fullContext.posts.posts.find((p) => p.slug === slug);
    const related = fullContext.posts.posts
      .filter((p) => p.slug !== slug)
      .slice(0, 3)
      .map(stripPostContent);
    return {
      ...base,
      page: {
        type: 'post',
        data: {
          post,
          relatedPosts: related,
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // Category page: category + posts (stripped)
  if (normalized.startsWith('/category/')) {
    const slug = normalized.replace('/category/', '');
    const category = categories.find((c) => c.slug === slug);
    const categoryPosts = fullContext.posts.posts
      .filter((p) => p.categories.some((c) => c.slug === slug))
      .map(stripPostContent);
    return {
      ...base,
      page: {
        type: 'category',
        data: {
          category,
          posts: categoryPosts,
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // Tag page: tag + posts (stripped)
  if (normalized.startsWith('/tag/')) {
    const slug = normalized.replace('/tag/', '');
    const tag = tags.find((t) => t.slug === slug);
    const tagPosts = fullContext.posts.posts
      .filter((p) => p.tags.some((t) => t.slug === slug))
      .map(stripPostContent);
    return {
      ...base,
      page: {
        type: 'tag',
        data: {
          tag,
          posts: tagPosts,
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // Author page: author + posts (stripped)
  if (normalized.startsWith('/author/')) {
    const slug = normalized.replace('/author/', '');
    const author = authors.find((a) => a.slug === slug);
    const authorPosts = fullContext.posts.posts
      .filter((p) => p.author?.slug === slug)
      .map(stripPostContent);
    return {
      ...base,
      page: {
        type: 'author',
        data: {
          author,
          posts: authorPosts,
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // Categories listing
  if (normalized === '/categories') {
    return {
      ...base,
      page: { type: 'categories', data: { categories } },
    };
  }
  
  // Tags listing
  if (normalized === '/tags') {
    return {
      ...base,
      page: { type: 'tags', data: { tags } },
    };
  }
  
  // Authors listing
  if (normalized === '/authors') {
    return {
      ...base,
      page: { type: 'authors', data: { authors } },
    };
  }
  
  // Search page: just categories/tags for sidebar, search is client-side
  if (normalized === '/search') {
    return {
      ...base,
      page: {
        type: 'search',
        data: {
          categories: categories.slice(0, 8),
          tags: tags.slice(0, 10),
        },
      },
    };
  }
  
  // Not found
  return {
    ...base,
    page: { type: 'notfound', data: {} },
  };
}

const serverTheme = {
  name: 'LesseUI',
  rounded: {
    default: 'sm',
    button: 'md',
    badge: 'xl',
  },
  buttonSize: {
    default: 'sm',
    badge: 'sm',
  },
  isNavFixed: true,
};

interface MetaPayload {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

/* function MainLayout({
  children,
  context,
  sidebar = 'right',
}: {
  children: React.ReactNode;
  context: RenderContext;
  sidebar?: 'left' | 'right' | 'none';
}) {
  const { menu } = context;
  return (
    <>
      <Block component="nav" py="xs" bg="background" data-class="nav-bar" borderBottom="1px" borderColor="border" shadow="lg">
        <Container size="lg">
          <Group justify="between" align="center">
            <Group align="center" gap="md">
              <a href="/">
                <Title order={2} size="2xl" fw="bold" c="primary">UI8Kit</Title>
              </a>
              <Text size="sm" c="secondary-foreground">Design System</Text>
            </Group>
            <Group align="center" gap="sm">
              <nav>
                <Group align="center" gap="sm" data-class="nav">
                  {menu.primary.items.map(item => (
                    <a key={item.id} href={item.url}>
                      <Text size="sm">{item.title}</Text>
                    </a>
                  ))}
                </Group>
              </nav>
            </Group>
          </Group>
        </Container>
      </Block>

      <Block component="main" py="lg" data-class="main-page">
        <Container size="lg">
          {sidebar === 'none' ? (
            <Stack gap="lg">
              {children}
            </Stack>
          ) : (
            <Group align="start" gap="lg">
              <Stack style={{ flex: 3 }}>{children}</Stack>
              <Stack style={{ flex: 1 }}>
                <Text size="sm" c="secondary-foreground">Sidebar</Text>
              </Stack>
            </Group>
          )}
        </Container>
      </Block>

      <Block component="footer" py="md" borderTop="1px" borderColor="border" bg="card" data-class="site-footer">
        <Container size="lg">
          <Stack gap="lg" align="center">
            <Text size="sm" c="secondary-foreground" ta="center">© 2025 UI8Kit Design System</Text>
            <Group gap="md" justify="center">
              <a href="/"><Text size="xs" c="secondary-foreground">Home</Text></a>
              <a href="/blog"><Text size="xs" c="secondary-foreground">Blog</Text></a>
              <a href="/about"><Text size="xs" c="secondary-foreground">About</Text></a>
            </Group>
          </Stack>
        </Container>
      </Block>
    </>
  );
} */

function AppRouter({ path, context }: { path: string; context: RenderContext }) {
  return (
    <ThemeProvider theme={serverTheme}>
      <RenderContextProvider value={context}>
        <StaticRouter location={path}>
          <Routes>
            <Route path="/" element={<MainLayout context={context} sidebar="none"><Home /></MainLayout>} />
            <Route path="/about" element={<MainLayout context={context} sidebar="left"><About /></MainLayout>} />
            <Route path="/blog" element={<MainLayout context={context}><Blog /></MainLayout>} />
            <Route path="/search" element={<MainLayout context={context}><Search /></MainLayout>} />
            <Route path="/categories" element={<MainLayout context={context}><Categories /></MainLayout>} />
            <Route path="/tags" element={<MainLayout context={context}><Tags /></MainLayout>} />
            <Route path="/authors" element={<MainLayout context={context}><Authors /></MainLayout>} />
            <Route path="/category/:slug" element={<MainLayout context={context}><Category /></MainLayout>} />
            <Route path="/tag/:slug" element={<MainLayout context={context}><Tag /></MainLayout>} />
            <Route path="/author/:slug" element={<MainLayout context={context}><Author /></MainLayout>} />
            <Route path="/posts/:slug" element={<MainLayout context={context}><Post /></MainLayout>} />
            <Route path="/test" element={<MainLayout context={context} sidebar="none"><Test /></MainLayout>} />
            <Route path="*" element={<MainLayout context={context} sidebar="none"><NotFound /></MainLayout>} />
          </Routes>
        </StaticRouter>
      </RenderContextProvider>
    </ThemeProvider>
  );
}

function getMetaForPath(path: string, context: RenderContext): MetaPayload {
  const normalized = normalizePath(path);
  const baseUrl = context.site.url || 'http://localhost:3000';
  const canonical = `${baseUrl}${normalized === '/' ? '' : normalized}`;

  if (normalized === '/') {
    return {
      title: context.home.page.title,
      description: context.home.page.excerpt,
      canonical,
      ogTitle: context.home.page.title,
      ogDescription: context.home.page.excerpt,
    };
  }

  if (normalized.startsWith('/posts/')) {
    const slug = normalized.replace('/posts/', '');
    const post = context.posts.posts.find((entry) => entry.slug === slug);
    const title = post?.title ?? context.site.title;
    const description = post?.excerpt ?? context.site.description;
    return {
      title,
      description,
      canonical,
      ogTitle: title,
      ogDescription: description,
    };
  }

  if (normalized === '/blog') {
    return {
      title: `${context.site.title} — Blog`,
      description: 'Latest posts and updates from the blog',
      canonical,
    };
  }

  return {
    title: context.site.title,
    description: context.site.description,
    canonical,
  };
}

export interface RenderResult {
  html: string;
  meta: MetaPayload;
  context: RenderContext;
}

export async function renderPage(path: string, context: RenderContext): Promise<RenderResult> {
  const html = renderToString(<AppRouter path={path} context={context} />);

  return {
    html,
    meta: getMetaForPath(normalizePath(path), context),
    context,
  };
}
