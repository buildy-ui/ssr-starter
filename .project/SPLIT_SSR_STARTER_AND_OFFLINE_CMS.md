# Split Plan: `ssr-starter` + `offline-cms` (Vite SPA) + optional `:5001/graphql`

This document is a **step-by-step execution plan** to split the current repo into two apps:

- **`ssr-starter`**: SSR website (Bun + Elysia + React Router SSR) that *consumes* `GRAPHQL_ENDPOINT`
- **`offline-cms`**: a typical **Vite SPA** admin UI + a backend that can expose `http://localhost:5001/graphql`

Important constraints:

- You want to **keep the current code in a separate branch**, but **roll back** the main branch to a version **before Admin existed**.
- You want **two scenarios**:
  1) Simple data copy (manual or scripts): copy LMDB + JSON files between apps
  2) `offline-cms` runs a GraphQL endpoint on **`:5001/graphql`** that is **compatible with WP GraphQL** (at least for the queries your SSR uses), so SSR can point `GRAPHQL_ENDPOINT` to it.

This plan is designed so you can execute it, then easily revert.

---

## 0) Pre-flight: identify the rollback point (pre-Admin)

- **Create two branches**:
  - `feature/offline-cms-admin` → keep the current Admin work
  - `main` (or `develop`) → will be rolled back to pre-Admin

Steps:

1. Commit everything you want to keep in `feature/offline-cms-admin`.
2. Find the last commit **before** Admin was introduced.
3. Reset your main branch to that commit.

Notes:

- Do not delete anything yet; just separate histories.

---

## 1) Target folder structure (single repo, two apps)

You said this might become a monorepo later, but for now you want copy/paste-friendly structure.

Recommended structure (single repo):

```
repo-root/
  apps/
    ssr-starter/
      server/
      src/
      dist/
      package.json
      bun.lockb
      .env.example
      data/                      # local runtime files (LMDB/flexible)
      src/data/json/full.json    # legacy json store location remains the same
    offline-cms/
      web/                       # Vite SPA (React)
      api/                       # GraphQL backend (Bun/Elysia)
      package.json               # optional workspace root, or separate package.json per folder
      .env.example
      data/
        flexible-db/             # flexible lmdb path
        flexible-json-db.json    # flexible json file
        graphql-cache/           # optional response cache for reverse-proxy mode
```

If you prefer 2 separate repos, treat `apps/ssr-starter` and `apps/offline-cms` as separate repo roots.

---

## 2) Current data paths to preserve (important)

These are the **current** locations that exist today and must be respected during copying:

### SSR legacy JSON store (WordPress collections)

- **File**: `src/data/json/full.json`
- Used by: `server/storage/adapter.json.ts`

### Flexible storage (Admin / custom collections)

- **Flexible LMDB path**: `./data/flexible-db`
  - Used by: `server/storage/adapter.flexible.lmdb.ts`
- **Flexible JSON file**: `./data/flexible-json-db.json`
  - Used by: `server/storage/adapter.flexible.json.ts`

### Legacy LMDB (WordPress collections)

- Legacy LMDB is **not** a single file here; it is implemented via `server/db` (`dbOperations`).
- If you use legacy LMDB in production, you must locate the underlying LMDB path used by `server/db` before moving.
  - Search in repo for `open({ path:` in `server/db/**`.

---

## 3) Scenario 1 — Simple copy/paste of DB files (no API coupling)

Goal: `offline-cms` manages flexible storage; `ssr-starter` stays SSR and reads WP data from its own adapters.

### 3.1 `offline-cms` owns flexible storage

- `offline-cms` stores:
  - `data/flexible-db/` (LMDB)
  - `data/flexible-json-db.json`

### 3.2 Migration method A: manual

When you want to copy state from one app to the other:

- Copy folder:
  - `data/flexible-db/` → target `data/flexible-db/`
- Copy file:
  - `data/flexible-json-db.json` → target `data/flexible-json-db.json`

### 3.3 Migration method B: scripts (recommended later)

Plan scripts (don’t implement yet if you want no code changes now):

- `scripts/export-flexible.sh` / `scripts/export-flexible.ps1`
  - zips `data/flexible-db/` + `data/flexible-json-db.json`
- `scripts/import-flexible.sh` / `scripts/import-flexible.ps1`
  - restores them into another app directory

---

## 4) Scenario 2 — `offline-cms` provides `:5001/graphql` compatible with WP GraphQL

Goal: SSR points `GRAPHQL_ENDPOINT=http://localhost:5001/graphql` and gets “the same” GraphQL API as WP.

You asked explicitly:

> задача возвращать 5001:/graphql эндпоинт идентичный текущему из WP GraphQL

Re-implementing full WPGraphQL is huge; the practical way is **reverse-proxy + cache**:

- When online: proxy any query to WPGraphQL and cache the **raw JSON response**.
- When offline: serve the cached response for the same `(query, variables)` key.

This preserves “identical” output for any query SSR has already executed at least once while online.

### 4.1 `offline-cms` backend responsibilities

- Listen on `PORT=5001`
- Expose:
  - `POST /graphql` (same as WPGraphQL endpoint shape)
  - Optional: `GET /health`

### 4.2 Reverse-proxy/cache algorithm

For each incoming GraphQL request:

1. Compute cache key: `sha256(query + JSON.stringify(variables))`
2. If upstream WP is reachable:
   - Forward request to real WP `UPSTREAM_GRAPHQL_ENDPOINT`
   - Save **response JSON** into `data/graphql-cache/<key>.json`
   - Return response to client
3. If upstream is down/offline:
   - If `data/graphql-cache/<key>.json` exists: return it (200)
   - Else: return GraphQL error payload (still 200, but `{ errors: [...] }`)

### 4.3 How flexible DB fits GETMODE

In `GRAPHQL_MODE=GETMODE`:

- WordPress content is read-only from GraphQL.
- New CMS data you create (e.g. `products`) is written to local flexible storage.

In Scenario 2, you have two options:

- **Option A (simple)**: `/graphql` only proxies/caches WPGraphQL. Custom collections (e.g. `products`) are accessed via a separate REST/JSON API.
- **Option B (advanced)**: extend the GraphQL endpoint with additional root fields for custom collections.
  - This will no longer be strictly identical to WPGraphQL (schema adds extra fields), but still compatible for WP queries.

Given your “identical” requirement, start with **Option A**.

---

## 5) What files belong to which app (copy list)

### 5.1 `ssr-starter` app should keep

- `server/` (SSR Elysia)
- `src/` (React routes/layouts/ui)
- `docs/` (optional, or keep in repo root)
- `.project/` (optional, or keep in repo root)
- `package.json`, `bun.lockb`
- `dist/` build outputs (optional in repo)

Data:

- Keep `src/data/json/full.json` if you rely on JsonDB for offline SSR.

### 5.2 `offline-cms` app should contain (new)

Web (Vite SPA):

- `apps/offline-cms/web/`
  - `index.html`
  - `vite.config.ts`
  - `src/main.tsx`
  - `src/App.tsx`
  - `src/routes/*` (admin pages)
  - `src/lib/api.ts` (calls `:5001/graphql` + local endpoints)

API (GraphQL backend):

- `apps/offline-cms/api/`
  - `server.ts` (Elysia bootstrap on `:5001`)
  - `graphql/proxy.ts` (proxy/cache logic)
  - `storage/` (flexible adapters for `products` etc)

Data:

- `apps/offline-cms/data/flexible-db/`
- `apps/offline-cms/data/flexible-json-db.json`
- `apps/offline-cms/data/graphql-cache/`

---

## 6) Environment variables (two apps)

### 6.1 `ssr-starter` `.env`

- `PORT=3000`
- `GRAPHQL_ENDPOINT=http://localhost:5001/graphql`  (Scenario 2)
- `GRAPHQL_MODE=GETMODE`
- `MAINDB=LMDB|JsonDB|FALSE`
- `BACKUPDB=JsonDB|LMDB|FALSE`
- `SYNC_ON_BOOT=true|false`

### 6.2 `offline-cms` API `.env`

- `PORT=5001`
- `UPSTREAM_GRAPHQL_ENDPOINT=https://your-wp-site/graphql`
- `CACHE_DIR=./data/graphql-cache`
- `MAINDB=LMDB|JsonDB`  (for flexible local writes)
- `BACKUPDB=JsonDB|FALSE`

---

## 7) Execution steps (do this once)

### Step A — Create the new folder layout

1. Create `apps/ssr-starter/` and move the current SSR code there (or copy).
2. Create `apps/offline-cms/web` (Vite) and `apps/offline-cms/api`.

### Step B — Wire Scenario 1 (data copy)

1. Run SSR normally.
2. Run offline-cms web separately.
3. Copy `data/flexible-db/` and `data/flexible-json-db.json` as needed.

### Step C — Wire Scenario 2 (`:5001/graphql`)

1. Start offline-cms API on `:5001`
2. Point SSR to it:
   - `GRAPHQL_ENDPOINT=http://localhost:5001/graphql`
3. Verify SSR pages render.
4. Verify that when WP is online, SSR triggers cache fills; when WP is offline, cached queries still work.

---

## 8) Rollback plan (the “simple revert” you want)

1. Keep current Admin implementation in `feature/offline-cms-admin`.
2. Reset main branch to the pre-Admin commit.
3. Create `apps/offline-cms` separately from that clean base.
4. Cherry-pick only the files you want to reuse in offline-cms (UI patterns, adapters) from the Admin branch.

---

## 9) Checklist (you can tick off)

- [ ] Branch `feature/offline-cms-admin` contains current admin work
- [ ] Main branch reset to pre-Admin commit
- [ ] `apps/ssr-starter` builds and runs
- [ ] `apps/offline-cms/web` builds (Vite)
- [ ] Scenario 1: can copy flexible DB files and see them in offline-cms
- [ ] Scenario 2: `POST :5001/graphql` proxies WP and caches responses
- [ ] SSR points `GRAPHQL_ENDPOINT` to `:5001/graphql` and renders online/offline


