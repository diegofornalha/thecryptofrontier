'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
/**
 * Componente para escutar atualizações do Strapi em tempo real
 * Implementa o sistema de preview conforme documentação do Strapi
 */
export function StrapiPreviewListener() {
    const router = useRouter();
    useEffect(() => {
        // Escutar mensagens do Strapi
        const handleMessage = (event) => {
            var _a, _b;
            // Verificar origem para segurança
            const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
            if (!strapiUrl || !event.origin.includes(strapiUrl.replace(/https?:\/\//, ''))) {
                return;
            }
            // Processar mensagem do Strapi
            if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.type) === 'strapi:update') {
                console.log('📝 Strapi update received:', event.data);
                // Refresh da página para buscar dados atualizados
                router.refresh();
            }
            // Preview mode
            if (((_b = event.data) === null || _b === void 0 ? void 0 : _b.type) === 'strapi:preview') {
                const { slug, secret } = event.data;
                // Redirecionar para preview
                if (slug && secret) {
                    window.location.href = `/api/preview?secret=${secret}&slug=${slug}`;
                }
            }
        };
        window.addEventListener('message', handleMessage);
        // Cleanup
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [router]);
    // Este componente não renderiza nada
    return null;
}
/**
 * Hook para verificar se está em modo preview
 */
export function usePreviewMode() {
    const isPreview = typeof window !== 'undefined' &&
        (window.location.search.includes('preview=true') ||
            document.cookie.includes('__prerender_bypass'));
    return { isPreview };
}
