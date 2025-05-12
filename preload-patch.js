import React from 'react';
import { preload as preloadModule } from 'react-dom';

// Monkey patch para resolver o problema de importação no Netlify
if (typeof preloadModule !== 'function') {
  // Fallback se preloadModule não estiver disponível
  global.preloadModule = (mod) => {
    console.warn('Usando fallback para preloadModule');
    return mod;
  };
} else {
  global.preloadModule = preloadModule;
} 