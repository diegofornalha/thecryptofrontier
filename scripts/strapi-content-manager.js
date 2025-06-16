#!/usr/bin/env node

/**
 * Content Manager para Strapi - Gerenciamento avançado via API
 * Inclui funcionalidades para autores, categorias, mídia e mais
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

class StrapiContentManager {
  constructor() {
    this.api = axios.create({
      baseURL: STRAPI_URL,
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });
  }

  // ===== POSTS =====
  
  async createPost(data) {
    try {
      // Processa tags se fornecidas
      if (data.tags && typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map(tag => tag.trim());
      }

      const postData = {
        data: {
          title: data.title,
          content: data.content || '',
          slug: data.slug || this.generateSlug(data.title),
          excerpt: data.excerpt || '',
          publishedAt: data.publish ? new Date().toISOString() : null,
          seo: {
            metaTitle: data.metaTitle || data.title,
            metaDescription: data.metaDescription || data.excerpt || '',
            keywords: data.keywords || '',
          },
          tags: data.tags || [],
          author: data.authorId || null,
          category: data.categoryId || null,
          featuredImage: data.featuredImageId || null
        }
      };

      const response = await this.api.post('/api/posts', postData);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePost(id, data) {
    try {
      const updateData = { data: {} };
      
      // Apenas adiciona campos que foram fornecidos
      if (data.title !== undefined) updateData.data.title = data.title;
      if (data.content !== undefined) updateData.data.content = data.content;
      if (data.slug !== undefined) updateData.data.slug = data.slug;
      if (data.excerpt !== undefined) updateData.data.excerpt = data.excerpt;
      if (data.tags !== undefined) updateData.data.tags = data.tags;
      if (data.authorId !== undefined) updateData.data.author = data.authorId;
      if (data.categoryId !== undefined) updateData.data.category = data.categoryId;
      if (data.featuredImageId !== undefined) updateData.data.featuredImage = data.featuredImageId;
      
      if (data.publish !== undefined) {
        updateData.data.publishedAt = data.publish ? new Date().toISOString() : null;
      }

      const response = await this.api.put(`/api/posts/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPost(id) {
    try {
      const response = await this.api.get(`/api/posts/${id}`, {
        params: {
          'populate': '*'
        }
      });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPosts(options = {}) {
    try {
      const params = {
        'pagination[page]': options.page || 1,
        'pagination[pageSize]': options.limit || 10,
        'sort': options.sort || 'publishedAt:desc',
        'populate': options.populate || 'author,category,featuredImage'
      };

      if (options.search) {
        params['filters[title][$containsi]'] = options.search;
      }

      if (options.status === 'published') {
        params['filters[publishedAt][$notNull]'] = true;
      } else if (options.status === 'draft') {
        params['filters[publishedAt][$null]'] = true;
      }

      const response = await this.api.get('/api/posts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePost(id) {
    try {
      await this.api.delete(`/api/posts/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== AUTORES =====
  
  async createAuthor(data) {
    try {
      const authorData = {
        data: {
          name: data.name,
          email: data.email || '',
          bio: data.bio || '',
          slug: data.slug || this.generateSlug(data.name),
          role: data.role || 'Autor',
          social: {
            twitter: data.twitter || '',
            linkedin: data.linkedin || '',
            github: data.github || ''
          },
          avatar: data.avatarId || null
        }
      };

      const response = await this.api.post('/api/authors', authorData);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAuthors(options = {}) {
    try {
      const params = {
        'populate': 'avatar',
        'sort': 'name:asc'
      };

      const response = await this.api.get('/api/authors', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== CATEGORIAS =====
  
  async createCategory(data) {
    try {
      const categoryData = {
        data: {
          name: data.name,
          slug: data.slug || this.generateSlug(data.name),
          description: data.description || ''
        }
      };

      const response = await this.api.post('/api/categories', categoryData);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategories() {
    try {
      const response = await this.api.get('/api/categories', {
        params: {
          'sort': 'name:asc'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== MÍDIA =====
  
  async uploadImage(filePath, options = {}) {
    try {
      const form = new FormData();
      const fileStream = fs.createReadStream(filePath);
      const fileName = path.basename(filePath);
      
      form.append('files', fileStream, fileName);
      
      if (options.ref && options.refId && options.field) {
        form.append('ref', options.ref);
        form.append('refId', options.refId);
        form.append('field', options.field);
      }

      const response = await this.api.post('/api/upload', form, {
        headers: {
          ...form.getHeaders()
        }
      });

      return response.data[0];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMedia(options = {}) {
    try {
      const params = {
        'pagination[page]': options.page || 1,
        'pagination[pageSize]': options.limit || 20,
        'sort': 'createdAt:desc'
      };

      const response = await this.api.get('/api/upload/files', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== UTILITÁRIOS =====
  
  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data?.error?.message || error.response.statusText;
      return new Error(`Strapi API Error: ${message}`);
    }
    return error;
  }

  // ===== FUNÇÕES DE ALTO NÍVEL =====
  
  async publishArticleFromMarkdown(filePath, options = {}) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse do conteúdo markdown
      const titleMatch = content.match(/^## Título:\s*(.+)$/m);
      const slugMatch = content.match(/^## Slug:\s*(.+)$/m);
      const resumoMatch = content.match(/^## Resumo:\s*(.+)$/m);
      const tagsMatch = content.match(/^## Tags:\s*(.+)$/m);
      const categoriasMatch = content.match(/^## Categorias:\s*(.+)$/m);
      const seoTitleMatch = content.match(/Meta Título:\s*(.+)$/m);
      const seoDescMatch = content.match(/Meta Descrição:\s*(.+)$/m);
      const contentMatch = content.match(/## CONTEÚDO COMPLETO:\s*([\s\S]+)$/);

      if (!titleMatch || !contentMatch) {
        throw new Error('Arquivo markdown inválido');
      }

      // Processa categorias
      let categoryId = null;
      if (categoriasMatch) {
        const categoryName = categoriasMatch[1].split(',')[0].trim();
        const categories = await this.getCategories();
        const existingCategory = categories.data.find(
          cat => cat.attributes.name.toLowerCase() === categoryName.toLowerCase()
        );
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else if (options.createCategory) {
          const newCategory = await this.createCategory({ name: categoryName });
          categoryId = newCategory.id;
        }
      }

      // Cria o post
      const postData = {
        title: titleMatch[1],
        slug: slugMatch ? slugMatch[1] : this.generateSlug(titleMatch[1]),
        content: contentMatch[1].trim(),
        excerpt: resumoMatch ? resumoMatch[1] : '',
        tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : [],
        categoryId: categoryId,
        publish: !options.draft,
        metaTitle: seoTitleMatch ? seoTitleMatch[1] : titleMatch[1],
        metaDescription: seoDescMatch ? seoDescMatch[1] : (resumoMatch ? resumoMatch[1] : ''),
        authorId: options.authorId
      };

      const post = await this.createPost(postData);
      
      return {
        success: true,
        post: post,
        url: `${STRAPI_URL}/blog/${postData.slug}`
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkImport(jsonFilePath) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
      const results = {
        posts: { success: 0, failed: 0 },
        authors: { success: 0, failed: 0 },
        categories: { success: 0, failed: 0 }
      };

      // Importa categorias
      if (data.categories) {
        for (const category of data.categories) {
          try {
            await this.createCategory(category);
            results.categories.success++;
          } catch (error) {
            results.categories.failed++;
            console.error(`Erro ao criar categoria ${category.name}:`, error.message);
          }
        }
      }

      // Importa autores
      if (data.authors) {
        for (const author of data.authors) {
          try {
            await this.createAuthor(author);
            results.authors.success++;
          } catch (error) {
            results.authors.failed++;
            console.error(`Erro ao criar autor ${author.name}:`, error.message);
          }
        }
      }

      // Importa posts
      if (data.posts) {
        for (const post of data.posts) {
          try {
            await this.createPost(post);
            results.posts.success++;
          } catch (error) {
            results.posts.failed++;
            console.error(`Erro ao criar post ${post.title}:`, error.message);
          }
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

// Exporta a classe e uma instância
module.exports = StrapiContentManager;
module.exports.default = new StrapiContentManager();