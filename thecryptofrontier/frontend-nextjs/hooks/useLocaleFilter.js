'use client';
import { useEffect, useState } from 'react';
import { fromStrapiLocale } from '@/lib/locale-utils';

/**
 * Hook personalizado para filtrar posts por idioma
 * Garantindo que posts só sejam exibidos no idioma correto
 */
export function useLocaleFilter(posts, currentLocale) {
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() => {
        if (!posts || !Array.isArray(posts)) {
            setFilteredPosts([]);
            return;
        }

        const filtered = posts.filter(post => {
            const data = post.attributes || post;
            const postLocale = data.locale;
            
            // Se o post não tem locale definido, assume inglês
            if (!postLocale) {
                return currentLocale === 'en';
            }
            
            // Converte o locale do Strapi para o formato do frontend
            const frontendLocale = fromStrapiLocale(postLocale);
            
            // Verifica se o locale do post corresponde ao atual
            return frontendLocale === currentLocale;
        });

        setFilteredPosts(filtered);
    }, [posts, currentLocale]);

    return filteredPosts;
}

/**
 * Função para verificar se um post pertence ao idioma especificado
 */
export function isPostInLocale(post, locale) {
    if (!post) return false;
    
    const data = post.attributes || post;
    const postLocale = data.locale;
    
    // Se o post não tem locale definido, assume inglês
    if (!postLocale) {
        return locale === 'en';
    }
    
    // Converte o locale do Strapi para o formato do frontend
    const frontendLocale = fromStrapiLocale(postLocale);
    
    return frontendLocale === locale;
}

/**
 * Função para validar se uma URL de post é válida para o idioma
 */
export function isValidPostUrl(slug, locale) {
    // Heurística básica: posts em inglês geralmente terminam com '-english'
    // posts em português com '-pt' ou '-br', posts em espanhol com '-es'
    if (locale === 'en') {
        return slug.endsWith('-english') || !slug.match(/-(pt|br|es)$/);
    }
    
    if (locale === 'br') {
        return slug.endsWith('-pt') || slug.endsWith('-br');
    }
    
    if (locale === 'es') {
        return slug.endsWith('-es');
    }
    
    return false;
}

export default useLocaleFilter; 