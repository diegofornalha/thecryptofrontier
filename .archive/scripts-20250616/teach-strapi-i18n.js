#!/usr/bin/env node

/**
 * Script para ensinar o strapi-specialist sobre i18n
 */

const http = require('http');

const i18nKnowledge = {
  content: `MEMORIZE: Internacionalização (i18n) no Strapi:
  
1. CONFIGURAÇÃO INICIAL:
   - Settings > Global Settings > Internationalization
   - Adicione locales (500+ pré-definidos)
   - Não é possível criar locales customizados
   
2. HABILITAR EM CONTENT-TYPES:
   - Content-Type Builder > Advanced Settings
   - Marque "Enable localization"
   
3. API REST:
   - Criar (padrão): POST /api/items {data:{name:"Item"}}
   - Criar (específico): POST /api/items {data:{name:"Item",locale:"pt"}}
   - Atualizar: PUT /api/items/{id}?locale=fr
   - Buscar: GET /api/items?locale=pt
   - Todos idiomas: GET /api/items?locale=all
   
4. PUBLICAÇÃO:
   - Cada idioma deve ser publicado separadamente
   - strapi.documents('api::item.item').publish({documentId:'abc',locale:'pt'})
   - Use locale:'*' para publicar todos
   
5. IMPORTANTE:
   - Cada tradução é um documento separado
   - Campos únicos são únicos por idioma
   - Relações podem ser localizadas
   
6. CONFIGURAÇÃO AVANÇADA:
   - config/plugins.js: defaultLocale e locales
   - Middleware para detecção automática
   - Fallback para idioma padrão`,
  metadata: {
    source: "i18n-complete-guide",
    category: "internationalization",
    type: "core-knowledge",
    tags: ["i18n", "multilingual", "localization", "strapi"],
    important: true
  }
};

const data = JSON.stringify(i18nKnowledge);

const options = {
  hostname: 'localhost',
  port: 3007,
  path: '/process',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      console.log('\n✅ Strapi Specialist Response:');
      console.log('=====================================');
      console.log(response.content || responseData);
      console.log('=====================================\n');
      
      // Verificar se foi memorizado
      if (response.metadata && response.metadata.agent === 'strapi-specialist') {
        console.log('📚 Conhecimento processado pelo strapi-specialist');
        console.log(`🏷️  Tipo de análise: ${response.metadata.analysisType}`);
      }
    } catch (error) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro ao conectar com strapi-specialist:', error);
  console.log('\n💡 Certifique-se de que o container strapi-specialist está rodando:');
  console.log('   docker ps | grep strapi-specialist');
});

console.log('📤 Enviando conhecimento sobre i18n para strapi-specialist...');
req.write(data);
req.end();