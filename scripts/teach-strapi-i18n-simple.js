#!/usr/bin/env node

const http = require('http');

// Dividir em mensagens menores e mais focadas
const i18nLessons = [
  {
    content: "APRENDA: Para habilitar i18n no Strapi, vá em Settings > Global Settings > Internationalization e adicione os locales desejados. Existem mais de 500 locales pré-definidos. Não é possível criar locales customizados.",
    metadata: { topic: "i18n-setup" }
  },
  {
    content: "APRENDA: Para habilitar i18n em um Content-Type, vá no Content-Type Builder, selecione o tipo, clique em Advanced Settings e marque Enable localization for this Content-Type.",
    metadata: { topic: "i18n-content-type" }
  },
  {
    content: "APRENDA: API i18n - Criar conteúdo com locale: POST /api/items com {data:{name:'Nome',locale:'pt'}}. Buscar por locale: GET /api/items?locale=pt. Buscar todos: GET /api/items?locale=all",
    metadata: { topic: "i18n-api" }
  },
  {
    content: "APRENDA: Com Draft & Publish, publique cada idioma separadamente: strapi.documents('api::item.item').publish({documentId:'abc123',locale:'pt'}). Use locale:'*' para publicar todas as versões.",
    metadata: { topic: "i18n-publish" }
  }
];

let currentIndex = 0;

function sendLesson(lesson) {
  const data = JSON.stringify(lesson);
  
  const options = {
    hostname: 'localhost',
    port: 3007,
    path: '/process',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    
    res.on('end', () => {
      console.log(`✅ Lição ${currentIndex + 1}/${i18nLessons.length} enviada`);
      currentIndex++;
      
      // Enviar próxima lição após 1 segundo
      if (currentIndex < i18nLessons.length) {
        setTimeout(() => sendLesson(i18nLessons[currentIndex]), 1000);
      } else {
        console.log('\n🎉 Todas as lições sobre i18n foram enviadas!');
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Erro na lição ${currentIndex + 1}:`, error.message);
  });

  req.write(data);
  req.end();
}

console.log('📚 Iniciando ensino sobre i18n para strapi-specialist...\n');
sendLesson(i18nLessons[0]);