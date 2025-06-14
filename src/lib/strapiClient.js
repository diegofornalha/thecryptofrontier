/**
 * Cliente Strapi para substituir o Strapi Client
 * Configuração para conectar com o Strapi CMS
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

class StrapiClient {
  constructor() {
    this.baseUrl = STRAPI_URL;
    this.apiToken = STRAPI_API_TOKEN;
  }

  /**
   * Método genérico para fazer requisições ao Strapi
   * @param {string} path - Caminho da API (ex: /api/posts)
   * @param {object} options - Opções da requisição
   * @returns {Promise} Resposta da API
   */
  async fetch(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Adiciona token de autenticação se disponível
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Strapi client error:', error);
      throw error;
    }
  }

  /**
   * Buscar posts com paginação
   * @param {object} params - Parâmetros de busca
   * @returns {Promise} Posts e metadados
   */
  async getPosts(params = {}) {
    const {
      start = 0,
      limit = 10,
      sort = 'publishedAt:desc',
      populate = '*',
    } = params;

    const queryParams = new URLSearchParams({
      'pagination[start]': start,
      'pagination[limit]': limit,
      sort,
      populate,
    });

    const response = await this.fetch(`/api/posts?${queryParams}`);
    return response;
  }

  /**
   * Buscar um post específico pelo slug
   * @param {string} slug - Slug do post
   * @returns {Promise} Post completo
   */
  async getPostBySlug(slug) {
    const queryParams = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate[author][populate]': '*',
      'populate[featuredImage]': '*',
      'populate[seo]': '*',
    });

    const response = await this.fetch(`/api/posts?${queryParams}`);
    
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    
    return null;
  }

  /**
   * Buscar posts por pesquisa de texto
   * @param {string} searchTerm - Termo de busca
   * @param {object} params - Parâmetros adicionais
   * @returns {Promise} Posts encontrados
   */
  async searchPosts(searchTerm, params = {}) {
    const {
      start = 0,
      limit = 10,
    } = params;

    const queryParams = new URLSearchParams({
      'filters[$or][0][title][$containsi]': searchTerm,
      'filters[$or][1][excerpt][$containsi]': searchTerm,
      'filters[$or][2][content][$containsi]': searchTerm,
      'pagination[start]': start,
      'pagination[limit]': limit,
      'sort': 'publishedAt:desc',
      'populate': 'author',
    });

    const response = await this.fetch(`/api/posts?${queryParams}`);
    return response;
  }

  /**
   * Buscar autores
   * @param {object} params - Parâmetros de busca
   * @returns {Promise} Lista de autores
   */
  async getAuthors(params = {}) {
    const queryParams = new URLSearchParams({
      populate: 'avatar',
      ...params,
    });

    const response = await this.fetch(`/api/authors?${queryParams}`);
    return response;
  }

  /**
   * Buscar autor por slug
   * @param {string} slug - Slug do autor
   * @returns {Promise} Dados do autor
   */
  async getAuthorBySlug(slug) {
    const queryParams = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate': '*',
    });

    const response = await this.fetch(`/api/authors?${queryParams}`);
    
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    
    return null;
  }

  /**
   * Buscar posts populares (baseado em visualizações ou data)
   * @param {number} limit - Número de posts
   * @returns {Promise} Posts populares
   */
  async getPopularPosts(limit = 5) {
    const queryParams = new URLSearchParams({
      'pagination[limit]': limit,
      'sort': 'publishedAt:desc', // Por enquanto, ordena por data
      'populate': 'author',
    });

    const response = await this.fetch(`/api/posts?${queryParams}`);
    return response;
  }

  /**
   * Buscar posts relacionados
   * @param {string} currentPostId - ID do post atual
   * @param {number} limit - Número de posts
   * @returns {Promise} Posts relacionados
   */
  async getRelatedPosts(currentPostId, limit = 3) {
    const queryParams = new URLSearchParams({
      'filters[id][$ne]': currentPostId,
      'pagination[limit]': limit,
      'sort': 'publishedAt:desc',
      'populate': 'author,featuredImage',
    });

    const response = await this.fetch(`/api/posts?${queryParams}`);
    return response;
  }
}

// Exporta uma instância única do cliente
const strapiClient = new StrapiClient();

export default strapiClient;
export { StrapiClient };