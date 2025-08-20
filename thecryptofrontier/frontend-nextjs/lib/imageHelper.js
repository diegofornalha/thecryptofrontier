/**
 * Helper para trabalhar com URLs de imagens
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';

/**
 * Gera URL completa para uma imagem
 * @param {string|object} image - URL da imagem ou objeto de imagem
 * @returns {string|null} URL completa da imagem
 */
export function getImageUrl(image) {
  if (!image) return null;
  
  // Se for string, assume que é uma URL
  if (typeof image === 'string') {
    return image.startsWith('http') ? image : `${STRAPI_URL}${image}`;
  }
  
  // Se for objeto com URL
  if (image.url) {
    return image.url.startsWith('http') ? image.url : `${STRAPI_URL}${image.url}`;
  }
  
  // Se for estrutura do Strapi
  if (image.data?.attributes?.url) {
    const url = image.data.attributes.url;
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  
  return null;
}

/**
 * Builder de URL de imagem com opções de tamanho
 * @param {string|object} image - Imagem
 * @returns {object} Builder com métodos para configurar a imagem
 */
export function urlForImage(image) {
  let baseUrl = getImageUrl(image);
  let width = null;
  let height = null;
  
  return {
    width: function(w) {
      width = w;
      return this;
    },
    height: function(h) {
      height = h;
      return this;
    },
    url: function() {
      if (!baseUrl) return null;
      
      // Por enquanto, retorna a URL base
      // No futuro, pode-se adicionar parâmetros de redimensionamento
      return baseUrl;
    }
  };
}