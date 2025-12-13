import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { renderPage } from '../server/render';
import { fetchAllData, buildRenderContext, sliceRouteContext, collectRoutes, getBaseContext } from '../server/sync';
import {
  ENTRY_CLIENT_MAP_PATH,
  ENTRY_CLIENT_PATH,
  STYLES_PATH,
  renderHtmlTemplate,
} from '../server/template';
import type { RenderContext } from '../src/data/types';

type RouteToStaticConfig = {
  outputDir: string;
  stylesPath?: string;
  entryClientPath?: string;
  entryClientMapPath?: string;
  assetsDir?: string;
  cleanOutput?: boolean;
  syncBefore?: boolean;
  blogPageSize?: number;
};

const DEFAULT_CONFIG: Omit<RouteToStaticConfig, 'outputDir'> = {
  stylesPath: STYLES_PATH,
  entryClientPath: ENTRY_CLIENT_PATH,
  entryClientMapPath: ENTRY_CLIENT_MAP_PATH,
  assetsDir: './src/assets',
  cleanOutput: true,
  syncBefore: true,
  blogPageSize: 3,
};

export class RouteToStatic {
  private config: RouteToStaticConfig;

  constructor(initial?: Partial<RouteToStaticConfig>) {
    this.config = { outputDir: './www/html', ...DEFAULT_CONFIG, ...initial };
  }

  configure(next: Partial<RouteToStaticConfig>): this {
    this.config = { ...this.config, ...next };
    return this;
  }

  async generateAll(): Promise<void> {
    const cfg = this.config;
    if (!cfg.outputDir) {
      throw new Error('outputDir is required');
    }

    // Fetch fresh data from GraphQL (force) and build base context
    const collections = await fetchAllData().catch(async (error) => {
      console.warn('⚠️  Fetch before static generation failed, trying cached context.', error);
      return null;
    });

    const baseContext = collections ? buildRenderContext(collections) : await getBaseContext();
    const routes = collectRoutes(baseContext, this.config.blogPageSize ?? DEFAULT_CONFIG.blogPageSize ?? 3);

    this.prepareOutputDir(cfg.outputDir, cfg.cleanOutput ?? true);

    for (const route of routes) {
      const routeContext = sliceRouteContext(route, baseContext);
      await this.renderAndWriteRoute(route, routeContext, cfg.outputDir);
      this.writeJsonSlice(route, routeContext);
    }

    this.writeJsonSlice('full', baseContext);
    this.copyStaticAssets(cfg);
    console.log(`✅ Static HTML generated for ${routes.length} routes in ${resolve(cfg.outputDir)}`);
  }

  private prepareOutputDir(outputDir: string, clean: boolean) {
    const absOutput = resolve(outputDir);
    if (clean && existsSync(absOutput)) {
      rmSync(absOutput, { recursive: true, force: true });
    }
    mkdirSync(absOutput, { recursive: true });
  }

  private async renderAndWriteRoute(route: string, context: RenderContext, outputDir: string) {
    const { html, meta } = await renderPage(route, context);
    const document = renderHtmlTemplate({
      html,
      meta,
      site: context.site,
      assets: context.assets,
    });

    const targetPath = this.routeToFilePath(outputDir, route);
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, document, 'utf8');
    console.log(`✅ ${route} -> ${targetPath}`);
  }

  private routeToFilePath(outputDir: string, route: string): string {
    const normalized = route === '/' ? '/' : route.replace(/\/+$/, '');
    if (normalized === '/') {
      return join(outputDir, 'index.html');
    }
    const clean = normalized.startsWith('/') ? normalized.slice(1) : normalized;
    return join(outputDir, clean, 'index.html');
  }

  private routeToJsonPath(route: string): string {
    const baseDir = resolve('./src/data/json');
    const normalized = route === '/' ? 'index' : route.replace(/^\//, '');
    const target = route === 'full' ? 'full' : normalized;
    return join(baseDir, `${target}.json`);
  }

  private writeJsonSlice(route: string, context: RenderContext) {
    const jsonPath = this.routeToJsonPath(route);
    mkdirSync(dirname(jsonPath), { recursive: true });
    writeFileSync(jsonPath, JSON.stringify(context, null, 2), 'utf8');
    console.log(`📝 JSON slice for ${route} -> ${jsonPath}`);
  }

  private copyStaticAssets(cfg: RouteToStaticConfig) {
    if (cfg.stylesPath) {
      this.copyFileIfExists(cfg.stylesPath, join(cfg.outputDir, 'styles.css'));
    }
    if (cfg.entryClientPath) {
      this.copyFileIfExists(cfg.entryClientPath, join(cfg.outputDir, 'entry-client.js'));
    }
    if (cfg.entryClientMapPath) {
      this.copyFileIfExists(cfg.entryClientMapPath, join(cfg.outputDir, 'entry-client.js.map'), true);
    }
    if (cfg.assetsDir) {
      this.copyDirIfExists(cfg.assetsDir, join(cfg.outputDir, 'assets'));
    }
  }

  private copyFileIfExists(from: string, to: string, optional = false) {
    const absFrom = resolve(from);
    const absTo = resolve(to);
    if (!existsSync(absFrom)) {
      if (!optional) {
        console.warn(`⚠️  Skip copy, file not found: ${absFrom}`);
      }
      return;
    }
    mkdirSync(dirname(absTo), { recursive: true });
    cpSync(absFrom, absTo);
    console.log(`📦 Copied ${absFrom} -> ${absTo}`);
  }

  private copyDirIfExists(from: string, to: string) {
    const absFrom = resolve(from);
    const absTo = resolve(to);
    if (!existsSync(absFrom)) {
      console.warn(`⚠️  Skip assets copy, directory not found: ${absFrom}`);
      return;
    }
    cpSync(absFrom, absTo, { recursive: true });
    console.log(`📁 Copied assets ${absFrom} -> ${absTo}`);
  }
}

export const routeToStatic = new RouteToStatic();

