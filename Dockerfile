# syntax=docker/dockerfile:1.4
FROM oven/bun:1

WORKDIR /app

# Copy all source files first
COPY . .

# Install dependencies
RUN bun install

# Set environment
ARG GRAPHQL_ENDPOINT
ARG S3_ASSETS_URL
ENV NODE_ENV=production \
    PORT=3000 \
    GRAPHQL_ENDPOINT=${GRAPHQL_ENDPOINT} \
    S3_ASSETS_URL=${S3_ASSETS_URL}

# Build assets (data sync + Tailwind + client bundle)
RUN bun run build

# Verify the build output exists
RUN ls -la dist/

EXPOSE 3000

CMD ["bun", "run", "start"]
