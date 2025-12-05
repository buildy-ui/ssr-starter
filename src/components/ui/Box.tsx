import type { ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import {
  spacingVariants,
  roundedVariants,
  shadowVariants,
  colorVariants,
  layoutVariants,
  borderVariants,
  flexVariants,
  aspectRatioVariants,
  type VariantSpacingProps,
  type RoundedProps,
  type ShadowProps,
  type ColorProps,
  type VariantLayoutProps,
  type BorderProps,
  type VariantFlexProps,
  type AspectRatioProps
} from "../../variants";

export interface BoxProps 
  extends VariantSpacingProps,
    RoundedProps,
    ShadowProps,
    ColorProps,
    VariantLayoutProps,
    BorderProps,
    VariantFlexProps,
    AspectRatioProps {
  component?: ElementType;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  ({ 
    component = "div",
    className,
    children,
    // Spacing props
    m, mx, my, mt, mr, mb, ml,
    p, px, py, pt, pr, pb, pl,
    // Rounded props
    rounded,
    // Shadow props
    shadow,
    // Color props
    bg, c, borderColor,
    // Layout props
    display, maxW, w, h, minH, position, z, overflow,
    // Border props
    border, borderTop, borderBottom, borderLeft, borderRight,
    // Flex props
    direction, align, justify, wrap, gap,
    // Aspect ratio props
    aspect,
    ...props 
  }, ref) => {
    const Element = component as ElementType;

    return (
      <Element
        ref={ref}
        data-class="box"
        className={cn(
          spacingVariants({
            m, mx, my, mt, mr, mb, ml,
            p, px, py, pt, pr, pb, pl
          }),
          roundedVariants({ rounded }),
          shadowVariants({ shadow }),
          colorVariants({ bg, c, borderColor }),
          layoutVariants({ display, maxW, w, h, minH, position, z, overflow }),
          borderVariants({ border, borderTop, borderBottom, borderLeft, borderRight }),
          flexVariants({ direction, align, justify, wrap, gap }),
          aspectRatioVariants({ aspect }),
          className
        )}
        {...props}
      >
        {children}
      </Element>
    );
  }
);

Box.displayName = "Box";