import React from 'react';
import * as nextImage from 'next/image';

// Mock para o Next.js Image
const OriginalNextImage = nextImage.default;

Object.defineProperty(nextImage, 'default', {
  configurable: true,
  value: (props) => {
    const { src, alt, width, height, ...rest } = props;
    
    return (
      <img
        src={typeof src === 'string' ? src : src.src || ''}
        alt={alt}
        width={width || 40}
        height={height || 40}
        style={{ 
          objectFit: 'cover', 
          maxWidth: '100%',
          height: 'auto',
          ...rest.style 
        }}
        {...rest}
      />
    );
  },
});

// Re-exportando para uso
export default nextImage; 