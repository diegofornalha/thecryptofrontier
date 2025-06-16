#!/usr/bin/env node

/**
 * Gerenciador de Posts do Strapi - Interface Unificada
 * 
 * Este script fornece uma interface completa para:
 * - Criar posts no formato correto
 * - Validar dados antes do envio
 * - Integrar com agentes automatizados
 * - Monitorar status e erros
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configurações
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

// Cliente Strapi
class StrapiPostManager {
  constructor() {
    this.baseUrl = STRAPI_URL;
    this.token = API_TOKEN;
    this.stats = {
      created: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Valida os dados do post antes de enviar
   */
  validatePost(data) {
    const errors = [];
    
    // Campos obrigatórios
    if (!data.title) errors.push('title é obrigatório');
    if (!data.content) errors.push('content é obrigatório');
    
    // Validações de tipo
    if (data.readingTime && typeof data.readingTime !== 'number') {
      errors.push('readingTime deve ser um número');
    }
    if (data.featured !== undefined && typeof data.featured !== 'boolean') {
      errors.push('featured deve ser boolean');
    }
    
    // Validações de tamanho
    if (data.title && data.title.length > 255) {
      errors.push('title não pode ter mais de 255 caracteres');
    }
    if (data.excerpt && data.excerpt.length > 500) {
      errors.push('excerpt não pode ter mais de 500 caracteres');
    }
    
    return errors;
  }

  /**
   * Formata os dados para o padrão do Strapi
   */
  formatPostData(rawData) {
    // Garante que temos a estrutura correta
    const formatted = {
      data: {
        title: rawData.title,
        content: rawData.content,
        slug: rawData.slug || this.generateSlug(rawData.title),
        excerpt: rawData.excerpt || rawData.summary || '',
        author: rawData.author || 'AI Agent',
        tags: rawData.tags || [],
        categories: rawData.categories || [],
        readingTime: rawData.readingTime || this.calculateReadingTime(rawData.content),
        featured: rawData.featured || false,
        publishedAt: rawData.publishedAt || new Date().toISOString()
      }
    };

    // Adiciona SEO se fornecido
    if (rawData.seo || rawData.metaDescription) {
      formatted.data.seo = {
        metaTitle: rawData.seo?.metaTitle || rawData.title,
        metaDescription: rawData.seo?.metaDescription || rawData.metaDescription || rawData.excerpt,
        keywords: rawData.seo?.keywords || rawData.tags
      };
    }

    return formatted;
  }

  /**
   * Cria um post no Strapi
   */
  async createPost(rawData) {
    try {
      // Valida dados
      const errors = this.validatePost(rawData);
      if (errors.length > 0) {
        throw new Error(`Validação falhou: ${errors.join(', ')}`);
      }

      // Formata dados
      const postData = this.formatPostData(rawData);

      // Envia para o Strapi
      const response = await axios.post(
        `${this.baseUrl}/api/posts`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      this.stats.created++;
      
      return {
        success: true,
        id: response.data.data.id,
        slug: response.data.data.attributes.slug,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${response.data.data.attributes.slug}`
      };

    } catch (error) {
      this.stats.failed++;
      this.stats.errors.push({
        title: rawData.title,
        error: error.response?.data?.error || error.message
      });

      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Cria múltiplos posts
   */
  async createMultiplePosts(posts) {
    console.log(`\n📝 Processando ${posts.length} posts...\n`);
    
    const results = [];
    
    for (const [index, post] of posts.entries()) {
      console.log(`[${index + 1}/${posts.length}] Criando: ${post.title}`);
      
      const result = await this.createPost(post);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ Sucesso! URL: ${result.url}`);
      } else {
        console.log(`❌ Erro: ${result.error}`);
      }
      
      // Delay entre posts para não sobrecarregar
      await this.delay(1000);
    }
    
    return results;
  }

  /**
   * Importa posts de um arquivo JSON
   */
  async importFromJSON(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const posts = JSON.parse(content);
      
      if (!Array.isArray(posts)) {
        throw new Error('O arquivo deve conter um array de posts');
      }
      
      return await this.createMultiplePosts(posts);
      
    } catch (error) {
      console.error('Erro ao importar arquivo:', error.message);
      throw error;
    }
  }

  /**
   * Gera slug a partir do título
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  /**
   * Calcula tempo de leitura
   */
  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exibe estatísticas
   */
  showStats() {
    console.log('\n📊 Estatísticas:');
    console.log(`✅ Posts criados: ${this.stats.created}`);
    console.log(`❌ Falhas: ${this.stats.failed}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Erros detalhados:');
      this.stats.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.title}: ${err.error}`);
      });
    }
  }
}

// Interface para agentes automatizados
class AgentInterface {
  constructor(manager) {
    this.manager = manager;
  }

  /**
   * Cria um post a partir de dados do agente
   */
  async createFromAgent(agentData) {
    // Adapta o formato do agente para o formato esperado
    const postData = {
      title: agentData.title,
      content: agentData.content || agentData.body,
      excerpt: agentData.excerpt || agentData.summary,
      author: agentData.author || 'AI Agent',
      tags: agentData.tags || agentData.keywords || [],
      categories: agentData.categories || [agentData.category],
      featured: agentData.featured || agentData.highlight || false,
      publishedAt: agentData.publishDate || agentData.publishedAt,
      seo: {
        metaTitle: agentData.metaTitle || agentData.seoTitle,
        metaDescription: agentData.metaDescription || agentData.seoDescription,
        keywords: agentData.keywords || agentData.tags
      }
    };

    return await this.manager.createPost(postData);
  }

  /**
   * Webhook handler para receber posts de agentes
   */
  async handleWebhook(webhookData) {
    console.log('🤖 Recebido do agente:', webhookData.source || 'unknown');
    
    // Processa dados baseado no tipo de agente
    let posts = [];
    
    if (webhookData.posts) {
      posts = webhookData.posts;
    } else if (webhookData.post) {
      posts = [webhookData.post];
    } else if (webhookData.articles) {
      posts = webhookData.articles;
    } else if (webhookData.article) {
      posts = [webhookData.article];
    } else {
      posts = [webhookData];
    }

    const results = [];
    for (const post of posts) {
      const result = await this.createFromAgent(post);
      results.push(result);
    }

    return results;
  }
}

// CLI Interface
async function main() {
  const manager = new StrapiPostManager();
  const agent = new AgentInterface(manager);
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
🚀 Strapi Post Manager

Uso:
  node strapi-post-manager.js <comando> [opções]

Comandos:
  create-single     Criar um único post (interativo)
  import <arquivo>  Importar posts de um arquivo JSON
  webhook-server    Iniciar servidor webhook para agentes
  test             Testar conexão e criar post de exemplo
  validate <arquivo> Validar arquivo JSON sem criar posts

Exemplos:
  node strapi-post-manager.js test
  node strapi-post-manager.js import posts.json
  node strapi-post-manager.js webhook-server --port 3001
    `);
    return;
  }

  switch (command) {
    case 'test':
      console.log('🧪 Testando criação de post...');
      const testPost = {
        title: 'Post de Teste - Strapi Manager',
        content: '## Teste do Gerenciador\n\nEste é um post criado automaticamente para testar a integração.',
        excerpt: 'Post de teste do gerenciador Strapi',
        tags: ['teste', 'strapi', 'automação'],
        categories: ['Testes'],
        author: 'Strapi Manager'
      };
      
      const result = await manager.createPost(testPost);
      console.log('\nResultado:', result);
      break;

    case 'import':
      const filePath = args[1];
      if (!filePath) {
        console.error('❌ Forneça o caminho do arquivo JSON');
        process.exit(1);
      }
      
      await manager.importFromJSON(filePath);
      manager.showStats();
      break;

    case 'webhook-server':
      const express = require('express');
      const app = express();
      const port = args.includes('--port') ? 
        args[args.indexOf('--port') + 1] : 3001;
      
      app.use(express.json());
      
      app.post('/webhook/posts', async (req, res) => {
        try {
          const results = await agent.handleWebhook(req.body);
          res.json({ success: true, results });
        } catch (error) {
          res.status(500).json({ 
            success: false, 
            error: error.message 
          });
        }
      });
      
      app.listen(port, () => {
        console.log(`🎯 Webhook server rodando em http://localhost:${port}/webhook/posts`);
      });
      break;

    case 'validate':
      const validatePath = args[1];
      if (!validatePath) {
        console.error('❌ Forneça o caminho do arquivo JSON');
        process.exit(1);
      }
      
      try {
        const content = await fs.readFile(validatePath, 'utf-8');
        const posts = JSON.parse(content);
        
        console.log(`\n📋 Validando ${posts.length} posts...\n`);
        
        let hasErrors = false;
        posts.forEach((post, i) => {
          const errors = manager.validatePost(post);
          if (errors.length > 0) {
            hasErrors = true;
            console.log(`❌ Post ${i + 1} (${post.title || 'sem título'}):`);
            errors.forEach(err => console.log(`   - ${err}`));
          }
        });
        
        if (!hasErrors) {
          console.log('✅ Todos os posts são válidos!');
        }
      } catch (error) {
        console.error('❌ Erro ao validar:', error.message);
      }
      break;

    default:
      console.error(`❌ Comando desconhecido: ${command}`);
  }
}

// Exportar para uso em outros scripts
module.exports = {
  StrapiPostManager,
  AgentInterface
};

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}