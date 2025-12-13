/**
 * twsx - Tailwind to inline CSS style converter
 * 
 * Usage: twsx('flex flex-col gap-4 p-6')
 * Returns: React CSSProperties object
 * 
 * Goal: Convert Tailwind-like class strings to inline styles
 * 
 * Features:
 * - Converts Tailwind classes to CSS properties at runtime
 * - Caches results for performance
 * - Returns React-compatible CSSProperties objects
 * - No external dependencies
 * 
 * LIMITATIONS:
 * - NO responsive modifiers (md:, lg:, xl:) - use className for those
 * - NO pseudo-classes (:hover, :focus) - use className for those
 * - NO CSS animations/transitions - use className for those
 * 
 * When to use twsx:
 * - Simple inline styles without responsive/pseudo behavior
 * - Dynamic styles computed at runtime
 * 
 * When to use className (Tailwind JIT):
 * - Responsive layouts (md:grid-cols-2)
 * - Hover/focus states (:hover, :focus)
 * - Animations and transitions
 */

import type { CSSProperties } from 'react';

// =============================================================================
// TAILWIND → CSS MAP
// Based on Tailwind defaults + shadcn design tokens
// =============================================================================

const tw: Record<string, Record<string, string | number>> = {
  // ---------------------------------------------------------------------------
  // DISPLAY
  // ---------------------------------------------------------------------------
  'block': { display: 'block' },
  'inline-block': { display: 'inline-block' },
  'inline': { display: 'inline' },
  'flex': { display: 'flex' },
  'inline-flex': { display: 'inline-flex' },
  'grid': { display: 'grid' },
  'inline-grid': { display: 'inline-grid' },
  'hidden': { display: 'none' },
  'contents': { display: 'contents' },

  // ---------------------------------------------------------------------------
  // FLEX DIRECTION
  // ---------------------------------------------------------------------------
  'flex-row': { flexDirection: 'row' },
  'flex-row-reverse': { flexDirection: 'row-reverse' },
  'flex-col': { flexDirection: 'column' },
  'flex-col-reverse': { flexDirection: 'column-reverse' },

  // ---------------------------------------------------------------------------
  // FLEX WRAP
  // ---------------------------------------------------------------------------
  'flex-wrap': { flexWrap: 'wrap' },
  'flex-wrap-reverse': { flexWrap: 'wrap-reverse' },
  'flex-nowrap': { flexWrap: 'nowrap' },

  // ---------------------------------------------------------------------------
  // FLEX GROW / SHRINK
  // ---------------------------------------------------------------------------
  'flex-1': { flex: '1 1 0%' },
  'flex-auto': { flex: '1 1 auto' },
  'flex-initial': { flex: '0 1 auto' },
  'flex-none': { flex: 'none' },
  'grow': { flexGrow: 1 },
  'grow-0': { flexGrow: 0 },
  'shrink': { flexShrink: 1 },
  'shrink-0': { flexShrink: 0 },

  // ---------------------------------------------------------------------------
  // ALIGN ITEMS
  // ---------------------------------------------------------------------------
  'items-start': { alignItems: 'flex-start' },
  'items-end': { alignItems: 'flex-end' },
  'items-center': { alignItems: 'center' },
  'items-baseline': { alignItems: 'baseline' },
  'items-stretch': { alignItems: 'stretch' },

  // ---------------------------------------------------------------------------
  // ALIGN SELF
  // ---------------------------------------------------------------------------
  'self-auto': { alignSelf: 'auto' },
  'self-start': { alignSelf: 'flex-start' },
  'self-end': { alignSelf: 'flex-end' },
  'self-center': { alignSelf: 'center' },
  'self-stretch': { alignSelf: 'stretch' },
  'self-baseline': { alignSelf: 'baseline' },

  // ---------------------------------------------------------------------------
  // JUSTIFY CONTENT
  // ---------------------------------------------------------------------------
  'justify-start': { justifyContent: 'flex-start' },
  'justify-end': { justifyContent: 'flex-end' },
  'justify-center': { justifyContent: 'center' },
  'justify-between': { justifyContent: 'space-between' },
  'justify-around': { justifyContent: 'space-around' },
  'justify-evenly': { justifyContent: 'space-evenly' },

  // ---------------------------------------------------------------------------
  // GAP
  // ---------------------------------------------------------------------------
  'gap-0': { gap: 0 },
  'gap-px': { gap: 1 },
  'gap-0.5': { gap: 2 },
  'gap-1': { gap: 4 },
  'gap-1.5': { gap: 6 },
  'gap-2': { gap: 8 },
  'gap-2.5': { gap: 10 },
  'gap-3': { gap: 12 },
  'gap-3.5': { gap: 14 },
  'gap-4': { gap: 16 },
  'gap-5': { gap: 20 },
  'gap-6': { gap: 24 },
  'gap-7': { gap: 28 },
  'gap-8': { gap: 32 },
  'gap-9': { gap: 36 },
  'gap-10': { gap: 40 },
  'gap-11': { gap: 44 },
  'gap-12': { gap: 48 },
  'gap-14': { gap: 56 },
  'gap-16': { gap: 64 },
  'gap-20': { gap: 80 },
  'gap-24': { gap: 96 },
  'gap-28': { gap: 112 },
  'gap-32': { gap: 128 },

  // Gap X/Y
  'gap-x-0': { columnGap: 0 },
  'gap-x-1': { columnGap: 4 },
  'gap-x-2': { columnGap: 8 },
  'gap-x-3': { columnGap: 12 },
  'gap-x-4': { columnGap: 16 },
  'gap-x-5': { columnGap: 20 },
  'gap-x-6': { columnGap: 24 },
  'gap-x-8': { columnGap: 32 },
  'gap-y-0': { rowGap: 0 },
  'gap-y-1': { rowGap: 4 },
  'gap-y-2': { rowGap: 8 },
  'gap-y-3': { rowGap: 12 },
  'gap-y-4': { rowGap: 16 },
  'gap-y-5': { rowGap: 20 },
  'gap-y-6': { rowGap: 24 },
  'gap-y-8': { rowGap: 32 },

  // ---------------------------------------------------------------------------
  // WIDTH
  // ---------------------------------------------------------------------------
  'w-0': { width: 0 },
  'w-px': { width: 1 },
  'w-0.5': { width: 2 },
  'w-1': { width: 4 },
  'w-2': { width: 8 },
  'w-3': { width: 12 },
  'w-4': { width: 16 },
  'w-5': { width: 20 },
  'w-6': { width: 24 },
  'w-8': { width: 32 },
  'w-10': { width: 40 },
  'w-12': { width: 48 },
  'w-14': { width: 56 },
  'w-16': { width: 64 },
  'w-20': { width: 80 },
  'w-24': { width: 96 },
  'w-28': { width: 112 },
  'w-32': { width: 128 },
  'w-36': { width: 144 },
  'w-40': { width: 160 },
  'w-44': { width: 176 },
  'w-48': { width: 192 },
  'w-52': { width: 208 },
  'w-56': { width: 224 },
  'w-60': { width: 240 },
  'w-64': { width: 256 },
  'w-72': { width: 288 },
  'w-80': { width: 320 },
  'w-96': { width: 384 },
  'w-auto': { width: 'auto' },
  'w-full': { width: '100%' },
  'w-screen': { width: '100vw' },
  'w-min': { width: 'min-content' },
  'w-max': { width: 'max-content' },
  'w-fit': { width: 'fit-content' },
  'w-1/2': { width: '50%' },
  'w-1/3': { width: '33.333333%' },
  'w-2/3': { width: '66.666667%' },
  'w-1/4': { width: '25%' },
  'w-2/4': { width: '50%' },
  'w-3/4': { width: '75%' },
  'w-1/5': { width: '20%' },
  'w-2/5': { width: '40%' },
  'w-3/5': { width: '60%' },
  'w-4/5': { width: '80%' },

  // ---------------------------------------------------------------------------
  // MIN/MAX WIDTH
  // ---------------------------------------------------------------------------
  'min-w-0': { minWidth: 0 },
  'min-w-full': { minWidth: '100%' },
  'min-w-min': { minWidth: 'min-content' },
  'min-w-max': { minWidth: 'max-content' },
  'min-w-fit': { minWidth: 'fit-content' },
  'max-w-none': { maxWidth: 'none' },
  'max-w-xs': { maxWidth: 320 },
  'max-w-sm': { maxWidth: 384 },
  'max-w-md': { maxWidth: 448 },
  'max-w-lg': { maxWidth: 512 },
  'max-w-xl': { maxWidth: 576 },
  'max-w-2xl': { maxWidth: 672 },
  'max-w-3xl': { maxWidth: 768 },
  'max-w-4xl': { maxWidth: 896 },
  'max-w-5xl': { maxWidth: 1024 },
  'max-w-6xl': { maxWidth: 1152 },
  'max-w-7xl': { maxWidth: 1280 },
  'max-w-full': { maxWidth: '100%' },
  'max-w-min': { maxWidth: 'min-content' },
  'max-w-max': { maxWidth: 'max-content' },
  'max-w-fit': { maxWidth: 'fit-content' },
  'max-w-prose': { maxWidth: '65ch' },
  'max-w-screen-sm': { maxWidth: 640 },
  'max-w-screen-md': { maxWidth: 768 },
  'max-w-screen-lg': { maxWidth: 1024 },
  'max-w-screen-xl': { maxWidth: 1280 },
  'max-w-screen-2xl': { maxWidth: 1536 },

  // ---------------------------------------------------------------------------
  // HEIGHT
  // ---------------------------------------------------------------------------
  'h-0': { height: 0 },
  'h-px': { height: 1 },
  'h-0.5': { height: 2 },
  'h-1': { height: 4 },
  'h-2': { height: 8 },
  'h-3': { height: 12 },
  'h-4': { height: 16 },
  'h-5': { height: 20 },
  'h-6': { height: 24 },
  'h-8': { height: 32 },
  'h-10': { height: 40 },
  'h-12': { height: 48 },
  'h-14': { height: 56 },
  'h-16': { height: 64 },
  'h-20': { height: 80 },
  'h-24': { height: 96 },
  'h-28': { height: 112 },
  'h-32': { height: 128 },
  'h-36': { height: 144 },
  'h-40': { height: 160 },
  'h-44': { height: 176 },
  'h-48': { height: 192 },
  'h-52': { height: 208 },
  'h-56': { height: 224 },
  'h-60': { height: 240 },
  'h-64': { height: 256 },
  'h-72': { height: 288 },
  'h-80': { height: 320 },
  'h-96': { height: 384 },
  'h-auto': { height: 'auto' },
  'h-full': { height: '100%' },
  'h-screen': { height: '100vh' },
  'h-min': { height: 'min-content' },
  'h-max': { height: 'max-content' },
  'h-fit': { height: 'fit-content' },
  'h-1/2': { height: '50%' },
  'h-1/3': { height: '33.333333%' },
  'h-2/3': { height: '66.666667%' },
  'h-1/4': { height: '25%' },
  'h-2/4': { height: '50%' },
  'h-3/4': { height: '75%' },

  // ---------------------------------------------------------------------------
  // MIN/MAX HEIGHT
  // ---------------------------------------------------------------------------
  'min-h-0': { minHeight: 0 },
  'min-h-full': { minHeight: '100%' },
  'min-h-screen': { minHeight: '100vh' },
  'min-h-min': { minHeight: 'min-content' },
  'min-h-max': { minHeight: 'max-content' },
  'min-h-fit': { minHeight: 'fit-content' },
  'max-h-none': { maxHeight: 'none' },
  'max-h-full': { maxHeight: '100%' },
  'max-h-screen': { maxHeight: '100vh' },
  'max-h-min': { maxHeight: 'min-content' },
  'max-h-max': { maxHeight: 'max-content' },
  'max-h-fit': { maxHeight: 'fit-content' },

  // ---------------------------------------------------------------------------
  // PADDING
  // ---------------------------------------------------------------------------
  'p-0': { padding: 0 },
  'p-px': { padding: 1 },
  'p-0.5': { padding: 2 },
  'p-1': { padding: 4 },
  'p-1.5': { padding: 6 },
  'p-2': { padding: 8 },
  'p-2.5': { padding: 10 },
  'p-3': { padding: 12 },
  'p-3.5': { padding: 14 },
  'p-4': { padding: 16 },
  'p-5': { padding: 20 },
  'p-6': { padding: 24 },
  'p-7': { padding: 28 },
  'p-8': { padding: 32 },
  'p-9': { padding: 36 },
  'p-10': { padding: 40 },
  'p-11': { padding: 44 },
  'p-12': { padding: 48 },
  'p-14': { padding: 56 },
  'p-16': { padding: 64 },
  'p-20': { padding: 80 },
  'p-24': { padding: 96 },
  'p-28': { padding: 112 },
  'p-32': { padding: 128 },

  // Padding X
  'px-0': { paddingLeft: 0, paddingRight: 0 },
  'px-px': { paddingLeft: 1, paddingRight: 1 },
  'px-0.5': { paddingLeft: 2, paddingRight: 2 },
  'px-1': { paddingLeft: 4, paddingRight: 4 },
  'px-1.5': { paddingLeft: 6, paddingRight: 6 },
  'px-2': { paddingLeft: 8, paddingRight: 8 },
  'px-2.5': { paddingLeft: 10, paddingRight: 10 },
  'px-3': { paddingLeft: 12, paddingRight: 12 },
  'px-3.5': { paddingLeft: 14, paddingRight: 14 },
  'px-4': { paddingLeft: 16, paddingRight: 16 },
  'px-5': { paddingLeft: 20, paddingRight: 20 },
  'px-6': { paddingLeft: 24, paddingRight: 24 },
  'px-7': { paddingLeft: 28, paddingRight: 28 },
  'px-8': { paddingLeft: 32, paddingRight: 32 },
  'px-9': { paddingLeft: 36, paddingRight: 36 },
  'px-10': { paddingLeft: 40, paddingRight: 40 },
  'px-12': { paddingLeft: 48, paddingRight: 48 },
  'px-14': { paddingLeft: 56, paddingRight: 56 },
  'px-16': { paddingLeft: 64, paddingRight: 64 },
  'px-20': { paddingLeft: 80, paddingRight: 80 },

  // Padding Y
  'py-0': { paddingTop: 0, paddingBottom: 0 },
  'py-px': { paddingTop: 1, paddingBottom: 1 },
  'py-0.5': { paddingTop: 2, paddingBottom: 2 },
  'py-1': { paddingTop: 4, paddingBottom: 4 },
  'py-1.5': { paddingTop: 6, paddingBottom: 6 },
  'py-2': { paddingTop: 8, paddingBottom: 8 },
  'py-2.5': { paddingTop: 10, paddingBottom: 10 },
  'py-3': { paddingTop: 12, paddingBottom: 12 },
  'py-3.5': { paddingTop: 14, paddingBottom: 14 },
  'py-4': { paddingTop: 16, paddingBottom: 16 },
  'py-5': { paddingTop: 20, paddingBottom: 20 },
  'py-6': { paddingTop: 24, paddingBottom: 24 },
  'py-7': { paddingTop: 28, paddingBottom: 28 },
  'py-8': { paddingTop: 32, paddingBottom: 32 },
  'py-9': { paddingTop: 36, paddingBottom: 36 },
  'py-10': { paddingTop: 40, paddingBottom: 40 },
  'py-12': { paddingTop: 48, paddingBottom: 48 },
  'py-14': { paddingTop: 56, paddingBottom: 56 },
  'py-16': { paddingTop: 64, paddingBottom: 64 },
  'py-20': { paddingTop: 80, paddingBottom: 80 },
  'py-24': { paddingTop: 96, paddingBottom: 96 },
  'py-32': { paddingTop: 128, paddingBottom: 128 },

  // Padding individual
  'pt-0': { paddingTop: 0 },
  'pt-1': { paddingTop: 4 },
  'pt-2': { paddingTop: 8 },
  'pt-3': { paddingTop: 12 },
  'pt-4': { paddingTop: 16 },
  'pt-5': { paddingTop: 20 },
  'pt-6': { paddingTop: 24 },
  'pt-8': { paddingTop: 32 },
  'pt-10': { paddingTop: 40 },
  'pt-12': { paddingTop: 48 },
  'pt-16': { paddingTop: 64 },
  'pt-20': { paddingTop: 80 },
  'pt-24': { paddingTop: 96 },
  'pt-32': { paddingTop: 128 },
  'pr-0': { paddingRight: 0 },
  'pr-1': { paddingRight: 4 },
  'pr-2': { paddingRight: 8 },
  'pr-3': { paddingRight: 12 },
  'pr-4': { paddingRight: 16 },
  'pr-5': { paddingRight: 20 },
  'pr-6': { paddingRight: 24 },
  'pr-8': { paddingRight: 32 },
  'pb-0': { paddingBottom: 0 },
  'pb-1': { paddingBottom: 4 },
  'pb-2': { paddingBottom: 8 },
  'pb-3': { paddingBottom: 12 },
  'pb-4': { paddingBottom: 16 },
  'pb-5': { paddingBottom: 20 },
  'pb-6': { paddingBottom: 24 },
  'pb-8': { paddingBottom: 32 },
  'pb-10': { paddingBottom: 40 },
  'pb-12': { paddingBottom: 48 },
  'pb-16': { paddingBottom: 64 },
  'pb-20': { paddingBottom: 80 },
  'pb-24': { paddingBottom: 96 },
  'pb-32': { paddingBottom: 128 },
  'pl-0': { paddingLeft: 0 },
  'pl-1': { paddingLeft: 4 },
  'pl-2': { paddingLeft: 8 },
  'pl-3': { paddingLeft: 12 },
  'pl-4': { paddingLeft: 16 },
  'pl-5': { paddingLeft: 20 },
  'pl-6': { paddingLeft: 24 },
  'pl-8': { paddingLeft: 32 },

  // ---------------------------------------------------------------------------
  // MARGIN
  // ---------------------------------------------------------------------------
  'm-0': { margin: 0 },
  'm-px': { margin: 1 },
  'm-0.5': { margin: 2 },
  'm-1': { margin: 4 },
  'm-1.5': { margin: 6 },
  'm-2': { margin: 8 },
  'm-2.5': { margin: 10 },
  'm-3': { margin: 12 },
  'm-3.5': { margin: 14 },
  'm-4': { margin: 16 },
  'm-5': { margin: 20 },
  'm-6': { margin: 24 },
  'm-7': { margin: 28 },
  'm-8': { margin: 32 },
  'm-auto': { margin: 'auto' },

  // Margin X
  'mx-0': { marginLeft: 0, marginRight: 0 },
  'mx-1': { marginLeft: 4, marginRight: 4 },
  'mx-2': { marginLeft: 8, marginRight: 8 },
  'mx-3': { marginLeft: 12, marginRight: 12 },
  'mx-4': { marginLeft: 16, marginRight: 16 },
  'mx-5': { marginLeft: 20, marginRight: 20 },
  'mx-6': { marginLeft: 24, marginRight: 24 },
  'mx-8': { marginLeft: 32, marginRight: 32 },
  'mx-auto': { marginLeft: 'auto', marginRight: 'auto' },

  // Margin Y
  'my-0': { marginTop: 0, marginBottom: 0 },
  'my-1': { marginTop: 4, marginBottom: 4 },
  'my-2': { marginTop: 8, marginBottom: 8 },
  'my-3': { marginTop: 12, marginBottom: 12 },
  'my-4': { marginTop: 16, marginBottom: 16 },
  'my-5': { marginTop: 20, marginBottom: 20 },
  'my-6': { marginTop: 24, marginBottom: 24 },
  'my-8': { marginTop: 32, marginBottom: 32 },
  'my-auto': { marginTop: 'auto', marginBottom: 'auto' },

  // Margin individual
  'mt-0': { marginTop: 0 },
  'mt-1': { marginTop: 4 },
  'mt-2': { marginTop: 8 },
  'mt-3': { marginTop: 12 },
  'mt-4': { marginTop: 16 },
  'mt-5': { marginTop: 20 },
  'mt-6': { marginTop: 24 },
  'mt-8': { marginTop: 32 },
  'mt-10': { marginTop: 40 },
  'mt-12': { marginTop: 48 },
  'mt-16': { marginTop: 64 },
  'mt-20': { marginTop: 80 },
  'mt-auto': { marginTop: 'auto' },
  'mr-0': { marginRight: 0 },
  'mr-1': { marginRight: 4 },
  'mr-2': { marginRight: 8 },
  'mr-3': { marginRight: 12 },
  'mr-4': { marginRight: 16 },
  'mr-auto': { marginRight: 'auto' },
  'mb-0': { marginBottom: 0 },
  'mb-1': { marginBottom: 4 },
  'mb-2': { marginBottom: 8 },
  'mb-3': { marginBottom: 12 },
  'mb-4': { marginBottom: 16 },
  'mb-5': { marginBottom: 20 },
  'mb-6': { marginBottom: 24 },
  'mb-8': { marginBottom: 32 },
  'mb-10': { marginBottom: 40 },
  'mb-12': { marginBottom: 48 },
  'mb-16': { marginBottom: 64 },
  'mb-auto': { marginBottom: 'auto' },
  'ml-0': { marginLeft: 0 },
  'ml-1': { marginLeft: 4 },
  'ml-2': { marginLeft: 8 },
  'ml-3': { marginLeft: 12 },
  'ml-4': { marginLeft: 16 },
  'ml-auto': { marginLeft: 'auto' },

  // ---------------------------------------------------------------------------
  // POSITION
  // ---------------------------------------------------------------------------
  'static': { position: 'static' },
  'fixed': { position: 'fixed' },
  'absolute': { position: 'absolute' },
  'relative': { position: 'relative' },
  'sticky': { position: 'sticky' },

  // Inset
  'inset-0': { top: 0, right: 0, bottom: 0, left: 0 },
  'inset-auto': { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' },
  'inset-x-0': { left: 0, right: 0 },
  'inset-y-0': { top: 0, bottom: 0 },
  'top-0': { top: 0 },
  'top-1': { top: 4 },
  'top-2': { top: 8 },
  'top-3': { top: 12 },
  'top-4': { top: 16 },
  'top-auto': { top: 'auto' },
  'top-full': { top: '100%' },
  'right-0': { right: 0 },
  'right-1': { right: 4 },
  'right-2': { right: 8 },
  'right-3': { right: 12 },
  'right-4': { right: 16 },
  'right-auto': { right: 'auto' },
  'bottom-0': { bottom: 0 },
  'bottom-1': { bottom: 4 },
  'bottom-2': { bottom: 8 },
  'bottom-3': { bottom: 12 },
  'bottom-4': { bottom: 16 },
  'bottom-auto': { bottom: 'auto' },
  'left-0': { left: 0 },
  'left-1': { left: 4 },
  'left-2': { left: 8 },
  'left-3': { left: 12 },
  'left-4': { left: 16 },
  'left-auto': { left: 'auto' },

  // ---------------------------------------------------------------------------
  // Z-INDEX
  // ---------------------------------------------------------------------------
  'z-0': { zIndex: 0 },
  'z-10': { zIndex: 10 },
  'z-20': { zIndex: 20 },
  'z-30': { zIndex: 30 },
  'z-40': { zIndex: 40 },
  'z-50': { zIndex: 50 },
  'z-auto': { zIndex: 'auto' },

  // ---------------------------------------------------------------------------
  // OVERFLOW
  // ---------------------------------------------------------------------------
  'overflow-auto': { overflow: 'auto' },
  'overflow-hidden': { overflow: 'hidden' },
  'overflow-clip': { overflow: 'clip' },
  'overflow-visible': { overflow: 'visible' },
  'overflow-scroll': { overflow: 'scroll' },
  'overflow-x-auto': { overflowX: 'auto' },
  'overflow-y-auto': { overflowY: 'auto' },
  'overflow-x-hidden': { overflowX: 'hidden' },
  'overflow-y-hidden': { overflowY: 'hidden' },
  'overflow-x-scroll': { overflowX: 'scroll' },
  'overflow-y-scroll': { overflowY: 'scroll' },

  // ---------------------------------------------------------------------------
  // TYPOGRAPHY
  // ---------------------------------------------------------------------------
  // Font Size
  'text-xs': { fontSize: 12, lineHeight: '16px' },
  'text-sm': { fontSize: 14, lineHeight: '20px' },
  'text-base': { fontSize: 16, lineHeight: '24px' },
  'text-lg': { fontSize: 18, lineHeight: '28px' },
  'text-xl': { fontSize: 20, lineHeight: '28px' },
  'text-2xl': { fontSize: 24, lineHeight: '32px' },
  'text-3xl': { fontSize: 30, lineHeight: '36px' },
  'text-4xl': { fontSize: 36, lineHeight: '40px' },
  'text-5xl': { fontSize: 48, lineHeight: 1 },
  'text-6xl': { fontSize: 60, lineHeight: 1 },
  'text-7xl': { fontSize: 72, lineHeight: 1 },
  'text-8xl': { fontSize: 96, lineHeight: 1 },
  'text-9xl': { fontSize: 128, lineHeight: 1 },

  // Font Weight
  'font-thin': { fontWeight: 100 },
  'font-extralight': { fontWeight: 200 },
  'font-light': { fontWeight: 300 },
  'font-normal': { fontWeight: 400 },
  'font-medium': { fontWeight: 500 },
  'font-semibold': { fontWeight: 600 },
  'font-bold': { fontWeight: 700 },
  'font-extrabold': { fontWeight: 800 },
  'font-black': { fontWeight: 900 },

  // Text Align
  'text-left': { textAlign: 'left' },
  'text-center': { textAlign: 'center' },
  'text-right': { textAlign: 'right' },
  'text-justify': { textAlign: 'justify' },

  // Line Height
  'leading-none': { lineHeight: 1 },
  'leading-tight': { lineHeight: 1.25 },
  'leading-snug': { lineHeight: 1.375 },
  'leading-normal': { lineHeight: 1.5 },
  'leading-relaxed': { lineHeight: 1.625 },
  'leading-loose': { lineHeight: 2 },

  // Letter Spacing
  'tracking-tighter': { letterSpacing: '-0.05em' },
  'tracking-tight': { letterSpacing: '-0.025em' },
  'tracking-normal': { letterSpacing: '0em' },
  'tracking-wide': { letterSpacing: '0.025em' },
  'tracking-wider': { letterSpacing: '0.05em' },
  'tracking-widest': { letterSpacing: '0.1em' },

  // Text Decoration
  'underline': { textDecorationLine: 'underline' },
  'overline': { textDecorationLine: 'overline' },
  'line-through': { textDecorationLine: 'line-through' },
  'no-underline': { textDecorationLine: 'none' },

  // Text Transform
  'uppercase': { textTransform: 'uppercase' },
  'lowercase': { textTransform: 'lowercase' },
  'capitalize': { textTransform: 'capitalize' },
  'normal-case': { textTransform: 'none' },

  // Whitespace
  'whitespace-normal': { whiteSpace: 'normal' },
  'whitespace-nowrap': { whiteSpace: 'nowrap' },
  'whitespace-pre': { whiteSpace: 'pre' },
  'whitespace-pre-line': { whiteSpace: 'pre-line' },
  'whitespace-pre-wrap': { whiteSpace: 'pre-wrap' },

  // Word Break
  'break-normal': { overflowWrap: 'normal', wordBreak: 'normal' },
  'break-words': { overflowWrap: 'break-word' },
  'break-all': { wordBreak: 'break-all' },

  // Truncate
  'truncate': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  'text-ellipsis': { textOverflow: 'ellipsis' },
  'text-clip': { textOverflow: 'clip' },

  // ---------------------------------------------------------------------------
  // COLORS (shadcn tokens via CSS variables)
  // ---------------------------------------------------------------------------
  // Background
  'bg-transparent': { backgroundColor: 'transparent' },
  'bg-background': { backgroundColor: 'var(--background)' },
  'bg-foreground': { backgroundColor: 'var(--foreground)' },
  'bg-card': { backgroundColor: 'var(--card)' },
  'bg-card-foreground': { backgroundColor: 'var(--card-foreground)' },
  'bg-popover': { backgroundColor: 'var(--popover)' },
  'bg-popover-foreground': { backgroundColor: 'var(--popover-foreground)' },
  'bg-primary': { backgroundColor: 'var(--primary)' },
  'bg-primary-foreground': { backgroundColor: 'var(--primary-foreground)' },
  'bg-secondary': { backgroundColor: 'var(--secondary)' },
  'bg-secondary-foreground': { backgroundColor: 'var(--secondary-foreground)' },
  'bg-muted': { backgroundColor: 'var(--muted)' },
  'bg-muted-foreground': { backgroundColor: 'var(--muted-foreground)' },
  'bg-accent': { backgroundColor: 'var(--accent)' },
  'bg-accent-foreground': { backgroundColor: 'var(--accent-foreground)' },
  'bg-destructive': { backgroundColor: 'var(--destructive)' },
  'bg-destructive-foreground': { backgroundColor: 'var(--destructive-foreground)' },
  'bg-border': { backgroundColor: 'var(--border)' },
  'bg-input': { backgroundColor: 'var(--input)' },
  'bg-ring': { backgroundColor: 'var(--ring)' },

  // Text colors
  'text-transparent': { color: 'transparent' },
  'text-foreground': { color: 'var(--foreground)' },
  'text-background': { color: 'var(--background)' },
  'text-card-foreground': { color: 'var(--card-foreground)' },
  'text-popover-foreground': { color: 'var(--popover-foreground)' },
  'text-primary': { color: 'var(--primary)' },
  'text-primary-foreground': { color: 'var(--primary-foreground)' },
  'text-secondary': { color: 'var(--secondary)' },
  'text-secondary-foreground': { color: 'var(--secondary-foreground)' },
  'text-muted': { color: 'var(--muted)' },
  'text-muted-foreground': { color: 'var(--muted-foreground)' },
  'text-accent': { color: 'var(--accent)' },
  'text-accent-foreground': { color: 'var(--accent-foreground)' },
  'text-destructive': { color: 'var(--destructive)' },
  'text-destructive-foreground': { color: 'var(--destructive-foreground)' },

  // ---------------------------------------------------------------------------
  // BORDER
  // ---------------------------------------------------------------------------
  'border': { borderWidth: 1, borderStyle: 'solid' },
  'border-0': { borderWidth: 0 },
  'border-2': { borderWidth: 2 },
  'border-4': { borderWidth: 4 },
  'border-8': { borderWidth: 8 },
  'border-t': { borderTopWidth: 1, borderStyle: 'solid' },
  'border-r': { borderRightWidth: 1, borderStyle: 'solid' },
  'border-b': { borderBottomWidth: 1, borderStyle: 'solid' },
  'border-l': { borderLeftWidth: 1, borderStyle: 'solid' },
  'border-t-0': { borderTopWidth: 0 },
  'border-r-0': { borderRightWidth: 0 },
  'border-b-0': { borderBottomWidth: 0 },
  'border-l-0': { borderLeftWidth: 0 },

  // Border colors (shadcn)
  'border-transparent': { borderColor: 'transparent' },
  'border-border': { borderColor: 'var(--border)' },
  'border-input': { borderColor: 'var(--input)' },
  'border-ring': { borderColor: 'var(--ring)' },
  'border-primary': { borderColor: 'var(--primary)' },
  'border-secondary': { borderColor: 'var(--secondary)' },
  'border-destructive': { borderColor: 'var(--destructive)' },
  'border-muted': { borderColor: 'var(--muted)' },
  'border-accent': { borderColor: 'var(--accent)' },

  // Border Style
  'border-solid': { borderStyle: 'solid' },
  'border-dashed': { borderStyle: 'dashed' },
  'border-dotted': { borderStyle: 'dotted' },
  'border-double': { borderStyle: 'double' },
  'border-none': { borderStyle: 'none' },

  // ---------------------------------------------------------------------------
  // BORDER RADIUS
  // ---------------------------------------------------------------------------
  'rounded-none': { borderRadius: 0 },
  'rounded-sm': { borderRadius: 2 },
  'rounded': { borderRadius: 4 },
  'rounded-md': { borderRadius: 6 },
  'rounded-lg': { borderRadius: 8 },
  'rounded-xl': { borderRadius: 12 },
  'rounded-2xl': { borderRadius: 16 },
  'rounded-3xl': { borderRadius: 24 },
  'rounded-full': { borderRadius: 9999 },

  // Individual corners
  'rounded-t-none': { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  'rounded-t-sm': { borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  'rounded-t': { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  'rounded-t-md': { borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  'rounded-t-lg': { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  'rounded-t-xl': { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  'rounded-b-none': { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  'rounded-b-sm': { borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  'rounded-b': { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  'rounded-b-md': { borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  'rounded-b-lg': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  'rounded-b-xl': { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  'rounded-l-none': { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  'rounded-l-lg': { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  'rounded-r-none': { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  'rounded-r-lg': { borderTopRightRadius: 8, borderBottomRightRadius: 8 },

  // ---------------------------------------------------------------------------
  // SHADOW
  // ---------------------------------------------------------------------------
  'shadow-none': { boxShadow: 'none' },
  'shadow-sm': { boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  'shadow': { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
  'shadow-md': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
  'shadow-lg': { boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
  'shadow-xl': { boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
  'shadow-2xl': { boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
  'shadow-inner': { boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },

  // ---------------------------------------------------------------------------
  // OPACITY
  // ---------------------------------------------------------------------------
  'opacity-0': { opacity: 0 },
  'opacity-5': { opacity: 0.05 },
  'opacity-10': { opacity: 0.1 },
  'opacity-20': { opacity: 0.2 },
  'opacity-25': { opacity: 0.25 },
  'opacity-30': { opacity: 0.3 },
  'opacity-40': { opacity: 0.4 },
  'opacity-50': { opacity: 0.5 },
  'opacity-60': { opacity: 0.6 },
  'opacity-70': { opacity: 0.7 },
  'opacity-75': { opacity: 0.75 },
  'opacity-80': { opacity: 0.8 },
  'opacity-90': { opacity: 0.9 },
  'opacity-95': { opacity: 0.95 },
  'opacity-100': { opacity: 1 },

  // ---------------------------------------------------------------------------
  // CURSOR
  // ---------------------------------------------------------------------------
  'cursor-auto': { cursor: 'auto' },
  'cursor-default': { cursor: 'default' },
  'cursor-pointer': { cursor: 'pointer' },
  'cursor-wait': { cursor: 'wait' },
  'cursor-text': { cursor: 'text' },
  'cursor-move': { cursor: 'move' },
  'cursor-help': { cursor: 'help' },
  'cursor-not-allowed': { cursor: 'not-allowed' },
  'cursor-none': { cursor: 'none' },
  'cursor-grab': { cursor: 'grab' },
  'cursor-grabbing': { cursor: 'grabbing' },

  // ---------------------------------------------------------------------------
  // POINTER EVENTS
  // ---------------------------------------------------------------------------
  'pointer-events-none': { pointerEvents: 'none' },
  'pointer-events-auto': { pointerEvents: 'auto' },

  // ---------------------------------------------------------------------------
  // USER SELECT
  // ---------------------------------------------------------------------------
  'select-none': { userSelect: 'none' },
  'select-text': { userSelect: 'text' },
  'select-all': { userSelect: 'all' },
  'select-auto': { userSelect: 'auto' },

  // ---------------------------------------------------------------------------
  // VISIBILITY
  // ---------------------------------------------------------------------------
  'visible': { visibility: 'visible' },
  'invisible': { visibility: 'hidden' },
  'collapse': { visibility: 'collapse' },

  // ---------------------------------------------------------------------------
  // OBJECT FIT
  // ---------------------------------------------------------------------------
  'object-contain': { objectFit: 'contain' },
  'object-cover': { objectFit: 'cover' },
  'object-fill': { objectFit: 'fill' },
  'object-none': { objectFit: 'none' },
  'object-scale-down': { objectFit: 'scale-down' },

  // Object Position
  'object-bottom': { objectPosition: 'bottom' },
  'object-center': { objectPosition: 'center' },
  'object-left': { objectPosition: 'left' },
  'object-left-bottom': { objectPosition: 'left bottom' },
  'object-left-top': { objectPosition: 'left top' },
  'object-right': { objectPosition: 'right' },
  'object-right-bottom': { objectPosition: 'right bottom' },
  'object-right-top': { objectPosition: 'right top' },
  'object-top': { objectPosition: 'top' },

  // ---------------------------------------------------------------------------
  // ASPECT RATIO
  // ---------------------------------------------------------------------------
  'aspect-auto': { aspectRatio: 'auto' },
  'aspect-square': { aspectRatio: '1 / 1' },
  'aspect-video': { aspectRatio: '16 / 9' },

  // ---------------------------------------------------------------------------
  // GRID (web only - not cross-platform safe)
  // ---------------------------------------------------------------------------
  'grid-cols-1': { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
  'grid-cols-2': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  'grid-cols-3': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  'grid-cols-4': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  'grid-cols-5': { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
  'grid-cols-6': { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
  'grid-cols-12': { gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' },
  'grid-cols-none': { gridTemplateColumns: 'none' },
  'grid-rows-1': { gridTemplateRows: 'repeat(1, minmax(0, 1fr))' },
  'grid-rows-2': { gridTemplateRows: 'repeat(2, minmax(0, 1fr))' },
  'grid-rows-3': { gridTemplateRows: 'repeat(3, minmax(0, 1fr))' },
  'grid-rows-4': { gridTemplateRows: 'repeat(4, minmax(0, 1fr))' },
  'grid-rows-5': { gridTemplateRows: 'repeat(5, minmax(0, 1fr))' },
  'grid-rows-6': { gridTemplateRows: 'repeat(6, minmax(0, 1fr))' },
  'grid-rows-none': { gridTemplateRows: 'none' },
  'col-auto': { gridColumn: 'auto' },
  'col-span-1': { gridColumn: 'span 1 / span 1' },
  'col-span-2': { gridColumn: 'span 2 / span 2' },
  'col-span-3': { gridColumn: 'span 3 / span 3' },
  'col-span-4': { gridColumn: 'span 4 / span 4' },
  'col-span-5': { gridColumn: 'span 5 / span 5' },
  'col-span-6': { gridColumn: 'span 6 / span 6' },
  'col-span-full': { gridColumn: '1 / -1' },
  'row-auto': { gridRow: 'auto' },
  'row-span-1': { gridRow: 'span 1 / span 1' },
  'row-span-2': { gridRow: 'span 2 / span 2' },
  'row-span-3': { gridRow: 'span 3 / span 3' },
  'row-span-full': { gridRow: '1 / -1' },

  // ---------------------------------------------------------------------------
  // PLACE / ALIGN / JUSTIFY (Grid & Flex)
  // ---------------------------------------------------------------------------
  'place-content-center': { placeContent: 'center' },
  'place-content-start': { placeContent: 'start' },
  'place-content-end': { placeContent: 'end' },
  'place-content-between': { placeContent: 'space-between' },
  'place-content-around': { placeContent: 'space-around' },
  'place-content-evenly': { placeContent: 'space-evenly' },
  'place-content-stretch': { placeContent: 'stretch' },
  'place-items-start': { placeItems: 'start' },
  'place-items-end': { placeItems: 'end' },
  'place-items-center': { placeItems: 'center' },
  'place-items-stretch': { placeItems: 'stretch' },
  'place-self-auto': { placeSelf: 'auto' },
  'place-self-start': { placeSelf: 'start' },
  'place-self-end': { placeSelf: 'end' },
  'place-self-center': { placeSelf: 'center' },
  'place-self-stretch': { placeSelf: 'stretch' },
  'content-center': { alignContent: 'center' },
  'content-start': { alignContent: 'flex-start' },
  'content-end': { alignContent: 'flex-end' },
  'content-between': { alignContent: 'space-between' },
  'content-around': { alignContent: 'space-around' },
  'content-evenly': { alignContent: 'space-evenly' },
  'justify-items-start': { justifyItems: 'start' },
  'justify-items-end': { justifyItems: 'end' },
  'justify-items-center': { justifyItems: 'center' },
  'justify-items-stretch': { justifyItems: 'stretch' },
  'justify-self-auto': { justifySelf: 'auto' },
  'justify-self-start': { justifySelf: 'start' },
  'justify-self-end': { justifySelf: 'end' },
  'justify-self-center': { justifySelf: 'center' },
  'justify-self-stretch': { justifySelf: 'stretch' },

  // ---------------------------------------------------------------------------
  // TRANSITIONS (web only)
  // ---------------------------------------------------------------------------
  'transition-none': { transitionProperty: 'none' },
  'transition-all': { transitionProperty: 'all', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '150ms' },
  'transition': { transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '150ms' },
  'transition-colors': { transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '150ms' },
  'transition-opacity': { transitionProperty: 'opacity', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '150ms' },
  'transition-shadow': { transitionProperty: 'box-shadow', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '150ms' },
  'transition-transform': { transitionProperty: 'transform', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', transitionDuration: '150ms' },
  'duration-75': { transitionDuration: '75ms' },
  'duration-100': { transitionDuration: '100ms' },
  'duration-150': { transitionDuration: '150ms' },
  'duration-200': { transitionDuration: '200ms' },
  'duration-300': { transitionDuration: '300ms' },
  'duration-500': { transitionDuration: '500ms' },
  'duration-700': { transitionDuration: '700ms' },
  'duration-1000': { transitionDuration: '1000ms' },
  'ease-linear': { transitionTimingFunction: 'linear' },
  'ease-in': { transitionTimingFunction: 'cubic-bezier(0.4, 0, 1, 1)' },
  'ease-out': { transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
  'ease-in-out': { transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' },

  // ---------------------------------------------------------------------------
  // TRANSFORMS (web only, 2D only for cross-platform)
  // ---------------------------------------------------------------------------
  'scale-0': { transform: 'scale(0)' },
  'scale-50': { transform: 'scale(.5)' },
  'scale-75': { transform: 'scale(.75)' },
  'scale-90': { transform: 'scale(.9)' },
  'scale-95': { transform: 'scale(.95)' },
  'scale-100': { transform: 'scale(1)' },
  'scale-105': { transform: 'scale(1.05)' },
  'scale-110': { transform: 'scale(1.1)' },
  'scale-125': { transform: 'scale(1.25)' },
  'scale-150': { transform: 'scale(1.5)' },
  'rotate-0': { transform: 'rotate(0deg)' },
  'rotate-1': { transform: 'rotate(1deg)' },
  'rotate-2': { transform: 'rotate(2deg)' },
  'rotate-3': { transform: 'rotate(3deg)' },
  'rotate-6': { transform: 'rotate(6deg)' },
  'rotate-12': { transform: 'rotate(12deg)' },
  'rotate-45': { transform: 'rotate(45deg)' },
  'rotate-90': { transform: 'rotate(90deg)' },
  'rotate-180': { transform: 'rotate(180deg)' },
  '-rotate-1': { transform: 'rotate(-1deg)' },
  '-rotate-2': { transform: 'rotate(-2deg)' },
  '-rotate-3': { transform: 'rotate(-3deg)' },
  '-rotate-6': { transform: 'rotate(-6deg)' },
  '-rotate-12': { transform: 'rotate(-12deg)' },
  '-rotate-45': { transform: 'rotate(-45deg)' },
  '-rotate-90': { transform: 'rotate(-90deg)' },
  '-rotate-180': { transform: 'rotate(-180deg)' },
  'translate-x-0': { transform: 'translateX(0px)' },
  'translate-x-1': { transform: 'translateX(4px)' },
  'translate-x-2': { transform: 'translateX(8px)' },
  'translate-x-4': { transform: 'translateX(16px)' },
  'translate-x-full': { transform: 'translateX(100%)' },
  '-translate-x-1': { transform: 'translateX(-4px)' },
  '-translate-x-2': { transform: 'translateX(-8px)' },
  '-translate-x-4': { transform: 'translateX(-16px)' },
  '-translate-x-full': { transform: 'translateX(-100%)' },
  'translate-y-0': { transform: 'translateY(0px)' },
  'translate-y-1': { transform: 'translateY(4px)' },
  'translate-y-2': { transform: 'translateY(8px)' },
  'translate-y-4': { transform: 'translateY(16px)' },
  'translate-y-full': { transform: 'translateY(100%)' },
  '-translate-y-1': { transform: 'translateY(-4px)' },
  '-translate-y-2': { transform: 'translateY(-8px)' },
  '-translate-y-4': { transform: 'translateY(-16px)' },
  '-translate-y-full': { transform: 'translateY(-100%)' },

  // ---------------------------------------------------------------------------
  // SR ONLY (accessibility)
  // ---------------------------------------------------------------------------
  'sr-only': {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0
  },
  'not-sr-only': {
    position: 'static',
    width: 'auto',
    height: 'auto',
    padding: 0,
    margin: 0,
    overflow: 'visible',
    clip: 'auto',
    whiteSpace: 'normal'
  },
};

// =============================================================================
// STYLE CACHE
// =============================================================================

const styleCache = new Map<string, CSSProperties>();

// =============================================================================
// TWSX FUNCTION
// =============================================================================

/**
 * Convert Tailwind class string to React CSSProperties object
 * 
 * @param classes - Space-separated Tailwind classes (like native Tailwind)
 * @returns React CSSProperties object for inline styles
 * 
 * @example
 * // Basic usage
 * <div style={twsx('flex flex-col gap-4 p-6')} />
 * 
 * // Conditional styles (use spread or Object.assign)
 * <div style={{ ...twsx('flex gap-4'), ...(isActive && twsx('bg-primary')) }} />
 * 
 * // Multiple strings
 * <div style={twsx('min-h-screen', 'flex items-center justify-center')} />
 */
export function twsx(...classStrings: (string | undefined | null | false)[]): CSSProperties {
  // Filter and join all class strings
  const input = classStrings
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
    .join(' ')
    .trim();

  if (!input) return {};

  // Check cache
  const cached = styleCache.get(input);
  if (cached) {
    return cached;
  }

  // Parse classes
  const classes = input.split(/\s+/).filter(Boolean);
  const merged: CSSProperties = {};

  for (const cls of classes) {
    const styles = tw[cls];
    if (styles) {
      Object.assign(merged, styles);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`[twsx] Unknown class: "${cls}"`);
    }
  }

  styleCache.set(input, merged);

  return merged;
}

/**
 * Create a reusable style object (for module-level definitions)
 * 
 * @example
 * const styles = twsxCreate({
 *   container: 'min-h-screen flex flex-col',
 *   header: 'w-full py-4 px-6 bg-background',
 *   main: 'flex-1 p-6',
 * });
 * 
 * <div style={styles.container}>
 *   <header style={styles.header} />
 *   <main style={styles.main} />
 * </div>
 */
export function twsxCreate<T extends Record<string, string>>(
  definitions: T
): { [K in keyof T]: CSSProperties } {
  const result = {} as { [K in keyof T]: CSSProperties };
  
  for (const key in definitions) {
    result[key] = twsx(definitions[key]);
  }
  
  return result;
}

/**
 * Merge multiple style objects into one
 * 
 * @example
 * <div style={mergeStyles(styles.base, isActive && styles.active, customStyle)} />
 */
export function mergeStyles(...styles: (CSSProperties | undefined | null | false)[]): CSSProperties {
  const result: CSSProperties = {};
  for (const style of styles) {
    if (style) {
      Object.assign(result, style);
    }
  }
  return result;
}

// Export the tw map for extension
export { tw };

