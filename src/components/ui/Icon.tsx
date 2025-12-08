import type { ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import {
  spacingVariants,
  colorVariants,
  iconSizeVariants,
  type VariantSpacingProps,
  type ColorProps,
  type IconSizingProps
} from "../../variants";

export interface IconProps 
  extends React.HTMLAttributes<HTMLElement>,
    Pick<VariantSpacingProps, 'm' | 'mx' | 'my'>,
    Pick<ColorProps, 'c'>,
    IconSizingProps {
  children?: ReactNode;
  component?: ElementType;
  lucideIcon?: any; // For Lucide React icons
}

export const Icon = forwardRef<HTMLElement, IconProps>(
  ({
    children,
    className,
    component: Component = 'span',
    size = 'sm',
    lucideIcon: LucideIcon,
    m, mx, my,
    c = 'foreground',
    ...props
  }, ref) => {
    const { 'aria-hidden': ariaHidden, role, ...rest } = props;

    const baseClasses = cn(
      'inline-block flex items-center justify-center',
      iconSizeVariants({ size }),
      spacingVariants({ m, mx, my }),
      colorVariants({ c }),
      className
    );

    const ComponentWithRef = Component as React.ComponentType<any>;

    return (
      <ComponentWithRef
        ref={ref}
        data-class="icon"
        className={baseClasses}
        aria-hidden={ariaHidden}
        role={role}
        {...rest}
      >
        {LucideIcon ? (
          <LucideIcon
            className={cn(
              iconSizeVariants({ size }),
              spacingVariants({ m, mx, my }),
              colorVariants({ c })
            )}
          />
        ) : (
          children
        )}
      </ComponentWithRef>
    );
  }
);

Icon.displayName = "Icon"; 