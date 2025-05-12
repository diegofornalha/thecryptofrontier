import React from 'react';

// Mock simples para o componente Image do Next.js
const NextImage = (props) => {
  const { src, alt, width, height, layout, ...rest } = props;
  
  // Se não tiver width ou height definidos, use valores padrão
  const imgWidth = width || (layout === 'fill' ? '100%' : 40);
  const imgHeight = height || (layout === 'fill' ? '100%' : 40);
  
  // Se src for um objeto (como em otimização de imagens Next.js), obter o URL
  const imgSrc = typeof src === 'string' ? src : (src?.src || '');
  
  return (
    <img
      src={imgSrc}
      alt={alt || ""}
      width={imgWidth}
      height={imgHeight}
      style={{
        objectFit: 'cover',
        maxWidth: '100%',
        ...(layout === 'fill' && { position: 'absolute', inset: 0 }),
        ...rest.style
      }}
      {...rest}
    />
  );
};

// Mock para os outros exports do módulo Image
NextImage.loader = ({ src }) => src;
NextImage.displayName = 'NextImage';

// Interface para usar com o Storybook
export default NextImage; 