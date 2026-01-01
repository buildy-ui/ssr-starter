import type { ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { gridVariants, type VariantGridProps } from "@/variants";

import { resolveUtilityClassName, type UtilityPropBag, type UtilityPropPrefix } from "@/lib/utility-props";

type GridDomProps = Omit<React.HTMLAttributes<HTMLDivElement>, UtilityPropPrefix>;

export type GridProps
  = GridDomProps &
    UtilityPropBag &
    VariantGridProps & {
  children: ReactNode;
};

// =============================================================================
// GRID COMPONENT
// =============================================================================

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    children,
    className,
    cols = '1-3',
    ...props
  }, ref) => {
    const { utilityClassName, rest } = resolveUtilityClassName(props);

    return (
      <div
        ref={ref}
        data-class="Grid"
        className={cn("grid",
          gridVariants({ cols }),
          utilityClassName,
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

export { Grid };
