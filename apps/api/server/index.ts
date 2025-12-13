import { Elysia } from 'elysia';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { createHash } from 'crypto';

type GraphQLRequest = {
  query?: string;
  variables?: Record<string, any>;
  operationName?: string | null;
};

const PORT = Number(process.env.PORT ?? 5001);
const UPSTREAM = process.env.UPSTREAM_GRAPHQL_ENDPOINT || process.env.GRAPHQL_ENDPOINT;
const CACHE_DIR = resolve(process.env.CACHE_DIR || './data/graphql-cache');
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': CORS_ORIGIN,
      'access-control-allow-headers': 'content-type, authorization',
      'access-control-allow-methods': 'POST, OPTIONS',
      ...extraHeaders,
    },
  });
}

function cacheKey(payload: GraphQLRequest): string {
  const query = payload.query || '';
  const variables = payload.variables ? JSON.stringify(payload.variables) : '';
  const op = payload.operationName || '';
  return createHash('sha256').update(query).update('|').update(variables).update('|').update(op).digest('hex');
}

async function readCache(key: string): Promise<any | null> {
  const filePath = join(CACHE_DIR, `${key}.json`);
  if (!existsSync(filePath)) return null;
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeCache(key: string, responseJson: any) {
  const filePath = join(CACHE_DIR, `${key}.json`);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(responseJson, null, 2), 'utf8');
}

async function forwardToUpstream(body: GraphQLRequest) {
  if (!UPSTREAM) throw new Error('UPSTREAM_GRAPHQL_ENDPOINT is not configured');

  const res = await fetch(UPSTREAM, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(async () => ({
    errors: [{ message: `Upstream returned non-JSON payload (${res.status})` }],
  }));

  return { status: res.status, json };
}

const app = new Elysia()
  .get('/health', async () => {
    return {
      ok: true,
      port: PORT,
      upstream: UPSTREAM ? 'configured' : 'missing',
      cacheDir: CACHE_DIR,
    };
  })
  .options('/graphql', async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': CORS_ORIGIN,
        'access-control-allow-headers': 'content-type, authorization',
        'access-control-allow-methods': 'POST, OPTIONS',
      },
    });
  })
  .post('/graphql', async ({ request }) => {
    const payload = (await request.json().catch(() => ({}))) as GraphQLRequest;
    const key = cacheKey(payload);

    // 1) Try upstream first (online)
    try {
      const upstreamRes = await forwardToUpstream(payload);

      // Cache only when upstream is OK-ish. WPGraphQL can return 200 with errors; still cache it to be identical later.
      await writeCache(key, upstreamRes.json).catch(() => undefined);

      return jsonResponse(upstreamRes.json, 200, {
        'x-cache': 'MISS',
        'x-upstream-status': String(upstreamRes.status),
        'x-cache-key': key,
      });
    } catch (error) {
      // 2) Offline fallback from cache
      const cached = await readCache(key).catch(() => null);
      if (cached) {
        return jsonResponse(cached, 200, {
          'x-cache': 'HIT',
          'x-cache-key': key,
        });
      }

      // 3) Cache miss: return GraphQL-style error payload (still 200 for GraphQL compatibility)
      return jsonResponse(
        {
          errors: [
            {
              message: 'Upstream GraphQL is unavailable and cache miss occurred for this query.',
              extensions: { code: 'OFFLINE_CACHE_MISS', cacheKey: key },
            },
          ],
        },
        200,
        { 'x-cache': 'MISS', 'x-cache-key': key }
      );
    }
  });

app.listen({ port: PORT });
console.log(`🚀 offline-cms GraphQL proxy running at http://localhost:${PORT}/graphql`);


