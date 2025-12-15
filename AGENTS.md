# AGENTS.md

Agent-focused project context for **ui8kit-ssr-starter** (SSR/SSG + offline-first data adapters).

This file is intentionally concise but complete enough for a coding agent to continue work in a new chat without losing architectural intent. See the AGENTS.md format reference at `https://agents.md/`.

## Project Goals (Current Phase)

- **Offline-first SSR**: The app must run with **zero internet** by reading data from local adapters in priority order.
- **GraphQL optional**: If GraphQL is down/unavailable, the app must *not* crash and must *not* overwrite local databases with empty data.
- **Adapter architecture**: Support switching storage backends via ENV:
  - MAINDB (primary): `LMDB | IndexedDB | ContextDB | JsonDB | FALSE`
  - BACKUPDB (fallback): `LMDB | SQLite | JsonDB | FALSE` (SQLite deferred for now)
  - Server-side mapping: `IndexedDB/ContextDB/JsonDB` → JSON file storage (`src/data/json/full.json`).
- **Performance**: Route-specific context slicing so SSR renders only necessary data per route.
- **Documentation-first**: Every meaningful change should be reflected in `docs/` and `.project/` guides.

## Tech Stack

- **Runtime**: Bun
- **Server**: Elysia
- **UI**: React + React Router
- **Rendering**: SSR + optional SSG (static generation scripts)
- **Data Source**: WordPress GraphQL (read-only today; full CRUD planned later)
- **Local Storage (server-side)**:
  - **LMDB** (fast embedded KV)
  - **JSON** (offline backup / IndexedDB surrogate for server-side)
- **UI Kit**: UI8Kit (see `src/components/ui8kit.ts` and component usage throughout routes)

## Repository Map (High-Signal)

- **Server**
  - `server/index.ts`: Elysia server bootstrap and routes.
  - `server/sync.ts`: Data fetching + adapter fallback + render context build + route slicing.
  - `server/storage/`: Storage adapter layer.
    - `server/storage/types.ts`: Adapter interfaces/types.
    - `server/storage/adapter.lmdb.ts`: MAINDB/BACKUPDB LMDB adapter.
    - `server/storage/adapter.json.ts`: JSON adapter (server-side IndexedDB/ContextDB surrogate).
    - `server/storage/index.ts`: Adapter factory (`MAINDB`/`BACKUPDB`) + flexible adapter helpers.
- **Client/UI**
  - `src/routes/*`: React routes.
  - `src/data/types.ts`: Shared data types (RenderContext etc).
- **Docs**
  - `docs/README.md`: Documentation entrypoint.
  - `docs/SUMMARY.md`: GitBook navigation.
  - `docs/guides/*`: Architecture & operational guides.
- **Project operator docs**
  - `.project/test-offline-mode.md`: Offline testing scenarios and command checklists.

## Setup / Dev Commands (Bun)

From repo root:

- **Install**: `bun install`
- **Build CSS + client bundle**: `bun run build`
- **Dev (build + watch server)**: `bun run dev`
- **Server only (watch)**: `bun run server:dev`

The authoritative scripts are in `package.json`.

## Runtime Modes (ENV)

### Storage selection

- **MAINDB**: primary storage for reads/writes after initial fetch
  - `MAINDB=LMDB` → uses LMDB adapter
  - `MAINDB=IndexedDB|ContextDB|JsonDB` → uses JSON adapter (`src/data/json/full.json`)
  - `MAINDB=FALSE` → no persistent local main storage
- **BACKUPDB**: fallback storage used when MAINDB fails/unavailable
  - `BACKUPDB=LMDB|JsonDB|FALSE` (SQLite is deferred)

### GraphQL behavior

- `GRAPHQL_ENDPOINT`: WordPress GraphQL endpoint.
- `GRAPHQL_MODE`: planned sync mode selector
  - `GETMODE` (current): read from GraphQL (when available), store locally
  - `SETMODE` (future): local → GraphQL mutations
  - `CRUDMODE` (future): bidirectional sync

### Boot behavior

- `SYNC_ON_BOOT` (default `true`):
  - `false` skips startup `syncAllData()` calls (useful for offline boots).
- `LOG_DATA_SOURCE` (default `true`):
  - `false` disables “where data came from” startup logs.

## Offline Data Flow (Must Not Break)

Key invariant: **Never overwrite MAINDB/BACKUPDB with empty payloads when GraphQL is unavailable.**

Current desired priority at runtime:

1. **In-memory cache** (warm)
2. **GraphQL** (only when reachable and configured)
3. **MAINDB** (LMDB or JSON)
4. **BACKUPDB** (LMDB or JSON)

When offline:

- server should boot using MAINDB/BACKUPDB
- `SYNC_ON_BOOT=false` is recommended to avoid noisy connection logs

## Context Slicing (SSR Performance)

- The router should receive a **route-specific `RenderContext`**, not the entire dataset.
- `server/sync.ts` builds a base context then uses route slicing for:
  - `/` (home), `/blog/:page`, `/posts/:slug`, `/category/:slug`, `/tag/:slug`, `/author/:slug`, `/search`, etc.

## Testing Checklists (Manual)

See `.project/test-offline-mode.md` for step-by-step commands.

High-value smoke checks:

- **Offline boot**:
  - set `SYNC_ON_BOOT=false`
  - disconnect internet
  - start server, verify `/health` and main pages render
- **Adapter fallback**:
  - corrupt/disable MAINDB, ensure BACKUPDB (JSON) loads
- **Static generation**:
  - run the static generation script(s) and ensure they use adapter-aware data loading (no LMDB hard dependency)

## Coding Conventions

- **Language**: TypeScript
- **Comments**: English only
- **Safety**:
  - Avoid side effects during error handling (especially data persistence).
  - Prefer deterministic logs (single “source of data” line per cold load).
- **Docs-first**: update `docs/` and `.project/` files when behavior changes (env vars, flows, commands).


