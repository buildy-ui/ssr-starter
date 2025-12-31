import type { ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { resolveUtilityClassName, ux, type UtilityPropBag, type UtilityPropPrefix } from "../../lib/utility-props";

type TextDomProps = Omit<React.HTMLAttributes<HTMLElement>, UtilityPropPrefix>;

export type TextProps
  = TextDomProps &
    UtilityPropBag & {
  children: ReactNode;
  component?: ElementType;
};

const defaultProps = ux({
  text: 'base',     // font-size: base (16px)
  font: 'normal',   // font-weight: normal
  leading: 'normal' // line-height: normal
});

export const Text = forwardRef<HTMLElement, TextProps>(
  ({
    children,
    className,
    component = 'p',
    ...props
  }, ref) => {
    const { utilityClassName, rest } = resolveUtilityClassName(props);
    const Element = component as ElementType;

    return (
      <Element
        ref={ref}
        data-class="text"
        className={cn(
          defaultProps,
          utilityClassName,
          className
        )}
        {...rest}
      >
        {children}
      </Element>
    );
  }
);

Text.displayName = "Text"; 