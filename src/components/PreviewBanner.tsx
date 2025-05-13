'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function PreviewBanner() {
  const [isPreview, setIsPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se estamos em modo de preview
    const isPreviewMode = 
      window.location.hostname.includes('deploy-preview') || 
      window.location.hostname.includes('netlify.app') ||
      router.query.preview === 'true' ||
      process.env.NEXT_PUBLIC_SANITY_PREVIEW === 'true';
    
    setIsPreview(isPreviewMode);
  }, [router.query]);

  if (!isPreview) return null;

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 text-center sticky top-0 z-50">
      <p className="flex items-center justify-center gap-2">
        <span className="w-3 h-3 bg-black rounded-full animate-pulse"></span>
        Modo de Visualização Ativo
        <button 
          onClick={() => {
            // Remover o parâmetro preview
            const url = new URL(window.location.href);
            url.searchParams.delete('preview');
            window.location.href = url.toString();
          }}
          className="px-2 py-1 bg-black text-white rounded text-xs hover:bg-gray-800"
        >
          Sair
        </button>
      </p>
    </div>
  );
} 