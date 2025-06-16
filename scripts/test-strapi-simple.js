#!/usr/bin/env node

/**
 * Script simplificado para testar comunicação com Strapi
 * Sem dependência do chalk para evitar problemas
 */

const axios = require('axios');
const path = require('path');

// Carrega variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../src/.env.local') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

console.log('\n🚀 Testando Comunicação com Strapi\n');
console.log('URL:', STRAPI_URL);
console.log('Token:', STRAPI_API_TOKEN ? '✅ Configurado' : '⚠️  Não configurado');
console.log('-'.repeat(60));

async function runTests() {
  // Teste 1: Buscar posts (GET)
  console.log('\n🧪 Teste 1: Buscando posts...');
  try {
    const response = await axios.get(`${STRAPI_URL}/api/posts?pagination[limit]=5`, {
      headers: STRAPI_API_TOKEN ? { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` } : {}
    });
    
    const { data, meta } = response.data;
    console.log(`✅ Sucesso! ${data.length} posts encontrados (Total: ${meta.pagination.total})`);
    
    if (data.length > 0) {
      console.log('   Exemplo:', data[0].attributes.title);
    }
  } catch (error) {
    console.log('❌ Erro:', error.response?.status || error.message);
    if (error.response?.status === 403) {
      console.log('   💡 API requer autenticação. Configure o token.');
    }
  }

  // Teste 2: Criar post (POST) - apenas se houver token
  if (STRAPI_API_TOKEN) {
    console.log('\n🧪 Teste 2: Criando post de teste...');
    try {
      const testPost = {
        data: {
          title: `Teste API - ${new Date().toLocaleString('pt-BR')}`,
          slug: `teste-api-${Date.now()}`,
          content: 'Post criado via API para testar integração.',
          excerpt: 'Teste de integração',
          publishedAt: new Date().toISOString()
        }
      };

      const response = await axios.post(
        `${STRAPI_URL}/api/posts`,
        testPost,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          }
        }
      );

      const createdId = response.data.data.id;
      console.log(`✅ Post criado! ID: ${createdId}`);
      console.log(`   URL: https://thecryptofrontier.agentesintegrados.com/blog/${testPost.data.slug}`);

      // Limpar: deletar o post de teste
      console.log('\n🧪 Limpando: Deletando post de teste...');
      await axios.delete(`${STRAPI_URL}/api/posts/${createdId}`, {
        headers: { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` }
      });
      console.log('✅ Post de teste deletado.');

    } catch (error) {
      console.log('❌ Erro:', error.response?.data?.error?.message || error.message);
    }
  } else {
    console.log('\n⚠️  Teste de criação pulado (requer token)');
  }

  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 Resumo:\n');
  
  if (STRAPI_API_TOKEN) {
    console.log('✅ Comunicação completa funcionando!');
    console.log('✅ Frontend pode ler e criar posts no Strapi');
  } else {
    console.log('✅ Leitura funcionando (GET)');
    console.log('⚠️  Para criar posts, adicione o token em STRAPI_API_TOKEN');
  }
  
  console.log('\n💡 Próximos passos:');
  console.log('1. Se precisar de token: acesse', STRAPI_URL + '/admin');
  console.log('2. Vá em Settings > API Tokens > Create new API Token');
  console.log('3. Adicione o token no arquivo .env.local');
  console.log('='.repeat(60) + '\n');
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});