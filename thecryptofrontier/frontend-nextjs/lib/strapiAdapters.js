/**
 * Adaptadores para converter dados do Strapi para o formato esperado pelos componentes
 * Estes adaptadores facilitam a migração gradual do Strapi para o Strapi
 */

/**
 * Converter post do Strapi para formato compatível com componentes
 * @param {object} strapiPost - Post do Strapi
 * @returns {object} Post no formato esperado
 */
export function adaptStrapiPost(strapiPost) {
  if (!strapiPost) return null;

  const attributes = strapiPost.attributes || strapiPost;
  const author = attributes.author?.data;

  return {
    _id: strapiPost.id || attributes.id,
    title: attributes.title,
    slug: attributes.slug,
    mainImage: adaptStrapiImage(attributes.featuredImage),
    content: attributes.content, // Strapi já retorna HTML/Markdown
    publishedAt: attributes.publishedAt,
    excerpt: attributes.excerpt,
    author: author ? adaptStrapiAuthor(author) : null,
    seo: adaptStrapiSeo(attributes.seo),
    originalSource: attributes.originalSource,
    // Campos adicionais para compatibilidade
    _type: 'post',
    estimatedReadingTime: calculateReadingTime(attributes.content),
  };
}

/**
 * Converter autor do Strapi para formato compatível
 * @param {object} strapiAuthor - Autor do Strapi
 * @returns {object} Autor no formato esperado
 */
export function adaptStrapiAuthor(strapiAuthor) {
  if (!strapiAuthor) return null;

  const attributes = strapiAuthor.attributes || strapiAuthor;

  return {
    _id: strapiAuthor.id || attributes.id,
    name: attributes.name,
    slug: attributes.slug,
    bio: attributes.bio,
    image: adaptStrapiImage(attributes.avatar),
    social: attributes.social || {},
    role: attributes.role || 'Autor',
  };
}

/**
 * Converter imagem do Strapi para formato compatível
 * @param {object} strapiImage - Imagem do Strapi
 * @returns {object} Imagem no formato esperado
 */
export function adaptStrapiImage(strapiImage) {
  if (!strapiImage?.data) return null;

  const imageData = strapiImage.data;
  const attributes = imageData.attributes || imageData;
  const formats = attributes.formats || {};

  // Constrói URL completa da imagem
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
  const imageUrl = attributes.url?.startsWith('http') 
    ? attributes.url 
    : `${baseUrl}${attributes.url}`;

  return {
    asset: {
      _ref: imageData.id,
      url: imageUrl,
      metadata: {
        dimensions: {
          width: attributes.width,
          height: attributes.height,
        },
      },
    },
    alt: attributes.alternativeText || attributes.caption || '',
    caption: attributes.caption,
    attribution: attributes.provider || null,
    // URLs das diferentes versões
    url: imageUrl,
    thumbnailUrl: formats.thumbnail?.url ? `${baseUrl}${formats.thumbnail.url}` : imageUrl,
    smallUrl: formats.small?.url ? `${baseUrl}${formats.small.url}` : imageUrl,
    mediumUrl: formats.medium?.url ? `${baseUrl}${formats.medium.url}` : imageUrl,
    largeUrl: formats.large?.url ? `${baseUrl}${formats.large.url}` : imageUrl,
  };
}

/**
 * Converter SEO do Strapi para formato compatível
 * @param {object} strapiSeo - SEO do Strapi
 * @returns {object} SEO no formato esperado
 */
export function adaptStrapiSeo(strapiSeo) {
  if (!strapiSeo) return null;

  return {
    metaTitle: strapiSeo.metaTitle,
    metaDescription: strapiSeo.metaDescription,
    openGraphImage: adaptStrapiImage(strapiSeo.shareImage),
    keywords: strapiSeo.keywords || [],
    canonicalUrl: strapiSeo.canonicalURL,
    metaSocial: strapiSeo.metaSocial || [],
  };
}

/**
 * Converter lista de posts do Strapi
 * @param {array} strapiPosts - Array de posts do Strapi
 * @returns {array} Posts no formato esperado
 */
export function adaptStrapiPostsList(strapiPosts) {
  if (!Array.isArray(strapiPosts)) return [];
  
  return strapiPosts.map(post => adaptStrapiPost(post));
}

/**
 * Calcular tempo estimado de leitura
 * @param {string} content - Conteúdo do post
 * @returns {number} Tempo em minutos
 */
function calculateReadingTime(content) {
  if (!content) return 1;
  
  // Remove tags HTML se houver
  const text = content.replace(/<[^>]*>/g, '');
  // Conta palavras
  const words = text.trim().split(/\s+/).length;
  // Assume 200 palavras por minuto
  const minutes = Math.ceil(words / 200);
  
  return Math.max(1, minutes);
}

/**
 * Converter resposta paginada do Strapi
 * @param {object} strapiResponse - Resposta do Strapi com data e meta
 * @returns {object} Resposta adaptada
 */
export function adaptStrapiPaginatedResponse(strapiResponse) {
  return {
    posts: adaptStrapiPostsList(strapiResponse.data || []),
    total: strapiResponse.meta?.pagination?.total || 0,
    page: strapiResponse.meta?.pagination?.page || 1,
    pageSize: strapiResponse.meta?.pagination?.pageSize || 10,
    pageCount: strapiResponse.meta?.pagination?.pageCount || 1,
  };
}

/**
 * Converter conteúdo rich text do Strapi para HTML
 * @param {string|array} content - Conteúdo do Strapi
 * @returns {string} HTML renderizado
 */
export function adaptStrapiContent(content) {
  if (!content) return '';
  
  // Se já for string (markdown ou HTML), retorna como está
  if (typeof content === 'string') {
    return content;
  }
  
  // Se for array de blocos (futuro rich text do Strapi)
  if (Array.isArray(content)) {
    return content.map(block => {
      // Implementar conversão de blocos conforme necessário
      if (block.type === 'paragraph') {
        return `<p>${block.children.map(child => child.text).join('')}</p>`;
      }
      // Adicionar mais tipos conforme necessário
      return '';
    }).join('\n');
  }
  
  return '';
}