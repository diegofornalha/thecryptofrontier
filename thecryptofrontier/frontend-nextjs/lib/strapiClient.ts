/**
 * Cliente Strapi TypeScript - Formato 100% Nativo
 * Segue exatamente o padrão de resposta do Strapi v4/v5
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

interface Post {
  id: number;
  attributes: {
    title: string;
    content?: string;
    description?: string;
    slug?: string;
    publishedAt: string;
    author?: string;
    [key: string]: any;
  };
}

class StrapiClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL?: string, token?: string) {
    this.baseURL = baseURL || STRAPI_URL;
    this.token = token || STRAPI_API_TOKEN;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Strapi API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Posts endpoints
  async getPosts(params?: {
    populate?: string;
    sort?: string;
    filters?: any;
    pagination?: {
      start?: number;
      limit?: number;
    };
  }): Promise<StrapiResponse<Post[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.populate) searchParams.append('populate', params.populate);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.pagination?.start) searchParams.append('pagination[start]', params.pagination.start.toString());
    if (params?.pagination?.limit) searchParams.append('pagination[limit]', params.pagination.limit.toString());
    
    const query = searchParams.toString();
    return this.request<StrapiResponse<Post[]>>(`/posts${query ? '?' + query : ''}`);
  }

  async getPost(id: number, params?: { populate?: string }): Promise<StrapiResponse<Post>> {
    const searchParams = new URLSearchParams();
    if (params?.populate) searchParams.append('populate', params.populate);
    
    const query = searchParams.toString();
    return this.request<StrapiResponse<Post>>(`/posts/${id}${query ? '?' + query : ''}`);
  }

  async getPostBySlug(slug: string, locale?: string, params?: { populate?: string }): Promise<StrapiResponse<Post[]>> {
    const searchParams = new URLSearchParams();
    if (params?.populate) searchParams.append('populate', params.populate);
    searchParams.append('filters[slug][$eq]', slug);
    if (locale) searchParams.append('locale', locale);
    
    const query = searchParams.toString();
    return this.request<StrapiResponse<Post[]>>(`/posts?${query}`);
  }

  async createPost(data: Partial<Post['attributes']>): Promise<StrapiResponse<Post>> {
    return this.request<StrapiResponse<Post>>('/posts', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async updatePost(id: number, data: Partial<Post['attributes']>): Promise<StrapiResponse<Post>> {
    return this.request<StrapiResponse<Post>>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deletePost(id: number): Promise<StrapiResponse<Post>> {
    return this.request<StrapiResponse<Post>>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async publishPost(id: number): Promise<StrapiResponse<Post>> {
    return this.request<StrapiResponse<Post>>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          publishedAt: new Date().toISOString(),
        },
      }),
    });
  }
}

export const strapiClient = new StrapiClient();
export default StrapiClient;
export type { Post, StrapiResponse };