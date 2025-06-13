#!/usr/bin/env node

/**
 * Script para criar Content-Types no Strapi automaticamente
 * Deve ser executado após o Strapi estar rodando
 */

const axios = require('axios');
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

// Aguardar Strapi inicializar
async function waitForStrapi(maxRetries = 30) {
  console.log('⏳ Aguardando Strapi inicializar...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${STRAPI_URL}/_health`);
      if (response.status === 204) {
        console.log('✅ Strapi está rodando!');
        return true;
      }
    } catch (error) {
      console.log(`Tentativa ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Strapi não iniciou no tempo esperado');
}

// Instruções para criar Content-Types
function showInstructions() {
  console.log('\n📋 INSTRUÇÕES PARA CRIAR CONTENT-TYPES NO STRAPI:\n');
  
  console.log('1. Acesse: http://localhost:1337/admin');
  console.log('2. Crie uma conta de admin na primeira vez');
  console.log('3. Vá para Content-Type Builder no menu lateral');
  console.log('4. Crie os seguintes Content-Types:\n');
  
  console.log('═══ POST ═══');
  console.log('- title (Text - Required)');
  console.log('- slug (UID - Target: title)');
  console.log('- content (Rich Text)');
  console.log('- excerpt (Text - Max 300 chars)');
  console.log('- publishedAt (Datetime)');
  console.log('- featuredImage (Media - Single image)');
  console.log('- categories (JSON)');
  console.log('- tags (JSON)');
  console.log('- originalSource (JSON)');
  console.log('- status (Enumeration: draft, published, archived)');
  console.log('- sanityId (Text)\n');
  
  console.log('═══ PAGE ═══');
  console.log('- title (Text - Required)');
  console.log('- slug (UID - Target: title)');
  console.log('- content (Rich Text)');
  console.log('- sanityId (Text)\n');
  
  console.log('═══ AUTHOR ═══');
  console.log('- name (Text - Required)');
  console.log('- slug (UID - Target: name)');
  console.log('- bio (Text)');
  console.log('- avatar (Media - Single image)');
  console.log('- social (JSON)');
  console.log('- sanityId (Text)\n');
  
  console.log('5. Após criar, vá em Settings > Roles > Public');
  console.log('6. Habilite find e findOne para todos os Content-Types');
  console.log('7. Salve as alterações\n');
  
  console.log('8. Para gerar um API Token:');
  console.log('   - Vá em Settings > API Tokens');
  console.log('   - Create new API Token');
  console.log('   - Nome: Migration Token');
  console.log('   - Type: Full access');
  console.log('   - Copie o token e adicione ao .env como STRAPI_API_TOKEN\n');
}

// Script principal
async function main() {
  try {
    await waitForStrapi();
    showInstructions();
    
    console.log('✅ Strapi está pronto para configuração manual!');
    console.log('\n🚀 Após concluir os passos acima, execute:');
    console.log('   node scripts/migration/migrate-sanity-to-strapi.js\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}