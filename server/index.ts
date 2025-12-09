import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { renderPage } from './render';
import { dbOperations } from './db';
import { syncAllData } from './sync';
import { renderHtmlTemplate, STYLES_PATH } from './template';

const PORT = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .use(html())
  .get('/styles.css', async () => {
    try {
      const buffer = await readFile(STYLES_PATH);
      return new Response(buffer, { headers: { 'content-type': 'text/css' } });
    } catch (error) {
      return new Response('/* styles not built yet */', { headers: { 'content-type': 'text/css' }, status: 404 });
    }
  })
  .get('/entry-client.js', async () => {
    try {
      const buffer = await readFile('./dist/entry-client.js');
      return new Response(buffer, {
        headers: {
          'content-type': 'application/javascript',
          'cache-control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (error) {
      return new Response('// client bundle not built', { headers: { 'content-type': 'application/javascript' }, status: 404 });
    }
  })
  .get('/entry-client.js.map', async () => {
    try {
      const buffer = await readFile('./dist/entry-client.js.map');
      return new Response(buffer, { headers: { 'content-type': 'application/json' } });
    } catch (error) {
      return new Response('{}', { headers: { 'content-type': 'application/json' }, status: 404 });
    }
  })
  .get('/assets/*', async ({ request }) => {
    const url = new URL(request.url);
    const assetPath = url.pathname.replace('/assets/', '');
    const filePath = `./src/assets/${assetPath}`;
    try {
      const buffer = await readFile(filePath);
      const ext = extname(filePath);
      const type =
        ext === '.woff2' ? 'font/woff2' :
        ext === '.woff' ? 'font/woff' :
        ext === '.ttf' ? 'font/ttf' :
        ext === '.otf' ? 'font/otf' :
        'application/octet-stream';
      return new Response(buffer, { headers: { 'content-type': type } });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  })
  .get('/api/posts', async ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const allPosts = dbOperations.getPosts();
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = allPosts.slice(start, end);
    const total = allPosts.length;
    const hasMore = end < total;

    return {
      items,
      page,
      limit,
      total,
      hasMore
    };
  })

  .get('/health', async () => {
    const posts = await dbOperations.getPosts();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      posts: posts.length,
    };
  })
  .get('*', async ({ request }) => {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const context = await dbOperations.getRenderContext();
      const { html, meta } = await renderPage(path, context);
      const body = renderHtmlTemplate({ html, meta, site: context.site, assets: context.assets });
      return body;
    } catch (error) {
      console.error('SSR error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  });

(async function bootstrap() {
  await syncAllData();
  app.listen({ port: PORT });
  console.log(`🚀 SSR server running at http://localhost:${PORT}`);
})();
