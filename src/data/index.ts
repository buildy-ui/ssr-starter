import { defaultRenderContext } from './context';
import type { RenderContext } from './types';

export { defaultRenderContext } from './context';
export { useRenderContext } from '@/providers/render-context';

export function mergeRenderContext(overrides: Partial<RenderContext>): RenderContext {
  return {
    ...defaultRenderContext,
    ...overrides,
  };
}