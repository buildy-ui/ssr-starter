# MPA SSR Migration with Bun + Elysia + LmDB

This document is now the playbook for refactoring the current Vite SPA into a **pure Bun-native SSR stack** with no hydration, powered by **Elysia**, **LmDB**, and simple Tailwind CLI builds. Use it alongside the full [SSR guide](SSR_ELYSIA_LMDB_INTEGRATION_GUIDE.md) and the [WordPress GraphQL guide](WORDPRESS_GRAPHQL_INTEGRATION_GUIDE.md).

## Reference guides
- `SSR_ELYSIA_LMDB_INTEGRATION_GUIDE.md` – details the server render flow, LmDB stores, sync script, and render helpers we are replicating in this repo.
- `WORDPRESS_GRAPHQL_INTEGRATION_GUIDE.md` – the GraphQL queries and types to reuse when syncing data from WordPress.
- `index.html` – keeps the SEO `<head>` metadata (charset, viewport, description, keywords, favicon) that the server template must match for every page.
- `src/hooks/useDocumentHead.ts` and `src/components/SEO.tsx` – document the required title/description/og tags; the server render should emit equivalent tags without relying on hydration.

## Migration goals
1. **Full server rendering** for every route (MPA-style) so there is no client-side routing or hydration.
2. **LmDB-backed data access** where `server/sync.ts` pulls WordPress data, normalizes it, and stores it in typed LmDB collections.
3. **Tailwind CLI builds only**: no Vite or PostCSS plugins—just `tailwindcss` commands run pre-flight or in watch mode locally.
4. **Consistent SEO metadata** driven by the normalized data and reused in both `index.html` and the server template, guided by the existing `SEO` component contract.

## Key steps

### A. Data normalization + types
- Replace the `useRenderContext` hook with data-only utilities in `src/data/index.ts` and `src/data/types.ts`. Expose the exact fields (`home`, `about`, `posts`, `categories`, `tags`, `authors`, `site`, `menu`, etc.) that the server expects.
- Provide fallback values so rendering still succeeds while the sync pipeline warms up.

### B. Server stack (Bun + Elysia + React SSR)
- `server/index.ts` boots Elysia, attaches `html()` middleware, and routes requests (`/`, `/blog`, `/posts/:slug`, etc.) to a shared `renderPage` helper.
- `server/render.tsx` uses `react-dom/server` (no React Router) to instantiate the right React/JSX tree for the path, injects data and SEO metadata, and returns a string that the template wraps in `<html>`/`<head>`/`<body>`.
- `server/db.ts` configures LmDB stores and exposes `dbOperations` that return typed data from each store.
- `server/sync.ts` reuses the GraphQL helpers/types alongside the WordPress integration guide to fetch posts/categories/tags/authors/pages and writes them into LmDB. Sync runs as part of `bun run build` (and before dev servers start).

### C. Template + SEO
- Mirror the `<head>` contents from `index.html`, ensuring `<meta charset>`, `<meta viewport>`, `<meta description>`, `<meta keywords>`, favicon, and canonical link tags exist.
- The server render should inject per-page `<title>`, `<meta name="description">`, and Open Graph tags consistent with `src/components/SEO.tsx` – use the normalized context data for these values.
- Keep `SEO.tsx` and `useDocumentHead.ts` as documentation for the meta contract and for any future client-side fallback (e.g., preview mode), but the live site relies on the server template.

### D. Tailwind CLI workflow
1. Install Tailwind CLI (and PostCSS/autoprefixer as needed) via Bun: `bun add -d tailwindcss postcss autoprefixer`.
2. Create `tailwind.config.ts` and `postcss.config.ts` that point to `src/assets/css/**/*.css` and set `content` appropriately.
3. Build styles with `bun exec tailwindcss -i src/assets/css/index.css -o dist/styles.css --minify` before running the server.
4. For local development, run `bun exec tailwindcss -i src/assets/css/index.css -o dist/styles.css --watch` alongside `bun run dev`.
5. Reference the generated `dist/styles.css` in the server template (e.g., `<link rel="stylesheet" href="/styles.css" />`).
6. Document these commands here and in `package.json` under `tailwind:build`/`tailwind:watch`.

## Next steps
1. Keep this file synced with reality as we build `server/index.ts`, `server/db.ts`, `server/sync.ts`, and `server/render.tsx`.
2. Follow the todo order: `doc-update`, `server-setup`, `data-ssr`, `tailwind-check`.
3. After the server and sync are wired, inspect the HTML output (`bun --watch server/index.ts`) and verify `<title>`/`<meta>`/`og:` tags match the `SEO` expectations.
4. Encourage contributors to run the Tailwind CLI (`tailwind:watch`) before starting the Bun dev server so styles are always up-to-date.

# MPA SSR Migration Plan

1. **Refresh documentation** – Update `.project/vite-to-ssr.md` so it describes the new Bun/Elysia/LmDB workflow instead of Vite steps, summarize the SSR guides (`SSR_ELYSIA_LMDB_INTEGRATION_GUIDE.md`, `WORDPRESS_GRAPHQL_INTEGRATION_GUIDE.md`), and explain how Tailwind will be compiled via CLI with the SEO constraints defined in `index.html`, `src/hooks/useDocumentHead.ts`, and `src/components/SEO.tsx`.
2. **Build the Bun/Elysia server stack** – Create `server/index.ts`, `server/db.ts`, `server/sync.ts`, and `server/render.tsx` (or similar) that replace the SPA runtime with static routes, LmDB read caches, and React server rendering that injects SEO meta data via `SEO`/`useDocumentHead`-style data from the normalized `src/data` exports.
3. **Adapt `src/data` for SSR** – Remove client-side hooks and fetch logic; expose synchronous helpers (or pre-synced data loaders) so the server can request `getRenderContext()` data from LmDB, including the existing `normalize()` logic and metadata (site/menu). Provide interfaces in `src/data/types.ts` for all content that matches the SEO expectations.
4. **Tie in Tailwind + templates** – Ensure `index.html` and any new template a) include the SEO meta and script tags expected, and b) rely on a Tailwind CLI build pipeline (no Vite plugins) that can run locally—describe the commands in the plan docs.

### Todos

- `doc-update`: Align the migration guides and `.project/vite-to-ssr.md` with the Bun/Elysia plan, mentioning Tailwind CLI usage and SEO hook requirements.
- `server-setup`: Implement the Bun/Elysia + LmDB server entry/render/sync files plus the new Tailwind build instructions.
- `data-ssr`: Rework `src/data/index.ts`/`types.ts` to be LmDB-friendly, removing hooks and providing the data the server needs for all routes and meta tags.
- `tailwind-check`: Define (and verify) the Tailwind CLI command flow so styling is part of local builds without Vite plugins.