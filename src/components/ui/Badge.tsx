import type { ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import {
  spacingVariants,
  roundedVariants,
  shadowVariants,
  borderVariants,
  badgeSizeVariants,
  badgeStyleVariants,
  type VariantSpacingProps,
  type RoundedProps,
  type ShadowProps,
  type BorderProps,
  type BadgeSizeProps,
  type BadgeStyleProps,
} from "../../variants";

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantSpacingProps, 'm' | 'mx' | 'my'>,
    RoundedProps,
    ShadowProps,
    BorderProps,
    BadgeSizeProps,
    BadgeStyleProps {
  children: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  dot?: boolean;
}

// Dot indicator - pure presentational
const BadgeDot = () => (
  <span 
    data-class="badge-dot" 
    className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" 
  />
);

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    children, 
    className,
    variant = 'default',
    size = 'default',
    rounded = 'md',
    shadow,
    dot = false,
    // Spacing props  
    m, mx, my,
    // Border props
    border,
    borderTop,
    borderBottom,
    borderLeft,
    borderRight,
    // Content props
    leftSection,
    rightSection,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        data-class="badge"
        className={cn(
          // Base styles (static)
          'inline-flex items-center font-semibold transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          // Variants (CVA)
          badgeSizeVariants({ size }),
          badgeStyleVariants({ variant }),
          roundedVariants({ rounded }),
          shadowVariants({ shadow }),
          spacingVariants({ m, mx, my }),
          borderVariants({ border, borderTop, borderBottom, borderLeft, borderRight }),
          className
        )}
        {...props}
      >
        {dot && <BadgeDot />}
        {leftSection && (
          <span data-class="badge-left-section" className="mr-1.5">{leftSection}</span>
        )}
        {children}
        {rightSection && (
          <span data-class="badge-right-section" className="ml-1.5">{rightSection}</span>
        )}
      </div>
    );
  }
);

Badge.displayName = "Badge"; 