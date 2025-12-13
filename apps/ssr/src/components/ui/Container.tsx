import type { ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import {
  spacingVariants,
  colorVariants,
  containerSizeVariants,
  textAlignVariants,
  type VariantSpacingProps,
  type ColorProps,
  type ContainerSizingProps,
  type TextAlignProps
} from "../../variants";

export interface ContainerProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantSpacingProps,
    ColorProps,
    ContainerSizingProps,
    TextAlignProps {
  children: ReactNode;
  component?: ElementType;
  centered?: boolean;
  fluid?: boolean;
}

export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ 
    children, 
    className,
    component = 'div',
    size = 'lg',
    centered = true,
    fluid = false,
    ta,
    // Spacing props
    p, px = 'md', py,
    m, mx, my, mt, mb, ml, mr,
    pt, pb, pl, pr,
    // Color props
    bg,
    c,
    borderColor,
    ...props 
  }, ref) => {
    const Element = component as ElementType;

    return (
      <Element
        ref={ref}
        data-class="container"
        className={cn(
          containerSizeVariants({ size }),
          centered && 'mx-auto',
          fluid && 'max-w-none',
          textAlignVariants({ ta }),
          spacingVariants({ p, px, py, pt, pb, pl, pr, m, mx, my, mt, mb, ml, mr }),
          colorVariants({ bg, c, borderColor }),
          className
        )}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Container.displayName = "Container"; 