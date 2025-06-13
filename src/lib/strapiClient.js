import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

// Cliente Strapi
const strapiClient = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Authorization': STRAPI_API_TOKEN ? `Bearer ${STRAPI_API_TOKEN}` : '',
    'Content-Type': 'application/json'
  }
});

// Funções auxiliares
export async function getPosts(params = {}) {
  try {
    const query = new URLSearchParams({
      populate: '*',
      sort: 'publishedAt:desc',
      ...params
    });
    
    const response = await strapiClient.get(`/posts?${query}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    const response = await strapiClient.get(`/posts`, {
      params: {
        filters: {
          slug: {
            $eq: slug
          }
        },
        populate: '*'
      }
    });
    
    return response.data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

export async function getPages(params = {}) {
  try {
    const query = new URLSearchParams({
      populate: '*',
      ...params
    });
    
    const response = await strapiClient.get(`/pages?${query}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

export async function getPageBySlug(slug) {
  try {
    const response = await strapiClient.get(`/pages`, {
      params: {
        filters: {
          slug: {
            $eq: slug
          }
        },
        populate: '*'
      }
    });
    
    return response.data.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    return null;
  }
}

export async function getAuthors() {
  try {
    const response = await strapiClient.get('/authors?populate=*');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}

// Função para converter dados do Strapi para formato compatível com componentes existentes
export function transformStrapiPost(post) {
  if (!post) return null;
  
  const { attributes } = post;
  
  return {
    _id: post.id,
    title: attributes.title,
    slug: { current: attributes.slug },
    publishedAt: attributes.publishedAt,
    excerpt: attributes.excerpt,
    content: attributes.content,
    mainImage: attributes.featuredImage?.data ? {
      asset: {
        url: `${STRAPI_URL}${attributes.featuredImage.data.attributes.url}`
      }
    } : null,
    categories: attributes.categories || [],
    tags: attributes.tags || [],
    author: attributes.author?.data ? {
      name: attributes.author.data.attributes.name,
      slug: { current: attributes.author.data.attributes.slug }
    } : null,
    seo: attributes.seo || {}
  };
}

export default strapiClient;