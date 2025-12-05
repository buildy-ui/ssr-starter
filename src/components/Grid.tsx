/**
 * Grid component using Tailwind CSS classes (JIT-compatible)
 *
 * Uses existing gridVariants from @src/variants/flex.ts to avoid duplication
 * All class strings are static for proper Tailwind JIT compilation
 */
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { gridVariants } from "@/variants/flex";

// =============================================================================
// USING EXISTING VARIANTS - No duplication of Tailwind classes
// =============================================================================

// All grid-related classes come from gridVariants in @src/variants/flex.ts
// This ensures single source of truth and avoids duplication

const COL_SPAN_CLASSES = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
  auto: "col-auto",
  full: "col-span-full"
} as const;

const COL_START_CLASSES = {
  auto: "col-start-auto",
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
  6: "col-start-6",
  7: "col-start-7",
  8: "col-start-8",
  9: "col-start-9",
  10: "col-start-10",
  11: "col-start-11",
  12: "col-start-12",
  13: "col-start-13"
} as const;

const COL_END_CLASSES = {
  auto: "col-end-auto",
  1: "col-end-1",
  2: "col-end-2",
  3: "col-end-3",
  4: "col-end-4",
  5: "col-end-5",
  6: "col-end-6",
  7: "col-end-7",
  8: "col-end-8",
  9: "col-end-9",
  10: "col-end-10",
  11: "col-end-11",
  12: "col-end-12",
  13: "col-end-13"
} as const;

const ORDER_CLASSES = {
  first: "order-first",
  last: "order-last",
  none: "order-none",
  1: "order-1",
  2: "order-2",
  3: "order-3",
  4: "order-4",
  5: "order-5",
  6: "order-6",
  7: "order-7",
  8: "order-8",
  9: "order-9",
  10: "order-10",
  11: "order-11",
  12: "order-12"
} as const;

// =============================================================================
// TYPES - Using VariantGridProps from existing variants
// =============================================================================

import type { VariantGridProps } from "@/variants/flex";

type GridCols = NonNullable<VariantGridProps["cols"]>;
type GridGap = NonNullable<VariantGridProps["gap"]>;
type GridAlign = NonNullable<VariantGridProps["align"]>;
type GridJustify = NonNullable<VariantGridProps["justify"]>;
type GridJustifyItems = NonNullable<VariantGridProps["justifyItems"]>;
type GridRows = NonNullable<VariantGridProps["rows"]>;
type GridContent = NonNullable<VariantGridProps["content"]>;
type GridFlow = NonNullable<VariantGridProps["flow"]>;
type GridAutoRows = NonNullable<VariantGridProps["autoRows"]>;
type GridAutoCols = NonNullable<VariantGridProps["autoCols"]>;

// Grid item specific types (not in gridVariants)
type GridColSpan = keyof typeof COL_SPAN_CLASSES;
type GridColStart = keyof typeof COL_START_CLASSES;
type GridColEnd = keyof typeof COL_END_CLASSES;
type GridOrder = keyof typeof ORDER_CLASSES;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns or responsive pattern like "1-2-3" */
  cols?: GridCols;
  /** Gap between items */
  gap?: GridGap;
  /** Vertical alignment of items */
  align?: GridAlign;
  /** Horizontal distribution of items */
  justify?: GridJustify;
  /** Alignment of items within cells */
  justifyItems?: GridJustifyItems;
  /** Number of rows */
  rows?: GridRows;
  /** Alignment of rows */
  content?: GridContent;
  /** Grid auto-flow direction */
  flow?: GridFlow;
  /** Auto-generated row sizing */
  autoRows?: GridAutoRows;
  /** Auto-generated column sizing */
  autoCols?: GridAutoCols;
}

export interface GridColProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns to span */
  span?: GridColSpan;
  /** Starting column */
  start?: GridColStart;
  /** Ending column */
  end?: GridColEnd;
  /** Display order */
  order?: GridOrder;
}

// =============================================================================
// GRID COMPONENT
// =============================================================================

const Grid = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const {
    cols = 1,
    gap,
    align,
    justify,
    justifyItems,
    rows,
    content,
    flow,
    autoRows,
    autoCols,
    children,
    className,
    ...rest
  } = props;

  // Use gridVariants for all grid-related classes
  const gridClasses = gridVariants({
    cols,
    gap,
    align,
    justify,
    justifyItems,
    rows,
    content,
    flow,
    autoRows,
    autoCols
  });

  const gridClassName = cn(gridClasses, className);

  return (
    <div ref={ref} className={cn("grid", gridClassName)} {...rest}>
      {children}
    </div>
  );
});

Grid.displayName = "Grid";

// =============================================================================
// GRID COL COMPONENT
// =============================================================================

const GridCol = forwardRef<HTMLDivElement, GridColProps>((props, ref) => {
  const { span, start, end, order, children, className, ...rest } = props;

  const colClassName = cn(
    span && COL_SPAN_CLASSES[span],
    start && COL_START_CLASSES[start],
    end && COL_END_CLASSES[end],
    order && ORDER_CLASSES[order],
    className
  );

  return (
    <div ref={ref} className={colClassName} {...rest}>
      {children}
    </div>
  );
});

GridCol.displayName = "GridCol";

// =============================================================================
// COMPOUND EXPORT
// =============================================================================

const CompoundGrid = Object.assign(Grid, {
  Col: GridCol
});

export { CompoundGrid as Grid, GridCol };
