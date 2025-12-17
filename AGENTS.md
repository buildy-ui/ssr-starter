# AGENTS.md

Agent-focused project context for **ui8kit-ssr-starter** (SSR app + HTML generator).

This file is intentionally concise but complete enough for a coding agent to continue work in a new chat without losing architectural intent. See the AGENTS.md format reference at `https://agents.md/`.

## Project Goals

- **Simple SSR**: Server-side rendering with React and WordPress GraphQL integration
- **HTML Generation**: Static HTML generation for pages using scripts
- **Clean Architecture**: Simple data flow from GraphQL to SSR rendering
- **Documentation-first**: Every meaningful change should be reflected in `docs/` guides

## Tech Stack

- **Runtime**: Bun
- **Server**: Elysia
- **UI**: React + React Router
- **Rendering**: SSR + static HTML generation
- **Data Source**: WordPress GraphQL
- **UI Kit**: UI8Kit (see `src/components/ui8kit.ts` and component usage throughout routes)

## Repository Map (High-Signal)

- **Server**
  - `server/index.ts`: Elysia server bootstrap and routes.
  - `server/sync.ts`: Data fetching from WordPress GraphQL and render context build.
  - `server/render.tsx`: React SSR rendering utilities.
- **Client/UI**
  - `src/routes/*`: React routes.
  - `src/data/types.ts`: Shared data types (RenderContext etc).
- **Scripts**
  - `scripts/routeToStatic.ts`: HTML generation script.
- **Docs**
  - `docs/README.md`: Documentation entrypoint.
  - `docs/SUMMARY.md`: GitBook navigation.
  - `docs/guides/*`: Architecture & operational guides.

## Setup / Dev Commands (Bun)

From repo root:

- **Install**: `bun install`
- **Build CSS + client bundle**: `bun run build`
- **Dev (build + watch server)**: `bun run dev`
- **Server only (watch)**: `bun run server:dev`

The authoritative scripts are in `package.json`.

## Configuration (ENV)

- `GRAPHQL_ENDPOINT`: WordPress GraphQL endpoint (required)
- `S3_ASSETS_URL`: Base URL for static assets (fonts, images)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Data Flow

- Server fetches data from WordPress GraphQL on startup
- Data is stored in memory for fast SSR rendering
- Each route receives optimized render context

## Testing

- Verify server starts and renders pages correctly
- Test static HTML generation scripts
- Check GraphQL integration with WordPress

## Coding Conventions

- **Language**: TypeScript
- **Comments**: English only
- **Docs-first**: update `docs/` files when behavior changes


