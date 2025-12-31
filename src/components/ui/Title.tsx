import type { ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { resolveUtilityClassName, ux, type UtilityPropBag, type UtilityPropPrefix } from "../../lib/utility-props";

type TitleDomProps = Omit<React.HTMLAttributes<HTMLHeadingElement>, UtilityPropPrefix>;

export type TitleProps
  = TitleDomProps &
    UtilityPropBag & {
  children: ReactNode;
  component?: ElementType;
  order?: 1 | 2 | 3 | 4 | 5 | 6;
};

const defaultProps = ux({
  text: 'xl',       // font-size: xl (20px)
  font: 'bold',     // font-weight: bold
  leading: 'normal' // line-height: normal
});

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  ({
    children,
    className,
    order = 1,
    ...props
  }, ref) => {
    const { utilityClassName, rest } = resolveUtilityClassName(props);
    const headingTag = `h${order}` as ElementType;

    const Heading = headingTag as ElementType;

    return (
      <Heading
        ref={ref}
        data-class="title"
        className={cn(
          defaultProps,
          utilityClassName,
          className
        )}
        {...rest}
      >
        {children}
      </Heading>
    );
  }
);

Title.displayName = "Title"; 