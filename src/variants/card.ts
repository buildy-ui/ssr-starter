import { cva, type VariantProps } from "class-variance-authority";

export const cardVariantVariants = cva("", {
  variants: {
    variant: {
      default: "border-border",
      outlined: "border-border shadow-none",
      filled: "border-transparent bg-muted/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const cardHeaderVariants = cva("flex flex-col space-y-1.5");

export const cardTitleVariants = cva("font-semibold leading-none tracking-tight");

export const cardDescriptionVariants = cva("text-sm text-muted-foreground");

export const cardContentVariants = cva("pt-0");

export const cardFooterVariants = cva("flex items-center pt-0");

export interface CardHeaderProps extends VariantProps<typeof cardHeaderVariants> {}
export interface CardTitleProps extends VariantProps<typeof cardTitleVariants> {}
export interface CardDescriptionProps extends VariantProps<typeof cardDescriptionVariants> {}
export interface CardContentProps extends VariantProps<typeof cardContentVariants> {}
export interface CardFooterProps extends VariantProps<typeof cardFooterVariants> {}
export type CardVariantProps = VariantProps<typeof cardVariantVariants> & VariantProps<typeof cardHeaderVariants> & VariantProps<typeof cardTitleVariants> & VariantProps<typeof cardDescriptionVariants> & VariantProps<typeof cardContentVariants> & VariantProps<typeof cardFooterVariants>;
export type CardProps = CardVariantProps & CardHeaderProps & CardTitleProps & CardDescriptionProps & CardContentProps & CardFooterProps;
