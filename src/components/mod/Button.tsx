import type { ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { useTheme } from "@/providers/theme";
import {
  spacingVariants,
  roundedVariants,
  shadowVariants,
  layoutVariants,
  buttonSizeVariants,
  buttonStyleVariants,
  buttonContentAlignVariants,
  type VariantSpacingProps,
  type RoundedProps,
  type ShadowProps,
  type VariantLayoutProps,
  type ButtonSizeProps,
  type ButtonStyleProps,
  type ButtonContentAlignProps
} from "../../variants";

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Pick<VariantSpacingProps, 'm' | 'mx' | 'my' | 'mr'>,
    RoundedProps,
    ShadowProps,
    Pick<VariantLayoutProps, 'w'>,
    ButtonSizeProps,
    ButtonStyleProps,
    ButtonContentAlignProps {
  children: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    className,
    variant = 'default',
    size,
    rounded,
    shadow,
    loading = false,
    disabled = false,
    // Spacing props  
    m, mx, my, mr,
    // Layout props
    w,
    // Content props
    leftSection,
    rightSection,
    contentAlign,
    ...props 
  }, ref) => {
    const { rounded: roundedTheme, buttonSize: buttonSizeTheme } = useTheme()
    const effectiveRounded = rounded ?? roundedTheme.button
    const effectiveButtonSize = size ?? buttonSizeTheme.default

    return (
      <button
        ref={ref}
        data-class="button"
        disabled={disabled || loading}
        className={cn(
          // Base styles (static)
          'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium',
          'transition-colors disabled:pointer-events-none disabled:opacity-50',
          '[&_svg]:pointer-events-none [&_svg]:shrink-0 shrink-0',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Variants (CVA)
          buttonSizeVariants({ size: effectiveButtonSize }),
          buttonStyleVariants({ variant }),
          buttonContentAlignVariants({ contentAlign }),
          roundedVariants({ rounded: effectiveRounded }),
          shadowVariants({ shadow }),
          spacingVariants({ m, mx, my, mr }),
          layoutVariants({ w }),
          // State modifiers
          loading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {!loading && leftSection && (
          <span data-class="button-left-section" className="mr-2">{leftSection}</span>
        )}
        {children}
        {!loading && rightSection && (
          <span data-class="button-right-section" className="ml-2">{rightSection}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button"; 