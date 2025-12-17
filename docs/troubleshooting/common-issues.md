# Common Issues

Solutions to frequently encountered problems with SSR-Starter.

## Installation Issues

### "Bun command not found"

**Problem**: Bun runtime is not installed or not in PATH.

**Solution**:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (restart terminal or run)
source ~/.bashrc

# Verify installation
bun --version

# Alternative: Use Node.js
npm install
npm run build  # instead of bun run build
```

### "GraphQL endpoint not configured"

**Problem**: Missing `GRAPHQL_ENDPOINT` environment variable.

**Solutions**:

```bash
# Set environment variable
export GRAPHQL_ENDPOINT=https://your-site.com/graphql

# Or create .env file
echo "GRAPHQL_ENDPOINT=https://your-site.com/graphql" > .env

# Or inline with command
GRAPHQL_ENDPOINT=https://your-site.com/graphql bun run dev
```

### "GraphQL API not accessible"

**Problem**: Cannot connect to GraphQL endpoint.

**Check WordPress setup**:

1. **Install WPGraphQL plugin**:
   ```bash
   # Via WP-CLI
   wp plugin install wp-graphql --activate
   ```

2. **Verify GraphQL endpoint**:
   ```bash
   curl -X POST https://your-site.com/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ posts { nodes { id } } }"}'
   ```

3. **Check CORS settings**:
   - Go to WordPress Admin → GraphQL → Settings
   - Enable CORS
   - Add your domain to "Allowed Origins"

4. **Test with different query**:
   ```bash
   curl -X POST https://your-site.com/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ generalSettings { title } }"}'
   ```

## Development Issues

### "Port 3000 already in use"

**Problem**: Another process is using port 3000.

**Solutions**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 bun run dev
```

### "Hot reload not working"

**Problem**: Changes to files don't trigger browser refresh.

**Solutions**:

```bash
# Ensure you're using dev command
bun run dev  # Not bun run server:dev

# Check file watching
DEBUG=true bun run dev

# Clear cache and restart
rm -rf node_modules/.cache
bun install
bun run dev
```

### "Styles not updating"

**Problem**: CSS changes not reflected in browser.

**Solutions**:

```bash
# Rebuild styles
bun run tailwind:build

# Use watch mode for development
bun run tailwind:watch

# Clear browser cache
# Hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
```

## Build Issues

### "Build failed: Cannot resolve module"

**Problem**: Missing dependencies or module resolution issues.

**Solutions**:

```bash
# Clean install
rm -rf node_modules bun.lock
bun install

# Check for circular dependencies
bun run build --verbose

# Verify TypeScript types
bun run tsc --noEmit
```

### "Out of memory during build"

**Problem**: Build process runs out of memory.

**Solutions**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Build in smaller chunks
bun run tailwind:build
bun run client:build
```

### "Assets not found after build"

**Problem**: Static assets missing after build.

**Solutions**:

```bash
# Check build output
ls -la dist/

# Rebuild completely
rm -rf dist/
bun run build

# Verify asset paths
cat dist/entry-client.js | head -10
```

## Runtime Issues

### "Internal Server Error"

**Problem**: 500 error in browser or API calls.

**Debug steps**:

```bash
# Check server logs
bun run dev

# Test health endpoint
curl http://localhost:3000/health

# Check GraphQL connectivity
curl -X POST $GRAPHQL_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id } } }"}'

# Enable debug logging
DEBUG=true bun run dev
```

### "Page loads but shows no content"

**Problem**: SSR works but content is empty.

**Check data flow**:

```bash
# Test API endpoint
curl "http://localhost:3000/api/posts?page=1&limit=5"

# Check data synchronization
curl http://localhost:3000/health

# Verify storage adapter
ls -la data/json/full.json  # If using JsonDB
```

### "Slow page loads"

**Problem**: Pages take too long to load.

**Performance checks**:

```bash
# Test response time
time curl http://localhost:3000/

# Check cache status
curl http://localhost:3000/health

# Profile with debug
DEBUG=true bun run dev
```

## Storage Issues

### "LMDB adapter failed"

**Problem**: Cannot read/write LMDB database.

**Solutions**:

```bash
# Check permissions
ls -la data/
chmod 755 data/

# Clear corrupted database
rm -rf data/db/
bun run build  # Re-sync data

# Use alternative storage
MAINDB=JsonDB bun run dev
```

### "IndexedDB not working"

**Problem**: Browser storage issues.

**Check browser compatibility**:

- IndexedDB requires modern browsers
- Check for private browsing mode
- Verify CORS settings for assets

```javascript
// Test in browser console
if (!window.indexedDB) {
  console.error('IndexedDB not supported');
}
```

### "JSON storage file corrupted"

**Problem**: JSON data file is malformed.

**Solutions**:

```bash
# Remove corrupted file
rm data/json/full.json

# Re-sync data
bun run build

# Check file permissions
chmod 644 data/json/full.json
```

## Deployment Issues

### "Container won't start"

**Problem**: Docker container fails to start.

**Debug steps**:

```bash
# Check container logs
docker logs <container-name>

# Run container interactively
docker run -it --rm ssr-starter /bin/sh

# Test build in container
docker build --progress=plain -t ssr-starter .
```

### "Environment variables not working"

**Problem**: Container ignores environment variables.

**Solutions**:

```bash
# Check variable syntax
docker run -e GRAPHQL_ENDPOINT=https://api.com/graphql ssr-starter

# Use .env file
docker run --env-file .env ssr-starter

# Debug inside container
docker run -it ssr-starter /bin/sh -c 'echo $GRAPHQL_ENDPOINT'
```

### "Static files not loading"

**Problem**: CSS/JS assets return 404.

**Check deployment**:

```bash
# Verify files exist
docker run -it ssr-starter ls -la dist/

# Check file permissions
docker run -it ssr-starter chmod 644 dist/*

# Test asset URLs
curl -I http://your-domain.com/styles.css
```

## GraphQL Issues

### "GraphQL query failed"

**Problem**: GraphQL returns errors.

**Debug GraphQL**:

```bash
# Test simple query
curl -X POST $GRAPHQL_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id title } } }"}'

# Check for authentication requirements
curl -X POST $GRAPHQL_ENDPOINT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id } } }"}'

# Verify WPGraphQL version
wp plugin list | grep wp-graphql
```

### "CORS errors in browser"

**Problem**: Browser blocks GraphQL requests.

**Fix CORS in WordPress**:

1. **Install WPGraphQL CORS plugin**:
   ```bash
   wp plugin install wp-graphql-cors --activate
   ```

2. **Configure CORS settings**:
   ```php
   // wp-config.php
   define('GRAPHQL_CORS_ALLOWED_ORIGINS', ['https://your-domain.com']);
   ```

3. **Test CORS**:
   ```bash
   curl -H "Origin: https://your-domain.com" \
        -X POST $GRAPHQL_ENDPOINT \
        -H "Content-Type: application/json" \
        -d '{"query": "{ posts { nodes { id } } }"}' \
        -v
   ```

## Performance Issues

### "High memory usage"

**Problem**: Application consumes too much RAM.

**Optimization steps**:

```bash
# Check memory usage
curl http://localhost:3000/health

# Reduce cache size
MAX_CACHE_SIZE=50 bun run dev

# Use lighter storage
MAINDB=JsonDB bun run dev

# Monitor with debug
DEBUG=memory bun run dev
```

### "Slow initial load"

**Problem**: First page load is slow.

**Performance fixes**:

```bash
# Enable caching
CACHE_TTL=3600 bun run dev

# Pre-warm cache
curl http://localhost:3000/ > /dev/null
curl http://localhost:3000/blog > /dev/null

# Use CDN for assets
S3_ASSETS_URL=https://cdn.your-domain.com bun run dev
```

## Testing Issues

### "Tests fail randomly"

**Problem**: Tests are flaky or fail intermittently.

**Fix test stability**:

```bash
# Run tests with verbose output
bun test --verbose

# Check for race conditions
bun test --run --reporter=verbose

# Use different test database
TEST_MAINDB=JsonDB bun test
```

### "E2E tests can't find elements"

**Problem**: Playwright/Cypress can't locate page elements.

**Fix test selectors**:

```typescript
// Use data attributes instead of CSS classes
<button data-testid="submit-button">Submit</button>

// Test with SSR content
await page.waitForSelector('[data-testid="post-title"]');
```

## Advanced Troubleshooting

### "Debug logging not working"

**Enable comprehensive logging**:

```bash
# All debug flags
DEBUG=* bun run dev

# Specific components
DEBUG=ssr:render,ssr:cache,ssr:storage bun run dev

# Save logs to file
bun run dev 2>&1 | tee debug.log
```

### "Memory leaks"

**Profile memory usage**:

```bash
# Use Node.js inspector
node --inspect --max-old-space-size=4096 server/index.ts

# Monitor with clinic.js
bunx clinic heapprofiler -- bun run dev

# Check for circular references
DEBUG=memory bun run dev
```

### "Database corruption"

**Recover from corruption**:

```bash
# Backup current data
cp -r data/ data.backup/

# Clear corrupted data
rm -rf data/db/ data/json/

# Re-sync from GraphQL
bun run build

# Verify data integrity
curl http://localhost:3000/health
```

## Getting Help

### Information to provide when asking for help:

1. **Environment details**:
   ```bash
   bun --version
   node --version
   uname -a
   ```

2. **Configuration**:
   ```bash
   cat .env  # (sanitize sensitive data)
   ```

3. **Error logs**:
   ```bash
   bun run dev 2>&1 | head -50
   ```

4. **System resources**:
   ```bash
   df -h
   free -h
   ```

5. **Network connectivity**:
   ```bash
   curl -I $GRAPHQL_ENDPOINT
   ping your-site.com
   ```

### Community Support

- **GitHub Issues**: [Report bugs](https://github.com/buildy-ui/ssr-starter/issues)
- **Discussions**: [Ask questions](https://github.com/buildy-ui/ssr-starter/discussions)
- **Discord**: Join our community server

### Commercial Support

For enterprise support and custom development:
- Email: support@your-org.com
- Schedule: [Book a consultation](https://calendly.com/your-org)
