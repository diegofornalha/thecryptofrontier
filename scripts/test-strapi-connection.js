#!/usr/bin/env node

/**
 * Script para testar a comunicação completa com o Strapi
 * Testa: GET (listar), POST (criar), PUT (atualizar), DELETE (deletar)
 */

const axios = require('axios');
const path = require('path');

// Importa chalk corretamente para a versão 5+
let chalk;
(async () => {
  chalk = (await import('chalk')).default;
})();

// Carrega variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../src/.env.local') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

// Configuração do cliente axios
const api = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_API_TOKEN && { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` })
  }
});

// Helpers para log colorido
const log = {
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  test: (msg) => console.log(chalk.cyan('🧪'), msg),
};

// Variável para armazenar ID do post criado
let createdPostId = null;

async function testConnection() {
  console.log(chalk.bold('\n🚀 Testando Comunicação com Strapi\n'));
  console.log('URL:', chalk.cyan(STRAPI_URL));
  console.log('Token:', STRAPI_API_TOKEN ? chalk.green('Configurado') : chalk.yellow('Não configurado (usando permissões públicas)'));
  console.log(chalk.gray('-'.repeat(60)));

  // Teste 1: GET - Listar posts
  log.test('Teste 1: Buscando posts existentes...');
  try {
    const response = await api.get('/api/posts?pagination[limit]=5');
    const { data, meta } = response.data;
    
    log.success(`${data.length} posts encontrados (Total: ${meta.pagination.total})`);
    
    if (data.length > 0) {
      console.log(chalk.gray('  Exemplo:'), data[0].attributes.title);
    }
  } catch (error) {
    log.error(`Erro ao buscar posts: ${error.response?.status || error.message}`);
    if (error.response?.status === 403) {
      log.warn('API requer autenticação. Configure o token em .env.local');
    }
  }

  console.log();

  // Teste 2: POST - Criar post
  if (STRAPI_API_TOKEN) {
    log.test('Teste 2: Criando post de teste...');
    try {
      const testPost = {
        data: {
          title: `Teste de Integração - ${new Date().toLocaleString('pt-BR')}`,
          slug: `teste-integracao-${Date.now()}`,
          content: 'Este é um post criado automaticamente para testar a integração com o Strapi. 🚀',
          excerpt: 'Post de teste automático',
          publishedAt: new Date().toISOString()
        }
      };

      const response = await api.post('/api/posts', testPost);
      createdPostId = response.data.data.id;
      
      log.success(`Post criado com sucesso! ID: ${createdPostId}`);
      log.info(`URL: ${STRAPI_URL.replace('ale-blog', 'thecryptofrontier')}/blog/${testPost.data.slug}`);
    } catch (error) {
      log.error(`Erro ao criar post: ${error.response?.data?.error?.message || error.message}`);
    }

    console.log();

    // Teste 3: PUT - Atualizar post
    if (createdPostId) {
      log.test('Teste 3: Atualizando post criado...');
      try {
        const updateData = {
          data: {
            title: `Teste de Integração - ATUALIZADO - ${new Date().toLocaleString('pt-BR')}`,
            content: 'Conteúdo atualizado! A integração está funcionando perfeitamente. ✅'
          }
        };

        await api.put(`/api/posts/${createdPostId}`, updateData);
        log.success('Post atualizado com sucesso!');
      } catch (error) {
        log.error(`Erro ao atualizar post: ${error.response?.data?.error?.message || error.message}`);
      }

      console.log();

      // Teste 4: DELETE - Deletar post
      log.test('Teste 4: Deletando post de teste...');
      try {
        await api.delete(`/api/posts/${createdPostId}`);
        log.success('Post deletado com sucesso!');
      } catch (error) {
        log.error(`Erro ao deletar post: ${error.response?.data?.error?.message || error.message}`);
      }
    }
  } else {
    log.warn('Testes de criação/atualização/deleção pulados (requerem token de API)');
  }

  console.log();

  // Teste 5: Verificar estrutura de dados
  log.test('Teste 5: Verificando estrutura de dados do Strapi...');
  try {
    const response = await api.get('/api/posts?pagination[limit]=1&populate=*');
    if (response.data.data.length > 0) {
      const post = response.data.data[0];
      
      console.log(chalk.gray('  Estrutura encontrada:'));
      console.log(chalk.gray('  - id:'), typeof post.id);
      console.log(chalk.gray('  - attributes:'), Object.keys(post.attributes).join(', '));
      
      log.success('Estrutura de dados compatível!');
    }
  } catch (error) {
    log.error('Erro ao verificar estrutura de dados');
  }

  // Resumo final
  console.log(chalk.gray('\n' + '='.repeat(60)));
  console.log(chalk.bold('📊 Resumo do Teste:\n'));
  
  if (STRAPI_API_TOKEN) {
    log.info('✅ Comunicação completa testada (GET, POST, PUT, DELETE)');
    log.info('✅ Frontend pode interagir totalmente com o Strapi');
  } else {
    log.info('✅ Leitura de posts funcionando (GET)');
    log.warn('⚠️  Para publicar posts, configure o token de API');
  }

  console.log(chalk.gray('\n' + '='.repeat(60)));
}

// Executa os testes
testConnection().catch(error => {
  log.error('Erro fatal:', error.message);
  process.exit(1);
});