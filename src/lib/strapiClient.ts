/**
 * Cliente Strapi TypeScript - Formato 100% Nativo
 * Segue exatamente o padrão de resposta do Strapi v4/v5
 */

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

interface StrapiAttributes {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  author?: {
    data: {
      id: number;
      attributes: {
        name: string;
        email?: string;
        bio?: string;
        avatar?: any;
      };
    };
  };
  category?: {
    data: {
      id: number;
      attributes: {
        name: string;
        slug: string;
      };
    };
  };
  featuredImage?: {
    data: {
      id: number;
      attributes: {
        url: string;
        alternativeText?: string;
        width?: number;
        height?: number;
      };
    };
  };
}

interface StrapiPost {
  id: number;
  attributes: StrapiAttributes;
}

interface CreatePostData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  publishedAt?: string | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  author?: number;
  category?: number;
  featuredImage?: number;
}

class StrapiClient {
  private baseUrl: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
    this.apiToken = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';
  }

  /**
   * Método base para requisições à API do Strapi
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Strapi API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Strapi Client Error:', error);
      throw error;
    }
  }

  /**
   * Buscar posts com paginação e filtros
   */
  async getPosts(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: Record<string, any>;
    populate?: string | string[];
    status?: 'published' | 'draft';
  } = {}): Promise<StrapiResponse<StrapiPost[]>> {
    const {
      page = 1,
      pageSize = 10,
      sort = 'publishedAt:desc',
      filters = {},
      populate = '*',
      status
    } = params;

    const queryParams = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      sort,
    });

    // Adiciona populate
    if (Array.isArray(populate)) {
      populate.forEach(field => queryParams.append('populate[]', field));
    } else {
      queryParams.append('populate', populate);
    }

    // Adiciona filtros
    if (status === 'published') {
      queryParams.append('filters[publishedAt][$notNull]', 'true');
    } else if (status === 'draft') {
      queryParams.append('filters[publishedAt][$null]', 'true');
    }

    // Adiciona filtros customizados
    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(`filters[${key}]`, value);
    });

    return this.fetch<StrapiResponse<StrapiPost[]>>(`/api/posts?${queryParams}`);
  }

  /**
   * Buscar post por ID
   */
  async getPost(id: number): Promise<StrapiSingleResponse<StrapiPost>> {
    return this.fetch<StrapiSingleResponse<StrapiPost>>(
      `/api/posts/${id}?populate=*`
    );
  }

  /**
   * Buscar post por slug
   */
  async getPostBySlug(slug: string): Promise<StrapiPost | null> {
    const response = await this.fetch<StrapiResponse<StrapiPost[]>>(
      `/api/posts?filters[slug][$eq]=${slug}&populate=*`
    );

    return response.data && response.data.length > 0 ? response.data[0]! : null;
  }

  /**
   * Criar novo post
   */
  async createPost(data: CreatePostData): Promise<StrapiSingleResponse<StrapiPost>> {
    // Gera slug se não fornecido
    if (!data.slug) {
      data.slug = this.generateSlug(data.title);
    }

    return this.fetch<StrapiSingleResponse<StrapiPost>>('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Atualizar post
   */
  async updatePost(
    id: number,
    data: Partial<CreatePostData>
  ): Promise<StrapiSingleResponse<StrapiPost>> {
    return this.fetch<StrapiSingleResponse<StrapiPost>>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Deletar post
   */
  async deletePost(id: number): Promise<StrapiSingleResponse<StrapiPost>> {
    return this.fetch<StrapiSingleResponse<StrapiPost>>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Buscar posts por texto
   */
  async searchPosts(
    query: string,
    params: {
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<StrapiResponse<StrapiPost[]>> {
    const { page = 1, pageSize = 10 } = params;

    const queryParams = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'filters[$or][0][title][$containsi]': query,
      'filters[$or][1][content][$containsi]': query,
      'filters[$or][2][excerpt][$containsi]': query,
      'populate': '*',
      'sort': 'publishedAt:desc',
    });

    return this.fetch<StrapiResponse<StrapiPost[]>>(`/api/posts?${queryParams}`);
  }

  /**
   * Upload de imagem
   */
  async uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        ...(this.apiToken && { 'Authorization': `Bearer ${this.apiToken}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return response.json();
  }

  /**
   * Gerar slug a partir do título
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
}

// Exporta instância única
const strapiClient = new StrapiClient();

export default strapiClient;
export { StrapiClient, type StrapiPost, type StrapiResponse, type CreatePostData };