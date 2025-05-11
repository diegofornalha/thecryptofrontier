import React from 'react';

interface ImageProps {
  src: string | { src: string; height?: number; width?: number };
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: any;
}

// Um componente simples que substitui o Next/Image
const NextImage = ({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: ImageProps) => {
  const imgSrc = typeof src === 'string' ? src : src.src;
  const imgWidth = width || (typeof src !== 'string' ? src.width : undefined);
  const imgHeight = height || (typeof src !== 'string' ? src.height : undefined);

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={imgWidth}
      height={imgHeight}
      className={className}
      {...props}
    />
  );
};

export default NextImage; 