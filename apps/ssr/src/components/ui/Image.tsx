import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import {
  spacingVariants,
  roundedVariants,
  shadowVariants,
  layoutVariants,
  imageFitVariants,
  imagePositionVariants,
  aspectRatioVariants,
  type VariantSpacingProps,
  type RoundedProps,
  type ShadowProps,
  type VariantLayoutProps,
  type ImageFitProps,
  type ImagePositionProps,
  type AspectRatioProps
} from "../../variants";

export interface ImageProps 
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'>,
    Pick<VariantSpacingProps, 'm' | 'mx' | 'my'>,
    RoundedProps,
    ShadowProps,
    Pick<VariantLayoutProps, 'w' | 'h'>,
    ImageFitProps,
    ImagePositionProps,
    AspectRatioProps {
  width?: string | number;
  height?: string | number;
  fallbackSrc?: string;
  withPlaceholder?: boolean;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ 
    className,
    src,
    alt,
    width,
    height,
    fit = 'cover',
    position = 'center',
    aspect = 'auto',
    rounded,
    shadow,
    fallbackSrc,
    withPlaceholder = false,
    onError,
    // Spacing props  
    m, mx, my,
    // Layout props
    w,
    h,
    ...props 
  }, ref) => {
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (fallbackSrc) {
        e.currentTarget.src = fallbackSrc;
      }
      onError?.(e);
    };

    return (
      <img
        ref={ref}
        data-class="image"
        src={src}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        className={cn(
          'block',
          withPlaceholder && 'bg-muted',
          imageFitVariants({ fit }),
          imagePositionVariants({ position }),
          aspectRatioVariants({ aspect }),
          spacingVariants({ m, mx, my }),
          layoutVariants({ w, h }),
          roundedVariants({ rounded }),
          shadowVariants({ shadow }),
          className
        )}
        {...props}
      />
    );
  }
);

Image.displayName = "Image"; 