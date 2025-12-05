FROM oven/bun:1 as base

WORKDIR /app

# Install dependencies (cached by lockfile)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

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

