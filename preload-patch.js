import React from 'react';

// Polyfill para o preloadModule 
// Em vez de importar do react-dom, criamos nossa própria implementação
const preloadModule = (mod) => {
  // Simples implementação de polyfill que apenas retorna o módulo
  console.warn('Usando polyfill para preloadModule');
  return mod;
};

// Monkey patch para resolver o problema de importação no Netlify
global.preloadModule = preloadModule; 