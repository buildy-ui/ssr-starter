import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { renderPage } from './render';
import { renderHtmlTemplate, STYLES_PATH } from './template';
import { getBaseContext, getRouteContext, syncAllData } from './sync';
import { buildAdminContext } from './admin/context';
import { ensureCollection, insertJsonDocument, updateJsonDocument, deleteDocument, dropCollection } from './admin/storage';

const PORT = Number(process.env.PORT ?? 3000);
const SYNC_ON_BOOT = String(process.env.SYNC_ON_BOOT ?? 'true').toLowerCase() !== 'false';

async function readFormFields(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') || '';

  // Prefer formData when available (multipart/form-data)
  if (contentType.includes('multipart/form-data')) {
    const fd = await request.formData();
    const out: Record<string, string> = {};
    for (const [k, v] of fd.entries()) out[k] = typeof v === 'string' ? v : v.name;
    return out;
  }

  const text = await request.text();
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

function redirect(location: string) {
  return new Response(null, { status: 303, headers: { location } });
}

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

    const base = await getBaseContext();
    const allPosts = base.posts.posts;
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
    const base = await getBaseContext();
    const posts = base.posts.posts;
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      posts: posts.length,
    };
  })

  // Admin actions (SSR-friendly, no client JS required)
  .post('/admin/actions/collection/create', async ({ request }) => {
    const fields = await readFormFields(request);
    const name = (fields.name || '').trim();
    if (!name) return redirect('/admin?view=collections&error=Missing%20collection%20name');

    try {
      await ensureCollection(name);
      return redirect(`/admin?view=collections&notice=${encodeURIComponent(`Collection "${name}" created`)}`);
    } catch (e) {
      console.error('Create collection failed:', e);
      return redirect(`/admin?view=collections&error=${encodeURIComponent('Create collection failed')}`);
    }
  })
  .post('/admin/actions/collection/drop', async ({ request }) => {
    const fields = await readFormFields(request);
    const name = (fields.name || '').trim();
    if (!name) return redirect('/admin?view=collections&error=Missing%20collection%20name');

    try {
      await dropCollection(name);
      return redirect(`/admin?view=collections&notice=${encodeURIComponent(`Collection "${name}" dropped`)}`);
    } catch (e) {
      console.error('Drop collection failed:', e);
      return redirect(`/admin?view=collections&error=${encodeURIComponent('Drop collection failed')}`);
    }
  })
  .post('/admin/actions/document/create', async ({ request }) => {
    const fields = await readFormFields(request);
    const collection = (fields.collection || '').trim();
    const json = (fields.json || '').trim();
    if (!collection || !json) return redirect('/admin?view=documents&error=Missing%20collection%20or%20json');

    try {
      const { id } = await insertJsonDocument({ collection, json });
      return redirect(`/admin?view=documents&collection=${encodeURIComponent(collection)}&notice=${encodeURIComponent(`Document ${id} created`)}`);
    } catch (e) {
      console.error('Create document failed:', e);
      return redirect(`/admin?view=documents&collection=${encodeURIComponent(collection)}&error=${encodeURIComponent('Create document failed (invalid JSON?)')}`);
    }
  })
  .post('/admin/actions/document/update', async ({ request }) => {
    const fields = await readFormFields(request);
    const collection = (fields.collection || '').trim();
    const id = (fields.id || '').trim();
    const json = (fields.json || '').trim();
    if (!collection || !id || !json) return redirect('/admin?view=documents&error=Missing%20collection%2Fid%2Fjson');

    try {
      await updateJsonDocument({ collection, id, json });
      return redirect(`/admin?view=documents&collection=${encodeURIComponent(collection)}&edit=${encodeURIComponent(id)}&notice=${encodeURIComponent(`Document ${id} updated`)}`);
    } catch (e) {
      console.error('Update document failed:', e);
      return redirect(`/admin?view=documents&collection=${encodeURIComponent(collection)}&edit=${encodeURIComponent(id)}&error=${encodeURIComponent('Update failed (invalid JSON?)')}`);
    }
  })
  .post('/admin/actions/document/delete', async ({ request }) => {
    const fields = await readFormFields(request);
    const collection = (fields.collection || '').trim();
    const id = (fields.id || '').trim();
    if (!collection || !id) return redirect('/admin?view=documents&error=Missing%20collection%2Fid');

    try {
      await deleteDocument({ collection, id });
      return redirect(`/admin?view=documents&collection=${encodeURIComponent(collection)}&notice=${encodeURIComponent(`Document ${id} deleted`)}`);
    } catch (e) {
      console.error('Delete document failed:', e);
      return redirect(`/admin?view=documents&collection=${encodeURIComponent(collection)}&error=${encodeURIComponent('Delete failed')}`);
    }
  })

  .get('*', async ({ request }) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const location = `${url.pathname}${url.search}`;

    try {
      const context = await getRouteContext(path);

      // Attach admin context only for /admin
      if (path === '/admin') {
        context.admin = await buildAdminContext({ searchParams: url.searchParams });
      }

      const { html, meta } = await renderPage(location, context);
      const body = renderHtmlTemplate({ html, meta, site: context.site, assets: context.assets });
      return body;
    } catch (error) {
      console.error('SSR error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  });

(async function bootstrap() {
  // Warm cache and persist to adapters if configured
  if (SYNC_ON_BOOT) {
    await syncAllData().catch((error) => console.warn('Sync on bootstrap failed:', error));
  } else {
    console.log('⏭️  SYNC_ON_BOOT=false: skipping initial GraphQL sync');
  }
  await getBaseContext().catch((error) => console.warn('Warm cache failed:', error));
  app.listen({ port: PORT });
  console.log(`🚀 SSR server running at http://localhost:${PORT}`);
})();
