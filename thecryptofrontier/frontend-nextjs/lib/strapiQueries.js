/**
 * Queries do Strapi equivalentes às queries GROQ do Strapi
 * Cada função retorna os dados já formatados para os componentes
 */

import strapiClient from './strapiClient';

/**
 * Buscar lista de posts com paginação
 * @param {number} start - Índice inicial
 * @param {number} end - Índice final
 * @returns {Promise} Posts e total
 */
export async function getPostsList(start = 0, end = 10) {
  const limit = end - start;
  const response = await strapiClient.getPosts({
    start,
    limit,
    populate: 'author,featuredImage',
  });

  return {
    posts: response.data || [],
    total: response.meta?.pagination?.total || 0,
  };
}

/**
 * Buscar um post específico pelo slug
 * @param {string} slug - Slug do post
 * @returns {Promise} Post completo ou null
 */
export async function getPostBySlug(slug) {
  const post = await strapiClient.getPostBySlug(slug);
  return post;
}

/**
 * Buscar posts populares para sidebar
 * @param {number} limit - Número de posts
 * @returns {Promise} Array de posts populares
 */
export async function getPopularPosts(limit = 5) {
  const response = await strapiClient.getPopularPosts(limit);
  return response.data || [];
}

/**
 * Buscar posts relacionados
 * @param {string} currentPostId - ID do post atual
 * @param {number} limit - Número de posts
 * @returns {Promise} Array de posts relacionados
 */
export async function getRelatedPosts(currentPostId, limit = 3) {
  const response = await strapiClient.getRelatedPosts(currentPostId, limit);
  return response.data || [];
}

/**
 * Buscar posts por termo de pesquisa
 * @param {string} searchTerm - Termo de busca
 * @param {number} start - Índice inicial
 * @param {number} end - Índice final
 * @returns {Promise} Posts encontrados
 */
export async function searchPosts(searchTerm, start = 0, end = 10) {
  const limit = end - start;
  const response = await strapiClient.searchPosts(searchTerm, {
    start,
    limit,
  });

  return response.data || [];
}

/**
 * Buscar dados para o sitemap
 * @returns {Promise} Posts para o sitemap
 */
export async function getSitemapData() {
  // Busca todos os posts sem limite para o sitemap
  const response = await strapiClient.getPosts({
    start: 0,
    limit: 1000, // Ajuste conforme necessário
    populate: '',
  });

  return {
    posts: response.data?.map(post => ({
      slug: post.attributes.slug,
      publishedAt: post.attributes.publishedAt,
      _updatedAt: post.attributes.updatedAt,
    })) || [],
  };
}

/**
 * Buscar autores
 * @returns {Promise} Lista de autores
 */
export async function getAuthors() {
  const response = await strapiClient.getAuthors();
  return response.data || [];
}

/**
 * Buscar autor por slug
 * @param {string} slug - Slug do autor
 * @returns {Promise} Dados do autor
 */
export async function getAuthorBySlug(slug) {
  const author = await strapiClient.getAuthorBySlug(slug);
  return author;
}