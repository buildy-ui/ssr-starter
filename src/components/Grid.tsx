/**
 * Grid component using Tailwind CSS classes (JIT-compatible)
 *
 * Uses gridVariants from @/variants (CDL-backed) for base grid variants
 * All class strings are static for proper Tailwind JIT compilation
 */
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { gridVariants, type VariantGridProps } from "@/variants";

// =============================================================================
// USING EXISTING VARIANTS - No duplication of Tailwind classes
// =============================================================================

// All grid-related base classes come from gridVariants (CDL-backed).
// Responsive behavior is represented structurally and compiled here (no "md:" strings in CDL).

// =============================================================================
// TYPES - Using VariantGridProps from existing variants
// =============================================================================

type GridColsValue = number | NonNullable<VariantGridProps["cols"]>;
type GridGap = NonNullable<VariantGridProps["gap"]>;
type GridAlign = NonNullable<VariantGridProps["align"]>;
type GridJustify = NonNullable<VariantGridProps["justify"]>;
type GridJustifyItems = NonNullable<VariantGridProps["justifyItems"]>;
type GridRows = NonNullable<VariantGridProps["rows"]>;
type GridContent = NonNullable<VariantGridProps["content"]>;
type GridFlow = NonNullable<VariantGridProps["flow"]>;
type GridAutoRows = NonNullable<VariantGridProps["autoRows"]>;
type GridAutoCols = NonNullable<VariantGridProps["autoCols"]>;

type GridBreakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

export type GridColsRule = {
  bp: GridBreakpoint;
  value: number;
};

function bpPrefix(bp: GridBreakpoint): "" | "sm:" | "md:" | "lg:" | "xl:" | "2xl:" {
  switch (bp) {
    case "base":
      return "";
    case "sm":
      return "sm:";
    case "md":
      return "md:";
    case "lg":
      return "lg:";
    case "xl":
      return "xl:";
    case "2xl":
      return "2xl:";
  }
}

function compileCols(cols?: GridColsValue | GridColsRule[]): string {
  if (!cols) return "";

  // Simple: cols={3}
  if (!Array.isArray(cols)) {
    const key = String(cols) as unknown as NonNullable<VariantGridProps["cols"]>;
    return gridVariants({ cols: key });
  }

  // Responsive rule list: cols={[{bp:"base",value:1},{bp:"md",value:2}]}
  const out: string[] = [];
  for (const rule of cols) {
    if (!rule) continue;
    const prefix = bpPrefix(rule.bp);
    const value = rule.value;
    if (prefix === "") {
      const key = String(value) as unknown as NonNullable<VariantGridProps["cols"]>;
      out.push(gridVariants({ cols: key }));
      continue;
    }
    out.push(`${prefix}grid-cols-${value}`);
  }
  return out.join(" ").trim();
}

// Grid item specific types (using gridVariants)
type GridColSpan = NonNullable<VariantGridProps["colSpan"]>;
type GridColStart = NonNullable<VariantGridProps["colStart"]>;
type GridColEnd = NonNullable<VariantGridProps["colEnd"]>;
type GridOrder = NonNullable<VariantGridProps["order"]>;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns or responsive rules list */
  cols?: GridColsValue | GridColsRule[];
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
  const gridClasses = cn(
    compileCols(cols),
    gridVariants({
      gap,
      align,
      justify,
      justifyItems,
      rows,
      content,
      flow,
      autoRows,
      autoCols,
    } as any)
  );

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
    gridVariants({
      colSpan: span,
      colStart: start,
      colEnd: end,
      order: order
    }),
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
