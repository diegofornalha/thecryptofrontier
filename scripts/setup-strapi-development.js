#!/usr/bin/env node

/**
 * Script para configurar Strapi em modo desenvolvimento e criar content-types
 * Tenta diferentes estratégias para ativar o modo desenvolvimento
 */

const axios = require('axios');
const path = require('path');

// Carrega variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '';

console.log('🔧 Configurando Strapi para Modo Desenvolvimento\n');
console.log('URL:', STRAPI_URL);
console.log('Token:', STRAPI_API_TOKEN ? '✅ Configurado' : '❌ Não configurado');
console.log('-'.repeat(60));

async function setupDevelopmentMode() {
  if (!STRAPI_API_TOKEN) {
    console.log('❌ Token de API necessário!');
    console.log('\n💡 Para criar um token:');
    console.log('1. Acesse:', STRAPI_URL + '/admin');
    console.log('2. Vá em Settings > API Tokens');
    console.log('3. Crie um token com "Full access"');
    console.log('4. Adicione ao .env.local: STRAPI_API_TOKEN=seu_token');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  };

  try {
    console.log('\n🔍 Verificando modo atual do Strapi...');
    
    // Tenta verificar informações do sistema
    try {
      const infoResponse = await axios.get(`${STRAPI_URL}/admin/information`, { headers });
      console.log('📊 Informações do Strapi:');
      console.log('- Versão:', infoResponse.data?.strapiVersion || 'N/A');
      console.log('- Node.js:', infoResponse.data?.nodeVersion || 'N/A');
      console.log('- Ambiente:', infoResponse.data?.environment || 'N/A');
    } catch (error) {
      console.log('⚠️  Não foi possível obter informações do sistema');
    }

    console.log('\n🔄 Tentativa 1: Mudando configuração via API...');
    
    // Tenta mudar configurações via API administrativa
    try {
      const configResponse = await axios.put(`${STRAPI_URL}/admin/config`, {
        environment: 'development',
        autoReload: true
      }, { headers });
      
      console.log('✅ Configuração alterada via API!');
    } catch (error) {
      console.log('❌ Falha na mudança via API:', error.response?.status || error.message);
    }

    console.log('\n🔄 Tentativa 2: Reiniciando em modo desenvolvimento...');
    
    // Tenta reiniciar o servidor
    try {
      await axios.post(`${STRAPI_URL}/admin/restart`, {
        environment: 'development'
      }, { headers });
      
      console.log('✅ Comando de reinicialização enviado!');
      console.log('⏳ Aguardando 30 segundos para reinicialização...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
    } catch (error) {
      console.log('❌ Falha no reinício:', error.response?.status || error.message);
    }

    console.log('\n🔄 Tentativa 3: Criando content-types diretamente...');
    
    // Tenta criar content-types mesmo em produção
    await attemptContentTypeCreation(headers);

  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

async function attemptContentTypeCreation(headers) {
  // Schema simplificado do Post
  const postContentType = {
    kind: 'collectionType',
    collectionName: 'posts',
    info: {
      singularName: 'post',
      pluralName: 'posts',
      displayName: 'Post',
      description: 'Blog posts'
    },
    options: {
      draftAndPublish: true
    },
    attributes: {
      title: {
        type: 'string',
        required: true
      },
      slug: {
        type: 'uid',
        targetField: 'title',
        required: true
      },
      content: {
        type: 'richtext',
        required: true
      },
      excerpt: {
        type: 'text'
      },
      publishedAt: {
        type: 'datetime'
      }
    }
  };

  try {
    console.log('📝 Tentando criar content-type Post...');
    
    const response = await axios.post(`${STRAPI_URL}/content-type-builder/content-types`, {
      contentType: postContentType
    }, { headers });

    console.log('✅ Content-type Post criado!');
    
    // Configura permissões
    console.log('🔐 Configurando permissões...');
    await configurePermissions(headers);
    
    console.log('\n🎉 Setup concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Teste: npm run strapi:test');
    console.log('2. Verifique: npm run strapi:check');

  } catch (error) {
    console.log('❌ Falha na criação do content-type:', error.response?.status || error.message);
    
    if (error.response?.status === 400) {
      console.log('ℹ️  Content-type pode já existir ou Strapi está em produção');
    }
    
    console.log('\n💡 Alternativas:');
    console.log('1. Criar manualmente pelo painel admin');
    console.log('2. Verificar se já existe com nome diferente');
    console.log('3. Contactar administrador do servidor');
  }
}

async function configurePermissions(headers) {
  try {
    const permissions = {
      permissions: {
        'api::post.post': {
          controllers: {
            post: {
              find: { enabled: true },
              findOne: { enabled: true }
            }
          }
        }
      }
    };

    await axios.put(`${STRAPI_URL}/users-permissions/roles/1`, permissions, { headers });
    console.log('✅ Permissões configuradas!');
    
  } catch (error) {
    console.log('⚠️  Configure permissões manualmente em Settings > Roles > Public');
  }
}

// Executa
setupDevelopmentMode().catch(console.error); 