import React from 'react';
import { defaultRenderContext } from '../data/context';
import type { RenderContext, PageContext } from '../data/types';

// The context can be either full RenderContext (server-side) or minimal PageContext (client hydration)
type ContextValue = RenderContext | PageContext | null;

const RenderCtx = React.createContext<ContextValue>(null);

export function RenderContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: ContextValue;
}) {
  return (
    <RenderCtx.Provider value={value ?? null}>
      {children}
    </RenderCtx.Provider>
  );
}

// Helper to check if context is full RenderContext
function isFullContext(ctx: ContextValue): ctx is RenderContext {
  return ctx !== null && 'posts' in ctx && 'home' in ctx;
}

// Helper to check if context is PageContext
function isPageContext(ctx: ContextValue): ctx is PageContext {
  return ctx !== null && 'page' in ctx;
}

// Hook that provides a normalized view of the context
// Components can access data the same way regardless of context type
export function useRenderContext() {
  const ctx = React.useContext(RenderCtx);
  
  if (!ctx) {
    return { context: defaultRenderContext, loading: false, error: null };
  }
  
  // If it's full context (from server during SSR), use as-is
  if (isFullContext(ctx)) {
    return { context: ctx, loading: false, error: null };
  }
  
  // If it's page context (client hydration), build a compatible view
  if (isPageContext(ctx)) {
    const pageData = ctx.page?.data || {};
    
    // Build a compatible RenderContext from PageContext
    const compatContext: RenderContext = {
      site: ctx.site,
      menu: ctx.menu,
      // Restore data from page-specific payload
      home: pageData.home || defaultRenderContext.home,
      about: pageData.about || defaultRenderContext.about,
      blog: pageData.blog || defaultRenderContext.blog,
      posts: {
        posts: pageData.posts || pageData.recentPosts || (pageData.post ? [pageData.post] : []),
      },
      categories: pageData.categories || [],
      tags: pageData.tags || [],
      authors: pageData.authors || (pageData.author ? [pageData.author] : []),
      pages: [],
    };
    
    return { context: compatContext, loading: false, error: null };
  }
  
  return { context: defaultRenderContext, loading: false, error: null };
}

// Direct access to page-specific data (for components that know about PageContext)
export function usePageContext() {
  const ctx = React.useContext(RenderCtx);
  
  if (!ctx || !isPageContext(ctx)) {
    return { page: null, site: defaultRenderContext.site, menu: defaultRenderContext.menu };
  }
  
  return {
    page: ctx.page,
    site: ctx.site,
    menu: ctx.menu,
  };
}
