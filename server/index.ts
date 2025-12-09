import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { renderPage } from './render';
import { dbOperations } from './db';
import { syncAllData } from './sync';

const STYLES_PATH = './dist/styles.css';
const PORT = Number(process.env.PORT ?? 3000);

const template = (payload: { html: string; meta: { title: string; description: string; canonical: string; ogTitle?: string; ogDescription?: string }; site: { lang?: string; charset?: string }; assets: { s3AssetsUrl: string } }) => {
  const { html, meta, site, assets } = payload;
  const lang = site?.lang ?? 'en';
  const charset = site?.charset ?? 'UTF-8';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="${charset}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <meta property="og:title" content="${meta.ogTitle ?? meta.title}" />
  <meta property="og:description" content="${meta.ogDescription ?? meta.description}" />
  <link rel="canonical" href="${meta.canonical}" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjlkZTgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1hdG9tLWljb24gbHVjaWRlLWF0b20iPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEiLz48cGF0aCBkPSJNMjAuMiAyMC4yYzIuMDQtMi4wMy4wMi03LjM2LTQuNS0xMS45LTQuNTQtNC41Mi05Ljg3LTYuNTQtMTEuOS00LjUtMi4wNCAyLjAzLS4wMiA3LjM2IDQuNSAxMS45IDQuNTQgNC41MiA5Ljg3IDYuNTQgMTEuOSA0LjVaIi8+PHBhdGggZD0iTTE1LjcgMTUuN2M0LjUyLTQuNTQgNi41NC05Ljg3IDQuNS0xMS45LTIuMDMtMi4wNC03LjM2LS4wMi0xMS45IDQuNS00LjUyIDQuNTQtNi41NCA5Ljg3LTQuNSAxMS45IDIuMDMgMi4wNCA3LjM2LjAyIDExLjktNC41WiIvPjwvc3ZnPg==" />
  <link rel="preload" href="${assets.s3AssetsUrl}/fonts/nunito/cyrillic.italic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${assets.s3AssetsUrl}/fonts/nunito/latin.italic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${assets.s3AssetsUrl}/fonts/nunito/cyrillic.normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${assets.s3AssetsUrl}/fonts/nunito/latin.normal.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face {
      font-family: 'Nunito';
      font-style: italic;
      font-weight: 200 1000;
      font-display: swap;
      src: url('${assets.s3AssetsUrl}/fonts/nunito/cyrillic.italic.woff2') format('woff2');
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }
    @font-face {
      font-family: 'Nunito';
      font-style: italic;
      font-weight: 200 1000;
      font-display: swap;
      src: url('${assets.s3AssetsUrl}/fonts/nunito/latin.italic.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Nunito';
      font-style: normal;
      font-weight: 200 1000;
      font-display: swap;
      src: url('${assets.s3AssetsUrl}/fonts/nunito/cyrillic.normal.woff2') format('woff2');
      unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
    }
    @font-face {
      font-family: 'Nunito';
      font-style: normal;
      font-weight: 200 1000;
      font-display: swap;
      src: url('${assets.s3AssetsUrl}/fonts/nunito/latin.normal.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
  </style>
  <script>!function(){const e=localStorage.getItem("ui:dark");let t=!1;null!==e?t="1"===e:window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches&&(t=!0),t?(document.documentElement.classList.add("dark"),document.documentElement.style.colorScheme="dark"):(document.documentElement.classList.remove("dark"),document.documentElement.style.colorScheme="light")}();</script>
  <link rel="stylesheet" href="/styles.css" />
  <script type="module" src="/entry-client.js"></script>
</head>
<body>
  <div id="root">${html}</div>
</body>
</html>`;
};

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
      const body = template({ html, meta, site: context.site, assets: context.assets });
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
