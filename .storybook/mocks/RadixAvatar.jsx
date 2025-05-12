import React from 'react';

// Mock para o namespace AvatarPrimitive do Radix UI
const Root = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref}
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`}
    {...props} 
  />
));
Root.displayName = 'AvatarPrimitive.Root';

const Image = React.forwardRef(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={`aspect-square h-full w-full ${className || ''}`}
    {...props}
  />
));
Image.displayName = 'AvatarPrimitive.Image';

const Fallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className || ''}`}
    {...props}
  />
));
Fallback.displayName = 'AvatarPrimitive.Fallback';

// Exporta o namespace completo como esperado pelo componente Avatar
const AvatarPrimitive = {
  Root,
  Image,
  Fallback
};

// Adiciona explicitamente os displayNames ao objeto exportado
AvatarPrimitive.Root.displayName = 'AvatarPrimitive.Root';
AvatarPrimitive.Image.displayName = 'AvatarPrimitive.Image';
AvatarPrimitive.Fallback.displayName = 'AvatarPrimitive.Fallback';

export default AvatarPrimitive; 