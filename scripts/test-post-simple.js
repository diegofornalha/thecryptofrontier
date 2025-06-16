#!/usr/bin/env node

/**
 * Script super simples para testar publicação no Strapi
 * Cria um post básico de teste
 */

const axios = require('axios');
const path = require('path');

// Carrega variáveis de ambiente do arquivo correto
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Configurações
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

async function createTestPost() {
  console.log('🚀 Criando post de teste...\n');
  console.log('URL do Strapi:', STRAPI_URL);
  console.log('Token configurado:', STRAPI_API_TOKEN ? '✅ Sim' : '❌ Não');
  console.log('-'.repeat(50));

  try {
    // Dados do post de teste
    const postData = {
      data: {
        title: "Post de Teste - " + new Date().toLocaleString('pt-BR'),
        slug: "post-teste-" + Date.now(),
        content: "Este é um post de teste criado via API. Se você está vendo isso no frontend, significa que a integração está funcionando! 🎉",
        excerpt: "Post de teste para verificar integração",
        publishedAt: new Date().toISOString() // Publica imediatamente
      }
    };

    console.log('\n📝 Dados do post:');
    console.log('Título:', postData.data.title);
    console.log('Slug:', postData.data.slug);
    console.log('\n');

    // Faz a requisição
    const response = await axios.post(
      `${STRAPI_URL}/api/posts`,
      postData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      }
    );

    console.log('✅ Post criado com sucesso!');
    console.log('-'.repeat(50));
    console.log('ID:', response.data.data.id);
    console.log('Título:', response.data.data.attributes.title);
    console.log('Slug:', response.data.data.attributes.slug);
    console.log('-'.repeat(50));
    console.log('\n🔗 Verifique o post em:');
    console.log(`${STRAPI_URL.replace('https://ale-blog', 'https://thecryptofrontier')}/blog/${postData.data.slug}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Erro ao criar post:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Mensagem:', error.response.data?.error?.message || error.response.statusText);
      console.error('\nDetalhes completos:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }

    console.log('\n💡 Dicas de solução:');
    console.log('1. Verifique se o token está configurado corretamente');
    console.log('2. Confirme se o token tem permissões de escrita para Posts');
    console.log('3. Verifique se a URL do Strapi está correta');
    console.log('4. Para criar um token: acesse ' + STRAPI_URL + '/admin');
    console.log('   Vá em Settings > API Tokens > Create new API Token');
  }
}

// Executa
createTestPost();