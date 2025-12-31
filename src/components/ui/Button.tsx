import type { ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { resolveUtilityClassName, type UtilityPropBag, type UtilityPropPrefix } from "../../lib/utility-props";
import { buttonStyleVariants, buttonSizeVariants, type ButtonVariantProps } from "../../variants";

type ButtonDomProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, UtilityPropPrefix>;

export type ButtonProps
  = ButtonDomProps &
    UtilityPropBag &
    ButtonVariantProps & {
  children: ReactNode;
  disabled?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    className,
    variant = 'default',
    size = 'default',
    ...props
  }, ref) => {
    const { utilityClassName, rest } = resolveUtilityClassName(props);

    return (
      <button
        ref={ref}
        data-class="button"
        className={cn(
          buttonStyleVariants({ variant }),
          buttonSizeVariants({ size }),
          utilityClassName,
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button"; 