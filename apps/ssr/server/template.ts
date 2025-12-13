import type { MetaPayload } from './render';

export const STYLES_PATH = './dist/styles.css';
export const ENTRY_CLIENT_PATH = './dist/entry-client.js';
export const ENTRY_CLIENT_MAP_PATH = './dist/entry-client.js.map';

export interface TemplatePayload {
  html: string;
  meta: MetaPayload;
  site: { lang?: string; charset?: string };
  assets: { s3AssetsUrl: string };
}

export function renderHtmlTemplate(payload: TemplatePayload): string {
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
}

