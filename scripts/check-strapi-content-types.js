#!/usr/bin/env node

/**
 * Script para verificar quais content-types existem no Strapi
 * e orientar sobre a criação se necessário
 */

const axios = require('axios');
const path = require('path');

// Carrega variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../src/.env.local') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

console.log('\n🔍 Verificando Content-Types do Strapi\n');
console.log('URL:', STRAPI_URL);
console.log('-'.repeat(60));

async function checkContentTypes() {
  // Lista de content-types comuns para verificar
  const contentTypes = [
    'posts',
    'articles', 
    'blogs',
    'pages',
    'authors',
    'categories',
    'tags'
  ];

  const foundTypes = [];
  const notFoundTypes = [];

  console.log('\n📋 Verificando endpoints da API:\n');

  for (const type of contentTypes) {
    try {
      const response = await axios.get(`${STRAPI_URL}/api/${type}`, {
        headers: STRAPI_API_TOKEN ? { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` } : {}
      });
      
      console.log(`✅ /api/${type} - Encontrado!`);
      foundTypes.push(type);
      
      // Mostra quantidade de registros
      if (response.data.meta?.pagination?.total !== undefined) {
        console.log(`   Registros: ${response.data.meta.pagination.total}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ /api/${type} - Não encontrado`);
        notFoundTypes.push(type);
      } else if (error.response?.status === 403) {
        console.log(`🔒 /api/${type} - Requer autenticação`);
        foundTypes.push(type);
      } else {
        console.log(`⚠️  /api/${type} - Erro: ${error.response?.status || error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Resumo:\n');

  if (foundTypes.length > 0) {
    console.log(`✅ Content-types encontrados: ${foundTypes.join(', ')}`);
  }

  if (notFoundTypes.includes('posts') && notFoundTypes.includes('articles')) {
    console.log('\n⚠️  Nenhum content-type de blog encontrado!');
    console.log('\n📝 Para criar o content-type "Post" no Strapi:\n');
    console.log('1. Acesse:', STRAPI_URL + '/admin');
    console.log('2. Vá em "Content-Type Builder"');
    console.log('3. Clique em "Create new collection type"');
    console.log('4. Nome: "Post" (plural: "posts")');
    console.log('5. Adicione os campos:');
    console.log('   - title (Text - Required)');
    console.log('   - slug (UID - Based on title)');
    console.log('   - content (Rich text)');
    console.log('   - excerpt (Text - Long text)');
    console.log('   - publishedAt (DateTime)');
    console.log('   - author (Relation - many-to-one with User)');
    console.log('   - featuredImage (Media - Single media)');
    console.log('   - seo (Component com metaTitle, metaDescription)');
    console.log('\n6. Após criar, vá em Settings > Roles > Public');
    console.log('7. Marque "find" e "findOne" para o content-type Post');
    console.log('8. Salve as permissões');
  }

  // Testa se consegue acessar o painel admin
  console.log('\n🔐 Verificando acesso ao painel admin...');
  try {
    const adminResponse = await axios.get(`${STRAPI_URL}/admin`, {
      maxRedirects: 0,
      validateStatus: (status) => status < 400
    });
    console.log('✅ Painel admin acessível em:', STRAPI_URL + '/admin');
  } catch (error) {
    console.log('❌ Erro ao acessar painel admin');
  }

  console.log('\n' + '='.repeat(60));
}

// Executa verificação
checkContentTypes().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});