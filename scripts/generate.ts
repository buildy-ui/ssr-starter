// bun scripts/generate

import { RouteToStatic } from './routeToStatic'

const generator = new RouteToStatic({
  outputDir: './www/html',
  stylesPath: './dist/styles.css',
  entryClientPath: './dist/entry-client.js',
  entryClientMapPath: './dist/entry-client.js.map',
  assetsDir: './src/assets',
  syncBefore: true,
  cleanOutput: true,
  blogPageSize: 3,
})

await generator.generateAll()