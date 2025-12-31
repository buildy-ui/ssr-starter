import { ElementType, forwardRef, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { resolveUtilityClassName, ux, type UtilityPropBag, type UtilityPropPrefix } from "../../lib/utility-props";

type ContainerDomProps = Omit<React.HTMLAttributes<HTMLElement>, UtilityPropPrefix>;

export type ContainerProps = ContainerDomProps & UtilityPropBag & {
  component?: ElementType;
  className?: string;
  children?: ReactNode;
};

const defaultProps = ux({
  mx: 'auto',
  px: '4'
});

export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({
    component = "div",
    children,
    className,
    ...props
  }, ref) => {
    const { utilityClassName, rest } = resolveUtilityClassName(props);

    const Element = component as ElementType;

    return (
      <Element
        ref={ref}
        data-class="container"
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

Container.displayName = "Container"; 