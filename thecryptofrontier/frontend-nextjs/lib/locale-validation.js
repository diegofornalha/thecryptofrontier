import { fromStrapiLocale } from './locale-utils';

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
        return slug.endsWith('-pt') || slug.endsWith('-br') || slug.endsWith('-portugues');
    }
    
    if (locale === 'es') {
        return slug.endsWith('-es') || slug.endsWith('-espanol');
    }
    
    return false;
}

/**
 * Função para filtrar posts por idioma (versão síncrona para servidor)
 */
export function filterPostsByLocale(posts, locale) {
    if (!posts || !Array.isArray(posts)) {
        return [];
    }

    return posts.filter(post => {
        const data = post.attributes || post;
        const postLocale = data.locale;
        
        // Se o post não tem locale definido, assume inglês
        if (!postLocale) {
            return locale === 'en';
        }
        
        // Converte o locale do Strapi para o formato do frontend
        const frontendLocale = fromStrapiLocale(postLocale);
        
        // Verifica se o locale do post corresponde ao atual
        return frontendLocale === locale;
    });
} 