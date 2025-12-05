# syntax=docker/dockerfile:1.4
FROM oven/bun:1 as base

WORKDIR /app

# Install dependencies (uses bun.lock if present)
RUN --mount=type=bind,source=.,target=/src,readonly \
    --mount=type=cache,target=/root/.bun \
    cp /src/package.json ./ && \
    if [ -f /src/bun.lock ]; then cp /src/bun.lock ./bun.lock; bun install --frozen-lockfile; else bun install; fi

# Copy source
COPY . .

ARG GRAPHQL_ENDPOINT
ENV NODE_ENV=production \
    PORT=3000 \
    GRAPHQL_ENDPOINT=${GRAPHQL_ENDPOINT}

# Build assets (data sync + Tailwind + client bundle)
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]

