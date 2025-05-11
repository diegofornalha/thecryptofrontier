import { useEffect } from 'react';

export function OldButton(props) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'OldButton está depreciado. Use o componente Button do shadcn/ui. ' +
        'Será removido na versão 2.0.0.'
      );
    }
  }, []);
  
  return (
    <button 
      className={`sb-component sb-component-button ${props.className || ''}`}
      {...props}
    >
      {props.children}
    </button>
  );
} 