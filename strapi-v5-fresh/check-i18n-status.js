#!/usr/bin/env node

/**
 * 🔍 Script de Verificação do Status i18n
 * Verifica se todas as configurações estão corretas
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 Verificando configuração i18n do Strapi v5...\n');

// Verificar arquivos de configuração
const checks = [
  {
    name: 'Package.json',
    path: './package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.dependencies['@strapi/strapi'] === '5.0.5';
    }
  },
  {
    name: 'Plugin i18n configurado',
    path: './config/plugins.js',
    check: (content) => {
      return content.includes('i18n') && content.includes('enabled: true');
    }
  },
  {
    name: 'Content Type Post com i18n',
    path: './src/api/post/content-types/post/schema.json',
    check: (content) => {
      return content.includes('"localized": true');
    }
  },
  {
    name: 'Content Type Article com i18n',
    path: './src/api/article/content-types/article/schema.json',
    check: (content) => {
      return content.includes('"localized": true');
    }
  },
  {
    name: 'Middlewares configurados',
    path: './config/middlewares.js',
    check: (content) => {
      return content.includes('strapi::cors');
    }
  },
  {
    name: 'Configuração do servidor',
    path: './config/server.js',
    check: (content) => {
      return content.includes('PORT');
    }
  }
];

let allPassed = true;

checks.forEach(({ name, path: filePath, check }) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const passed = check(content);
      console.log(`${passed ? '✅' : '❌'} ${name}`);
      if (!passed) allPassed = false;
    } else {
      console.log(`❌ ${name} - Arquivo não encontrado: ${filePath}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name} - Erro ao verificar: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 Todas as configurações estão corretas!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute: npm run develop');
  console.log('2. Acesse: http://localhost:1337/admin');
  console.log('3. Configure os locales em Settings → Internationalization');
  console.log('4. Verifique os content types em Content-Type Builder');
} else {
  console.log('⚠️  Algumas configurações precisam ser corrigidas.');
  console.log('Consulte o guia: docs/STRAPI-I18N-SETUP-GUIDE.md');
}

console.log('\n🔗 Documentação completa:');
console.log('- docs/STRAPI-I18N-API-REFERENCE.md');
console.log('- examples/strapi-i18n-examples.js');
console.log('- scripts/test-i18n-setup.js'); 