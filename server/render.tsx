import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../src/providers/theme';
import { RenderContextProvider } from '../src/providers/render-context';
import type { RenderContext } from '../src/data/types';
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

export interface MetaPayload {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

function AppRouter({ path, context }: { path: string; context: RenderContext }) {
  return (
    <ThemeProvider theme={serverTheme}>
      <RenderContextProvider value={context}>
        <StaticRouter location={path}>
          <Routes>
            <Route path="/" element={<MainLayout context={context} sidebar="none"><Home /></MainLayout>} />
            <Route path="/about" element={<MainLayout context={context} sidebar="left"><About /></MainLayout>} />
            <Route path="/blog" element={<MainLayout context={context}><Blog /></MainLayout>} />
            <Route path="/blog/:page" element={<MainLayout context={context}><Blog /></MainLayout>} />
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
    const homePage = context.pages.find((p) => p.slug === 'home');
    return {
      title: homePage?.title ?? context.site.title,
      description: homePage?.excerpt ?? context.site.description,
      canonical,
      ogTitle: homePage?.title ?? context.site.title,
      ogDescription: homePage?.excerpt ?? context.site.description,
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

  if (normalized.startsWith('/blog/')) {
    const page = normalized.replace('/blog/', '') || '1';
    return {
      title: `${context.site.title} — Blog (Page ${page})`,
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
