import React from 'react';

// Mock para o useRouter do Next.js
export function useRouter() {
  return {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: () => Promise.resolve(true),
    replace: () => Promise.resolve(true),
    reload: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => Promise.resolve(),
    beforePopState: () => {},
    events: {
      on: () => {},
      off: () => {},
      emit: () => {},
    },
    isFallback: false,
    isReady: true,
    isPreview: false,
  };
}

// Mock para o Next Router
const router = {
  useRouter,
};

export default router; 