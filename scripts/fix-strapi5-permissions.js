#!/usr/bin/env node

/**
 * Script para configurar permissões no Strapi v5
 * Atualizado para trabalhar com a nova estrutura de permissões
 */

const axios = require('axios');
require('dotenv').config();

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const API_TOKEN = '87e5f7e4c6917d39415f669f077cafa528e26c3aff065206805c82daa7e6ede2941bb783992ab6a8fc0f31f45b239dce9915b8a161d41ff312529464da6f9501218cb15b375253cfad94df96fb61286ca4e96558dfc37d36bbdb58214fd7bf76dcec1c61a3c7c1d9d00d541dc14c7d158463432f252708b9b421a02f65e0defb';

async function configurePermissions() {
  console.log('🔧 Configurando permissões para Strapi v5...\n');
  
  try {
    // No Strapi v5, as permissões de API são configuradas diferentemente
    // Vamos tentar acessar diretamente a API de content-manager
    console.log('📋 Verificando content-types disponíveis...');
    
    const contentTypesResponse = await axios.get(`${STRAPI_URL}/api/content-manager/content-types`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    console.log('Content-types encontrados:', contentTypesResponse.data);
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Endpoint de content-manager não encontrado. Tentando abordagem alternativa...');
      
      // Abordagem alternativa: tentar acessar diretamente os endpoints
      await testEndpoints();
    } else {
      console.error('❌ Erro:', error.response?.data || error.message);
    }
  }
}

async function testEndpoints() {
  console.log('\n🧪 Testando endpoints diretamente...\n');
  
  const endpoints = [
    '/api/posts',
    '/api/articles',
    '/api/posts?populate=*',
    '/api/articles?populate=*'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${STRAPI_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });
      
      if (response.data) {
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log(`   Dados: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Erro: ${error.response?.status} ${error.response?.statusText || error.message}`);
      
      // Se for 403, vamos tentar entender o erro
      if (error.response?.status === 403 && error.response?.data) {
        console.log(`   Detalhes: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
  
  // Testar criação de um post
  console.log('\n🧪 Tentando criar um post de teste...\n');
  
  try {
    const testPost = {
      data: {
        title: 'Post de Teste - Permissões',
        slug: 'teste-permissoes-' + Date.now(),
        content: 'Testando as permissões do Strapi v5',
        excerpt: 'Teste',
        publishedAt: new Date().toISOString()
      }
    };
    
    const createResponse = await axios.post(`${STRAPI_URL}/api/posts`, testPost, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Post criado com sucesso!');
    console.log(`   ID: ${createResponse.data.data.id}`);
  } catch (error) {
    console.log(`❌ Erro ao criar post: ${error.response?.status} ${error.response?.statusText || error.message}`);
    if (error.response?.data) {
      console.log(`   Detalhes: ${JSON.stringify(error.response.data)}`);
    }
  }
}

async function checkTokenPermissions() {
  console.log('\n🔑 Verificando permissões do token...\n');
  
  try {
    // Tentar acessar o endpoint /api/users/me para verificar o token
    const meResponse = await axios.get(`${STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    console.log('✅ Token válido para usuário:', meResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Token inválido ou expirado');
    } else if (error.response?.status === 403) {
      console.log('⚠️  Token válido mas sem permissões suficientes');
    } else {
      console.log('❓ Endpoint /api/users/me não disponível (pode ser um token de API)');
    }
  }
}

async function main() {
  await checkTokenPermissions();
  await configurePermissions();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}