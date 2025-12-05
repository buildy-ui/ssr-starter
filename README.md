# UI8Kit SSR Starter (Elysia + LMDB + GraphQL)

A Bun-powered SSR starter that pairs an Elysia HTTP server with React, hydrated on the client, and an LMDB-backed cache fed by a WordPress GraphQL API.

## How it works
- **Server-rendered React via Elysia:** `server/index.ts` streams pre-rendered HTML, serves the client bundle, styles, and static assets, and exposes `/health`.
- **GraphQL → LMDB cache:** `server/sync.ts` pulls content from `GRAPHQL_ENDPOINT` (WordPress GraphQL), normalizes it, and stores posts, categories, tags, authors, and meta in `data/db` via LMDB. Cached data is read through `dbOperations` for fast render contexts.
- **Hydration on the client:** The server serializes `window.__RENDER_CONTEXT__` into the HTML shell; `src/entry-client.tsx` hydrates the same tree with `hydrateRoot`, reusing the render context and theme providers.
- **Client bundle:** Built with `bun build src/entry-client.tsx --outdir dist --minify --target=browser --sourcemap`. Served as `/entry-client.js` (+ source map) by the Elysia server.
- **Tailwind CSS v4 CLI:** `bunx @tailwindcss/cli` compiles `src/assets/css/index.css` into `dist/styles.css`, which the server serves at `/styles.css`.
- **Build pipeline:** `bun run build` runs `build.ts` (data sync), then Tailwind, then the browser bundle—everything required for production assets to live in `dist/`.

## Scripts (package.json)
- `bun run tailwind:build` — one-off Tailwind compile to `dist/styles.css`.
- `bun run tailwind:watch` — watch mode for Tailwind during local dev.
- `bun run client:build` — bundle the hydrated client entry for the browser.
- `bun run build` — sync data, build styles, and build the client bundle.
- `bun run dev` — run `build`, then start the Elysia server with watch mode.
- `bun run server:dev` — watch-only server (assumes assets are already built).
- `bun run start` — production start (expects built assets in `dist/`).

## Environment
Copy `env.example` and set `GRAPHQL_ENDPOINT` to your WordPress GraphQL URL. Without it, sync is skipped and defaults are used.

## Local development
1) Install Bun (`curl -fsSL https://bun.sh/install | bash`), then `bun install`.
2) Set `GRAPHQL_ENDPOINT` (e.g., via `.env`).
3) Build once: `bun run build` (or `bun run tailwind:watch` + `bun run client:build` for incremental work).
4) Start the server: `bun run dev` (watch) or `bun run server:dev` if assets are prebuilt.

## Deployment
Use the provided `docker-compose.yml` (and `Dockerfile`) to build and run with Bun:
- Set `GRAPHQL_ENDPOINT` in your deployment UI.
- Run `docker compose up --build` locally, or let your platform build from the repo. The image installs Bun deps, runs the full build pipeline, and starts `server/index.ts` on port 3000.

## More documentation
See the `.project` directory for in-depth guides, including LMDB/GraphQL integration and migration notes.

