FROM oven/bun:1 as base

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

ENV NODE_ENV=production

# Build assets (data sync + Tailwind + client bundle)
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "server/index.ts"]

